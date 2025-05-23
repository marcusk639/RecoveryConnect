// src/types/navigation/index.ts
import {NavigatorScreenParams} from '@react-navigation/native';
import {Meeting, ServicePosition} from '../index';

// Group Stack Navigation Params
export type GroupStackParamList = {
  GroupsList: undefined;
  GroupOverview: {groupId: string; groupName: string};
  GroupMembers: {groupId: string; groupName: string};
  GroupAnnouncements: {groupId: string; groupName: string};
  GroupTreasury: {groupId: string; groupName: string};
  GroupLiterature: {groupId: string; groupName: string};
  GroupMemberDetails: {groupId: string; memberId: string};
  GroupAnnouncementDetails: {groupId: string; announcementId: string};
  GroupEventDetails: {groupId: string; eventId: string};
  GroupBusinessMeeting: {groupId: string; meetingId?: string};
  GroupEditDetails: {groupId: string; groupName: string};
  GroupDetails: {groupId: string; groupName: string};
  CreateGroup: {meeting?: Meeting};
  GroupSchedule: {groupId: string; groupName: string};
  AddTransaction: {groupId: string; groupName: string};
  GroupChat: {groupId: string; groupName: string};
  GroupChatMediaPicker: {groupId: string};
  GroupChatInfo: {groupId: string; groupName: string};
  GroupServicePositions: {groupId: string; groupName: string};
  AssignChairperson: {
    groupId: string;
    groupName: string;
    instanceId: string;
    currentChairpersonId?: string | null;
    scheduledAt: number;
  };
  GroupDonation: {groupId: string; groupName: string};
  GroupSponsors: {groupId: string; groupName: string};
  SponsorChat: {
    groupId: string;
    groupName: string;
    sponsorId: string;
    sponseeId: string;
    sponsorName: string;
    sponseeName: string;
  };
  SponsorshipAnalytics: {groupId: string; groupName: string};
  AddEditServicePosition: {
    groupId: string;
    groupName: string;
    positionId?: string;
    position?: ServicePosition;
  };
};

// Profile Stack Navigation Params (assuming it exists)
export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileManagement: undefined;
  SobrietyTracker: undefined;
  // ... other screens in ProfileStack
};

// Main Tab Navigation Params
export type MainTabParamList = {
  Home: NavigatorScreenParams<GroupStackParamList>; // <-- Specify params for Home stack
  Meetings: undefined;
  Treasury: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>; // <-- Specify params for Profile stack
  GroupSearch: undefined;
  AdminPanel: undefined;
};

// Auth Stack Navigation Params
export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Meetings: undefined;
};

// Root Stack Navigation Params
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};
