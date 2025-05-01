import firestore from '@react-native-firebase/firestore';
import {
  Sponsorship,
  SponsorshipAnalytics,
  SponsorSettings,
} from '../types/sponsorship';
import {UserModel} from './UserModel';

class SponsorModel {
  private static instance: SponsorModel;

  private constructor() {}

  static getInstance(): SponsorModel {
    if (!SponsorModel.instance) {
      SponsorModel.instance = new SponsorModel();
    }
    return SponsorModel.instance;
  }

  async getGroupSponsorships(groupId: string): Promise<Sponsorship[]> {
    try {
      const snapshot = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('sponsorships')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Sponsorship[];
    } catch (error) {
      console.error('Error fetching group sponsorships:', error);
      throw error;
    }
  }

  async getSponsorshipAnalytics(
    groupId: string,
  ): Promise<SponsorshipAnalytics> {
    try {
      const sponsorshipsRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('sponsorships');

      // Get all sponsorships
      const sponsorshipsSnapshot = await sponsorshipsRef.get();
      const sponsorships = sponsorshipsSnapshot.docs.map(doc => doc.data());

      // Calculate success rate
      const successfulSponsorships = sponsorships.filter(
        s => s.status === 'completed',
      ).length;
      const successRate = (successfulSponsorships / sponsorships.length) * 100;

      // Calculate average duration
      const durations = sponsorships
        .filter(s => s.endDate)
        .map(s => {
          const start = s.startDate.toDate();
          const end = s.endDate.toDate();
          return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // Duration in days
        });
      const averageDuration =
        durations.reduce((a, b) => a + b, 0) / durations.length;

      // Get common challenges
      const challengesRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('challenges');
      const challengesSnapshot = await challengesRef.get();
      const challenges = challengesSnapshot.docs.map(doc => doc.data());
      const challengeCounts = challenges.reduce((acc, challenge) => {
        acc[challenge.type] = (acc[challenge.type] || 0) + 1;
        return acc;
      }, {});
      const commonChallenges = Object.entries(challengeCounts)
        .map(([challenge, count]) => ({challenge, count}))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get solutions
      const solutionsRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('solutions');
      const solutionsSnapshot = await solutionsRef.get();
      const solutions = solutionsSnapshot.docs.map(doc => doc.data());
      const solutionSuccessRates = solutions.map(solution => ({
        solution: solution.description,
        successRate: solution.successRate,
      }));

      return {
        successRate,
        averageDuration,
        commonChallenges,
        solutions: solutionSuccessRates,
      };
    } catch (error) {
      console.error('Error fetching sponsorship analytics:', error);
      throw error;
    }
  }

  async createSponsorship(
    groupId: string,
    sponsorId: string,
    sponseeId: string,
  ): Promise<string> {
    try {
      const docRef = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('sponsorships')
        .add({
          sponsorId,
          sponseeId,
          status: 'active',
          startDate: firestore.FieldValue.serverTimestamp(),
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      return docRef.id;
    } catch (error) {
      console.error('Error creating sponsorship:', error);
      throw error;
    }
  }

  async updateSponsorshipStatus(
    groupId: string,
    sponsorshipId: string,
    status: 'active' | 'completed' | 'terminated',
  ): Promise<void> {
    try {
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('sponsorships')
        .doc(sponsorshipId)
        .update({
          status,
          endDate:
            status !== 'active' ? firestore.FieldValue.serverTimestamp() : null,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error updating sponsorship status:', error);
      throw error;
    }
  }

  async getSponsorChatMessages(
    groupId: string,
    sponsorId: string,
    sponseeId: string,
  ): Promise<any[]> {
    try {
      const chatId = [sponsorId, sponseeId].sort().join('_');
      const snapshot = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('sponsorChats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      }));
    } catch (error) {
      console.error('Error fetching sponsor chat messages:', error);
      throw error;
    }
  }

  async sendSponsorChatMessage(
    groupId: string,
    sponsorId: string,
    sponseeId: string,
    message: string,
    senderId: string,
  ): Promise<void> {
    try {
      const chatId = [sponsorId, sponseeId].sort().join('_');
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('sponsorChats')
        .doc(chatId)
        .collection('messages')
        .add({
          text: message,
          senderId,
          timestamp: firestore.FieldValue.serverTimestamp(),
          isRead: false,
        });
    } catch (error) {
      console.error('Error sending sponsor chat message:', error);
      throw error;
    }
  }

  async getGroupSponsors(groupId: string) {
    try {
      const groupRef = firestore().collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();
      const groupData = groupDoc.data();

      if (!groupData?.members) return [];

      const sponsors = await Promise.all(
        groupData.members.map(async (memberId: string) => {
          const userDoc = await firestore()
            .collection('users')
            .doc(memberId)
            .get();
          const userData = userDoc.data();

          if (!userData?.sponsorSettings?.isAvailable) return null;

          const activeSponsorships = await this.getActiveSponsorships(memberId);

          return {
            id: memberId,
            displayName: userData.displayName,
            sobrietyDate: userData.sobrietyStartDate,
            requirements: userData.sponsorSettings?.requirements || [],
            bio: userData.sponsorSettings?.bio || '',
            currentSponsees: activeSponsorships.length,
            maxSponsees: userData.sponsorSettings?.maxSponsees || 3,
          };
        }),
      );

      return sponsors.filter(Boolean);
    } catch (error) {
      console.error('Error fetching group sponsors:', error);
      throw error;
    }
  }

  async requestSponsorship(
    groupId: string,
    sponsorId: string,
    message: string,
  ) {
    try {
      const currentUser = await UserModel.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');

      const requestRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('sponsorshipRequests')
        .doc();

      const request = {
        id: requestRef.id,
        sponseeId: currentUser.uid,
        sponseeName: currentUser.displayName,
        message,
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await requestRef.set(request);
      return {groupId, request};
    } catch (error) {
      console.error('Error requesting sponsorship:', error);
      throw error;
    }
  }

  async acceptSponsorshipRequest(groupId: string, requestId: string) {
    try {
      const requestRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('sponsorshipRequests')
        .doc(requestId);

      const requestDoc = await requestRef.get();
      const request = requestDoc.data();

      if (!request) throw new Error('Request not found');
      if (request.status !== 'pending')
        throw new Error('Request already processed');

      // Update request status
      await requestRef.update({status: 'accepted'});

      // Create sponsorship
      const sponsorshipRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('sponsorships')
        .doc();

      const sponsorship = {
        id: sponsorshipRef.id,
        sponsorId: request.sponseeId,
        sponseeId: request.sponseeId,
        status: 'active',
        startDate: firestore.FieldValue.serverTimestamp(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await sponsorshipRef.set(sponsorship);
      return {groupId, requestId};
    } catch (error) {
      console.error('Error accepting sponsorship request:', error);
      throw error;
    }
  }

  async rejectSponsorshipRequest(groupId: string, requestId: string) {
    try {
      const requestRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('sponsorshipRequests')
        .doc(requestId);

      const requestDoc = await requestRef.get();
      const request = requestDoc.data();

      if (!request) throw new Error('Request not found');
      if (request.status !== 'pending')
        throw new Error('Request already processed');

      await requestRef.update({status: 'rejected'});
      return {groupId, requestId};
    } catch (error) {
      console.error('Error rejecting sponsorship request:', error);
      throw error;
    }
  }

  async updateSponsorAvailability(groupId: string, isAvailable: boolean) {
    try {
      const currentUser = await UserModel.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');

      const userRef = firestore().collection('users').doc(currentUser.uid);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      if (!userData) throw new Error('User data not found');

      const currentSettings: SponsorSettings = userData.sponsorSettings || {
        isAvailable: false,
        maxSponsees: 3,
        requirements: [],
        bio: '',
      };

      const updatedSettings: SponsorSettings = {
        ...currentSettings,
        isAvailable,
      };

      await userRef.update({sponsorSettings: updatedSettings});
      return {groupId, isAvailable};
    } catch (error) {
      console.error('Error updating sponsor availability:', error);
      throw error;
    }
  }

  private async getActiveSponsorships(sponsorId: string) {
    try {
      const snapshot = await firestore()
        .collectionGroup('sponsorships')
        .where('sponsorId', '==', sponsorId)
        .where('status', '==', 'active')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Sponsorship[];
    } catch (error) {
      console.error('Error fetching active sponsorships:', error);
      throw error;
    }
  }
}

export default SponsorModel;
