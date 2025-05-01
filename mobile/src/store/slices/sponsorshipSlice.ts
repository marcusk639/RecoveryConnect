import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import SponsorModel from '../../models/SponsorModel';
import {
  Sponsorship,
  SponsorshipAnalytics,
  SponsorChatMessage,
  SponsorSettings,
} from '../../types/sponsorship';
import {RootState} from '../types';

export interface SponsorshipState {
  sponsorships: Sponsorship[];
  analytics: SponsorshipAnalytics | null;
  chatMessages: Record<string, SponsorChatMessage[]>;
  loading: boolean;
  error: string | null;
  sponsors: Record<
    string,
    {
      id: string;
      displayName: string;
      sobrietyDate: string;
      requirements: string[];
      bio: string;
      currentSponsees: number;
      maxSponsees: number;
    }[]
  >;
  sponsorshipRequests: Record<
    string,
    {
      id: string;
      sponseeId: string;
      sponseeName: string;
      message: string;
      status: 'pending' | 'accepted' | 'rejected';
      createdAt: string;
    }[]
  >;
}

const initialState: SponsorshipState = {
  sponsorships: [],
  analytics: null,
  chatMessages: {},
  loading: false,
  error: null,
  sponsors: {},
  sponsorshipRequests: {},
};

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

export const selectGroupSponsors = (state: RootState, groupId: string) =>
  state.sponsorship.sponsors[groupId] || [];

export const selectSponsorshipRequests = (state: RootState, groupId: string) =>
  state.sponsorship.sponsorshipRequests[groupId] || [];

export const selectSponsorSettings = (state: RootState) =>
  state.auth.userData?.sponsorSettings;

export const selectIsSponsorAvailable = (state: RootState, groupId: string) => {
  const sponsorSettings = state.auth.userData?.sponsorSettings;
  return sponsorSettings?.isAvailable || false;
};

export const selectCurrentSponsees = (state: RootState) => {
  const userId = state.auth.user?.uid;
  if (!userId) return 0;
  return state.sponsorship.sponsorships.filter(
    s => s.sponsorId === userId && s.status === 'active',
  ).length;
};

const sponsorshipSlice = createSlice({
  name: 'sponsorship',
  initialState,
  reducers: {
    clearSponsorshipState: state => {
      state.sponsorships = [];
      state.analytics = null;
      state.chatMessages = {};
      state.loading = false;
      state.error = null;
      state.sponsors = {};
      state.sponsorshipRequests = {};
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
        state.sponsorships = action.payload;
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
        const sponsorship = state.sponsorships.find(
          s => s.id === sponsorshipId,
        );
        if (sponsorship) {
          sponsorship.status = status;
          if (status !== 'active') {
            sponsorship.endDate = new Date();
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
        state.sponsors[action.meta.arg] = action.payload;
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
        if (!state.sponsorshipRequests[groupId]) {
          state.sponsorshipRequests[groupId] = [];
        }
        state.sponsorshipRequests[groupId].push({
          ...request,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
        });
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
        const requests = state.sponsorshipRequests[groupId] || [];
        const requestIndex = requests.findIndex(r => r.id === requestId);
        if (requestIndex !== -1) {
          requests[requestIndex].status = 'accepted';
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
        const requests = state.sponsorshipRequests[groupId] || [];
        const requestIndex = requests.findIndex(r => r.id === requestId);
        if (requestIndex !== -1) {
          requests[requestIndex].status = 'rejected';
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

export const {clearSponsorshipState} = sponsorshipSlice.actions;
export default sponsorshipSlice.reducer;
