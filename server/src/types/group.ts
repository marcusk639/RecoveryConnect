export interface GroupMember {
  uid: string;
  displayName: string;
  recoveryDate?: string | null | undefined;
  joinedAt: Date;
  position?: string; // Secretary, treasurer, etc.
  isAdmin: boolean;
  updatedAt?: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  meetingDay: string;
  meetingTime: string;
  location: string;
  address?: string;
  format: string;
  isOnline: boolean;
  onlineLink?: string;
  createdAt: Date;
  updatedAt: Date;
  foundedDate?: string;
  members: GroupMember[];
  memberCount: number;
  admins: string[]; // Array of user IDs
  isAdmin?: boolean; // Computed property for the current user
  lat?: number; // Latitude coordinate
  lng?: number; // Longitude coordinate
  latitude?: number; // Normalized latitude (used by Cloud Functions)
  longitude?: number; // Normalized longitude (used by Cloud Functions)
  geohash?: string; // Geohash for location-based queries
}

export interface GroupCreationData {
  name: string;
  description: string;
  meetingDay: string;
  meetingTime: string;
  location: string;
  address?: string;
  format: string;
  isOnline: boolean;
  onlineLink?: string;
  foundedDate?: string;
  lat?: number; // Latitude coordinate
  lng?: number; // Longitude coordinate
}

export interface GroupUpdateData {
  name?: string;
  description?: string;
  meetingDay?: string;
  meetingTime?: string;
  location?: string;
  address?: string;
  format?: string;
  isOnline?: boolean;
  onlineLink?: string;
  foundedDate?: string;
  lat?: number; // Latitude coordinate
  lng?: number; // Longitude coordinate
}
