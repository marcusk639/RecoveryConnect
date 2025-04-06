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
}
