import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Announcement} from '../../types';
import {AnnouncementModel} from '../../models/AnnouncementModel';
import {createSelector} from 'reselect';
import {RootState} from '../types';
// State interface
export interface AnnouncementsState {
  items: Record<string, Announcement>;
  groupAnnouncementIds: Record<string, string[]>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedGroup: Record<string, number>; // Track last fetch time per group
}

// Initial state
const initialState: AnnouncementsState = {
  items: {},
  groupAnnouncementIds: {},
  status: 'idle',
  error: null,
  lastFetchedGroup: {},
};

// Constants
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL for announcements

// Helper function to check if data is stale
const isDataStale = (lastFetched: number | undefined): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_TTL;
};

// Fetch announcements for a group
export const fetchAnnouncementsForGroup = createAsyncThunk<
  {groupId: string; announcements: Announcement[]},
  string, // groupId
  {state: RootState; rejectValue: string}
>(
  'announcements/fetchForGroup',
  async (groupId, {getState, rejectWithValue}) => {
    // TODO: Implement caching logic using lastFetchedGroup[groupId]
    try {
      const announcements = await AnnouncementModel.getAnnouncementsForGroup(
        groupId,
      );
      return {groupId, announcements};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch announcements');
    }
  },
);

// Fetch a single announcement by ID
export const fetchAnnouncementById = createAsyncThunk(
  'announcements/fetchById',
  async (
    {groupId, announcementId}: {groupId: string; announcementId: string},
    {rejectWithValue},
  ) => {
    try {
      // Assume we need to use the group ID to fetch the announcement
      const announcements = await AnnouncementModel.getByGroup(groupId);
      const announcement = announcements.find(a => a.id === announcementId);

      if (!announcement) {
        return rejectWithValue('Announcement not found');
      }

      return announcement;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch announcement');
    }
  },
);

// Create a new announcement
export const createAnnouncement = createAsyncThunk<
  Announcement, // Return the new announcement
  {
    groupId: string;
    title: string;
    content: string;
    isPinned?: boolean;
    expiresAt?: Date | null;
    userId: string;
    memberId: string;
  },
  {rejectValue: string}
>('announcements/create', async (data, {rejectWithValue}) => {
  try {
    const newAnnouncement = await AnnouncementModel.createAnnouncement(
      data.groupId,
      {
        title: data.title,
        content: data.content,
        isPinned: data.isPinned,
        expiresAt: data.expiresAt,
        userId: data.userId,
        memberId: data.memberId,
      },
    );
    return newAnnouncement;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create announcement');
  }
});

// Update an announcement
export const updateAnnouncement = createAsyncThunk(
  'announcements/update',
  async (
    {
      announcementId,
      title,
      content,
      isPinned,
    }: {
      announcementId: string;
      title?: string;
      content?: string;
      isPinned?: boolean;
    },
    {getState, rejectWithValue},
  ) => {
    try {
      const state = getState() as RootState;
      const currentAnnouncement = state.announcements.items[announcementId];

      if (!currentAnnouncement) {
        return rejectWithValue('Announcement not found');
      }

      const updateData: Partial<Announcement> = {};

      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (isPinned !== undefined) updateData.isPinned = isPinned;

      await AnnouncementModel.update(currentAnnouncement.groupId, updateData);

      return currentAnnouncement;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update announcement');
    }
  },
);

// Delete an announcement
export const deleteAnnouncement = createAsyncThunk<
  {groupId: string; announcementId: string}, // Return IDs for reducer
  {groupId: string; announcementId: string},
  {rejectValue: string}
>(
  'announcements/delete',
  async ({groupId, announcementId}, {rejectWithValue}) => {
    try {
      await AnnouncementModel.deleteAnnouncement(groupId, announcementId);
      return {groupId, announcementId}; // Return IDs to remove from state
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete announcement');
    }
  },
);

// Create the slice
const announcementsSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    clearAnnouncementsError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Announcements
      .addCase(fetchAnnouncementsForGroup.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchAnnouncementsForGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, announcements} = action.payload;
        const announcementIds: string[] = [];
        announcements.forEach(announcement => {
          state.items[announcement.id] = announcement;
          announcementIds.push(announcement.id);
        });
        state.groupAnnouncementIds[groupId] = announcementIds;
        state.lastFetchedGroup[groupId] = Date.now();
        state.error = null;
      })
      .addCase(fetchAnnouncementsForGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create Announcement
      .addCase(createAnnouncement.pending, state => {
        state.status = 'loading';
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const newAnnouncement = action.payload;
        state.items[newAnnouncement.id] = newAnnouncement;
        // Add to the specific group's list
        if (state.groupAnnouncementIds[newAnnouncement.groupId]) {
          state.groupAnnouncementIds[newAnnouncement.groupId].unshift(
            newAnnouncement.id,
          ); // Add to beginning
        } else {
          state.groupAnnouncementIds[newAnnouncement.groupId] = [
            newAnnouncement.id,
          ];
        }
        state.error = null;
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Update announcement
      .addCase(updateAnnouncement.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items[action.payload.id] = action.payload;
        state.error = null;
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to update announcement';
      })
      // Delete Announcement
      .addCase(deleteAnnouncement.pending, state => {
        state.status = 'loading';
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, announcementId} = action.payload;
        // Remove from items
        delete state.items[announcementId];
        // Remove from group mapping
        if (state.groupAnnouncementIds[groupId]) {
          state.groupAnnouncementIds[groupId] = state.groupAnnouncementIds[
            groupId
          ].filter(id => id !== announcementId);
        }
        state.error = null;
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {clearAnnouncementsError} = announcementsSlice.actions;

// Selectors
export const selectAllAnnouncements = (state: RootState) =>
  state.announcements.items;
export const selectGroupAnnouncementIds = (state: RootState, groupId: string) =>
  state.announcements.groupAnnouncementIds[groupId] || [];

export const selectAnnouncementsByGroupId = createSelector(
  [selectAllAnnouncements, selectGroupAnnouncementIds],
  (allItems, groupIds) => {
    return groupIds.map(id => allItems[id]).filter(Boolean);
  },
);

export const selectAnnouncementById = (
  state: RootState,
  announcementId: string,
) => state.announcements.items[announcementId];
export const selectAnnouncementsStatus = (state: RootState) =>
  state.announcements.status;
export const selectAnnouncementsError = (state: RootState) =>
  state.announcements.error;

export default announcementsSlice.reducer;
