import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../types';
import {TreasuryStats} from '../../types/domain/treasury';
import {TreasuryModel} from '../../models/TreasuryModel';

export interface TreasuryState {
  groupStats: Record<string, TreasuryStats>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: Record<string, number>;
}

// Initial state
const initialState: TreasuryState = {
  groupStats: {},
  status: 'idle',
  error: null,
  lastFetched: {},
};

// Constants
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache TTL (shorter for treasury stats)

// Helper function to check if data is stale
const isDataStale = (lastFetched: number | undefined): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_TTL;
};

// Async thunks
export const fetchTreasuryStats = createAsyncThunk(
  'treasury/fetchTreasuryStats',
  async (groupId: string, {getState, rejectWithValue}) => {
    try {
      const treasuryStats = await TreasuryModel.getTreasuryStats(groupId);
      return treasuryStats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch treasury stats');
    }
  },
  {
    // Only fetch if data is stale
    condition: (groupId, {getState}) => {
      const state = getState() as RootState;
      const lastFetchTime = state.treasury.lastFetched[groupId];

      // If already loading, don't fetch again
      if (state.treasury.status === 'loading') return false;

      return isDataStale(lastFetchTime);
    },
  },
);

// Create the slice
const treasurySlice = createSlice({
  name: 'treasury',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch treasury stats
      .addCase(fetchTreasuryStats.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchTreasuryStats.fulfilled, (state, action) => {
        state.status = 'succeeded';

        const stats = action.payload;
        const groupId = stats.groupId;

        // Update treasury stats for the group
        state.groupStats[groupId] = stats;

        // Update lastFetched
        state.lastFetched[groupId] = Date.now();

        state.error = null;
      })
      .addCase(fetchTreasuryStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to fetch treasury stats';
      });
  },
});

// Export actions and reducer
export const {clearError} = treasurySlice.actions;

// Selectors
export const selectTreasuryStatsByGroupId = (
  state: RootState,
  groupId: string,
) => state.treasury.groupStats[groupId];
export const selectTreasuryStatus = (state: RootState) => state.treasury.status;
export const selectTreasuryError = (state: RootState) => state.treasury.error;

export default treasurySlice.reducer;
