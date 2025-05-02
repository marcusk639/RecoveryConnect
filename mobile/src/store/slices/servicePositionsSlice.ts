import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';
import {RootState} from '../types';
import {ServicePosition} from '../../types';
import {ServicePositionModel} from '../../models/ServicePositionModel';

// Define proper entity type
export interface ServicePositionEntity extends ServicePosition {
  id: string;
}

// Create entity adapter for better performance
const servicePositionsAdapter = createEntityAdapter({
  selectId: (position: ServicePositionEntity) => position.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

// Update state interface
export interface ServicePositionsState {
  positions: ReturnType<typeof servicePositionsAdapter.getInitialState>;
  groupPositionIds: Record<string, string[]>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedGroup: Record<string, number>;
}

// Initial State
const initialState: ServicePositionsState = {
  positions: servicePositionsAdapter.getInitialState(),
  groupPositionIds: {},
  status: 'idle',
  error: null,
  lastFetchedGroup: {},
};

// --- Async Thunks ---

export const fetchServicePositionsForGroup = createAsyncThunk(
  'servicePositions/fetchForGroup',
  async (groupId: string) => {
    try {
      return await ServicePositionModel.getPositionsForGroup(groupId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch service positions');
    }
  },
);

export const createServicePosition = createAsyncThunk(
  'servicePositions/create',
  async ({
    groupId,
    name,
    description,
    commitmentLength,
    termStartDate,
    termEndDate,
  }: {
    groupId: string;
    name: string;
    description?: string;
    commitmentLength?: number;
    termStartDate?: Date;
    termEndDate?: Date;
  }) => {
    try {
      return await ServicePositionModel.createPosition(groupId, {
        name,
        description,
        commitmentLength,
        termStartDate,
        termEndDate,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create service position');
    }
  },
);

export const updateServicePosition = createAsyncThunk(
  'servicePositions/update',
  async ({
    groupId,
    positionId,
    updateData,
  }: {
    groupId: string;
    positionId: string;
    updateData: Partial<Omit<ServicePosition, 'id' | 'groupId' | 'createdAt'>>;
  }) => {
    try {
      return await ServicePositionModel.updatePosition(
        groupId,
        positionId,
        updateData,
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update service position');
    }
  },
);

export const deleteServicePosition = createAsyncThunk<
  {groupId: string; positionId: string},
  {groupId: string; positionId: string},
  {rejectValue: string}
>(
  'servicePositions/delete',
  async ({groupId, positionId}, {rejectWithValue}) => {
    try {
      await ServicePositionModel.deletePosition(groupId, positionId);
      return {groupId, positionId};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete position');
    }
  },
);

// --- Slice Definition ---

const servicePositionsSlice = createSlice({
  name: 'servicePositions',
  initialState,
  reducers: {
    clearServicePositionsError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Positions
      .addCase(fetchServicePositionsForGroup.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchServicePositionsForGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const positions = action.payload;
        const positionIds: string[] = [];

        if (positions.length > 0) {
          servicePositionsAdapter.upsertMany(state.positions, positions);
          positionIds.push(...positions.map(pos => pos.id));
          state.groupPositionIds[positions[0].groupId] = positionIds;
          state.lastFetchedGroup[positions[0].groupId] = Date.now();
        } else {
          state.groupPositionIds[action.meta.arg] = [];
          state.lastFetchedGroup[action.meta.arg] = Date.now();
        }

        state.error = null;
      })
      .addCase(fetchServicePositionsForGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message || 'Failed to fetch service positions';
      })
      // Create Position
      .addCase(createServicePosition.pending, state => {
        state.status = 'loading';
      })
      .addCase(createServicePosition.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const newPosition = action.payload;
        servicePositionsAdapter.upsertOne(state.positions, newPosition);
        if (!state.groupPositionIds[newPosition.groupId]) {
          state.groupPositionIds[newPosition.groupId] = [];
        }
        state.groupPositionIds[newPosition.groupId].push(newPosition.id);
        state.error = null;
      })
      .addCase(createServicePosition.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message || 'Failed to create service position';
      })
      // Update Position
      .addCase(updateServicePosition.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateServicePosition.fulfilled, (state, action) => {
        state.status = 'succeeded';
        servicePositionsAdapter.upsertOne(state.positions, action.payload);
        state.error = null;
      })
      .addCase(updateServicePosition.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message || 'Failed to update service position';
      })
      // Delete Position
      .addCase(deleteServicePosition.pending, state => {
        state.status = 'loading';
      })
      .addCase(deleteServicePosition.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, positionId} = action.payload;
        servicePositionsAdapter.removeOne(state.positions, positionId);
        if (state.groupPositionIds[groupId]) {
          state.groupPositionIds[groupId] = state.groupPositionIds[
            groupId
          ].filter(id => id !== positionId);
        }
        state.error = null;
      })
      .addCase(deleteServicePosition.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Optimize selectors with proper memoization
export const selectAllServicePositions = createSelector(
  [(state: RootState) => state.servicePositions.positions],
  positions => servicePositionsAdapter.getSelectors().selectAll(positions),
);

export const selectGroupPositionIds = createSelector(
  [
    (state: RootState, groupId: string) =>
      state.servicePositions.groupPositionIds[groupId] || [],
  ],
  positionIds => positionIds,
);

export const selectServicePositionsByGroup = createSelector(
  [
    (state: RootState) => state.servicePositions.positions,
    (state: RootState, groupId: string) => groupId,
  ],
  (positions, groupId) => {
    const entities = positions.entities;
    return Object.values(entities).filter(
      (position): position is ServicePositionEntity =>
        position !== undefined && position.groupId === groupId,
    );
  },
);

export const selectServicePositionById = (
  state: RootState,
  positionId: string,
) => {
  return servicePositionsAdapter
    .getSelectors()
    .selectById(state.servicePositions.positions, positionId);
};

// Simple selectors that don't need memoization
export const selectServicePositionsStatus = (state: RootState) =>
  state.servicePositions.status;
export const selectServicePositionsError = (state: RootState) =>
  state.servicePositions.error;

export const {clearServicePositionsError} = servicePositionsSlice.actions;
export default servicePositionsSlice.reducer;
