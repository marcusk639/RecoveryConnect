import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../index';
import auth from '@react-native-firebase/auth';
import {AnnouncementModel} from '../../models/AnnouncementModel';

// Define types
export interface Announcement {
  id: string;
  groupId: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  authorName: string;
}

// State interface
interface AnnouncementsState {
  items: Record<string, Announcement>;
  groupAnnouncements: Record<string, string[]>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: Record<string, number>; // By groupId
}

// Initial state
const initialState: AnnouncementsState = {
  items: {},
  groupAnnouncements: {},
  status: 'idle',
  error: null,
  lastFetched: {},
};

// Constants
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL for announcements

// Helper function to check if data is stale
const isDataStale = (lastFetched: number | undefined): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_TTL;
};

// Fetch announcements for a group
export const fetchAnnouncementsForGroup = createAsyncThunk(
  'announcements/fetchForGroup',
  async (groupId: string, {getState, rejectWithValue}) => {
    try {
      const announcements = await AnnouncementModel.getByGroup(groupId);
      return {groupId, announcements};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch announcements');
    }
  },
  {
    condition: (groupId, {getState}) => {
      const state = getState() as RootState;

      // If already loading, don't fetch again
      if (state.announcements.status === 'loading') return false;

      // Check if data for this group is stale
      return isDataStale(state.announcements.lastFetched[groupId]);
    },
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
export const createAnnouncement = createAsyncThunk(
  'announcements/create',
  async (
    {
      groupId,
      title,
      content,
      isPinned = false,
    }: {
      groupId: string;
      title: string;
      content: string;
      isPinned?: boolean;
    },
    {rejectWithValue},
  ) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return rejectWithValue('User not authenticated');
      }

      const announcementData: Omit<Announcement, 'id'> = {
        groupId,
        title,
        content,
        isPinned,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous',
      };

      const announcement = await AnnouncementModel.create(announcementData);
      return announcement;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create announcement');
    }
  },
);

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
export const deleteAnnouncement = createAsyncThunk(
  'announcements/delete',
  async (announcementId: string, {getState, rejectWithValue}) => {
    try {
      const state = getState() as RootState;
      const announcement = state.announcements.items[announcementId];

      if (!announcement) {
        return rejectWithValue('Announcement not found');
      }

      await AnnouncementModel.delete(announcementId);

      return {
        id: announcementId,
        groupId: announcement.groupId,
      };
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
      // Fetch announcements for group
      .addCase(fetchAnnouncementsForGroup.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchAnnouncementsForGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';

        const {groupId, announcements} = action.payload;

        // Update items dictionary with announcements
        announcements.forEach((announcement: Announcement) => {
          state.items[announcement.id] = announcement;
        });

        // Update group announcements array with IDs
        state.groupAnnouncements[groupId] = announcements.map(
          (a: Announcement) => a.id,
        );

        // Update last fetched timestamp for this group
        state.lastFetched[groupId] = Date.now();

        state.error = null;
      })
      .addCase(fetchAnnouncementsForGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to fetch announcements';
      })

      // Fetch announcement by ID
      .addCase(fetchAnnouncementById.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchAnnouncementById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items[action.payload.id] = action.payload;
        state.error = null;
      })
      .addCase(fetchAnnouncementById.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to fetch announcement';
      })

      // Create announcement
      .addCase(createAnnouncement.pending, state => {
        state.status = 'loading';
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const announcement = action.payload;

        // Add to items
        state.items[announcement.id] = announcement;

        // Add to group announcements
        if (!state.groupAnnouncements[announcement.groupId]) {
          state.groupAnnouncements[announcement.groupId] = [];
        }
        state.groupAnnouncements[announcement.groupId].unshift(announcement.id);

        state.error = null;
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to create announcement';
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

      // Delete announcement
      .addCase(deleteAnnouncement.pending, state => {
        state.status = 'loading';
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {id, groupId} = action.payload;

        // Remove from items
        delete state.items[id];

        // Remove from group announcements
        if (state.groupAnnouncements[groupId]) {
          state.groupAnnouncements[groupId] = state.groupAnnouncements[
            groupId
          ].filter(announcementId => announcementId !== id);
        }

        state.error = null;
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to delete announcement';
      });
  },
});

// Export actions and reducer
export const {clearAnnouncementsError} = announcementsSlice.actions;

// Selectors
export const selectAllAnnouncements = (state: RootState) =>
  Object.values(state.announcements.items);

export const selectAnnouncementsByGroupId = (
  state: RootState,
  groupId: string,
) => {
  const announcementIds = state.announcements.groupAnnouncements[groupId] || [];
  return announcementIds
    .map(id => state.announcements.items[id])
    .filter(Boolean);
};

export const selectAnnouncementById = (state: RootState, id: string) =>
  state.announcements.items[id];

export const selectAnnouncementsStatus = (state: RootState) =>
  state.announcements.status;

export const selectAnnouncementsError = (state: RootState) =>
  state.announcements.error;

export default announcementsSlice.reducer;
