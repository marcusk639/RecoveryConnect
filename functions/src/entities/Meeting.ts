import { Location } from "./GeocodeResponse";

export class Meeting {
  name = "";
  time = "";
  street = "";
  city?: string;
  state?: string;
  zip?: string;
  types?: string[];
  lat?: number;
  lng?: number;
  country?: string;
  locationName?: string; // or the directions, if NA meeting
  type?: MeetingType;
  Location?: string[]; // specific to NA meetings
  day?: string;
  online?: boolean;
  link?: string;
  onlineNotes?: string;
  format: string;
  id?: string;
  address?: string;
  location?: string;
  verified?: boolean;
  addedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  groupId?: string; // Optional reference to associated group
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
