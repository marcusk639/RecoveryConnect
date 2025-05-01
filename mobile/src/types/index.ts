// src/types/index.ts

import {Transaction, TransactionType} from './domain/treasury';
import React from 'react';
import {SponsorSettings} from './sponsorship';
/**
 * Authentication and User Types
 */

export interface User {
  uid: string;
  email: string;
  displayName: string;
  recoveryDate?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  homeGroups: string[];
  role: 'user' | 'admin';
  favoriteMeetings?: string[];
  photoUrl?: string | null;
  phoneNumber?: string | null;
  fcmTokens?: string[];
  stripeCustomerId?: string;
  sponsorSettings?: SponsorSettings;
}

export interface NotificationSettings {
  meetings: boolean;
  announcements: boolean;
  celebrations: boolean;
  groupChatMentions?: boolean;
  allowPushNotifications?: boolean;
}

export interface PrivacySettings {
  showRecoveryDate: boolean;
  allowDirectMessages: boolean;
  showPhoneNumber?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  recoveryDate?: string;
  agreeToTerms: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface TreasurySummary {
  balance: number;
  prudentReserve: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  lastUpdated: Date;
}

export interface Treasury {
  balance: number;
  prudentReserve: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  summary: TreasurySummary;
  transactions: Transaction[];
}

export interface HomeGroup {
  id: string;
  name: string;
  description: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  createdAt: Date;
  updatedAt: Date;
  foundedDate?: string;
  memberCount: number;
  admins: string[]; // Keep for backward compatibility
  isClaimed: boolean; // Flag to indicate if group has been claimed
  pendingAdminRequests?: {
    // Make optional to handle existing records
    uid: string;
    requestedAt: Date;
    message?: string;
  }[];
  treasurers: string[];
  placeName?: string;
  type: string;
  meetings: Meeting[];
  treasury: Treasury;
  distanceInKm?: number;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  email?: string;
  name: string;
  position?: string;
  isAdmin?: boolean;
  sobrietyDate?: string;
  phoneNumber?: string;
  showSobrietyDate?: boolean;
  showPhoneNumber?: boolean;
  joinedAt: Date;
  photoUrl?: string;
}

export interface SobrietyMilestone {
  memberId: string;
  memberName: string;
  years: number;
  date: Date;
}

/**
 * Announcement Types
 */

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  authorName: string;
  expiresAt?: Date;
  groupId: string;
  userId: string;
  memberId: string;
}

/**
 * Meeting Types
 */

export class DaysAndTimes {
  sunday: string = '';
  monday: string = '';
  tuesday: string = '';
  wednesday: string = '';
  thursday: string = '';
  friday: string = '';
  saturday: string = '';
}

export type MeetingType =
  | 'AA'
  | 'NA'
  | 'IOP'
  | 'Religious'
  | 'Celebrate Recovery'
  | 'Custom';

const exampleMeeting: Meeting = {
  state: 'TX',
  locationName: undefined,
  zip: '78703',
  onlineNotes: undefined,
  link: undefined,
  time: '10:00',
  day: 'saturday',
  street: '3201 Windsor Road',
  type: 'AA',
  lat: 30.296411,
  city: 'Austin',
  lng: -97.7688783,
  online: false,
  name: 'Benevolent Manipulators - IN-PERSON',
};

export interface Meeting {
  id?: string;
  name: string;
  type: MeetingType;
  day: string;
  time: string;
  address?: string;
  country?: string;
  city?: string;
  state?: string;
  street?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  location?: string;
  online?: boolean;
  link?: string | null;
  onlineNotes?: string | null;
  verified?: boolean;
  addedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  format?: string;
  locationName?: string;
  groupId?: string; // Optional reference to associated group
  isFavorite?: boolean; // For UI state, not stored
  temporaryNotice?: string | null; // e.g., "Speaker meeting", "Cancelled this week"
  isCancelledTemporarily?: boolean; // Specific flag for cancellation
}

export interface Location {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  street?: string;
  zip?: string;
}

export interface MeetingSearchCriteria {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  time?: string;
  location?: Location;
}

export interface MeetingFilters {
  day?: keyof DaysAndTimes;
  type?: MeetingType;
  location?: Location;
  radius?: number;
}

export interface MeetingSearchInput {
  location?: Location;
  filters?: MeetingFilters;
  criteria?: MeetingSearchCriteria;
}

/**
 * Event Types
 */

export interface GroupEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  isOnline: boolean;
  meetingLink?: string;
  groupId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Navigation Types
 */

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  HomeGroup: {groupId: string};
  Meetings: undefined;
  MeetingDetails: {meetingId: string};
  Treasury: undefined;
  Profile: undefined;
  Announcements: {groupId: string; groupName: string};
  Events: {groupId: string; groupName: string};
  Members: {groupId: string; groupName: string};
  CreateGroup: {meeting?: Meeting};
  GroupDetails: {groupId: string};
  GroupMembers: {groupId: string; groupName: string};
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Splash: undefined;
};

/**
 * UI Component Props
 */

export interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: any;
  textStyle?: any;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
}

export interface InputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
  labelStyle?: any;
  inputStyle?: any;
  errorStyle?: any;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'number-pad';
  multiline?: boolean;
  numberOfLines?: number;
}

export interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  style?: any;
  fullscreen?: boolean;
}

export interface SocialSignInButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export interface AnnouncementDetailProps {
  announcement: Announcement;
  isAdmin: boolean;
  isCreator: boolean;
  onDismiss: () => void;
  onUpdate?: (updatedAnnouncement: Announcement) => void;
  onDelete?: (announcementId: string) => void;
}

export interface AnnouncementListProps {
  groupId: string;
  isAdmin: boolean;
  onAnnouncementPress?: (announcement: Announcement) => void;
}

/**
 * Filter Options
 */

export interface MeetingFilterOptions {
  showOnline: boolean;
  showInPerson: boolean;
  meetingType: MeetingType | null;
  day: keyof DaysAndTimes | null;
  radius: number;
}

export interface TreasuryFilterOptions {
  type: TransactionType | 'all';
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  category?: string;
}

/**
 * API Response Types
 */

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: {[key: string]: string[]};
}

/**
 * Firebase Types
 */

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
}

export interface FirestoreDocument<T> {
  id: string;
  data: () => T;
}

export interface FirestoreCollection<T> {
  docs: FirestoreDocument<T>[];
}

/**
 * Cloud Function Types
 */

export interface CloudFunctionResponse<T> {
  data: T;
}

export interface MeetingSearchResults {
  meetings: Meeting[];
  totalCount: number;
}

/**
 * Theme Types
 */

export interface ThemeColors {
  primary: {
    light: string;
    main: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    light: string;
    main: string;
    dark: string;
    contrastText: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  background: {
    default: string;
    paper: string;
  };
  divider: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  grey: {
    [key: number]: string;
  };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeFonts {
  regular: string;
  medium: string;
  light: string;
  thin: string;
}

export interface ThemeFontSizes {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  fonts: ThemeFonts;
  fontSizes: ThemeFontSizes;
  roundness: number;
}

/**
 * Service Position Type
 */
export interface ServicePosition {
  id: string; // Firestore document ID
  groupId: string;
  name: string; // e.g., "Secretary", "Treasurer", "GSR", "Coffee Maker"
  description?: string;
  commitmentLength?: number; // Optional length in months
  currentHolderId?: string | null; // User ID of the current holder
  currentHolderName?: string | null; // Denormalized name for display
  termStartDate?: Date | null;
  termEndDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Meeting Instance Type (Add Chairperson)
 */
export interface MeetingInstance extends Meeting {
  instanceId: string;
  meetingId: string;
  groupId: string;
  scheduledAt: Date;
  link?: string | null | undefined;
  onlineNotes?: string | null | undefined;
  locationName?: string;
  isOnline?: boolean;
  isCancelled: boolean;
  instanceNotice?: string | null;
  templateUpdatedAt: Date;
  // Add Chairperson fields
  chairpersonId?: string | null;
  chairpersonName?: string | null; // Denormalized for easier display
}
