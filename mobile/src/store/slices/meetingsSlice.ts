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

// Define state type
interface MeetingsState {
  items: Record<string, Meeting>;
  filteredIds: string[];
  favoriteIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
  userLocation: Location | null;
}

// Initial state
const initialState: MeetingsState = {
  items: {},
  filteredIds: [],
  favoriteIds: [],
  status: 'idle',
  error: null,
  lastFetched: null,
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

export const fetchMeetings = createAsyncThunk(
  'meetings/fetchMeetings',
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

        return {
          meetings,
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
  {
    // Only fetch if data is stale
    condition: (_, {getState}) => {
      const state = getState() as RootState;

      // If already loading, don't fetch again
      if (state.meetings.status === 'loading') return false;

      return isDataStale(state.meetings.lastFetched);
    },
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
        state.lastFetched = Date.now();

        state.error = null;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch meetings';
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
      });
  },
});

// Export actions and reducer
export const {clearError, filterMeetings} = meetingsSlice.actions;

// Selectors
export const selectAllMeetings = (state: RootState) =>
  Object.values(state.meetings.items);

export const selectFilteredMeetings = (state: RootState) =>
  state.meetings.filteredIds
    .map(id => state.meetings.items[id])
    .filter(Boolean);

export const selectFavoriteMeetings = (state: RootState) =>
  state.meetings.favoriteIds
    .map(id => state.meetings.items[id])
    .filter(Boolean);

export const selectMeetingById = (state: RootState, id: string) =>
  state.meetings.items[id];

export const selectMeetingsStatus = (state: RootState) => state.meetings.status;

export const selectMeetingsError = (state: RootState) => state.meetings.error;

export const selectUserLocation = (state: RootState) =>
  state.meetings.userLocation;

export default meetingsSlice.reducer;
