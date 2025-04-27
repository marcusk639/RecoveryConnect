import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../index';
import auth from '@react-native-firebase/auth';
import {TreasuryModel} from '../../models/TreasuryModel';
import {Transaction} from '../../types/domain/treasury';

// State interface
interface TransactionsState {
  items: Record<string, Transaction[]>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: Record<string, number>; // By groupId
}

// Initial state
const initialState: TransactionsState = {
  items: {},
  status: 'idle',
  error: null,
  lastFetched: {},
};

// Constants
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

// Helper function to check if data is stale
const isDataStale = (lastFetched: number | undefined): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_TTL;
};

// Fetch transactions for a group
export const fetchGroupTransactions = createAsyncThunk(
  'transactions/fetchForGroup',
  async (
    {groupId, limit = 20}: {groupId: string; limit?: number},
    {getState, rejectWithValue},
  ) => {
    try {
      const transactions = await TreasuryModel.getTransactions(groupId, limit);
      return {groupId, transactions};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  },
  {
    condition: ({groupId}, {getState}) => {
      const state = getState() as RootState;

      // If already loading, don't fetch again
      if (state.transactions.status === 'loading') return false;

      // Check if data for this group is stale
      return isDataStale(state.transactions.lastFetched[groupId]);
    },
  },
);

// Add a new transaction
export const addTransaction = createAsyncThunk(
  'transactions/add',
  async (
    {
      groupId,
      amount,
      type,
      category,
      description,
    }: {
      groupId: string;
      amount: number;
      type: 'income' | 'expense';
      category: string;
      description: string;
    },
    {rejectWithValue},
  ) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return rejectWithValue('User not authenticated');
      }

      const transactionData = {
        amount,
        type,
        category,
        description,
        createdBy: currentUser.uid,
        groupId,
      };

      const transaction = await TreasuryModel.createTransaction(
        transactionData,
      );
      return {groupId, transaction};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add transaction');
    }
  },
);

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
      // Fetch transactions for group
      .addCase(fetchGroupTransactions.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchGroupTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';

        const {groupId, transactions} = action.payload;

        // Store transactions by group ID
        state.items[groupId] = transactions;

        // Update last fetched timestamp for this group
        state.lastFetched[groupId] = Date.now();

        state.error = null;
      })
      .addCase(fetchGroupTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to fetch transactions';
      })

      // Add transaction
      .addCase(addTransaction.pending, state => {
        state.status = 'loading';
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, transaction} = action.payload;

        // Add to transactions array
        if (!state.items[groupId]) {
          state.items[groupId] = [];
        }

        // Add at the beginning (most recent first)
        state.items[groupId] = [transaction, ...state.items[groupId]];

        state.error = null;
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to add transaction';
      })

      // Delete transaction
      .addCase(deleteTransaction.pending, state => {
        state.status = 'loading';
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, transactionId} = action.payload;

        // Remove from transactions array
        if (state.items[groupId]) {
          state.items[groupId] = state.items[groupId].filter(
            transaction => transaction.id !== transactionId,
          );
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
export const selectGroupTransactions = (state: RootState, groupId: string) => {
  return state.transactions.items[groupId] || [];
};

export const selectTransactionsStatus = (state: RootState) =>
  state.transactions.status;

export const selectTransactionsError = (state: RootState) =>
  state.transactions.error;

export default transactionsSlice.reducer;
