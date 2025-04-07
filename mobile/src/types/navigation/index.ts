// src/types/navigation.ts
import {NavigatorScreenParams} from '@react-navigation/native';

// Group Tab Navigation Params
export type GroupTabParamList = {
  GroupOverview: {groupId: string};
  GroupMembers: {groupId: string};
  GroupAnnouncements: {groupId: string};
  GroupTreasury: {groupId: string};
  GroupLiterature: {groupId: string};
};

// Group Stack Navigation Params
export type GroupStackParamList = {
  GroupsList: undefined;
  GroupDetails: {
    groupId: string;
    groupName: string;
  } & NavigatorScreenParams<GroupTabParamList>;
  GroupMemberDetails: {groupId: string; memberId: string};
  GroupAnnouncementDetails: {groupId: string; announcementId: string};
  GroupEventDetails: {groupId: string; eventId: string};
  GroupBusinessMeeting: {groupId: string; meetingId?: string};
};

// Main Tab Navigation Params
export type MainTabParamList = {
  Home: NavigatorScreenParams<GroupStackParamList>;
  Meetings: undefined;
  Treasury: undefined;
  Profile: undefined;
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
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
