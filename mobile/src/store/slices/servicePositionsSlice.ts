import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../index';
import {ServicePosition} from '../../types';
import {ServicePositionModel} from '../../models/ServicePositionModel';
import {createSelector} from 'reselect';

// Define State Type
interface ServicePositionsState {
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

export const fetchServicePositionsForGroup = createAsyncThunk<
  {groupId: string; positions: ServicePosition[]},
  string, // groupId
  {state: RootState; rejectValue: string}
>(
  'servicePositions/fetchForGroup',
  async (groupId, {getState, rejectWithValue}) => {
    // TODO: Add caching logic
    try {
      const positions = await ServicePositionModel.getPositionsForGroup(
        groupId,
      );
      return {groupId, positions};
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch service positions',
      );
    }
  },
);

export const createServicePosition = createAsyncThunk<
  ServicePosition,
  {
    groupId: string;
    name: string;
    description?: string;
    commitmentLength?: number;
  },
  {rejectValue: string}
>('servicePositions/create', async (data, {rejectWithValue}) => {
  try {
    const newPosition = await ServicePositionModel.createPosition(
      data.groupId,
      {
        name: data.name,
        description: data.description,
        commitmentLength: data.commitmentLength,
      },
    );
    return newPosition;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create position');
  }
});

export const updateServicePosition = createAsyncThunk<
  ServicePosition,
  {
    groupId: string;
    positionId: string;
    updateData: Partial<Omit<ServicePosition, 'id' | 'groupId' | 'createdAt'>>;
  },
  {rejectValue: string}
>(
  'servicePositions/update',
  async ({groupId, positionId, updateData}, {rejectWithValue}) => {
    try {
      const updatedPosition = await ServicePositionModel.updatePosition(
        groupId,
        positionId,
        updateData,
      );
      return updatedPosition;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update position');
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
        const {groupId, positions} = action.payload;
        const positionIds: string[] = [];
        positions.forEach(pos => {
          state.items[pos.id] = pos;
          positionIds.push(pos.id);
        });
        state.groupPositionIds[groupId] = positionIds;
        state.lastFetchedGroup[groupId] = Date.now();
        state.error = null;
      })
      .addCase(fetchServicePositionsForGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
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
        state.groupPositionIds[newPosition.groupId].push(newPosition.id); // Add to list
        state.error = null;
      })
      .addCase(createServicePosition.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
