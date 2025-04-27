import firestore from '@react-native-firebase/firestore';
import {GroupMember} from '../types';
import {GroupMemberDocument} from '../types/schema';

/**
 * Member model for managing group membership data in top-level collection
 */
export class MemberModel {
  /**
   * Convert a Firestore member document to a GroupMember object
   */
  static fromFirestore(doc: any): GroupMember {
    const data = doc.data() as GroupMemberDocument;
    return {
      id: doc.id,
      groupId: data.groupId,
      name: data.displayName,
      email: data.email,
      photoURL: data.photoURL,
      isAdmin: data.isAdmin || false,
      position: data.position,
      sobrietyDate: data.sobrietyDate
        ? data.sobrietyDate.toDate().toISOString()
        : undefined,
      joinedAt: data.joinedAt ? data.joinedAt.toDate() : new Date(),
      showSobrietyDate: data.showSobrietyDate || false,
    };
  }

  /**
   * Convert a GroupMember object to a Firestore document
   */
  static toFirestore(
    member: Partial<GroupMember>,
  ): Partial<GroupMemberDocument> {
    const firestoreData: Partial<GroupMemberDocument> = {
      groupId: member.groupId || '',
    };

    if (member.name) firestoreData.displayName = member.name;
    if (member.email) firestoreData.email = member.email;
    if (member.photoURL) firestoreData.photoURL = member.photoURL;
    if (member.isAdmin !== undefined) firestoreData.isAdmin = member.isAdmin;
    if (member.position) firestoreData.position = member.position;
    if (member.sobrietyDate)
      firestoreData.sobrietyDate = firestore.Timestamp.fromDate(
        new Date(member.sobrietyDate),
      );
    if (member.joinedAt)
      firestoreData.joinedAt = firestore.Timestamp.fromDate(member.joinedAt);
    if (member.showSobrietyDate !== undefined)
      firestoreData.showSobrietyDate = member.showSobrietyDate;

    return firestoreData;
  }

  /**
   * Get group members
   */
  static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const membersSnapshot = await firestore()
        .collection('members')
        .where('groupId', '==', groupId)
        .get();

      return membersSnapshot.docs.map(doc => this.fromFirestore(doc));
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
    userData: any,
    isAdmin: boolean = false,
  ): Promise<void> {
    try {
      // Check if the membership already exists
      const membershipQuery = await firestore()
        .collection('members')
        .where('groupId', '==', groupId)
        .where(firestore.FieldPath.documentId(), '==', userId)
        .get();

      if (!membershipQuery.empty) {
        console.log('User is already a member of this group');
        return;
      }

      // Add member to top-level members collection
      const memberDoc = {
        id: userId,
        groupId: groupId,
        displayName: userData?.displayName || 'Anonymous',
        email: userData?.email,
        photoURL: userData?.photoURL,
        joinedAt: firestore.FieldValue.serverTimestamp(),
        sobrietyDate: userData?.recoveryDate,
        isAdmin: isAdmin,
        showSobrietyDate: true,
      };

      await firestore()
        .collection('members')
        .doc(`${groupId}_${userId}`)
        .set(memberDoc);

      // Update group memberCount
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
      // Check if membership exists
      const memberDocRef = firestore()
        .collection('members')
        .doc(`${groupId}_${userId}`);

      const memberDoc = await memberDocRef.get();

      if (!memberDoc.exists) {
        throw new Error('Member not found in this group');
      }

      const memberData = memberDoc.data() as GroupMemberDocument;

      // If member is admin, check if they're the last admin
      if (memberData.isAdmin) {
        const groupDoc = await firestore()
          .collection('groups')
          .doc(groupId)
          .get();

        const groupData = groupDoc.data();

        if (
          groupData &&
          groupData.admins.length === 1 &&
          groupData.admins[0] === userId
        ) {
          throw new Error('Cannot remove the last admin from a group');
        }

        // Remove user from admins array in group document
        await firestore()
          .collection('groups')
          .doc(groupId)
          .update({
            admins: firestore.FieldValue.arrayRemove(userId),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
      }

      // Remove member document
      await memberDocRef.delete();

      // Update group memberCount
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

  /**
   * Make a user an admin of a group
   */
  static async makeAdmin(groupId: string, userId: string): Promise<void> {
    try {
      const memberDocRef = firestore()
        .collection('members')
        .doc(`${groupId}_${userId}`);

      const memberDoc = await memberDocRef.get();

      if (!memberDoc.exists) {
        throw new Error('Member not found in this group');
      }

      const groupRef = firestore().collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }

      // Get current admins array
      const groupData = groupDoc.data();
      const currentAdmins = groupData?.admins || [];

      // Check if user is already an admin
      if (currentAdmins.includes(userId)) {
        return; // Already an admin, nothing to do
      }

      // Add user to admins array in group document
      await groupRef.update({
        admins: firestore.FieldValue.arrayUnion(userId),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update member document
      await memberDocRef.update({
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
      const memberDocRef = firestore()
        .collection('members')
        .doc(`${groupId}_${userId}`);

      const memberDoc = await memberDocRef.get();

      if (!memberDoc.exists) {
        throw new Error('Member not found in this group');
      }

      const groupRef = firestore().collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();

      if (!groupDoc.exists) {
        throw new Error('Group not found');
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

      // Remove user from admins array in group document
      await groupRef.update({
        admins: firestore.FieldValue.arrayRemove(userId),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update member document
      await memberDocRef.update({
        isAdmin: false,
      });
    } catch (error) {
      console.error('Error removing user as admin:', error);
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
      const memberDoc = await firestore()
        .collection('members')
        .doc(`${groupId}_${userId}`)
        .get();

      return memberDoc.exists;
    } catch (error) {
      console.error('Error checking if user is a member:', error);
      return false;
    }
  }

  /**
   * Get all groups a user is a member of
   */
  static async getUserGroups(userId: string): Promise<string[]> {
    try {
      const membersSnapshot = await firestore()
        .collection('members')
        .where(firestore.FieldPath.documentId(), '>=', `_${userId}`)
        .where(firestore.FieldPath.documentId(), '<=', `_${userId}\uf8ff`)
        .get();

      return membersSnapshot.docs.map(doc => doc.data().groupId);
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

  /**
   * Update member position/role
   */
  static async updateMemberPosition(
    groupId: string,
    userId: string,
    position: string,
  ): Promise<void> {
    try {
      const memberDocRef = firestore()
        .collection('members')
        .doc(`${groupId}_${userId}`);

      const memberDoc = await memberDocRef.get();

      if (!memberDoc.exists) {
        throw new Error('Member not found in this group');
      }

      // Update member position
      await memberDocRef.update({
        position: position,
      });
    } catch (error) {
      console.error('Error updating member position:', error);
      throw error;
    }
  }

  /**
   * Update sobriety date visibility
   */
  static async updateSobrietyDateVisibility(
    groupId: string,
    userId: string,
    showSobrietyDate: boolean,
  ): Promise<void> {
    try {
      const memberDocRef = firestore()
        .collection('members')
        .doc(`${groupId}_${userId}`);

      const memberDoc = await memberDocRef.get();

      if (!memberDoc.exists) {
        throw new Error('Member not found in this group');
      }

      // Update sobriety date visibility
      await memberDocRef.update({
        showSobrietyDate: showSobrietyDate,
      });
    } catch (error) {
      console.error('Error updating sobriety date visibility:', error);
      throw error;
    }
  }

  /**
   * Get all memberships for a specific user
   */
  static async getUserMemberships(userId: string): Promise<GroupMember[]> {
    try {
      // Get all members where userId matches the suffix pattern of document ID
      const queryResults = [];

      // Perform a paginated scan of the collection
      // This approach is more scalable for large collections
      let lastDoc = null;
      const batchSize = 100;
      let hasMore = true;

      while (hasMore) {
        let query = firestore().collection('members').limit(batchSize);

        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();

        if (snapshot.empty || snapshot.docs.length < batchSize) {
          hasMore = false;
        } else {
          lastDoc = snapshot.docs[snapshot.docs.length - 1];
        }

        // Filter documents where ID ends with _userId
        const matchingDocs = snapshot.docs.filter(doc =>
          doc.id.endsWith(`_${userId}`),
        );
        queryResults.push(...matchingDocs);
      }

      // Convert to GroupMember objects
      return queryResults.map(doc => this.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting user memberships:', error);
      throw error;
    }
  }

  /**
   * Update user's information across all their memberships
   */
  static async updateUserAcrossMemberships(
    userId: string,
    userData: {
      displayName?: string;
      sobrietyDate?: string | null;
      photoURL?: string;
      email?: string;
      showSobrietyDate?: boolean;
    },
  ): Promise<void> {
    try {
      // Log the start of the operation for debugging
      console.log(`Updating membership documents for user ${userId}`);

      // Get matching document IDs using the getUserMemberships method
      const userMemberships = await this.getUserMemberships(userId);

      // If no memberships found, exit early
      if (userMemberships.length === 0) {
        console.log('No memberships found for user', userId);
        return;
      }

      console.log(`Found ${userMemberships.length} memberships to update`);

      // Batch update all memberships
      const batch = firestore().batch();
      let updateCount = 0;

      for (const membership of userMemberships) {
        // The document ID should be ${groupId}_${userId}
        const docId = `${membership.groupId}_${userId}`;
        const memberRef = firestore().collection('members').doc(docId);
        const updates: Record<string, any> = {};

        if (userData.displayName !== undefined) {
          updates.displayName = userData.displayName;
        }

        if (userData.sobrietyDate !== undefined) {
          updates.sobrietyDate = userData.sobrietyDate
            ? firestore.Timestamp.fromDate(new Date(userData.sobrietyDate))
            : null;
        }

        if (userData.photoURL !== undefined) {
          updates.photoURL = userData.photoURL;
        }

        if (userData.email !== undefined) {
          updates.email = userData.email;
        }

        if (userData.showSobrietyDate !== undefined) {
          updates.showSobrietyDate = userData.showSobrietyDate;
        }

        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          batch.update(memberRef, updates);
          updateCount++;
        }
      }

      // Commit the batch if there are updates
      if (updateCount > 0) {
        await batch.commit();
        console.log(
          `Successfully updated ${updateCount} membership documents for user ${userId}`,
        );
      } else {
        console.log('No updates needed for member documents');
      }
    } catch (error) {
      console.error('Error updating user memberships:', error);
      throw error;
    }
  }

  /**
   * Get all member documents for a specific user across all groups
   * This retrieves all membership documents where the user is a member,
   * efficiently querying based on document ID pattern ${groupId}_${userId}
   */
  static async getAllUserMemberDocuments(
    userId: string,
  ): Promise<GroupMember[]> {
    try {
      console.log(`Fetching all member documents for user: ${userId}`);

      // Try the compound query first, which is more efficient if possible
      try {
        // Using a compound query with startAt and endAt to filter documents where ID ends with _userId
        const membersSnapshot = await firestore()
          .collection('members')
          .where(firestore.FieldPath.documentId(), '>=', `_${userId}`)
          .where(firestore.FieldPath.documentId(), '<=', `_${userId}\uf8ff`)
          .get();

        console.log(
          `Found ${membersSnapshot.docs.length} member documents for user ${userId} using optimized query`,
        );

        if (membersSnapshot.docs.length > 0) {
          return membersSnapshot.docs.map(doc => this.fromFirestore(doc));
        }
      } catch (queryError) {
        console.warn(
          'Compound query failed, falling back to collection scan:',
          queryError,
        );
      }

      // Fallback approach: Scan the collection in batches
      // This is less efficient but more reliable
      const documents: any[] = [];
      let lastDoc = null;
      const batchSize = 100;
      let hasMore = true;

      while (hasMore) {
        let query = firestore().collection('members').limit(batchSize);

        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();

        if (snapshot.empty || snapshot.docs.length < batchSize) {
          hasMore = false;
        } else {
          lastDoc = snapshot.docs[snapshot.docs.length - 1];
        }

        // Filter documents where ID contains _userId
        const matchingDocs = snapshot.docs.filter(doc =>
          doc.id.includes(`_${userId}`),
        );
        documents.push(...matchingDocs);
      }

      console.log(
        `Found ${documents.length} member documents for user ${userId} using collection scan`,
      );

      // Convert to GroupMember objects
      return documents.map(doc => this.fromFirestore(doc));
    } catch (error) {
      console.error('Error getting user member documents:', error);
      throw new Error(
        `Failed to get member documents for user ${userId}: ${error}`,
      );
    }
  }

  /**
   * Update a user's photo URL across all their member documents
   * This is useful when a user updates their profile photo
   */
  static async updateUserPhotoURL(
    userId: string,
    photoURL: string | null,
  ): Promise<void> {
    try {
      console.log(
        `Updating photo URL for user ${userId} across all member documents`,
      );

      // Get all member documents for this user using the direct query
      const membersSnapshot = await firestore()
        .collection('members')
        .where(firestore.FieldPath.documentId(), '>=', `_${userId}`)
        .where(firestore.FieldPath.documentId(), '<=', `_${userId}\uf8ff`)
        .get();

      if (membersSnapshot.empty) {
        console.log(`No member documents found for user ${userId}`);
        return;
      }

      console.log(
        `Updating photo URL for ${membersSnapshot.size} member documents`,
      );

      // Batch update all documents
      const batch = firestore().batch();

      membersSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          photoURL: photoURL,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      });

      // Commit the batch
      await batch.commit();
      console.log(
        `Successfully updated photo URL for ${membersSnapshot.size} member documents`,
      );
    } catch (error) {
      console.error('Error updating user photo URL:', error);
      throw new Error(
        `Failed to update photo URL for user ${userId}: ${error}`,
      );
    }
  }
}
