import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../index';
import functions from '@react-native-firebase/functions';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore'; // Import firestore and Timestamp type
import * as hashUtils from '../../utils/hashUtils';
import {
  Meeting,
  MeetingInstance, // Import MeetingInstance
  MeetingSearchInput,
  MeetingFilters,
  Location,
  MeetingSearchCriteria,
  MeetingType, // Import MeetingType
} from '../../types';
import {MeetingModel} from '../../models'; // Keep for potential template interactions
import {createSelector} from 'reselect';
import {COLLECTION_PATHS} from '../../types/schema'; // Import paths
import moment from 'moment-timezone'; // Import moment-timezone
import {DayOfWeek, DAYS_OF_WEEK} from '../../types/utils';

// Define state type
interface MeetingsState {
  items: Record<string, Meeting>; // Keep for meeting templates if needed elsewhere
  instanceItems: Record<string, MeetingInstance>; // NEW: Store instances by instanceId
  groupMeetingIds: Record<string, string[]>; // Keep for templates
  groupMeetingInstanceIds: Record<string, string[]>; // NEW: Map groupId to array of instance IDs
  filteredIds: string[];
  favoriteIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedGroup: Record<string, number>; // Timestamp for template fetches
  lastFetchedGroupInstances: Record<string, number>; // NEW: Timestamp for instance fetches
  userLocation: Location | null;
}

// Initial state
const initialState: MeetingsState = {
  items: {},
  instanceItems: {},
  groupMeetingIds: {},
  groupMeetingInstanceIds: {},
  filteredIds: [],
  favoriteIds: [],
  status: 'idle',
  error: null,
  lastFetchedGroup: {},
  lastFetchedGroupInstances: {},
  userLocation: null,
};

// Constants
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL for meetings

// Helper function to check if data is stale
const isDataStale = (lastFetched: number | null): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_TTL;
};

// --- Instance Helper ---
// Function to convert Firestore Instance Doc to MeetingInstance Type
function instanceFromFirestore(docId: string, data: any): MeetingInstance {
  return {
    instanceId: docId,
    meetingId: data.meetingId,
    groupId: data.groupId,
    scheduledAt: data.scheduledAt.toDate(), // Convert Timestamp to Date
    name: data.name,
    type: data.type,
    format: data.format,
    location: data.location,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    lat: data.lat,
    lng: data.lng,
    locationName: data.locationName,
    isOnline: data.isOnline,
    link: data.link,
    onlineNotes: data.onlineNotes,
    isCancelled: data.isCancelled ?? false,
    instanceNotice: data.instanceNotice ?? null,
    templateUpdatedAt: data.templateUpdatedAt.toDate(), // Convert Timestamp
    day: data.day ?? '', // Add day, provide default
    time: data.time ?? '', // Add time, provide default
  };
}

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

// --- Helper to calculate next meeting date ---
function getNextMeetingDate(dayOfWeek: string, time: string): Date | null {
  if (!dayOfWeek || !time) return null;

  const days = DAYS_OF_WEEK;
  const targetDayIndex = days.indexOf(dayOfWeek.toLowerCase() as DayOfWeek);
  if (targetDayIndex === -1) return null;

  const now = moment(); // Use moment in local timezone for comparison
  let nextDate = now.clone().day(targetDayIndex);

  // Parse time (handle potential AM/PM or 24hr)
  const meetingTime = moment(time, ['h:mm A', 'HH:mm']);
  if (!meetingTime.isValid()) return null;

  // Set the time on the target date
  nextDate
    .hour(meetingTime.hour())
    .minute(meetingTime.minute())
    .second(0)
    .millisecond(0);

  // If the calculated date/time is in the past relative to now, move to the next week
  if (nextDate.isBefore(now)) {
    nextDate.add(1, 'week');
  }

  return nextDate.toDate();
}

// Define fetchUpcomingMeetingInstances thunk
export const fetchUpcomingMeetingInstances = createAsyncThunk<
  {groupId: string; instances: MeetingInstance[]}, // Return type
  string, // Argument is groupId
  {state: RootState; rejectValue: string}
>(
  'meetings/fetchUpcomingInstances',
  async (groupId, {getState, rejectWithValue}) => {
    try {
      // Attempt to fetch pre-generated instances first
      let instances = await MeetingModel.getUpcomingInstancesByGroupId(groupId);

      // --- Fallback Logic ---
      if (!instances || instances.length === 0) {
        console.log(
          `No pre-generated instances found for group ${groupId}, attempting fallback from templates.`,
        );
        // Fetch meeting templates as a fallback
        const meetings = await MeetingModel.getMeetingsByGroupId(groupId);
        const now = new Date(); // For templateUpdatedAt default

        instances = meetings
          .map(meeting => {
            const scheduledAtDate = getNextMeetingDate(
              meeting.day,
              meeting.time,
            );

            // Create a mock instance - essential fields must be present
            const instance: MeetingInstance = {
              // Inherit most fields from the template
              ...meeting,
              // Override/Add instance-specific fields
              instanceId: `${meeting.id}-fallback-${
                scheduledAtDate?.getTime() || Date.now()
              }`, // Create a unique-ish ID
              meetingId: meeting.id || 'unknown-template',
              groupId: meeting.groupId || groupId,
              scheduledAt: scheduledAtDate || now, // Use calculated date or fallback to now
              isCancelled: meeting.isCancelledTemporarily ?? false, // Use template cancellation as instance cancellation
              instanceNotice: meeting.temporaryNotice ?? null, // Use template notice as instance notice
              templateUpdatedAt: meeting.updatedAt || now, // Use template update time or now
            };
            return instance;
          })
          .filter(instance => instance.scheduledAt >= now) // Filter out any calculated past dates
          .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()); // Sort chronologically
      }
      // --- End Fallback Logic ---

      return {groupId, instances};
    } catch (error: any) {
      console.error('Error fetching meeting instances:', error);
      return rejectWithValue(
        error.message || 'Failed to fetch upcoming meetings',
      );
    }
  },
);

// NEW: Thunk to update a single meeting instance (e.g., for chairperson)
export const updateMeetingInstance = createAsyncThunk<
  MeetingInstance, // Return updated instance
  {instanceId: string; updateData: Partial<MeetingInstance>}, // Args
  {rejectValue: string}
>(
  'meetings/updateInstance',
  async ({instanceId, updateData}, {rejectWithValue}) => {
    try {
      // Note: This currently uses MeetingModel.update which operates on MEETING TEMPLATES.
      // We need MeetingModel.updateInstanceChairperson or a similar method specifically for instances.
      // For now, let's assume updateInstanceChairperson handles the specific update needed.
      // We pass only the fields relevant to the chairperson update.
      await MeetingModel.updateInstanceChairperson(
        instanceId,
        updateData.chairpersonId ?? null,
        updateData.chairpersonName ?? null,
      );

      // Fetch the updated instance to return (or construct locally if preferred)
      // This requires a getMeetingInstanceById method in MeetingModel
      // For simplicity, construct optimistic update based on input:
      const tempUpdatedInstance: Partial<MeetingInstance> = {
        ...updateData, // Include whatever was passed in
        // We don't have the full instance data here without another fetch
      };

      // WARNING: Returning partial data. Ideally, fetch the full updated doc.
      return tempUpdatedInstance as MeetingInstance; // Cast needed due to missing fields
    } catch (error: any) {
      console.error('Error updating meeting instance:', error);
      return rejectWithValue(
        error.message || 'Failed to update meeting instance',
      );
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
      })

      // --- fetchUpcomingMeetingInstances ---
      .addCase(fetchUpcomingMeetingInstances.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchUpcomingMeetingInstances.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, instances} = action.payload;
        const instanceIds: string[] = [];
        instances.forEach(instance => {
          state.instanceItems[instance.instanceId] = instance; // Store by instanceId
          instanceIds.push(instance.instanceId);
        });
        state.groupMeetingInstanceIds[groupId] = instanceIds; // Update instance ID mapping
        state.lastFetchedGroupInstances[groupId] = Date.now(); // Update instance fetch time
        state.error = null;
      })
      .addCase(fetchUpcomingMeetingInstances.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // --- updateMeetingInstance ---
      .addCase(updateMeetingInstance.pending, state => {
        state.status = 'loading'; // Or a specific 'updating' status
      })
      .addCase(updateMeetingInstance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedInstance = action.payload;
        if (
          updatedInstance.instanceId &&
          state.instanceItems[updatedInstance.instanceId]
        ) {
          // Merge the updates into the existing instance state
          state.instanceItems[updatedInstance.instanceId] = {
            ...state.instanceItems[updatedInstance.instanceId],
            ...updatedInstance,
          };
        } else if (updatedInstance.instanceId) {
          // If it wasn't in state before, add it (less likely scenario)
          state.instanceItems[updatedInstance.instanceId] = updatedInstance;
          // Also need to potentially add to groupMeetingInstanceIds if not present
        }
        state.error = null;
      })
      .addCase(updateMeetingInstance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const {clearError, filterMeetings} = meetingsSlice.actions;

// Selectors
export const selectAllMeetingTemplates = (state: RootState) =>
  state.meetings.items;
export const selectAllMeetingInstances = (state: RootState) =>
  state.meetings.instanceItems;
export const selectGroupMeetingTemplateIds = (
  state: RootState,
  groupId: string,
) => state.meetings.groupMeetingIds[groupId] || [];
export const selectGroupMeetingInstanceIds = (
  state: RootState,
  groupId: string,
) => state.meetings.groupMeetingInstanceIds[groupId] || [];

// Selector for upcoming meeting instances for a specific group
export const selectUpcomingMeetingInstances = createSelector(
  [selectAllMeetingInstances, selectGroupMeetingInstanceIds],
  (allInstances, instanceIds) => {
    // Map IDs to instances and filter out any potential undefined results
    return instanceIds.map(id => allInstances[id]).filter(Boolean);
  },
);

export const selectMeetingById = (state: RootState, meetingId: string) =>
  state.meetings.items[meetingId];
export const selectMeetingsStatus = (state: RootState) => state.meetings.status;
export const selectMeetingsError = (state: RootState) => state.meetings.error;
export const selectFilteredMeetings = (state: RootState) =>
  state.meetings.filteredIds.map(id => state.meetings.items[id]);

export const selectUserLocation = (state: RootState) =>
  state.meetings.userLocation;
export const selectGroupMeetings = (state: RootState, groupId: string) =>
  state.meetings.items[groupId] || [];

// NEW: Selector for a single meeting instance by ID
export const selectMeetingInstanceById = (
  state: RootState,
  instanceId: string,
) => state.meetings.instanceItems[instanceId];

export default meetingsSlice.reducer;
