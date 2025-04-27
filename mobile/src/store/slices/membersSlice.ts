import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../index';
import auth from '@react-native-firebase/auth';
import {GroupModel} from '../../models/GroupModel';
import {UserModel} from '../../models/UserModel';

// Define types
export interface GroupMember {
  id: string;
  groupId: string;
  name: string;
  email?: string;
  photoURL?: string;
  isAdmin: boolean;
  position?: string;
  sobrietyDate?: string;
  joinedAt: Date;
}

// State interface
interface MembersState {
  items: Record<string, GroupMember>;
  groupMembers: Record<string, string[]>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: Record<string, number>; // By groupId
}

// Initial state
const initialState: MembersState = {
  items: {},
  groupMembers: {},
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

// Fetch members for a group
export const fetchGroupMembers = createAsyncThunk(
  'members/fetchForGroup',
  async (groupId: string, {getState, rejectWithValue}) => {
    try {
      // Get group to check if it exists
      const group = await GroupModel.getById(groupId);

      if (!group) {
        return rejectWithValue('Group not found');
      }

      // Get members list
      const members = await GroupModel.getMembers(groupId);

      // Sort members - admins first, then by name
      members.sort((a, b) => {
        if (a.isAdmin && !b.isAdmin) return -1;
        if (!a.isAdmin && b.isAdmin) return 1;
        return a.name.localeCompare(b.name);
      });

      return {groupId, members};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch group members');
    }
  },
  {
    condition: (groupId, {getState}) => {
      const state = getState() as RootState;

      // If already loading, don't fetch again
      if (state.members.status === 'loading') return false;

      // Check if data for this group is stale
      return isDataStale(state.members.lastFetched[groupId]);
    },
  },
);

// Add member to group
export const addMemberToGroup = createAsyncThunk(
  'members/addToGroup',
  async (
    {
      groupId,
      userId,
      isAdmin = false,
      position = '',
    }: {
      groupId: string;
      userId: string;
      isAdmin?: boolean;
      position?: string;
    },
    {rejectWithValue},
  ) => {
    try {
      // Add member to group
      await GroupModel.addMember(groupId, userId, isAdmin);

      // If there's a position, update it
      if (position) {
        await GroupModel.updateMemberPosition(groupId, userId, position);
      }

      // Get user data
      const user = await UserModel.getById(userId);

      if (!user) {
        return rejectWithValue('User not found');
      }

      // Return member data
      const member: GroupMember = {
        id: userId,
        groupId,
        name: user.displayName || 'Anonymous',
        email: user.email,
        photoURL: user.photoUrl,
        isAdmin,
        position: position || undefined,
        sobrietyDate: user.recoveryDate,
        joinedAt: new Date(),
      };

      return member;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add member to group');
    }
  },
);

// Update member in group
export const updateGroupMember = createAsyncThunk(
  'members/update',
  async (
    {
      groupId,
      userId,
      isAdmin,
      position,
    }: {
      groupId: string;
      userId: string;
      isAdmin?: boolean;
      position?: string;
    },
    {getState, rejectWithValue},
  ) => {
    try {
      const state = getState() as RootState;
      const currentMember = state.members.items[userId];

      if (!currentMember) {
        return rejectWithValue('Member not found');
      }

      // Update admin status if changed
      if (isAdmin !== undefined && isAdmin !== currentMember.isAdmin) {
        if (isAdmin) {
          await GroupModel.makeAdmin(groupId, userId);
        } else {
          await GroupModel.removeAdmin(groupId, userId);
        }
      }

      // Update position if changed
      if (position !== undefined && position !== currentMember.position) {
        await GroupModel.updateMemberPosition(groupId, userId, position);
      }

      // Return updated member data
      return {
        ...currentMember,
        isAdmin: isAdmin !== undefined ? isAdmin : currentMember.isAdmin,
        position: position !== undefined ? position : currentMember.position,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update group member');
    }
  },
);

// Remove member from group
export const removeMemberFromGroup = createAsyncThunk(
  'members/removeFromGroup',
  async (
    {groupId, userId}: {groupId: string; userId: string},
    {getState, rejectWithValue},
  ) => {
    try {
      await GroupModel.removeMember(groupId, userId);
      return {groupId, userId};
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to remove member from group',
      );
    }
  },
);

// Create the slice
const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearMembersError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch group members
      .addCase(fetchGroupMembers.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchGroupMembers.fulfilled, (state, action) => {
        state.status = 'succeeded';

        const {groupId, members} = action.payload;

        // Update items dictionary with members
        members.forEach((member: GroupMember) => {
          state.items[member.id] = member;
        });

        // Update group members array with IDs
        state.groupMembers[groupId] = members.map((m: GroupMember) => m.id);

        // Update last fetched timestamp for this group
        state.lastFetched[groupId] = Date.now();

        state.error = null;
      })
      .addCase(fetchGroupMembers.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to fetch group members';
      })

      // Add member to group
      .addCase(addMemberToGroup.pending, state => {
        state.status = 'loading';
      })
      .addCase(addMemberToGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const member = action.payload;

        // Add to items
        state.items[member.id] = member;

        // Add to group members
        if (!state.groupMembers[member.groupId]) {
          state.groupMembers[member.groupId] = [];
        }
        state.groupMembers[member.groupId].push(member.id);

        state.error = null;
      })
      .addCase(addMemberToGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to add member to group';
      })

      // Update group member
      .addCase(updateGroupMember.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateGroupMember.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items[action.payload.id] = action.payload;
        state.error = null;
      })
      .addCase(updateGroupMember.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to update group member';
      })

      // Remove member from group
      .addCase(removeMemberFromGroup.pending, state => {
        state.status = 'loading';
      })
      .addCase(removeMemberFromGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, userId} = action.payload;

        // Remove from items if this is their only group
        // Check if member exists in other groups
        let memberInOtherGroups = false;

        for (const [gId, members] of Object.entries(state.groupMembers)) {
          if (gId !== groupId && members.includes(userId)) {
            memberInOtherGroups = true;
            break;
          }
        }

        if (!memberInOtherGroups) {
          delete state.items[userId];
        }

        // Remove from group members
        if (state.groupMembers[groupId]) {
          state.groupMembers[groupId] = state.groupMembers[groupId].filter(
            memberId => memberId !== userId,
          );
        }

        state.error = null;
      })
      .addCase(removeMemberFromGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to remove member from group';
      });
  },
});

// Export actions and reducer
export const {clearMembersError} = membersSlice.actions;

// Selectors
export const selectAllMembers = (state: RootState) =>
  Object.values(state.members.items);

export const selectMembersByGroupId = (state: RootState, groupId: string) => {
  const memberIds = state.members.groupMembers[groupId] || [];
  return memberIds.map(id => state.members.items[id]).filter(Boolean);
};

export const selectMemberById = (state: RootState, id: string) =>
  state.members.items[id];

export const selectGroupAdmins = (state: RootState, groupId: string) => {
  const memberIds = state.members.groupMembers[groupId] || [];
  return memberIds
    .map(id => state.members.items[id])
    .filter(member => member && member.isAdmin);
};

export const selectMembersStatus = (state: RootState) => state.members.status;

export const selectMembersError = (state: RootState) => state.members.error;

export default membersSlice.reducer;
