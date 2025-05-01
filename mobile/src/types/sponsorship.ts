export interface Sponsorship {
  id: string;
  sponsorId: string;
  sponseeId: string;
  status: 'active' | 'completed' | 'terminated';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SponsorshipAnalytics {
  successRate: number;
  averageDuration: number;
  commonChallenges: {
    challenge: string;
    count: number;
  }[];
  solutions: {
    solution: string;
    successRate: number;
  }[];
}

export interface SponsorChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
}

export interface SponsorSettings {
  isAvailable: boolean;
  maxSponsees: number;
  requirements: string[];
  bio: string;
}
