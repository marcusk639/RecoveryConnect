import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';
import SponsorModel from '../../models/SponsorModel';
import {
  Sponsorship,
  SponsorshipAnalytics,
  SponsorChatMessage,
  SponsorSettings,
} from '../../types/sponsorship';
import {RootState} from '../types';
import {Timestamp} from '../../types/schema';

// Define proper entity types
export interface SponsorshipEntity {
  id: string;
  groupId: string;
  sponsorId: string;
  sponseeId: string;
  sponsorName: string;
  sponseeName: string;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'ended' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface SponsorEntity {
  id: string;
  displayName: string;
  sobrietyDate: string;
  requirements: string[];
  bio: string;
  currentSponsees: number;
  maxSponsees: number;
}

export interface SponsorshipRequestEntity {
  id: string;
  sponseeId: string;
  sponseeName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

// Create entity adapters for better performance
const sponsorshipsAdapter = createEntityAdapter({
  selectId: (sponsorship: SponsorshipEntity) => sponsorship.id,
  sortComparer: (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
});

const sponsorsAdapter = createEntityAdapter({
  selectId: (sponsor: SponsorEntity) => sponsor.id,
  sortComparer: (a, b) => a.displayName.localeCompare(b.displayName),
});

const sponsorshipRequestsAdapter = createEntityAdapter({
  selectId: (request: SponsorshipRequestEntity) => request.id,
  sortComparer: (a, b) =>
    b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime(),
});

// Update state interface
export interface SponsorshipState {
  sponsorships: ReturnType<typeof sponsorshipsAdapter.getInitialState>;
  analytics: SponsorshipAnalytics | null;
  chatMessages: Record<string, SponsorChatMessage[]>;
  loading: boolean;
  error: string | null;
  sponsors: ReturnType<typeof sponsorsAdapter.getInitialState>;
  sponsorshipRequests: ReturnType<
    typeof sponsorshipRequestsAdapter.getInitialState
  >;
  groupSponsors: Record<string, string[]>;
}

const initialState: SponsorshipState = {
  sponsorships: sponsorshipsAdapter.getInitialState(),
  analytics: null,
  chatMessages: {},
  loading: false,
  error: null,
  sponsors: sponsorsAdapter.getInitialState(),
  sponsorshipRequests: sponsorshipRequestsAdapter.getInitialState(),
  groupSponsors: {},
};

const convertToSponsorshipEntity = (
  sponsorship: Sponsorship,
): SponsorshipEntity => ({
  id: sponsorship.id,
  groupId: sponsorship.groupId,
  sponsorId: sponsorship.sponsorId,
  sponseeId: sponsorship.sponseeId,
  sponsorName: sponsorship.sponsorName,
  sponseeName: sponsorship.sponseeName,
  startDate: sponsorship.startDate.toISOString(),
  endDate: sponsorship.endDate?.toISOString() || null,
  status:
    sponsorship.status === 'completed'
      ? 'ended'
      : sponsorship.status === 'terminated'
      ? 'ended'
      : sponsorship.status,
  createdAt: sponsorship.createdAt.toISOString(),
  updatedAt: sponsorship.updatedAt.toISOString(),
});

export const fetchGroupSponsorships = createAsyncThunk(
  'sponsorship/fetchGroupSponsorships',
  async (groupId: string) => {
    const sponsorModel = SponsorModel.getInstance();
    return await sponsorModel.getGroupSponsorships(groupId);
  },
);

export const fetchSponsorshipAnalytics = createAsyncThunk(
  'sponsorship/fetchAnalytics',
  async (groupId: string) => {
    const sponsorModel = SponsorModel.getInstance();
    return await sponsorModel.getSponsorshipAnalytics(groupId);
  },
);

export const createNewSponsorship = createAsyncThunk(
  'sponsorship/create',
  async ({
    groupId,
    sponsorId,
    sponseeId,
  }: {
    groupId: string;
    sponsorId: string;
    sponseeId: string;
  }) => {
    const sponsorModel = SponsorModel.getInstance();
    return await sponsorModel.createSponsorship(groupId, sponsorId, sponseeId);
  },
);

export const updateSponsorshipStatus = createAsyncThunk(
  'sponsorship/updateStatus',
  async ({
    groupId,
    sponsorshipId,
    status,
  }: {
    groupId: string;
    sponsorshipId: string;
    status: 'active' | 'completed' | 'terminated';
  }) => {
    const sponsorModel = SponsorModel.getInstance();
    await sponsorModel.updateSponsorshipStatus(groupId, sponsorshipId, status);
    return {sponsorshipId, status};
  },
);

export const fetchSponsorChatMessages = createAsyncThunk(
  'sponsorship/fetchChatMessages',
  async ({
    groupId,
    sponsorId,
    sponseeId,
  }: {
    groupId: string;
    sponsorId: string;
    sponseeId: string;
  }) => {
    const sponsorModel = SponsorModel.getInstance();
    const messages = await sponsorModel.getSponsorChatMessages(
      groupId,
      sponsorId,
      sponseeId,
    );
    return {sponsorId, sponseeId, messages};
  },
);

export const sendSponsorChatMessage = createAsyncThunk(
  'sponsorship/sendChatMessage',
  async ({
    groupId,
    sponsorId,
    sponseeId,
    message,
    senderId,
  }: {
    groupId: string;
    sponsorId: string;
    sponseeId: string;
    message: string;
    senderId: string;
  }) => {
    const sponsorModel = SponsorModel.getInstance();
    await sponsorModel.sendSponsorChatMessage(
      groupId,
      sponsorId,
      sponseeId,
      message,
      senderId,
    );
    return {sponsorId, sponseeId, message, senderId};
  },
);

export const fetchGroupSponsors = createAsyncThunk(
  'sponsorship/fetchGroupSponsors',
  async (groupId: string) => {
    const sponsorModel = SponsorModel.getInstance();
    return await sponsorModel.getGroupSponsors(groupId);
  },
);

export const requestSponsorship = createAsyncThunk(
  'sponsorship/request',
  async ({
    groupId,
    sponsorId,
    message,
  }: {
    groupId: string;
    sponsorId: string;
    message: string;
  }) => {
    const sponsorModel = SponsorModel.getInstance();
    return await sponsorModel.requestSponsorship(groupId, sponsorId, message);
  },
);

export const acceptSponsorshipRequest = createAsyncThunk(
  'sponsorship/acceptRequest',
  async ({groupId, requestId}: {groupId: string; requestId: string}) => {
    const sponsorModel = SponsorModel.getInstance();
    return await sponsorModel.acceptSponsorshipRequest(groupId, requestId);
  },
);

export const rejectSponsorshipRequest = createAsyncThunk(
  'sponsorship/rejectRequest',
  async ({groupId, requestId}: {groupId: string; requestId: string}) => {
    const sponsorModel = SponsorModel.getInstance();
    return await sponsorModel.rejectSponsorshipRequest(groupId, requestId);
  },
);

export const updateSponsorAvailability = createAsyncThunk(
  'sponsorship/updateAvailability',
  async ({groupId, isAvailable}: {groupId: string; isAvailable: boolean}) => {
    const sponsorModel = SponsorModel.getInstance();
    return await sponsorModel.updateSponsorAvailability(groupId, isAvailable);
  },
);

// Update the slice definition
const sponsorshipSlice = createSlice({
  name: 'sponsorship',
  initialState,
  reducers: {
    clearSponsorshipState: state => {
      state.sponsorships = sponsorshipsAdapter.getInitialState();
      state.analytics = null;
      state.chatMessages = {};
      state.loading = false;
      state.error = null;
      state.sponsors = sponsorsAdapter.getInitialState();
      state.sponsorshipRequests = sponsorshipRequestsAdapter.getInitialState();
      state.groupSponsors = {};
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Group Sponsorships
      .addCase(fetchGroupSponsorships.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupSponsorships.fulfilled, (state, action) => {
        state.loading = false;
        const entities = action.payload.map(convertToSponsorshipEntity);
        sponsorshipsAdapter.setAll(state.sponsorships, entities);
      })
      .addCase(fetchGroupSponsorships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sponsorships';
      })
      // Fetch Analytics
      .addCase(fetchSponsorshipAnalytics.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSponsorshipAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchSponsorshipAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch analytics';
      })
      // Create Sponsorship
      .addCase(createNewSponsorship.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createNewSponsorship.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create sponsorship';
      })
      // Update Status
      .addCase(updateSponsorshipStatus.fulfilled, (state, action) => {
        const {sponsorshipId, status} = action.payload;
        const sponsorship = state.sponsorships.entities[sponsorshipId];
        if (sponsorship) {
          sponsorship.status =
            status === 'completed'
              ? 'ended'
              : status === 'terminated'
              ? 'ended'
              : status;
          if (status !== 'active') {
            sponsorship.endDate = new Date().toISOString();
          }
        }
      })
      // Fetch Chat Messages
      .addCase(fetchSponsorChatMessages.fulfilled, (state, action) => {
        const {sponsorId, sponseeId, messages} = action.payload;
        const chatId = [sponsorId, sponseeId].sort().join('_');
        state.chatMessages[chatId] = messages;
      })
      // Send Chat Message
      .addCase(sendSponsorChatMessage.fulfilled, (state, action) => {
        const {sponsorId, sponseeId, message, senderId} = action.payload;
        const chatId = [sponsorId, sponseeId].sort().join('_');
        const newMessage: SponsorChatMessage = {
          id: Date.now().toString(),
          text: message,
          senderId,
          timestamp: new Date(),
          isRead: false,
        };
        if (!state.chatMessages[chatId]) {
          state.chatMessages[chatId] = [];
        }
        state.chatMessages[chatId].push(newMessage);
      })
      // Fetch Group Sponsors
      .addCase(fetchGroupSponsors.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupSponsors.fulfilled, (state, action) => {
        state.loading = false;
        state.groupSponsors[action.meta.arg] = action.payload.map(
          sponsor => sponsor.id,
        );
        state.sponsors.ids = action.payload.map(sponsor => sponsor.id);
        state.sponsors.entities = action.payload.reduce<
          Record<string, SponsorEntity>
        >((acc, sponsor) => {
          acc[sponsor.id] = sponsor;
          return acc;
        }, {});
      })
      .addCase(fetchGroupSponsors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sponsors';
      })
      // Request Sponsorship
      .addCase(requestSponsorship.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestSponsorship.fulfilled, (state, action) => {
        state.loading = false;
        const {groupId, request} = action.payload;
        if (!request) return;

        if (!state.sponsorshipRequests.entities[request.id]) {
          state.sponsorshipRequests.ids.push(request.id);
          state.sponsorshipRequests.entities[request.id] = {
            id: request.id,
            sponseeId: request.sponseeId,
            sponseeName: request.sponseeName,
            message: request.message,
            status: 'pending' as const,
            createdAt: request.createdAt,
          };
        }
      })
      .addCase(requestSponsorship.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to request sponsorship';
      })
      // Accept Sponsorship Request
      .addCase(acceptSponsorshipRequest.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptSponsorshipRequest.fulfilled, (state, action) => {
        state.loading = false;
        const {groupId, requestId} = action.meta.arg;
        const request = sponsorshipRequestsAdapter
          .getSelectors()
          .selectById(state.sponsorshipRequests, requestId);
        if (request) {
          sponsorshipRequestsAdapter.updateOne(state.sponsorshipRequests, {
            id: requestId,
            changes: {status: 'accepted'},
          });
        }
      })
      .addCase(acceptSponsorshipRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to accept sponsorship request';
      })
      // Reject Sponsorship Request
      .addCase(rejectSponsorshipRequest.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectSponsorshipRequest.fulfilled, (state, action) => {
        state.loading = false;
        const {groupId, requestId} = action.meta.arg;
        const request = sponsorshipRequestsAdapter
          .getSelectors()
          .selectById(state.sponsorshipRequests, requestId);
        if (request) {
          sponsorshipRequestsAdapter.updateOne(state.sponsorshipRequests, {
            id: requestId,
            changes: {status: 'rejected'},
          });
        }
      })
      .addCase(rejectSponsorshipRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to reject sponsorship request';
      })
      // Update Sponsor Availability
      .addCase(updateSponsorAvailability.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSponsorAvailability.fulfilled, (state, action) => {
        state.loading = false;
        const {groupId, isAvailable} = action.meta.arg;
        // Remove auth state access since it's not available in this slice
        // The UI will handle updating the sponsor's availability status
      })
      .addCase(updateSponsorAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to update sponsor availability';
      });
  },
});

// Optimize selectors with proper memoization
export const selectAllSponsorships = createSelector(
  [(state: RootState) => state.sponsorship.sponsorships],
  sponsorships => sponsorshipsAdapter.getSelectors().selectAll(sponsorships),
);

export const selectGroupSponsors = createSelector(
  [(state: RootState) => state.sponsorship.sponsors],
  sponsors =>
    sponsorsAdapter
      .getSelectors()
      .selectAll(sponsors)
      .filter((sponsor): sponsor is SponsorEntity => sponsor !== undefined),
);

export const selectSponsorshipRequests = createSelector(
  [(state: RootState) => state.sponsorship.sponsorshipRequests],
  requests =>
    sponsorshipRequestsAdapter
      .getSelectors()
      .selectAll(requests)
      .filter(
        (request): request is SponsorshipRequestEntity => request !== undefined,
      ),
);

export const selectSponsorSettings = (state: RootState) =>
  state.auth.users.entities[state.auth.user?.uid ?? '']?.sponsorSettings;

export const selectIsSponsorAvailable = createSelector(
  [selectSponsorSettings],
  sponsorSettings => sponsorSettings?.isAvailable || false,
);

export const selectCurrentSponsees = createSelector(
  [selectAllSponsorships, (state: RootState) => state.auth.user?.uid],
  (sponsorships, userId) => {
    if (!userId) return 0;
    return sponsorships.filter(
      s => s.sponsorId === userId && s.status === 'active',
    ).length;
  },
);

export const selectActiveSponsorship = createSelector(
  [selectAllSponsorships, (state, groupId: string) => groupId],
  (sponsorships, groupId) => {
    return sponsorships.find(
      sponsorship =>
        sponsorship.groupId === groupId &&
        sponsorship.status === 'active' &&
        sponsorship.endDate === null,
    );
  },
);

export const {clearSponsorshipState} = sponsorshipSlice.actions;
export default sponsorshipSlice.reducer;
