import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../index';
import functions from '@react-native-firebase/functions';
import * as hashUtils from '../../utils/hashUtils';
import {
  Meeting,
  MeetingSearchInput,
  MeetingFilters,
  Location,
  MeetingSearchCriteria,
} from '../../types';
import {MeetingModel} from '../../models';
import {createSelector} from 'reselect';

// Define state type
interface MeetingsState {
  items: Record<string, Meeting>; // Store meetings by ID
  groupMeetingIds: Record<string, string[]>; // Map groupId to array of meeting IDs
  filteredIds: string[]; // IDs for search results (if applicable)
  favoriteIds: string[]; // IDs of favorite meetings
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedGroup: Record<string, number>; // Track last fetch time per group
  userLocation: Location | null;
}

// Initial state - adjust to new structure
const initialState: MeetingsState = {
  items: {},
  groupMeetingIds: {},
  filteredIds: [],
  favoriteIds: [],
  status: 'idle',
  error: null,
  lastFetchedGroup: {},
  userLocation: null,
};

// Constants
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL for meetings

// Helper function to check if data is stale
const isDataStale = (lastFetched: number | null): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_TTL;
};

// Async thunks
export const setUserLocation = createAsyncThunk(
  'meetings/setUserLocation',
  async (location: Location) => {
    // Just return the location, we'll handle fetchMeetings separately
    return location;
  },
);

export const fetchGroupMeetings = createAsyncThunk<
  {groupId: string; meetings: Meeting[]}, // Return type MUST include groupId
  string, // Argument is groupId
  {state: RootState; rejectValue: string}
>(
  'meetings/fetchGroupMeetings',
  async (groupId, {getState, rejectWithValue}) => {
    try {
      const meetings = await MeetingModel.getMeetingsByGroupId(groupId);
      // Ensure the returned object matches the defined return type
      return {groupId, meetings};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch group meetings');
    }
  },
);

export const fetchMeetings = createAsyncThunk(
  'meetings/fetchMeetings',
  async (
    {
      location,
      filters,
      criteria,
      groupId,
    }: {
      location?: Location;
      filters?: MeetingFilters;
      criteria?: MeetingSearchCriteria;
      groupId?: string;
    },
    {getState, rejectWithValue},
  ) => {
    try {
      const state = getState() as RootState;
      const effectiveLocation = location || state.meetings.userLocation;

      if (!effectiveLocation) {
        return rejectWithValue('Location is required to find meetings');
      }

      // Build meeting search input correctly matching the expected structure
      const searchInput = {
        filters: {
          date: new Date().toISOString(),
          location: effectiveLocation,
          day: filters?.day,
          type: filters?.type,
        },
        criteria: criteria,
      };

      console.log(
        'Sending meeting search request:',
        JSON.stringify(searchInput),
      );

      // Call the cloud function
      const meetingsResult = await functions().httpsCallable('findMeetings')(
        searchInput,
      );

      if (meetingsResult.data && Array.isArray(meetingsResult.data)) {
        const meetings = meetingsResult.data.map((meeting: any) => ({
          ...meeting,
          id: meeting.id || hashUtils.generateMeetingHash(meeting),
        }));

        return {
          meetings,
          groupId,
        };
      } else {
        return rejectWithValue(
          'Invalid response format from findMeetings function',
        );
      }
    } catch (error: any) {
      console.error('Error fetching meetings:', error);
      return rejectWithValue(error.message || 'Failed to fetch meetings');
    }
  },
);

export const toggleFavoriteMeeting = createAsyncThunk(
  'meetings/toggleFavorite',
  async (meetingId: string, {getState}) => {
    const state = getState() as RootState;
    const isFavorite = state.meetings.favoriteIds.includes(meetingId);

    // Here you would normally update Firestore, but for this example
    // we're just updating the state
    return {
      meetingId,
      isFavorite: !isFavorite,
    };
  },
);

export const updateMeeting = createAsyncThunk<
  Meeting, // Return the updated meeting
  {meetingId: string; meetingData: Partial<Meeting>}, // Argument
  {rejectValue: string}
>(
  'meetings/updateMeeting',
  async ({meetingId, meetingData}, {rejectWithValue}) => {
    try {
      const updatedMeeting = await MeetingModel.update(meetingId, meetingData);
      return updatedMeeting;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update meeting');
    }
  },
);

export const fetchFavoriteMeetings = createAsyncThunk(
  'meetings/fetchFavoriteMeetings',
  async (
    {
      location,
      filters,
      criteria,
    }: {
      location?: Location;
      filters?: MeetingFilters;
      criteria?: MeetingSearchCriteria;
    },
    {getState, rejectWithValue},
  ) => {
    try {
      const state = getState() as RootState;
      const effectiveLocation = location || state.meetings.userLocation;

      if (!effectiveLocation) {
        return rejectWithValue('Location is required to find meetings');
      }

      // Build meeting search input correctly matching the expected structure
      const searchInput = {
        filters: {
          date: new Date().toISOString(),
          location: effectiveLocation,
          day: filters?.day,
          type: filters?.type,
        },
        criteria: criteria,
      };

      console.log(
        'Sending meeting search request:',
        JSON.stringify(searchInput),
      );

      // Call the cloud function
      const meetingsResult = await functions().httpsCallable('findMeetings')(
        searchInput,
      );

      if (meetingsResult.data && Array.isArray(meetingsResult.data)) {
        const meetings = meetingsResult.data.map((meeting: any) => ({
          ...meeting,
          id: meeting.id || hashUtils.generateMeetingHash(meeting),
        }));

        return meetings;
      } else {
        return rejectWithValue(
          'Invalid response format from findMeetings function',
        );
      }
    } catch (error: any) {
      console.error('Error fetching meetings:', error);
      return rejectWithValue(error.message || 'Failed to fetch meetings');
    }
  },
);

// Create the slice
const meetingsSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    filterMeetings: (
      state,
      action: PayloadAction<{
        searchQuery?: string;
        showOnline?: boolean;
        showInPerson?: boolean;
        meetingType?: string | null;
        day?: string | null;
      }>,
    ) => {
      const {searchQuery, showOnline, showInPerson, meetingType, day} =
        action.payload;

      // Get all meeting IDs
      const allMeetingIds = Object.keys(state.items);

      // Filter based on criteria
      state.filteredIds = allMeetingIds.filter(id => {
        const meeting = state.items[id];

        // Filter by online/in-person
        if (showOnline !== undefined && !showOnline && meeting.online) {
          return false;
        }

        if (showInPerson !== undefined && !showInPerson && !meeting.online) {
          return false;
        }

        // Filter by meeting type
        if (meetingType && meeting.type !== meetingType) {
          return false;
        }

        // Filter by day
        if (day && meeting.day !== day.toLowerCase()) {
          return false;
        }

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            meeting.name.toLowerCase().includes(query) ||
            (meeting.location &&
              meeting.location.toLowerCase().includes(query)) ||
            (meeting.address &&
              meeting.address.toLowerCase().includes(query)) ||
            (meeting.city && meeting.city.toLowerCase().includes(query))
          );
        }

        return true;
      });
    },
  },
  extraReducers: builder => {
    builder
      // Set user location
      .addCase(setUserLocation.fulfilled, (state, action) => {
        state.userLocation = action.payload;
      })

      // Fetch meetings
      .addCase(fetchMeetings.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.status = 'succeeded';

        // Add meetings to items dictionary
        action.payload.meetings.forEach(meeting => {
          if (meeting.id) {
            state.items[meeting.id] = meeting;
          }
        });

        // Update filtered IDs based on search query
        state.filteredIds = action.payload.meetings
          .filter(meeting => meeting.id)
          .map(meeting => meeting.id!);

        // Update last fetched timestamp
        state.lastFetchedGroup[action.payload.groupId!] = Date.now();

        state.error = null;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch meetings';
      })

      // Handle fetchGroupMeetings
      .addCase(fetchGroupMeetings.pending, state => {
        state.status = 'loading';
      })
      .addCase(
        fetchGroupMeetings.fulfilled,
        (
          state,
          action: PayloadAction<{groupId: string; meetings: Meeting[]}>,
        ) => {
          state.status = 'succeeded';
          // Access payload properties directly
          const groupId = action.payload.groupId;
          const meetings = action.payload.meetings;

          if (!groupId || !Array.isArray(meetings)) {
            // Handle potential case where payload is malformed
            console.error(
              'Invalid payload received for fetchGroupMeetings.fulfilled',
            );
            state.status = 'failed';
            state.error = 'Invalid data received from server.';
            return;
          }

          const meetingIds: string[] = [];
          meetings.forEach(meeting => {
            if (meeting?.id) {
              // Add safe access check for meeting object itself
              state.items[meeting.id] = meeting;
              meetingIds.push(meeting.id);
            }
          });
          state.groupMeetingIds[groupId] = meetingIds;
          // Use type assertion as last resort for persistent linter error
          if (groupId) {
            // Keep check for runtime safety
            state.lastFetchedGroup[groupId as any] = Date.now();
          }
          state.error = null;
        },
      )
      .addCase(fetchGroupMeetings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Toggle favorite
      .addCase(toggleFavoriteMeeting.fulfilled, (state, action) => {
        const {meetingId, isFavorite} = action.payload;

        if (isFavorite) {
          state.favoriteIds.push(meetingId);
        } else {
          state.favoriteIds = state.favoriteIds.filter(id => id !== meetingId);
        }

        // Update the meeting favorite status
        if (state.items[meetingId]) {
          state.items[meetingId].isFavorite = isFavorite;
        }
      })

      // Fetch favorite meetings
      .addCase(fetchFavoriteMeetings.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchFavoriteMeetings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const favoriteMeetings = action.payload; // This is Meeting[]
        const favoriteIds: string[] = [];
        favoriteMeetings.forEach(meeting => {
          if (meeting.id) {
            state.items[meeting.id] = meeting; // Add/update item
            favoriteIds.push(meeting.id);
          }
        });
        state.favoriteIds = favoriteIds; // Update the list of favorite IDs
        state.error = null;
      })
      .addCase(fetchFavoriteMeetings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Update meeting
      .addCase(updateMeeting.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedMeeting = action.payload;
        if (updatedMeeting.id) {
          state.items[updatedMeeting.id] = updatedMeeting;
        }
        state.error = null;
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {clearError, filterMeetings} = meetingsSlice.actions;

// Selectors
export const selectAllMeetings = (state: RootState) => state.meetings.items;
export const selectGroupMeetingIds = (state: RootState, groupId: string) =>
  state.meetings.groupMeetingIds[groupId] || [];

export const selectGroupMeetings = createSelector(
  [selectAllMeetings, selectGroupMeetingIds],
  (allItems, groupIds) => {
    return groupIds.map(id => allItems[id]).filter(Boolean); // Filter out undefined if an ID doesn't exist
  },
);

const selectFilteredIds = (state: RootState) => state.meetings.filteredIds;

export const selectFilteredMeetings = createSelector(
  [selectAllMeetings, selectFilteredIds],
  (allItems, filteredIds) => {
    return filteredIds.map(id => allItems[id]).filter(Boolean); // Filter out undefined if an ID doesn't exist
  },
);

export const selectMeetingById = (state: RootState, meetingId: string) =>
  state.meetings.items[meetingId];
export const selectMeetingsStatus = (state: RootState) => state.meetings.status;
export const selectMeetingsError = (state: RootState) => state.meetings.error;

export const selectUserLocation = (state: RootState) =>
  state.meetings.userLocation;

export default meetingsSlice.reducer;
