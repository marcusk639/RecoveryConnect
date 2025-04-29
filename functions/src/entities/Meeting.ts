import { Timestamp } from "firebase-admin/firestore";
import { Location } from "./GeocodeResponse";

export class Meeting {
  name = "";
  time = "";
  address?: string; // Using address for the full string from API
  city?: string;
  state?: string;
  street?: string;
  zip?: string;
  formattedAddress?: string;
  types?: string;
  lat?: number;
  lng?: number;
  geohash?: string; // Added for geohashing
  country?: string;
  locationName?: string; // Building Name / Location details from API
  type?: MeetingType; // Hardcoding for this script
  day?: string; // Store as string "0"-"6"
  online?: boolean;
  link?: string;
  onlineNotes?: string;
  format: string = ""; // Comma-separated string of types
  id?: string; // Our generated hash ID
  apiId?: string; // Store the original API ID for reference
  notes?: string; // Meeting notes
  locationNotes?: string; // Location-specific notes
  groupName?: string; // Group name associated with meeting
  district?: string;
  timezone?: string;
  venmo?: string;
  square?: string;
  paypal?: string;
  // Fields set by script
  verified?: boolean;
  addedBy?: string;
  createdAt?: Date;
  updatedAt?: Date; // Corresponds to API 'updated' field
}

export type MeetingType =
  | "AA"
  | "NA"
  | "IOP"
  | "Religious"
  | "Celebrate Recovery"
  | "CUSTOM";

export interface MeetingSearchCriteria {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  time?: string;
  location?: Location;
  street?: string;
}

/**
 * Meeting Instance Document (Firestore Schema)
 */
export interface MeetingInstanceDocument {
  meetingId: string;
  groupId: string;
  scheduledAt: Timestamp; // Specific date and time as Firestore Timestamp
  name: string;
  type: string; // Store MeetingType as string
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
  templateUpdatedAt: Timestamp; // Timestamp of the template
  // Optional future fields
  // chairpersonId?: string;
  // speakerId?: string;
  // topic?: string;
}

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
