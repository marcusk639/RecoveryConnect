import {HomeGroup, GroupMember} from '../types';
import {
  FirestoreDocument,
  GroupDocument,
  GroupMemberDocument,
} from '../types/schema';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

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
      name: data.name,
      description: data.description,
      meetingDay: data.meetingDay,
      meetingTime: data.meetingTime,
      location: data.location,
      address: data.address,
      format: data.format,
      isOnline: data.isOnline,
      onlineLink: data.onlineLink,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      foundedDate: data.foundedDate
        ? data.foundedDate.toDate().toISOString()
        : undefined,
      memberCount: data.memberCount,
      admins: data.admins,
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
    if (group.meetingDay !== undefined)
      firestoreData.meetingDay = group.meetingDay;
    if (group.meetingTime !== undefined)
      firestoreData.meetingTime = group.meetingTime;
    if (group.location !== undefined) firestoreData.location = group.location;
    if (group.address !== undefined) firestoreData.address = group.address;
    if (group.format !== undefined) firestoreData.format = group.format;
    if (group.isOnline !== undefined) firestoreData.isOnline = group.isOnline;
    if (group.onlineLink !== undefined)
      firestoreData.onlineLink = group.onlineLink;
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

    return firestoreData;
  }

  /**
   * Get a group by ID
   */
  static async getById(groupId: string): Promise<HomeGroup | null> {
    try {
      const doc = await firestore().collection('groups').doc(groupId).get();

      if (!doc.exists) {
        return null;
      }

      return GroupModel.fromFirestore({
        id: doc.id,
        data: () => doc.data() as GroupDocument,
      });
    } catch (error) {
      console.error('Error getting group:', error);
      throw error;
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
        meetingDay: '',
        meetingTime: '',
        location: '',
        format: '',
        isOnline: false,
        createdAt: now,
        updatedAt: now,
        memberCount: 1,
        admins: [currentUser.uid],
      };

      const newGroup = {...defaultGroup, ...groupData};
      delete newGroup.id; // Remove ID as Firestore will generate one

      const docRef = await firestore()
        .collection('groups')
        .add(GroupModel.toFirestore(newGroup));

      // Add current user as a member
      await firestore()
        .collection('groups')
        .doc(docRef.id)
        .collection('members')
        .doc(currentUser.uid)
        .set({
          id: currentUser.uid,
          displayName: currentUser.displayName || 'Anonymous',
          joinedAt: firestore.FieldValue.serverTimestamp(),
          isAdmin: true,
          showSobrietyDate: false,
        });

      // Add group ID to user's homeGroups
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          homeGroups: firestore.FieldValue.arrayUnion(docRef.id),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      const createdGroup = await docRef.get();
      return {
        ...GroupModel.fromFirestore({
          id: createdGroup.id,
          data: () => createdGroup.data() as GroupDocument,
        }),
        id: docRef.id,
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
      const membersSnapshot = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .get();

      return membersSnapshot.docs.map(doc => {
        const data = doc.data() as GroupMemberDocument;
        return {
          id: doc.id,
          name: data.displayName,
          sobrietyDate: data.sobrietyDate
            ? data.sobrietyDate.toDate().toISOString()
            : undefined,
          position: data.position,
          isAdmin: data.isAdmin,
        };
      });
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

      // Add user to group's members collection
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId)
        .set({
          id: userId,
          displayName: userData?.displayName || 'Anonymous',
          joinedAt: firestore.FieldValue.serverTimestamp(),
          sobrietyDate: userData?.recoveryDate,
          isAdmin: isAdmin,
          showSobrietyDate: false,
        });

      // Increment member count
      await firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          memberCount: firestore.FieldValue.increment(1),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Add group to user's homeGroups
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          homeGroups: firestore.FieldValue.arrayUnion(groupId),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
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
      // Check if member exists
      const memberDoc = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId)
        .get();

      if (!memberDoc.exists) {
        throw new Error('Member not found in this group');
      }

      const memberData = memberDoc.data() as GroupMemberDocument;
      if (memberData.isAdmin) {
        const groupDoc = await firestore()
          .collection('groups')
          .doc(groupId)
          .get();
        const groupData = groupDoc.data() as GroupDocument;

        if (groupData.admins.length === 1 && groupData.admins[0] === userId) {
          throw new Error('Cannot remove the last admin from a group');
        }

        // Remove user from admins array
        await firestore()
          .collection('groups')
          .doc(groupId)
          .update({
            admins: firestore.FieldValue.arrayRemove(userId),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
      }

      // Remove member from group's members collection
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId)
        .delete();

      // Decrement member count
      await firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          memberCount: firestore.FieldValue.increment(-1),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Remove group from user's homeGroups
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          homeGroups: firestore.FieldValue.arrayRemove(groupId),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error removing group member:', error);
      throw error;
    }
  }

  // Add these methods to the GroupModel class in src/models/GroupModel.ts

  /**
   * Make a user an admin of a group
   */
  static async makeAdmin(groupId: string, userId: string): Promise<void> {
    try {
      const groupRef = firestore().collection('groups').doc(groupId);
      const memberRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId);

      // Check if group and member exist
      const [groupDoc, memberDoc] = await Promise.all([
        groupRef.get(),
        memberRef.get(),
      ]);

      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }

      if (!memberDoc.exists) {
        throw new Error('Member not found in this group');
      }

      // Get current admins array
      const groupData = groupDoc.data();
      const currentAdmins = groupData?.admins || [];

      // Check if user is already an admin
      if (currentAdmins.includes(userId)) {
        return; // Already an admin, nothing to do
      }

      // Add user to admins array
      await groupRef.update({
        admins: firestore.FieldValue.arrayUnion(userId),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update member document
      await memberRef.update({
        isAdmin: true,
      });
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
      const groupRef = firestore().collection('groups').doc(groupId);
      const memberRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId);

      // Check if group and member exist
      const [groupDoc, memberDoc] = await Promise.all([
        groupRef.get(),
        memberRef.get(),
      ]);

      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }

      if (!memberDoc.exists) {
        throw new Error('Member not found in this group');
      }

      // Get current admins array
      const groupData = groupDoc.data();
      const currentAdmins = groupData?.admins || [];

      // Check if user is an admin
      if (!currentAdmins.includes(userId)) {
        return; // Not an admin, nothing to do
      }

      // Check if user is the last admin
      if (currentAdmins.length === 1 && currentAdmins[0] === userId) {
        throw new Error('Cannot remove the last admin from a group');
      }

      // Remove user from admins array
      await groupRef.update({
        admins: firestore.FieldValue.arrayRemove(userId),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update member document
      await memberRef.update({
        isAdmin: false,
      });
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
      meetingDay?: string;
      meetingTime?: string;
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
      const memberRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId);

      // Check if member exists
      const memberDoc = await memberRef.get();

      if (!memberDoc.exists) {
        throw new Error('Member not found in this group');
      }

      // Update member position
      await memberRef.update({
        position: position,
      });
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
      const memberRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId);

      const memberDoc = await memberRef.get();
      return memberDoc.exists;
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

      // Sort groups by name
      return groups.sort((a, b) => a.name.localeCompare(b.name));
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
}
