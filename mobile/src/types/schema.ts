// src/types/schema.ts

import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {Meeting, MeetingType, Treasury} from '.';
import firestore from '@react-native-firebase/firestore';

export type Timestamp = FirebaseFirestoreTypes.Timestamp;

/**
 * Generic type for Firestore documents
 */
export interface FirestoreDocument<T> {
  id: string;
  data: () => T;
}

/**
 * This file defines the Firestore schema types and structure
 * to ensure consistency between client and backend.
 */

export interface TransactionDocument {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  createdBy: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  groupId: string;
}

export interface TreasuryOverviewDocument {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  prudentReserve: number;
  lastUpdated: FirebaseFirestoreTypes.Timestamp;
  lastMonthReset?: FirebaseFirestoreTypes.Timestamp;
  groupId: string;
}

/**
 * Firestore User Document
 */
export interface UserDocument {
  id: string; // Matches UID from Auth, often document ID in users collection
  uid: string; // Firebase Auth UID
  email: string | null;
  displayName: string | null;
  recoveryDate?: Timestamp;
  photoUrl: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin: Timestamp;
  phoneNumber?: string | null;
  showPhoneNumber?: boolean;
  sobrietyStartDate?: Timestamp | null; // Use this as the definitive start date
  showSobrietyDate?: boolean; // Controls visibility of duration/date
  notificationSettings?: {
    meetings?: boolean;
    announcements?: boolean;
    celebrations?: boolean;
    groupChatMentions?: boolean;
    allowPushNotifications?: boolean;
  };
  privacySettings?: {
    allowDirectMessages?: boolean;
    showRecoveryDate?: boolean;
    showPhoneNumber?: boolean;
  };
  homeGroups?: string[]; // Array of group IDs user is member of
  adminGroups?: string[]; // Array of group IDs user is admin of
  role: 'user' | 'admin';
  favoriteMeetings?: string[]; // Array of meeting IDs
  fcmTokens?: string[]; // For push notifications
  subscriptionTier?: 'free' | 'plus'; // For premium features
  subscriptionValidUntil?: Timestamp;
}

/**
 * Firestore Group Document
 */
export interface GroupDocument {
  id?: string;
  name: string;
  description: string;
  location: string;
  address?: string;
  meetings: Meeting[];
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  foundedDate?: FirebaseFirestoreTypes.Timestamp;
  memberCount: number;
  admins: string[]; // Keep for backward compatibility
  adminUids: string[]; // New field explicitly for admin user IDs
  isClaimed: boolean; // Flag to indicate if group has been claimed
  pendingAdminRequests: {
    uid: string;
    requestedAt: FirebaseFirestoreTypes.Timestamp;
    message?: string;
  }[]; // Array to store admin requests
  treasurers: string[];
  placeName?: string;
  type: string;
  treasury?: Treasury;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?:
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'cancelled'
    | 'unpaid'
    | 'incomplete'
    | null;
  subscriptionExpiresAt?: Timestamp | null; // Tracks when the current period ends
}

/**
 * Group Member Document (top-level collection)
 */
export interface GroupMemberDocument {
  id: string; // User ID
  groupId: string; // Group ID
  displayName: string;
  showPhoneNumber: boolean;
  userId?: string;
  phoneNumber?: string;
  email?: string;
  photoURL?: string;
  joinedAt: Timestamp;
  sobrietyDate?: Timestamp;
  position?: string; // Position in the group (secretary, treasurer, etc.)
  isAdmin: boolean;
  showSobrietyDate: boolean; // Privacy setting specific to this group
  photoUrl?: string;
}

/**
 * Announcement Sub-Collection Document
 */
export interface AnnouncementDocument {
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID
  authorName: string; // Display name for efficiency
  expiresAt?: Timestamp;
  groupId: string; // Group ID that this announcement belongs to
  userId: string;
  memberId: string;
}

/**
 * Event Sub-Collection Document
 */
export interface EventDocument {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  location: string;
  isOnline: boolean;
  meetingLink?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID
  attendees?: string[]; // Array of user IDs
}

/**
 * Meeting Document
 */
export interface MeetingDocument {
  name: string;
  type: string; // AA, NA, etc.
  day: string;
  country?: string;
  time: string;
  street?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  location?: string;
  isOnline: boolean;
  onlineLink?: string;
  onlineNotes?: string;
  verified: boolean;
  addedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  groupId: string;
  format?: string;
  locationName?: string;
  geohash?: string;
  temporaryNotice?: string | null;
  isCancelledTemporarily?: boolean;
}

/**
 * Notification Document
 */
export interface NotificationDocument {
  id: string;
  userId: string;
  type: string; // announcement, meeting_reminder, etc.
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  data?: {
    groupId?: string;
    meetingId?: string;
    announcementId?: string;
    userId?: string;
    url?: string;
    [key: string]: any;
  };
}

/**
 * Business Meeting Document
 */
export interface BusinessMeetingDocument {
  id: string;
  groupId: string;
  date: Timestamp;
  startTime: string;
  endTime?: string;
  location: string;
  isOnline: boolean;
  onlineLink?: string;
  chair: string; // User ID
  secretary: string; // User ID
  attendees: string[]; // Array of user IDs
  treasuryReportId?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID
}

/**
 * Agenda Item Sub-Collection Document
 */
export interface AgendaItemDocument {
  id: string;
  title: string;
  description?: string;
  presenter: string; // User ID
  type: 'old_business' | 'new_business' | 'report' | 'election' | 'other';
  timeAllotted?: number; // minutes
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'tabled';
  notes?: string;
}

/**
 * Decision Sub-Collection Document
 */
export interface DecisionDocument {
  id: string;
  topic: string;
  description: string;
  motionBy: string; // User ID
  secondBy?: string; // User ID
  voteFor: number;
  voteAgainst: number;
  voteAbstain: number;
  passed: boolean;
  implementationDate?: Timestamp;
  responsibleParty?: string; // User ID
  notes?: string;
}

/**
 * Service Position Document (Firestore Schema)
 * Stored in subcollection: groups/{groupId}/servicePositions/{positionId}
 */
export interface ServicePositionDocument {
  groupId: string;
  name: string;
  description?: string;
  commitmentLength?: number | null; // months
  currentHolderId?: string | null;
  currentHolderName?: string | null;
  termStartDate?: Timestamp | null;
  termEndDate?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Literature Item Document
 */
export interface LiteratureItemDocument {
  id: string;
  title: string;
  type: 'book' | 'pamphlet' | 'workbook' | 'card' | 'other';
  program: 'AA' | 'NA' | 'other';
  description?: string;
  imageUrl?: string;
  price?: number;
  itemCode?: string;
  isApproved: boolean;
  language: string;
  publicationDate?: Timestamp;
  publisher: string;
  pages?: number;
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Group Literature Inventory Sub-Collection Document
 */
export interface GroupLiteratureInventoryDocument {
  items: {
    literatureId: string;
    title: string;
    quantity: number;
    lastUpdated: Timestamp;
  }[];
  lastUpdated: Timestamp;
  updatedBy: string; // User ID
}

/**
 * Direct Message Thread Document
 */
export interface DirectMessageThreadDocument {
  id: string;
  participants: string[]; // Array of user IDs
  lastMessage: {
    text: string;
    senderId: string;
    sentAt: Timestamp;
    read: {[userId: string]: boolean};
  };
  createdAt: Timestamp;
}

/**
 * Direct Message Sub-Collection Document
 */
export interface DirectMessageDocument {
  id: string;
  senderId: string;
  text: string;
  sentAt: Timestamp;
  read: {[userId: string]: boolean};
}

/**
 * Group Chat Document
 */
export interface GroupChatDocument {
  groupId: string;
  lastMessage: {
    text: string;
    senderId: string;
    senderName: string;
    sentAt: Timestamp;
  };
  participantCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Chat Message Document
 */
export interface ChatMessageDocument {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  text: string;
  sentAt: Timestamp;
  readBy: {[userId: string]: boolean};
  attachments?: {
    type: 'image' | 'file' | 'voice';
    url: string;
    name?: string;
    size?: number;
    duration?: number; // for voice messages
  }[];
  reactions?: {
    [reactionType: string]: string[]; // userId[]
  };
  replyTo?: {
    messageId: string;
    text: string;
    senderId: string;
    senderName: string;
  };
}

/**
 * Meeting Instance Document (Firestore Schema) - Add Chairperson
 */
export interface MeetingInstanceDocument {
  meetingId: string;
  groupId: string;
  scheduledAt: Timestamp;
  name: string;
  type: string;
  format?: string | null;
  location?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  lat?: number | null;
  lng?: number | null;
  locationName?: string | null;
  isOnline?: boolean;
  link?: string | null;
  onlineNotes?: string | null;
  isCancelled: boolean;
  instanceNotice?: string | null;
  templateUpdatedAt: Timestamp;
  // Add Chairperson fields
  chairpersonId?: string | null;
  chairpersonName?: string | null;
}

/**
 * Firestore Collection Paths
 */
export const COLLECTION_PATHS = {
  USERS: 'users',
  GROUPS: 'groups',
  MEMBERS: 'members',
  GROUP_MEMBERS: (groupId: string) => `groups/${groupId}/members`, // Keep old path if needed
  SERVICE_POSITIONS: (groupId: string) => `groups/${groupId}/servicePositions`, // Subcollection
  ANNOUNCEMENTS: 'announcements',
  EVENTS: (groupId: string) => `groups/${groupId}/events`,
  TRANSACTIONS: `transactions`,
  TREASURY_OVERVIEW: `treasury_overviews`,
  MEETINGS: 'meetings',
  MEETING_INSTANCES: 'meetingInstances',
  NOTIFICATIONS: 'notifications',
  BUSINESS_MEETINGS: 'business_meetings',
  AGENDA_ITEMS: (meetingId: string) => `business_meetings/${meetingId}/agenda`,
  DECISIONS: (meetingId: string) => `business_meetings/${meetingId}/decisions`,
  LITERATURE: 'literature',
  GROUP_LITERATURE: (groupId: string) => `groups/${groupId}/literature`,
  DIRECT_MESSAGE_THREADS: 'direct_message_threads',
  DIRECT_MESSAGES: (threadId: string) =>
    `direct_message_threads/${threadId}/messages`,
  GROUP_CHATS: 'group_chats',
  CHAT_MESSAGES: (groupId: string) => `group_chats/${groupId}/messages`,
};
