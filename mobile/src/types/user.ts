import {SponsorSettings} from './sponsorship';

export interface UserData {
  id: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  sobrietyStartDate?: string | null;
  photoURL?: string;
  notificationSettings?: {
    meetings: boolean;
    announcements: boolean;
    celebrations: boolean;
    sponsorship: boolean;
  };
  privacySettings?: {
    showSobrietyDate: boolean;
    showPhoneNumber: boolean;
    allowDirectMessages: boolean;
    sponsorship: boolean;
  };
  sponsorSettings?: SponsorSettings;
  createdAt: Date;
  updatedAt: Date;
}
