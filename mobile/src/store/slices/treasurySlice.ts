import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';
import {RootState} from '../types';
import {TreasuryStats} from '../../types/domain/treasury';
import {TreasuryModel} from '../../models/TreasuryModel';

// Define entity types
interface TreasuryStatsEntity extends TreasuryStats {
  id: string;
}

// Create entity adapter
const treasuryStatsAdapter = createEntityAdapter<TreasuryStatsEntity>();

// Define state interface
export interface TreasuryState {
  stats: ReturnType<typeof treasuryStatsAdapter.getInitialState>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: Record<string, number>;
}

// Initial state
const initialState: TreasuryState = {
  stats: treasuryStatsAdapter.getInitialState(),
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
        const statsEntity = {
          ...stats,
          id: stats.groupId,
        };
        treasuryStatsAdapter.upsertOne(state.stats, statsEntity);
        state.lastFetched[stats.groupId] = Date.now();
        state.error = null;
      })
      .addCase(fetchTreasuryStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Memoized selectors
const treasuryStatsSelectors = treasuryStatsAdapter.getSelectors<RootState>(
  state => state.treasury.stats,
);

export const selectTreasuryStatsByGroupId = createSelector(
  [
    treasuryStatsSelectors.selectAll,
    (state: RootState, groupId: string) => groupId,
  ],
  (allStats, groupId) => allStats.find(stats => stats.id === groupId),
);

export const selectTreasuryStatus = (state: RootState) => state.treasury.status;
export const selectTreasuryError = (state: RootState) => state.treasury.error;

export const {clearError} = treasurySlice.actions;
export default treasurySlice.reducer;
