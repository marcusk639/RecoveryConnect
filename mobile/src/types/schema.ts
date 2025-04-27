// src/types/schema.ts

import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {Meeting, MeetingType, Treasury} from '.';

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
  uid: string; // Firebase Auth UID
  email: string; // User's email address
  displayName: string; // First name or initial
  recoveryDate?: Timestamp; // Optional recovery date
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin: Timestamp;

  notificationSettings: {
    meetings: boolean; // default: true
    announcements: boolean; // default: true
    celebrations: boolean; // default: true
  };

  privacySettings: {
    showRecoveryDate: boolean; // default: false
    allowDirectMessages: boolean; // default: true
  };

  homeGroups: string[]; // Array of group IDs
  role: 'user' | 'admin';
  favoriteMeetings?: string[]; // Array of meeting IDs
  photoUrl?: string;
}

/**
 * Firestore Group Document
 */
export interface GroupDocument {
  name: string;
  description: string;
  meetings: Meeting[];
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  foundedDate?: Timestamp;
  memberCount: number;
  admins: string[];
  placeName?: string;
  type: MeetingType;
  treasurers: string[];
  treasury: Treasury;
}

/**
 * Group Member Document (top-level collection)
 */
export interface GroupMemberDocument {
  id: string; // User ID
  groupId: string; // Group ID
  displayName: string;
  email?: string;
  photoURL?: string;
  joinedAt: Timestamp;
  sobrietyDate?: Timestamp;
  position?: string; // Position in the group (secretary, treasurer, etc.)
  isAdmin: boolean;
  showSobrietyDate: boolean; // Privacy setting specific to this group
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
  time: string;
  street?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
  location: string;
  isOnline: boolean;
  onlineLink?: string;
  onlineNotes?: string;
  verified: boolean;
  addedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  groupId: string;
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
 * Service Position Document
 */
export interface ServicePositionDocument {
  id: string;
  groupId: string;
  name: string;
  description: string;
  commitmentLength: number; // in months
  requirements?: string;
  currentHolder?: string; // User ID
  startDate?: Timestamp;
  endDate?: Timestamp;
  isFilled: boolean;
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
    timestamp: Timestamp;
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
  timestamp: Timestamp;
  read: {[userId: string]: boolean};
}

/**
 * Firestore Collection Paths
 */
export const COLLECTION_PATHS = {
  USERS: 'users',
  GROUPS: 'groups',
  MEMBERS: 'members', // New top-level members collection
  GROUP_MEMBERS: 'members', // Legacy path, will be migrated
  ANNOUNCEMENTS: 'announcements', // Updated to top-level collection
  EVENTS: (groupId: string) => `groups/${groupId}/events`,
  TRANSACTIONS: `transactions`,
  TREASURY_OVERVIEW: `treasury_overviews`,
  MEETINGS: 'meetings',
  NOTIFICATIONS: 'notifications',
  BUSINESS_MEETINGS: 'business_meetings',
  AGENDA_ITEMS: (meetingId: string) => `business_meetings/${meetingId}/agenda`,
  DECISIONS: (meetingId: string) => `business_meetings/${meetingId}/decisions`,
  SERVICE_POSITIONS: 'service_positions',
  LITERATURE: 'literature',
  GROUP_LITERATURE: (groupId: string) => `groups/${groupId}/literature`,
  DIRECT_MESSAGE_THREADS: 'direct_message_threads',
  DIRECT_MESSAGES: (threadId: string) =>
    `direct_message_threads/${threadId}/messages`,
};
