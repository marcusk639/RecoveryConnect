import {SponsorshipState} from '../store/slices/sponsorshipSlice';
import {AuthState} from '../store/slices/authSlice';
import {GroupsState} from '../store/slices/groupsSlice';
import {TransactionsState} from '../store/slices/transactionsSlice';
import {TreasuryState} from '../store/slices/treasurySlice';
import {MeetingsState} from '../store/slices/meetingsSlice';
import {AnnouncementsState} from '../store/slices/announcementsSlice';
import {MembersState} from '../store/slices/membersSlice';
import {ChatState} from '../store/slices/chatSlice';
import {ServicePositionsState} from '../store/slices/servicePositionsSlice';

export interface RootState {
  auth: AuthState;
  groups: GroupsState;
  transactions: TransactionsState;
  treasury: TreasuryState;
  meetings: MeetingsState;
  announcements: AnnouncementsState;
  members: MembersState;
  chat: ChatState;
  servicePositions: ServicePositionsState;
  sponsorship: SponsorshipState;
}
