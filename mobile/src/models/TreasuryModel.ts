import {
  Transaction,
  TreasuryStats,
  TransactionType,
} from '../types/domain/treasury';
import {FirestoreDocument, TreasuryOverviewDocument} from '../types/schema';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {TransactionDocument} from '../types/schema';

/**
 * Treasury model for managing financial data
 */
export class TreasuryModel {
  /**
   * Convert a Firestore transaction document to a Transaction object
   */
  static fromFirestore(
    doc: FirestoreDocument<TransactionDocument>,
  ): Transaction {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      createdBy: data.createdBy,
      groupId: data.groupId,
      createdAt: data.createdAt?.toDate(),
    };
  }

  /**
   * Convert a Transaction object to a Firestore document
   */
  static toFirestore(
    transaction: Partial<Transaction>,
  ): Partial<TransactionDocument> {
    const firestoreData: Partial<TransactionDocument> = {};

    if (transaction.id !== undefined) firestoreData.id = transaction.id;
    if (transaction.type !== undefined) firestoreData.type = transaction.type;
    if (transaction.amount !== undefined)
      firestoreData.amount = transaction.amount;
    if (transaction.category !== undefined)
      firestoreData.category = transaction.category;
    if (transaction.description !== undefined)
      firestoreData.description = transaction.description;
    if (transaction.createdBy !== undefined)
      firestoreData.createdBy = transaction.createdBy;
    if (transaction.groupId !== undefined)
      firestoreData.groupId = transaction.groupId;

    return firestoreData;
  }

  /**
   * Get transactions for a group
   */
  static async getTransactions(
    groupId: string,
    limit: number = 50,
  ): Promise<Transaction[]> {
    try {
      const transactionsSnapshot = await firestore()
        .collection('transactions')
        .where('groupId', '==', groupId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return transactionsSnapshot.docs.map(doc =>
        TreasuryModel.fromFirestore({
          id: doc.id,
          data: () => doc.data() as TransactionDocument,
        }),
      );
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  /**
   * Get treasury stats for a group
   */
  static async getTreasuryStats(groupId: string): Promise<TreasuryStats> {
    try {
      // Get the treasury overview document
      const overviewDoc = await firestore()
        .collection('treasury_overviews')
        .doc(groupId)
        .get();

      if (!overviewDoc.exists) {
        // If no overview exists, create a default one
        return TreasuryModel.createDefaultTreasuryStats(groupId);
      }

      const data = overviewDoc.data() as TreasuryOverviewDocument;

      // Check if we need to reset monthly stats
      if (
        TreasuryModel.shouldResetMonthlyStats(data.lastMonthReset?.toDate())
      ) {
        return TreasuryModel.resetMonthlyStats(groupId, data);
      }

      return {
        balance: data.balance,
        monthlyIncome: data.monthlyIncome,
        monthlyExpenses: data.monthlyExpenses,
        prudentReserve: data.prudentReserve,
        availableFunds: data.balance - data.prudentReserve,
        lastUpdated: data.lastUpdated.toDate(),
        groupId: data.groupId,
        lastMonthReset: data.lastMonthReset?.toDate(),
      };
    } catch (error) {
      console.error('Error getting treasury stats:', error);
      throw error;
    }
  }

  /**
   * Check if we should reset monthly stats
   */
  private static shouldResetMonthlyStats(lastReset?: Date): boolean {
    if (!lastReset) return true;

    const now = new Date();
    // Reset if we're in a different month than the last reset
    return (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    );
  }

  /**
   * Reset monthly stats
   */
  private static async resetMonthlyStats(
    groupId: string,
    data: TreasuryOverviewDocument,
  ): Promise<TreasuryStats> {
    try {
      const now = new Date();
      const overviewRef = firestore()
        .collection('treasury_overviews')
        .doc(groupId);

      // Update with reset monthly stats
      await overviewRef.update({
        monthlyIncome: 0,
        monthlyExpenses: 0,
        lastMonthReset: firestore.Timestamp.fromDate(now),
        lastUpdated: firestore.Timestamp.fromDate(now),
      });

      return {
        balance: data.balance,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        prudentReserve: data.prudentReserve,
        availableFunds: data.balance - data.prudentReserve,
        lastUpdated: now,
        groupId: data.groupId,
        lastMonthReset: now,
      };
    } catch (error) {
      console.error('Error resetting monthly stats:', error);
      throw error;
    }
  }

  /**
   * Create a transaction
   */
  static async createTransaction(
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const docRef = firestore().collection('transactions').doc();

      const now = new Date();
      const defaultTransaction: Partial<Transaction> = {
        createdBy: currentUser.uid,
        createdAt: now,
        id: docRef.id,
      };

      const newTransaction = {...defaultTransaction, ...transactionData};

      if (!newTransaction.type) {
        throw new Error('Transaction type is required');
      }

      if (!newTransaction.amount || newTransaction.amount <= 0) {
        throw new Error('Valid transaction amount is required');
      }

      if (!newTransaction.category) {
        throw new Error('Transaction category is required');
      }

      if (!newTransaction.groupId) {
        throw new Error('Group ID is required');
      }

      // Create the transaction in the top-level collection
      await docRef.set({
        ...TreasuryModel.toFirestore(newTransaction),
        createdAt: firestore.Timestamp.fromDate(now),
      });

      // Update treasury stats
      await TreasuryModel.updateTreasuryStatsAfterTransaction(
        newTransaction.groupId as string,
        newTransaction.type as TransactionType,
        newTransaction.amount as number,
      );

      const createdTransaction = await docRef.get();
      return TreasuryModel.fromFirestore({
        id: createdTransaction.id,
        data: () => createdTransaction.data() as TransactionDocument,
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Update a transaction
   */
  static async updateTransaction(
    transactionId: string,
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    try {
      const transactionRef = firestore()
        .collection('transactions')
        .doc(transactionId);

      const transactionDoc = await transactionRef.get();

      if (!transactionDoc.exists) {
        throw new Error('Transaction not found');
      }

      const currentData = transactionDoc.data() as TransactionDocument;
      const groupId = currentData.groupId;

      // If amount or type changed, update treasury stats
      if (
        (transactionData.amount !== undefined &&
          transactionData.amount !== currentData.amount) ||
        (transactionData.type !== undefined &&
          transactionData.type !== currentData.type)
      ) {
        // Undo old transaction effect
        await TreasuryModel.updateTreasuryStatsAfterTransaction(
          groupId,
          currentData.type === 'income' ? 'expense' : 'income', // Reverse effect
          currentData.amount,
        );

        // Apply new transaction effect
        const newType =
          transactionData.type !== undefined
            ? transactionData.type
            : currentData.type;
        const newAmount =
          transactionData.amount !== undefined
            ? transactionData.amount
            : currentData.amount;

        await TreasuryModel.updateTreasuryStatsAfterTransaction(
          groupId,
          newType,
          newAmount,
        );
      }

      await transactionRef.update(TreasuryModel.toFirestore(transactionData));

      const updatedDoc = await transactionRef.get();
      return TreasuryModel.fromFirestore({
        id: updatedDoc.id,
        data: () => updatedDoc.data() as TransactionDocument,
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  /**
   * Delete a transaction
   */
  static async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const transactionRef = firestore()
        .collection('transactions')
        .doc(transactionId);

      const transactionDoc = await transactionRef.get();

      if (!transactionDoc.exists) {
        throw new Error('Transaction not found');
      }

      const data = transactionDoc.data() as TransactionDocument;
      const groupId = data.groupId;

      // Undo transaction effect on treasury stats
      await TreasuryModel.updateTreasuryStatsAfterTransaction(
        groupId,
        data.type === 'income' ? 'expense' : 'income', // Reverse effect
        data.amount,
      );

      // Delete the transaction
      await transactionRef.delete();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Create default treasury stats
   */
  private static async createDefaultTreasuryStats(
    groupId: string,
  ): Promise<TreasuryStats> {
    try {
      const now = new Date();
      const defaultStats: TreasuryStats = {
        balance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        prudentReserve: 600, // Default prudent reserve
        availableFunds: -600, // Negative because we start with zero balance
        lastUpdated: now,
        groupId: groupId,
        lastMonthReset: now,
      };

      // Create the overview document
      await firestore()
        .collection('treasury_overviews')
        .doc(groupId)
        .set({
          balance: defaultStats.balance,
          monthlyIncome: defaultStats.monthlyIncome,
          monthlyExpenses: defaultStats.monthlyExpenses,
          prudentReserve: defaultStats.prudentReserve,
          lastUpdated: firestore.Timestamp.fromDate(now),
          lastMonthReset: firestore.Timestamp.fromDate(now),
          groupId: groupId,
        });

      return defaultStats;
    } catch (error) {
      console.error('Error creating default treasury stats:', error);
      throw error;
    }
  }

  /**
   * Update treasury stats after a transaction
   */
  private static async updateTreasuryStatsAfterTransaction(
    groupId: string,
    type: TransactionType,
    amount: number,
  ): Promise<void> {
    try {
      // First check if we need to get the current stats (to check for month reset)
      await TreasuryModel.getTreasuryStats(groupId);

      const overviewRef = firestore()
        .collection('treasury_overviews')
        .doc(groupId);

      // Update stats based on transaction type
      if (type === 'income') {
        await overviewRef.update({
          balance: firestore.FieldValue.increment(amount),
          monthlyIncome: firestore.FieldValue.increment(amount),
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await overviewRef.update({
          balance: firestore.FieldValue.increment(-amount),
          monthlyExpenses: firestore.FieldValue.increment(amount),
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating treasury stats:', error);
      throw error;
    }
  }
}
