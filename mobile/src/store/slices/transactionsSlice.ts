import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../index';
import auth from '@react-native-firebase/auth';
import {TreasuryModel} from '../../models/TreasuryModel';
import {Transaction, TransactionType} from '../../types/domain/treasury';
import {createSelector} from 'reselect';

// Define State Type
interface TransactionsState {
  items: Record<string, Transaction>; // Store transactions by ID
  groupTransactionIds: Record<string, string[]>; // Map groupId -> [transactionId]
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedGroup: Record<string, number>;
}

// Initial State
const initialState: TransactionsState = {
  items: {},
  groupTransactionIds: {},
  status: 'idle',
  error: null,
  lastFetchedGroup: {},
};

// Constants
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

// Helper function to check if data is stale
const isDataStale = (lastFetched: number | undefined): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_TTL;
};

// Fetch transactions for a group
export const fetchGroupTransactions = createAsyncThunk<
  {groupId: string; transactions: Transaction[]},
  {groupId: string; limit?: number}, // Allow optional limit
  {state: RootState; rejectValue: string}
>(
  'transactions/fetchForGroup',
  async ({groupId, limit = 50}, {getState, rejectWithValue}) => {
    // TODO: Add caching logic
    try {
      const transactions = await TreasuryModel.getTransactions(groupId, limit);
      return {groupId, transactions};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  },
);

// Add a new transaction
export const addTransaction = createAsyncThunk<
  Transaction, // Return the created transaction
  // Arguments expected from the form (excluding server-set fields like id, createdBy, createdAt)
  {
    groupId: string;
    type: TransactionType;
    amount: number;
    category: string;
    description?: string;
  },
  {rejectValue: string}
>('transactions/addTransaction', async (transactionData, {rejectWithValue}) => {
  try {
    // The model handles setting createdBy and createdAt
    const newTransaction = await TreasuryModel.createTransaction(
      transactionData,
    );
    return newTransaction;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to add transaction');
  }
});

// Delete a transaction
export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (
    {groupId, transactionId}: {groupId: string; transactionId: string},
    {rejectWithValue},
  ) => {
    try {
      await TreasuryModel.deleteTransaction(transactionId);
      return {groupId, transactionId};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete transaction');
    }
  },
);

// Create the slice
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionsError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Transactions
      .addCase(fetchGroupTransactions.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchGroupTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, transactions} = action.payload;
        const transactionIds: string[] = [];
        transactions.forEach(tx => {
          state.items[tx.id] = tx;
          transactionIds.push(tx.id);
        });
        // Replace or merge? For now, replace the list for the group.
        state.groupTransactionIds[groupId] = transactionIds;
        state.lastFetchedGroup[groupId] = Date.now();
        state.error = null;
      })
      .addCase(fetchGroupTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Add Transaction
      .addCase(addTransaction.pending, state => {
        state.status = 'loading';
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const newTransaction = action.payload;
        state.items[newTransaction.id] = newTransaction;
        // Add to the beginning of the group's transaction list
        if (!state.groupTransactionIds[newTransaction.groupId]) {
          state.groupTransactionIds[newTransaction.groupId] = [];
        }
        state.groupTransactionIds[newTransaction.groupId].unshift(
          newTransaction.id,
        );
        state.error = null;
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Delete transaction
      .addCase(deleteTransaction.pending, state => {
        state.status = 'loading';
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, transactionId} = action.payload;

        // Remove from transactions array
        if (state.items[transactionId]) {
          delete state.items[transactionId];
        }

        // Remove from group transaction IDs
        if (state.groupTransactionIds[groupId]) {
          state.groupTransactionIds[groupId] = state.groupTransactionIds[
            groupId
          ].filter(id => id !== transactionId);
        }

        state.error = null;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to delete transaction';
      });
  },
});

// Export actions and reducer
export const {clearTransactionsError} = transactionsSlice.actions;

// Selectors
export const selectAllTransactions = (state: RootState) =>
  state.transactions.items;
export const selectGroupTransactionIds = (state: RootState, groupId: string) =>
  state.transactions.groupTransactionIds[groupId] || [];

export const selectGroupTransactions = createSelector(
  [selectAllTransactions, selectGroupTransactionIds],
  (allItems, groupIds) => {
    return groupIds.map(id => allItems[id]).filter(Boolean);
  },
);

export const selectTransactionsStatus = (state: RootState) =>
  state.transactions.status;
export const selectTransactionsError = (state: RootState) =>
  state.transactions.error;

export default transactionsSlice.reducer;
