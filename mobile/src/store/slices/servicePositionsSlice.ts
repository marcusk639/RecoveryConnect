import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {RootState} from '../types';
import {ServicePosition} from '../../types';
import {ServicePositionModel} from '../../models/ServicePositionModel';
import {createSelector} from 'reselect';

// Define State Type
export interface ServicePositionsState {
  items: Record<string, ServicePosition>; // Store positions by positionId
  groupPositionIds: Record<string, string[]>; // Map groupId -> [positionId]
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedGroup: Record<string, number>; // Track last fetch time per group
}

// Initial State
const initialState: ServicePositionsState = {
  items: {},
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
          positions.forEach(pos => {
            state.items[pos.id] = pos;
            positionIds.push(pos.id);
          });
          state.groupPositionIds[positions[0].groupId] = positionIds;
          state.lastFetchedGroup[positions[0].groupId] = Date.now();
        } else {
          // Handle empty positions array
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
        state.items[newPosition.id] = newPosition;
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
        const updatedPosition = action.payload;
        state.items[updatedPosition.id] = updatedPosition;
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
        delete state.items[positionId];
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

// --- Exports ---

export const {clearServicePositionsError} = servicePositionsSlice.actions;

// Selectors
export const selectAllServicePositions = (state: RootState) =>
  state.servicePositions.items;
export const selectGroupPositionIds = (state: RootState, groupId: string) =>
  state.servicePositions.groupPositionIds[groupId] || [];

export const selectServicePositionsByGroup = createSelector(
  [selectAllServicePositions, selectGroupPositionIds],
  (allItems, groupIds) => {
    return groupIds.map(id => allItems[id]).filter(Boolean);
  },
);

export const selectServicePositionById = (
  state: RootState,
  positionId: string,
) => state.servicePositions.items[positionId];

export const selectServicePositionsStatus = (state: RootState) =>
  state.servicePositions.status;

export const selectServicePositionsError = (state: RootState) =>
  state.servicePositions.error;

export default servicePositionsSlice.reducer;
