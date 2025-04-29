// src/types/navigation/index.ts
import {Meeting} from '../index';

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
  GroupDetails: {groupId: string};
  CreateGroup: {meeting?: Meeting};
  GroupSchedule: {groupId: string; groupName: string};
  AddTransaction: {groupId: string; groupName: string};
  GroupChat: {groupId: string; groupName: string};
  GroupChatMediaPicker: {groupId: string};
  GroupChatInfo: {groupId: string; groupName: string};
};

// Main Tab Navigation Params
export type MainTabParamList = {
  Home: undefined;
  Meetings: undefined;
  Treasury: undefined;
  Profile: undefined;
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
  Main: undefined;
};
