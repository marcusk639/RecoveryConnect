import {HomeGroup, GroupMember, Meeting} from '../types';
import {FirestoreDocument, GroupDocument} from '../types/schema';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {MemberModel} from './MemberModel';
import {MeetingModel} from './MeetingModel';
import {cloneDeep, zip} from 'lodash';
import {mapAsync} from '../utils/async';
import {UserModel} from './UserModel';

/**
 * Group model for managing group data
 */
export class GroupModel {
  /**
   * Convert a Firestore group document to a HomeGroup object
   */
  static fromFirestore(doc: FirestoreDocument<GroupDocument>): HomeGroup {
    const data = doc.data();
    const now = new Date(); // Default date if timestamps are missing
    return {
      id: doc.id,
      type: data.type || 'AA', // Default to AA if missing
      name: data.name || 'Unnamed Group',
      description: data.description || '',
      location: data.location || '',
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      lat: data.lat,
      lng: data.lng,
      treasurers: data.treasurers || [],
      createdAt: data.createdAt ? data.createdAt.toDate() : now,
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : now,
      foundedDate: data.foundedDate
        ? data.foundedDate.toDate().toISOString()
        : undefined,
      memberCount: data.memberCount || 0,
      admins: data.admins || [],
      isClaimed: data.isClaimed || false,
      pendingAdminRequests: data.pendingAdminRequests
        ? data.pendingAdminRequests.map(request => ({
            uid: request.uid,
            requestedAt: request.requestedAt.toDate(),
            message: request.message,
          }))
        : [],
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
          lastUpdated: now,
        },
      },
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
    if (group.meetings !== undefined) {
      delete group.meetings;
    }
    if (group.memberCount !== undefined)
      firestoreData.memberCount = group.memberCount;
    if (group.admins !== undefined) firestoreData.admins = group.admins;
    if (group.isClaimed !== undefined)
      firestoreData.isClaimed = group.isClaimed;

    if (group.pendingAdminRequests !== undefined) {
      firestoreData.pendingAdminRequests = group.pendingAdminRequests.map(
        request => ({
          uid: request.uid,
          requestedAt: firestore.Timestamp.fromDate(request.requestedAt),
          message: request.message,
        }),
      );
    }

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
      firestoreData.treasury = {
        balance: group.treasury.balance || 0,
        prudentReserve: group.treasury.prudentReserve || 0,
        monthlyIncome: group.treasury.monthlyIncome || 0,
        monthlyExpenses: group.treasury.monthlyExpenses || 0,
        transactions: group.treasury.transactions || [],
        summary: group.treasury.summary || {
          balance: 0,
          prudentReserve: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          lastUpdated: new Date(),
        },
      };
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
        isClaimed: true, // Initialize this field
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
      const newGroupForFirestore = {...newGroup};
      // Remove ID field from the Firestore data
      if ('id' in newGroupForFirestore) {
        delete (newGroupForFirestore as {id?: string}).id;
      }

      let meetings = cloneDeep(newGroup.meetings);
      // Remove meetings from the Firestore data
      if ('meetings' in newGroupForFirestore) {
        delete (newGroupForFirestore as {meetings?: Meeting[]}).meetings;
      }

      const docRef = await firestore()
        .collection('groups')
        .add(GroupModel.toFirestore(newGroupForFirestore));

      // Add groupId to each meeting
      meetings = meetings?.map(meeting => ({
        ...meeting,
        groupId: docRef.id,
      }));
      await MeetingModel.createBatch(meetings || []);

      // Get user data
      const user = await UserModel.getById(currentUser.uid);

      if (!user) {
        throw new Error('User not found');
      }

      // Add current user as a member using the MemberModel
      await MemberModel.addMember(docRef.id, currentUser.uid, user, true);

      const createdGroup = await docRef.get();
      return {
        ...GroupModel.fromFirestore({
          id: createdGroup.id,
          data: () => createdGroup.data() as GroupDocument,
        }),
        id: docRef.id,
        meetings: meetings || [],
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
      const user = await UserModel.getById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Use MemberModel to add member to top-level collection
      await MemberModel.addMember(groupId, userId, user, isAdmin);
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

  static async completeDonation(
    groupId: string,
    amount: number,
    donationId: string,
  ): Promise<HomeGroup | null> {
    try {
      // Use MemberModel to add donation to group
      const groupRef = firestore().collection('groups').doc(groupId);

      await groupRef.update({
        treasury: {
          balance: firestore.FieldValue.increment(amount),
        },
      });
      await groupRef.collection('donations').doc(donationId).update({
        amount,
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: 'completed',
      });
      return GroupModel.getById(groupId);
    } catch (error) {
      console.error('Error adding donation:', error);
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
        .collection('members')
        .where('groupId', '==', groupId)
        .get();

      const userIds = membersSnapshot.docs.map(doc => {
        const memberData = doc.data() as GroupMember;
        return memberData.userId;
      });

      // Batch write to remove group from all members' homeGroups
      const batch = firestore().batch();

      for (const userId of userIds) {
        const userRef = firestore().collection('users').doc(userId);
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
      // Step 1: Get the user's memberships to find which groups they belong to
      const membersSnapshot = await firestore()
        .collection('members')
        .where('userId', '==', userId)
        .get();

      if (membersSnapshot.empty) {
        return []; // User isn't a member of any groups
      }

      // Step 2: Extract the group IDs from the memberships
      const groupIds = membersSnapshot.docs.map(doc => doc.data().groupId);

      if (groupIds.length === 0) {
        return [];
      }

      // Step 3: Fetch the actual group documents using these IDs
      const groupPromises = groupIds.map(groupId =>
        firestore().collection('groups').doc(groupId).get(),
      );

      const groupDocs = await Promise.all(groupPromises);

      // Step 4: Convert to HomeGroup objects, filtering out any that don't exist
      const groups = groupDocs
        .filter(doc => doc.exists)
        .map(doc =>
          this.fromFirestore({
            id: doc.id,
            data: () => doc.data() as GroupDocument,
          }),
        );

      // Fetch meetings for all groups
      const groupsWithMeetings = await mapAsync(groups, async group => {
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
      // Get all members with sobriety dates from top-level members collection
      const membersWithDates: {id: string; name: string; sobrietyDate: Date}[] =
        [];

      const membersSnapshot = await firestore()
        .collection('members')
        .where('groupId', '==', groupId)
        .where('sobrietyDate', '!=', null)
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
   * Search groups by location using Cloud Function
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
      console.log(
        `Calling searchGroupsByLocation cloud function with lat=${latitude}, lng=${longitude}, radius=${radius}`,
      );

      // Call the Cloud Function to search groups by location
      const functions = firestore().app.functions('us-central1');
      const searchFunction = functions.httpsCallable('searchGroupsByLocation');

      const result = await searchFunction({
        lat: latitude,
        lng: longitude,
        radius: radius,
      });

      console.log(`Cloud function returned ${result.data?.length || 0} groups`);

      const groups = result.data || [];

      console.log(
        `Found ${groups.length} groups within ${radius} miles using cloud function`,
      );
      return groups;
    } catch (error) {
      console.error('Error searching groups by location:', error);
      throw error;
    }
  }

  /**
   * Get the current user's ID
   * @returns The current user's UID or null if not authenticated
   */
  static getCurrentUserId(): string | null {
    const currentUser = auth().currentUser;
    return currentUser ? currentUser.uid : null;
  }

  /**
   * Request admin access for a group
   * @param groupId The ID of the group
   * @param message Optional message explaining the connection to the group
   * @returns Promise that resolves when the request is submitted
   */
  static async requestAdminAccess(
    groupId: string,
    message?: string,
  ): Promise<void> {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      throw new Error('You must be logged in to request admin access');
    }

    const userId = currentUser.uid;
    const groupRef = firestore().collection('groups').doc(groupId);

    // Get the current group data
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data();

    // Check if group is already claimed
    if (groupData?.isClaimed) {
      throw new Error(
        'This group already has admins. Please contact them directly.',
      );
    }

    // Check if user already has a pending request
    const pendingRequests = groupData?.pendingAdminRequests || [];
    const existingRequest = pendingRequests.find(
      (req: any) => req.uid === userId,
    );

    if (existingRequest) {
      throw new Error('You already have a pending request for this group');
    }

    // Add the request
    const newRequest = {
      uid: userId,
      requestedAt: firestore.Timestamp.now(),
      message: message || '',
    };

    return groupRef.update({
      pendingAdminRequests: firestore.FieldValue.arrayUnion(newRequest),
    });
  }

  /**
   * Get all groups with pending admin requests
   * For super admin use
   * @returns Promise that resolves to an array of groups with pending requests
   */
  static async getGroupsWithPendingRequests(): Promise<HomeGroup[]> {
    const isSuperAdmin = await UserModel.isSuperAdmin();

    if (!isSuperAdmin) {
      throw new Error('Only super admins can view pending requests');
    }

    const snapshot = await firestore()
      .collection('groups')
      .where('pendingAdminRequests', '!=', [])
      .get();

    return snapshot.docs.map(doc =>
      this.fromFirestore({
        id: doc.id,
        data: () => doc.data() as GroupDocument,
      }),
    );
  }

  /**
   * Approve an admin request
   * @param groupId The ID of the group
   * @param requestUid The UID of the user whose request is being approved
   * @returns Promise that resolves when the request is approved
   */
  static async approveAdminRequest(
    groupId: string,
    requestUid: string,
  ): Promise<void> {
    const isSuperAdmin = await UserModel.isSuperAdmin();

    if (!isSuperAdmin) {
      throw new Error('Only super admins can approve requests');
    }

    const groupRef = firestore().collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data();
    const pendingRequests = groupData?.pendingAdminRequests || [];
    const requestIndex = pendingRequests.findIndex(
      (req: any) => req.uid === requestUid,
    );

    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    // Remove the request from pending
    const updatedRequests = [...pendingRequests];
    updatedRequests.splice(requestIndex, 1);

    // Add the user as an admin
    return firestore().runTransaction(async transaction => {
      transaction.update(groupRef, {
        pendingAdminRequests: updatedRequests,
        adminUids: firestore.FieldValue.arrayUnion(requestUid),
        isClaimed: true,
      });
    });
  }

  /**
   * Deny an admin request
   * @param groupId The ID of the group
   * @param requestUid The UID of the user whose request is being denied
   * @returns Promise that resolves when the request is denied
   */
  static async denyAdminRequest(
    groupId: string,
    requestUid: string,
  ): Promise<void> {
    const isSuperAdmin = await UserModel.isSuperAdmin();

    if (!isSuperAdmin) {
      throw new Error('Only super admins can deny requests');
    }

    const groupRef = firestore().collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new Error('Group not found');
    }

    const groupData = groupDoc.data();
    const pendingRequests = groupData?.pendingAdminRequests || [];
    const requestIndex = pendingRequests.findIndex(
      (req: any) => req.uid === requestUid,
    );

    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    // Remove the request from pending
    const updatedRequests = [...pendingRequests];
    updatedRequests.splice(requestIndex, 1);

    return groupRef.update({
      pendingAdminRequests: updatedRequests,
    });
  }

  /**
   * Direct admin assignment (super admin only)
   */
  static async assignAdmin(groupId: string, userId: string): Promise<void> {
    try {
      // Check if current user is a super admin
      const isSuperAdmin = await UserModel.isSuperAdmin();
      if (!isSuperAdmin) {
        throw new Error('Only super admins can directly assign admins');
      }

      const groupRef = firestore().collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }

      // Update the group
      await groupRef.update({
        adminUids: firestore.FieldValue.arrayUnion(userId),
        admins: firestore.FieldValue.arrayUnion(userId),
        isClaimed: true,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log('Admin assigned directly');
    } catch (error) {
      console.error('Error assigning admin:', error);
      throw error;
    }
  }

  /**
   * Check if a group is claimed (has admins)
   */
  static async isGroupClaimed(groupId: string): Promise<boolean> {
    try {
      const groupDoc = await firestore()
        .collection('groups')
        .doc(groupId)
        .get();

      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data() as GroupDocument;
      return groupData.isClaimed || false;
    } catch (error) {
      console.error('Error checking if group is claimed:', error);
      return false;
    }
  }
}
