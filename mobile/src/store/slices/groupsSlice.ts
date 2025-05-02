import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
  createEntityAdapter,
} from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';
import {RootState} from '../types';
import {HomeGroup, Meeting} from '../../types';
import {GroupModel} from '../../models/GroupModel';
import firestore from '@react-native-firebase/firestore';

// Define proper entity types
interface GroupEntity extends HomeGroup {
  id: string;
}

// Create entity adapter for better performance
const groupsAdapter = createEntityAdapter({
  selectId: (group: GroupEntity) => group.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

// Update state interface
export interface GroupsState {
  groups: ReturnType<typeof groupsAdapter.getInitialState>;
  memberGroups: string[];
  adminGroups: string[];
  nearbyGroups: HomeGroup[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: Record<string, number>;
}

// Update initial state
const initialState: GroupsState = {
  groups: groupsAdapter.getInitialState(),
  memberGroups: [],
  adminGroups: [],
  nearbyGroups: [],
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

// Async thunks
export const fetchUserGroups = createAsyncThunk(
  'groups/fetchUserGroups',
  async (_, {getState, rejectWithValue}) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return rejectWithValue('User not authenticated');
      }

      const userGroups = await GroupModel.getUserGroups(currentUser.uid);
      return userGroups;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user groups');
    }
  },
  {
    // Only fetch if data is stale or empty
    condition: (_, {getState}) => {
      const state = getState() as RootState;
      const {status, lastFetched, memberGroups} = state.groups;

      // If already loading, don't fetch again
      if (status === 'loading') return false;

      // Always fetch if we have no groups loaded
      if (memberGroups.length === 0) return true;

      // Check if any of the user's existing groups data is stale
      const isAnyGroupStale = memberGroups.some(groupId =>
        isDataStale(lastFetched[groupId]),
      );

      return isAnyGroupStale;
    },
  },
);

export const fetchGroupById = createAsyncThunk(
  'groups/fetchGroupById',
  async (groupId: string, {getState, rejectWithValue}) => {
    try {
      const group = await GroupModel.getById(groupId);
      if (!group) {
        return rejectWithValue('Group not found');
      }
      return group;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch group');
    }
  },
  {
    // Only fetch if data is stale
    condition: (groupId, {getState}) => {
      const state = getState() as RootState;
      const lastFetchTime = state.groups.lastFetched[groupId];

      // If already loading, don't fetch again
      if (state.groups.status === 'loading') return false;

      return isDataStale(lastFetchTime);
    },
  },
);

export const createGroup = createAsyncThunk(
  'groups/create',
  async (
    {
      groupData,
      onSuccess,
    }: {
      groupData: Partial<HomeGroup>;
      onSuccess?: (group: HomeGroup) => void;
    },
    {rejectWithValue},
  ) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return rejectWithValue('No authenticated user');
      }

      // Create the group
      const group = await GroupModel.create(groupData);

      // Call onSuccess callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(group);
      }

      return group;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create group');
    }
  },
);

export const completeDonation = createAsyncThunk(
  'groups/completeDonation',
  async (
    {
      groupId,
      amount,
      donationId,
    }: {groupId: string; amount: number; donationId: string},
    {rejectWithValue},
  ) => {
    try {
      const updatedGroup = await GroupModel.completeDonation(
        groupId,
        amount,
        donationId,
      );
      return updatedGroup;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to complete donation');
    }
  },
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async (
    {groupId, groupData}: {groupId: string; groupData: Partial<HomeGroup>},
    {rejectWithValue},
  ) => {
    try {
      const updatedGroup = await GroupModel.update(groupId, groupData);
      return updatedGroup;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update group');
    }
  },
);

export const joinGroup = createAsyncThunk(
  'groups/joinGroup',
  async (groupId: string, {rejectWithValue}) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return rejectWithValue('User not authenticated');
      }

      await GroupModel.addMember(groupId, currentUser.uid);

      // Fetch updated group data
      const updatedGroup = await GroupModel.getById(groupId);
      return updatedGroup;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to join group');
    }
  },
);

export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async (groupId: string, {rejectWithValue}) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return rejectWithValue('User not authenticated');
      }

      await GroupModel.removeMember(groupId, currentUser.uid);
      return groupId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to leave group');
    }
  },
);

// Add new thunk for searching groups by location
export const searchGroupsByLocation = createAsyncThunk(
  'groups/searchByLocation',
  async (
    {
      latitude,
      longitude,
      radius = 25,
    }: {
      latitude: number;
      longitude: number;
      radius?: number;
    },
    {rejectWithValue},
  ) => {
    try {
      const groups = await GroupModel.searchGroupsByLocation(
        latitude,
        longitude,
        radius,
      );
      return groups;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to search groups by location',
      );
    }
  },
);

// Add the requestGroupAdminAccess thunk
export const requestGroupAdminAccess = createAsyncThunk(
  'groups/requestGroupAdminAccess',
  async (
    {
      groupId,
      userId,
      message,
    }: {
      groupId: string;
      userId: string;
      message?: string;
    },
    {rejectWithValue},
  ) => {
    try {
      // Get the current group
      const groupRef = firestore().collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        return rejectWithValue('Group not found');
      }

      // Update the group with the new admin request
      await groupRef.update({
        pendingAdminRequests: firestore.FieldValue.arrayUnion({
          uid: userId,
          requestedAt: firestore.FieldValue.serverTimestamp(),
          message: message || '',
        }),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Fetch the updated group
      const updatedGroup = await GroupModel.getById(groupId);
      return updatedGroup;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to request admin access');
    }
  },
);

// Create the slice
const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch user groups
      .addCase(fetchUserGroups.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.status = 'succeeded';

        // Add/update groups in the items dictionary
        action.payload.forEach((group: HomeGroup) => {
          if (group.id) {
            groupsAdapter.upsertOne(state.groups, group);
            state.lastFetched[group.id] = Date.now();
          }
        });

        // Update member and admin groups lists
        const currentUser = auth().currentUser;
        if (currentUser) {
          state.memberGroups = action.payload.map(
            (group: HomeGroup) => group.id!,
          );
          state.adminGroups = action.payload
            .filter((group: HomeGroup) =>
              group.admins.includes(currentUser.uid),
            )
            .map((group: HomeGroup) => group.id!);
        }

        state.error = null;
      })
      .addCase(fetchUserGroups.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to fetch user groups';
      })

      // Fetch group by id
      .addCase(fetchGroupById.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.status = 'succeeded';

        // Add/update the group in the items dictionary
        if (action.payload) {
          groupsAdapter.upsertOne(state.groups, action.payload);
          state.lastFetched[action.payload.id!] = Date.now();
        }

        state.error = null;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch group';
      })

      // Create group
      .addCase(createGroup.pending, state => {
        state.status = 'loading';
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const group = action.payload;
        groupsAdapter.upsertOne(state.groups, group);

        // Add to user groups if it's not already there
        if (!state.memberGroups.includes(group.id!)) {
          state.memberGroups.push(group.id!);
        }

        state.error = null;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to create group';
      })

      // Update group
      .addCase(updateGroup.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';

        // Update the group
        groupsAdapter.upsertOne(state.groups, action.payload);
        state.lastFetched[action.payload.id!] = Date.now();

        state.error = null;
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to update group';
      })

      // Join group
      .addCase(joinGroup.pending, state => {
        state.status = 'loading';
      })
      .addCase(joinGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';

        if (action.payload) {
          // Update the group
          groupsAdapter.upsertOne(state.groups, action.payload);
          state.lastFetched[action.payload.id!] = Date.now();

          // Add to member groups if not already there
          if (!state.memberGroups.includes(action.payload.id!)) {
            state.memberGroups.push(action.payload.id!);
          }
        }

        state.error = null;
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to join group';
      })

      // Leave group
      .addCase(leaveGroup.pending, state => {
        state.status = 'loading';
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';

        // Remove from member and admin groups
        state.memberGroups = state.memberGroups.filter(
          id => id !== action.payload,
        );
        state.adminGroups = state.adminGroups.filter(
          id => id !== action.payload,
        );

        state.error = null;
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to leave group';
      })

      // Search groups by location
      .addCase(searchGroupsByLocation.pending, state => {
        state.status = 'loading';
      })
      .addCase(searchGroupsByLocation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.nearbyGroups = action.payload;

        // Also add groups to items dictionary
        action.payload.forEach((group: HomeGroup) => {
          if (group.id) {
            groupsAdapter.upsertOne(state.groups, group);
          }
        });

        state.error = null;
      })
      .addCase(searchGroupsByLocation.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to search nearby groups';
      })

      // Request group admin access
      .addCase(requestGroupAdminAccess.pending, state => {
        state.status = 'loading';
      })
      .addCase(requestGroupAdminAccess.fulfilled, (state, action) => {
        state.status = 'succeeded';

        // Update the group in the items dictionary
        if (action.payload && action.payload.id) {
          groupsAdapter.upsertOne(state.groups, action.payload);
          state.lastFetched[action.payload.id] = Date.now();
        }

        state.error = null;
      })
      .addCase(requestGroupAdminAccess.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to request admin access';
      })

      // Complete donation
      .addCase(completeDonation.pending, state => {
        state.status = 'loading';
      })
      .addCase(completeDonation.fulfilled, (state, action) => {
        state.status = 'succeeded';

        if (action.payload) {
          groupsAdapter.upsertOne(state.groups, action.payload);
          state.lastFetched[action.payload.id!] = Date.now();
        }

        state.error = null;
      })
      .addCase(completeDonation.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to complete donation';
      });
  },
});

// Export actions and reducer
export const {clearError} = groupsSlice.actions;

// Optimize selectors with proper memoization
export const selectAllGroups = createSelector(
  [groupsAdapter.getSelectors().selectAll],
  groups => groups,
);

export const selectMemberGroupIds = createSelector(
  [(state: RootState) => state.groups.memberGroups],
  memberGroups => memberGroups,
);

export const selectAdminGroupIds = createSelector(
  [(state: RootState) => state.groups.adminGroups],
  adminGroups => adminGroups,
);

export const selectGroupById = (state: RootState, groupId: string) =>
  groupsAdapter.getSelectors().selectById(state.groups.groups, groupId);

export const selectNearbyGroups = createSelector(
  [(state: RootState) => state.groups.nearbyGroups],
  nearbyGroups => nearbyGroups,
);

export const selectMemberGroups = createSelector(
  [selectAllGroups, selectMemberGroupIds],
  (allGroups, memberIds) => {
    return memberIds
      .map(id => allGroups.find(group => group.id === id))
      .filter(Boolean);
  },
);

export const selectAdminGroups = createSelector(
  [selectAllGroups, selectAdminGroupIds],
  (allGroups, adminIds) => {
    return adminIds
      .map(id => allGroups.find(group => group.id === id))
      .filter(Boolean);
  },
);

export const selectUserGroups = createSelector(
  [(state: RootState) => state.groups.groups],
  groups =>
    Object.values(groups.entities).filter(
      (group): group is GroupEntity => group !== undefined,
    ),
);

// Simple selectors that don't need memoization
export const selectGroupsStatus = (state: RootState) => state.groups.status;
export const selectGroupsError = (state: RootState) => state.groups.error;

export default groupsSlice.reducer;
