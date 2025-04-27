import {HomeGroup, GroupMember, Meeting} from '../types';
import {
  FirestoreDocument,
  GroupDocument,
  GroupMemberDocument,
} from '../types/schema';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {calculateDistance} from '../utils/locationUtils';
import {Transaction} from '../types/domain';
import {MemberModel} from './MemberModel';
import {MeetingModel} from './MeetingModel';

/**
 * Group model for managing group data
 */
export class GroupModel {
  /**
   * Convert a Firestore group document to a HomeGroup object
   */
  static fromFirestore(doc: FirestoreDocument<GroupDocument>): HomeGroup {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.type,
      name: data.name,
      description: data.description,
      location: data.location || '',
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      lat: data.lat,
      lng: data.lng,
      treasurers: data.treasurers,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      foundedDate: data.foundedDate
        ? data.foundedDate.toDate().toISOString()
        : undefined,
      memberCount: data.memberCount,
      admins: data.admins,
      treasury: data.treasury,
      placeName: data.placeName,
      meetings: [], // Initialize with empty array, will be populated when needed
    };
  }

  /**
   * Convert a HomeGroup object to a Firestore document
   */
  static toFirestore(group: Partial<HomeGroup>): Partial<GroupDocument> {
    const firestoreData: Partial<GroupDocument> = {};

    if (group.name !== undefined) firestoreData.name = group.name;
    if (group.description !== undefined)
      firestoreData.description = group.description;
    if (group.foundedDate !== undefined) {
      firestoreData.foundedDate = group.foundedDate
        ? firestore.Timestamp.fromDate(new Date(group.foundedDate))
        : undefined;
    }
    if (group.memberCount !== undefined)
      firestoreData.memberCount = group.memberCount;
    if (group.admins !== undefined) firestoreData.admins = group.admins;
    if (group.createdAt !== undefined) {
      firestoreData.createdAt = firestore.Timestamp.fromDate(group.createdAt);
    }
    if (group.updatedAt !== undefined) {
      firestoreData.updatedAt = firestore.Timestamp.fromDate(group.updatedAt);
    }

    if (group.treasurers !== undefined) {
      firestoreData.treasurers = group.treasurers;
    }

    if (group.treasury !== undefined) {
      firestoreData.treasury = group.treasury;
    }

    // Location information
    if (group.location !== undefined) firestoreData.location = group.location;
    if (group.address !== undefined) firestoreData.address = group.address;
    if (group.city !== undefined) firestoreData.city = group.city;
    if (group.state !== undefined) firestoreData.state = group.state;
    if (group.zip !== undefined) firestoreData.zip = group.zip;
    if (group.lat !== undefined) firestoreData.lat = group.lat;
    if (group.lng !== undefined) firestoreData.lng = group.lng;
    if (group.placeName !== undefined)
      firestoreData.placeName = group.placeName;
    if (group.type !== undefined) firestoreData.type = group.type;

    return firestoreData;
  }

  /**
   * Get a group by ID
   */
  static async getById(id: string): Promise<HomeGroup | null> {
    try {
      const doc = await firestore().collection('groups').doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return GroupModel.fromFirestore({
        id: doc.id,
        data: () => doc.data() as any,
      });
    } catch (error) {
      console.error('Error getting group by ID:', error);
      return null;
    }
  }

  /**
   * Get all groups
   */
  static async getAllGroups(): Promise<HomeGroup[]> {
    try {
      const groupsSnapshot = await firestore().collection('groups').get();

      const groups = groupsSnapshot.docs.map(doc => {
        const data = doc.data() as GroupDocument;
        // Ensure required fields have defaults
        return {
          id: doc.id,
          type: data.type || 'AA', // Default type
          name: data.name,
          description: data.description,
          location: data.location || '',
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          lat: data.lat,
          lng: data.lng,
          // Provide default empty array for treasurers if undefined
          treasurers: data.treasurers || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          foundedDate: data.foundedDate?.toDate().toISOString(),
          memberCount: data.memberCount || 0,
          admins: data.admins || [],
          // Provide default treasury structure if undefined
          treasury: data.treasury || {
            balance: 0,
            prudentReserve: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            transactions: [],
            summary: {
              balance: 0,
              prudentReserve: 0,
              monthlyIncome: 0,
              monthlyExpenses: 0,
              lastUpdated: new Date(),
            },
          },
          placeName: data.placeName,
          meetings: [], // Initialize with empty array
        } as HomeGroup; // Assert type after providing defaults
      });

      return groups;
    } catch (error) {
      console.error('Error getting all groups:', error);
      throw error; // Rethrow or return empty array based on desired error handling
    }
  }

  /**
   * Create a new group
   */
  static async create(groupData: Partial<HomeGroup>): Promise<HomeGroup> {
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const now = new Date();
      const defaultGroup: HomeGroup = {
        id: '',
        name: '',
        description: '',
        location: '',
        createdAt: now,
        updatedAt: now,
        memberCount: 1,
        admins: [currentUser.uid],
        treasurers: [currentUser.uid],
        treasury: {
          balance: 0,
          prudentReserve: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          transactions: [],
          summary: {
            balance: 0,
            prudentReserve: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            lastUpdated: now,
          },
        },
        type: 'AA',
        meetings: [], // Initialize with empty array
      };

      const newGroup = {...defaultGroup, ...groupData};
      delete newGroup.id; // Remove ID as Firestore will generate one
      delete newGroup.meetings; // Remove meetings as they're stored separately

      // Ensure lat, lng, and geohash are set if we have location data
      // First, try to use provided lat/lng
      let hasLocationData = false;
      if (groupData.lat && groupData.lng) {
        // If lat and lng are provided directly, use them
        newGroup.lat = groupData.lat;
        newGroup.lng = groupData.lng;
        hasLocationData = true;
      } else if (groupData.address) {
        // TODO: no lat/lng but we have an address, we should geocode it
        // For now, log a warning - in a real implementation, you would
        // call a geocoding service here to get lat/lng from the address
        console.warn('Group created with address but no lat/lng coordinates');
      } else {
        console.warn('Group created without location data');
      }

      const docRef = await firestore()
        .collection('groups')
        .add(GroupModel.toFirestore(newGroup));

      await MeetingModel.createBatch(newGroup.meetings || []);

      // Get user data
      const userDoc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();
      const userData = userDoc.data();

      // Add current user as a member using the MemberModel
      await MemberModel.addMember(docRef.id, currentUser.uid, userData, true);

      // If we have location data, call the Cloud Function to set the geohash
      if (hasLocationData) {
        try {
          const functions = firestore().app.functions('us-central1');
          const ensureGeolocation = functions.httpsCallable(
            'ensureGroupGeolocation',
          );
          await ensureGeolocation({groupId: docRef.id});
          console.log('Successfully set geohash for group');
        } catch (error) {
          console.error('Failed to set geohash for group:', error);
          // Don't throw here, as the group was still created successfully
        }
      }

      const createdGroup = await docRef.get();
      return {
        ...GroupModel.fromFirestore({
          id: createdGroup.id,
          data: () => createdGroup.data() as GroupDocument,
        }),
        id: docRef.id,
        meetings: [], // Initialize with empty array
      };
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  /**
   * Update a group
   */
  static async update(
    groupId: string,
    groupData: Partial<HomeGroup>,
  ): Promise<HomeGroup> {
    try {
      const groupRef = firestore().collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }

      const updatedFields = {
        ...groupData,
        updatedAt: new Date(),
      };

      await groupRef.update(GroupModel.toFirestore(updatedFields));

      const updatedDoc = await groupRef.get();
      return GroupModel.fromFirestore({
        id: updatedDoc.id,
        data: () => updatedDoc.data() as GroupDocument,
      });
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  /**
   * Get group members
   */
  static async getMembers(groupId: string): Promise<GroupMember[]> {
    try {
      // Use MemberModel to get group members from top-level collection
      return MemberModel.getGroupMembers(groupId);
    } catch (error) {
      console.error('Error getting group members:', error);
      throw error;
    }
  }

  /**
   * Add a member to a group
   */
  static async addMember(
    groupId: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();

      // Use MemberModel to add member to top-level collection
      await MemberModel.addMember(groupId, userId, userData, isAdmin);
    } catch (error) {
      console.error('Error adding group member:', error);
      throw error;
    }
  }

  /**
   * Remove a member from a group
   */
  static async removeMember(groupId: string, userId: string): Promise<void> {
    try {
      // Use MemberModel to remove member from top-level collection
      await MemberModel.removeMember(groupId, userId);
    } catch (error) {
      console.error('Error removing group member:', error);
      throw error;
    }
  }

  /**
   * Make a user an admin of a group
   */
  static async makeAdmin(groupId: string, userId: string): Promise<void> {
    try {
      // Use MemberModel to make user an admin
      await MemberModel.makeAdmin(groupId, userId);
    } catch (error) {
      console.error('Error making user admin:', error);
      throw error;
    }
  }

  /**
   * Remove a user as admin of a group
   */
  static async removeAdmin(groupId: string, userId: string): Promise<void> {
    try {
      // Use MemberModel to remove user as admin
      await MemberModel.removeAdmin(groupId, userId);
    } catch (error) {
      console.error('Error removing user as admin:', error);
      throw error;
    }
  }

  /**
   * Update group information
   */
  static async updateGroupInfo(
    groupId: string,
    groupInfo: {
      name?: string;
      description?: string;
      meetings?: Meeting[];
      format?: string;
      isOnline?: boolean;
      location?: string;
      address?: string;
      onlineLink?: string;
    },
  ): Promise<void> {
    try {
      const groupRef = firestore().collection('groups').doc(groupId);

      // Check if group exists
      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }

      // Update group information
      await groupRef.update({
        ...groupInfo,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating group info:', error);
      throw error;
    }
  }

  /**
   * Delete a group
   */
  static async deleteGroup(groupId: string): Promise<void> {
    try {
      const groupRef = firestore().collection('groups').doc(groupId);

      // Check if group exists
      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();

      // Get all members
      const membersSnapshot = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .get();

      const memberIds = membersSnapshot.docs.map(doc => doc.id);

      // Batch write to remove group from all members' homeGroups
      const batch = firestore().batch();

      for (const memberId of memberIds) {
        const userRef = firestore().collection('users').doc(memberId);
        batch.update(userRef, {
          homeGroups: firestore.FieldValue.arrayRemove(groupId),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      // Commit batch
      await batch.commit();

      // Delete the group document
      await groupRef.delete();
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  /**
   * Get admin users for a group
   */
  static async getGroupAdmins(groupId: string): Promise<GroupMember[]> {
    try {
      const groupRef = firestore().collection('groups').doc(groupId);

      // Check if group exists
      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();
      const adminIds = groupData?.admins || [];

      // Get admin members
      const members = await this.getMembers(groupId);

      return members.filter(member => adminIds.includes(member.id));
    } catch (error) {
      console.error('Error getting group admins:', error);
      throw error;
    }
  }

  /**
   * Update member role/position
   */
  static async updateMemberPosition(
    groupId: string,
    userId: string,
    position: string,
  ): Promise<void> {
    try {
      // Use MemberModel to update member position
      await MemberModel.updateMemberPosition(groupId, userId, position);
    } catch (error) {
      console.error('Error updating member position:', error);
      throw error;
    }
  }

  /**
   * Check if user is a member of the group
   */
  static async isGroupMember(
    groupId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      // Use MemberModel to check if user is a member
      return MemberModel.isGroupMember(groupId, userId);
    } catch (error) {
      console.error('Error checking if user is a member:', error);
      return false;
    }
  }

  /**
   * Check if user is an admin of the group
   */
  static async isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
    try {
      const groupRef = firestore().collection('groups').doc(groupId);

      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        return false;
      }

      const groupData = groupDoc.data();
      const adminIds = groupData?.admins || [];

      return adminIds.includes(userId);
    } catch (error) {
      console.error('Error checking if user is an admin:', error);
      return false;
    }
  }

  /**
   * Get recent groups (useful for discovery)
   */
  static async getRecentGroups(limit: number = 10): Promise<HomeGroup[]> {
    try {
      const groupsSnapshot = await firestore()
        .collection('groups')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return groupsSnapshot.docs.map(doc =>
        this.fromFirestore({
          id: doc.id,
          data: () => doc.data() as GroupDocument,
        }),
      );
    } catch (error) {
      console.error('Error getting recent groups:', error);
      throw error;
    }
  }

  /**
   * Search groups by name
   */
  static async searchGroups(
    query: string,
    limit: number = 10,
  ): Promise<HomeGroup[]> {
    try {
      // Firebase doesn't support native text search, so we'll use startAt/endAt with query
      // This is a simple implementation and might need to be enhanced for real-world use

      const searchQuery = query.toLowerCase();
      const endQuery = searchQuery + '\uf8ff'; // Unicode character for end of string

      const groupsSnapshot = await firestore()
        .collection('groups')
        .orderBy('name')
        .startAt(searchQuery)
        .endAt(endQuery)
        .limit(limit)
        .get();

      return groupsSnapshot.docs.map(doc =>
        this.fromFirestore({
          id: doc.id,
          data: () => doc.data() as GroupDocument,
        }),
      );
    } catch (error) {
      console.error('Error searching groups:', error);
      throw error;
    }
  }

  /**
   * Get user's home groups
   */
  static async getUserGroups(userId: string): Promise<HomeGroup[]> {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const homeGroupIds = userData?.homeGroups || [];

      if (homeGroupIds.length === 0) {
        return [];
      }

      // Get all groups in a batch
      const groups: HomeGroup[] = [];

      // Firestore has a limit of 10 items in a where-in query
      // So we need to batch our requests
      const batchSize = 10;
      for (let i = 0; i < homeGroupIds.length; i += batchSize) {
        const batch = homeGroupIds.slice(i, i + batchSize);

        const groupsSnapshot = await firestore()
          .collection('groups')
          .where(firestore.FieldPath.documentId(), 'in', batch)
          .get();

        const batchGroups = groupsSnapshot.docs.map(doc =>
          this.fromFirestore({
            id: doc.id,
            data: () => doc.data() as GroupDocument,
          }),
        );

        groups.push(...batchGroups);
      }

      // Fetch meetings for all groups
      const meetingsPromises = groups.map(async group => {
        const meetingsSnapshot = await firestore()
          .collection('meetings')
          .where('groupId', '==', group.id)
          .get();

        const meetings = meetingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Meeting[];

        return {
          ...group,
          meetings,
        };
      });

      const groupsWithMeetings = await Promise.all(meetingsPromises);

      // Sort groups by name
      return groupsWithMeetings.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

  /**
   * Get all sobriety milestones for a group
   */
  static async getGroupMilestones(
    groupId: string,
    daysAhead: number = 30,
  ): Promise<
    {memberId: string; memberName: string; date: Date; years: number}[]
  > {
    try {
      // Get all members with sobriety dates
      const membersWithDates: {id: string; name: string; sobrietyDate: Date}[] =
        [];

      const membersSnapshot = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .get();

      membersSnapshot.docs.forEach(doc => {
        const memberData = doc.data();
        if (memberData.sobrietyDate && memberData.showSobrietyDate !== false) {
          membersWithDates.push({
            id: doc.id,
            name: memberData.displayName,
            sobrietyDate: memberData.sobrietyDate.toDate(),
          });
        }
      });

      // Calculate upcoming milestones
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysAhead);

      const milestones: {
        memberId: string;
        memberName: string;
        date: Date;
        years: number;
      }[] = [];

      membersWithDates.forEach(member => {
        const sobrietyDate = member.sobrietyDate;

        // Calculate years of sobriety as of today
        const yearsFloat =
          (today.getTime() - sobrietyDate.getTime()) /
          (365.25 * 24 * 60 * 60 * 1000);
        const currentYears = Math.floor(yearsFloat);

        // Calculate the next anniversary date
        const nextAnniversary = new Date(sobrietyDate);
        nextAnniversary.setFullYear(
          sobrietyDate.getFullYear() + currentYears + 1,
        );

        // Check if the next anniversary is within our target period
        if (nextAnniversary >= today && nextAnniversary <= futureDate) {
          milestones.push({
            memberId: member.id,
            memberName: member.name,
            date: nextAnniversary,
            years: currentYears + 1,
          });
        }
      });

      // Sort by date
      return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('Error getting group milestones:', error);
      throw error;
    }
  }

  /**
   * Create a group from a meeting
   */
  static async createFromMeeting(meeting: Meeting): Promise<HomeGroup> {
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Check if meeting already has a group
      if (meeting.groupId) {
        throw new Error('This meeting already has an associated group');
      }

      const now = new Date();
      const groupData: Partial<HomeGroup> = {
        name: `${meeting.name} Group`,
        description: `A recovery group that meets at ${meeting.name}`,
        location: meeting.location,
        address: meeting.address,
        lat: meeting.lat,
        lng: meeting.lng,
        createdAt: now,
        updatedAt: now,
        memberCount: 1,
        admins: [currentUser.uid],
      };

      // Create group - this will also handle setting the geohash if lat/lng are provided
      const group = await GroupModel.create(groupData);

      // Update the meeting with the new group ID
      await firestore().collection('meetings').doc(meeting.id).update({
        groupId: group.id,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return group;
    } catch (error) {
      console.error('Error creating group from meeting:', error);
      throw error;
    }
  }

  static async updateMeetingGroupId(
    meetingId: string,
    groupId: string,
  ): Promise<void> {
    try {
      const meetingRef = firestore().collection('meetings').doc(meetingId);
      await meetingRef.update({
        groupId: groupId,
      });
    } catch (error) {
      console.error('Error updating meeting group ID:', error);
      throw error;
    }
  }

  /**
   * Add a meeting to an existing group
   */
  static async addMeetingToGroup(
    groupId: string,
    meeting: Meeting,
  ): Promise<void> {
    try {
      const groupRef = firestore().collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }

      // Update the meeting with the group ID
      await this.updateMeetingGroupId(meeting.id!, groupId);
    } catch (error) {
      console.error('Error adding meeting to group:', error);
      throw error;
    }
  }

  /**
   * Search groups by location using a Cloud Function (assumed)
   * @param latitude User's latitude
   * @param longitude User's longitude
   * @param radius Radius in miles
   * @returns Promise<HomeGroup[]>
   */
  static async searchGroupsByLocation(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise<HomeGroup[]> {
    try {
      // TODO: Replace with actual Cloud Function call
      console.warn(
        'searchGroupsByLocation: Cloud Function call not implemented yet. Returning empty array.',
      );
      // Example of how you might call a Cloud Function:
      // const functions = firebase.app().functions('your-region'); // Get functions instance
      // const searchFunction = functions.httpsCallable('searchGroupsByLocation');
      // const result = await searchFunction({ latitude, longitude, radius });
      // return result.data as HomeGroup[]; // Assuming the function returns data in this format

      // --- TEMPORARY FALLBACK (REMOVE LATER) ---
      // Fetch all and filter client-side (inefficient, for testing only)
      const allGroups = await this.getAllGroups();
      const filtered = allGroups.filter(group => {
        if (group.lat && group.lng) {
          const distance = calculateDistance(
            latitude,
            longitude,
            group.lat,
            group.lng,
          );
          return distance <= radius;
        }
        return false;
      });
      console.log(
        `Temporary client-side filter found ${filtered.length} groups within ${radius} miles.`,
      );
      return filtered;
      // --- END TEMPORARY FALLBACK ---

      // return []; // Return empty when Cloud Function is ready
    } catch (error) {
      console.error('Error searching groups by location:', error);
      throw error;
    }
  }
}
