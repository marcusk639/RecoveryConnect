import {Announcement} from '../types';
import {
  FirestoreDocument,
  AnnouncementDocument,
  COLLECTION_PATHS,
  Timestamp,
} from '../types/schema';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {GroupModel} from './GroupModel'; // For permission checks

/**
 * Model for handling Announcement data
 */
export class AnnouncementModel {
  /**
   * Convert Firestore Document to Announcement app type
   */
  static fromFirestore(
    snapshot: FirebaseFirestoreTypes.DocumentSnapshot,
  ): Announcement {
    const data = snapshot.data() as AnnouncementDocument | undefined; // Get data
    if (!data) {
      throw new Error(`Announcement data missing for doc ${snapshot.id}`);
    }
    return {
      id: snapshot.id, // Use snapshot ID
      groupId: data.groupId,
      title: data.title,
      content: data.content,
      isPinned: data.isPinned ?? false,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      createdBy: data.createdBy,
      authorName: data.authorName,
      expiresAt: data.expiresAt?.toDate(),
      userId: data.userId,
      memberId: data.memberId,
    };
  }

  /**
   * Convert Announcement object to Firestore document
   */
  static toFirestore(
    announcement: Partial<Announcement>,
  ): Partial<AnnouncementDocument> {
    const {id, ...rest} = announcement as any;
    return rest;
  }

  /**
   * Get all announcements for a group
   */
  static async getByGroup(groupId: string): Promise<Announcement[]> {
    try {
      // Query the top-level announcements collection filtering by groupId
      const snapshot = await firestore()
        .collection(COLLECTION_PATHS.ANNOUNCEMENTS)
        .where('groupId', '==', groupId)
        .orderBy('createdAt', 'desc')
        .get();

      if (snapshot.empty) {
        return [];
      }

      const announcements = snapshot.docs.map(doc => this.fromFirestore(doc));
      return announcements;
    } catch (error) {
      console.error('Error getting announcements for group', error);
      throw error;
    }
  }

  /**
   * Create a new announcement
   */
  static async create(
    announcement: Partial<Announcement>,
  ): Promise<Announcement> {
    try {
      const now = firestore.Timestamp.now();
      const data = {
        ...this.toFirestore(announcement),
        createdAt: now,
        updatedAt: now,
      };

      // Add announcement to top-level collection
      const docRef = await firestore()
        .collection(COLLECTION_PATHS.ANNOUNCEMENTS)
        .add(data);

      // If the announcement is pinned, manage the pinned announcements
      if (announcement.isPinned) {
        await this.managePinnedAnnouncements(announcement.groupId!, docRef.id);
      }

      return {
        id: docRef.id,
        ...announcement,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      } as Announcement;
    } catch (error) {
      console.error('Error creating announcement', error);
      throw error;
    }
  }

  /**
   * Update an existing announcement
   */
  static async update(
    id: string,
    updateData: Partial<Announcement>,
  ): Promise<void> {
    try {
      const now = firestore.Timestamp.now();
      const data = {
        ...this.toFirestore(updateData),
        updatedAt: now,
      };

      // Get the current document to check if isPinned status is changing
      const docRef = firestore()
        .collection(COLLECTION_PATHS.ANNOUNCEMENTS)
        .doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Announcement not found');
      }

      const currentData = doc.data() as AnnouncementDocument;

      // If pinned status is changing to true, manage pinned announcements
      if (updateData.isPinned === true && !currentData.isPinned) {
        await this.managePinnedAnnouncements(currentData.groupId, id);
      }

      await docRef.update(data);
    } catch (error) {
      console.error('Error updating announcement', error);
      throw error;
    }
  }

  /**
   * Delete an announcement
   */
  static async delete(id: string): Promise<void> {
    try {
      await firestore()
        .collection(COLLECTION_PATHS.ANNOUNCEMENTS)
        .doc(id)
        .delete();
    } catch (error) {
      console.error('Error deleting announcement', error);
      throw error;
    }
  }

  /**
   * Private method to manage pinned announcements (only 3 are allowed per group)
   */
  private static async managePinnedAnnouncements(
    groupId: string,
    newPinnedId: string,
  ): Promise<void> {
    try {
      // Get current pinned announcements
      const snapshot = await firestore()
        .collection(COLLECTION_PATHS.ANNOUNCEMENTS)
        .where('groupId', '==', groupId)
        .where('isPinned', '==', true)
        .orderBy('createdAt', 'asc')
        .get();

      // If there are already 3 pinned announcements, unpin the oldest one
      if (snapshot.size >= 3) {
        // Skip the one we just pinned
        const announcements = snapshot.docs
          .map(doc => ({id: doc.id, ...(doc.data() as AnnouncementDocument)}))
          .filter(doc => doc.id !== newPinnedId);

        if (announcements.length >= 3) {
          // Unpin the oldest one (first in the list since we ordered by createdAt asc)
          await firestore()
            .collection(COLLECTION_PATHS.ANNOUNCEMENTS)
            .doc(announcements[0].id)
            .update({isPinned: false});
        }
      }
    } catch (error) {
      console.error('Error managing pinned announcements', error);
      throw error;
    }
  }

  /**
   * Fetch all announcements for a specific group, ordered by creation date
   */
  static async getAnnouncementsForGroup(
    groupId: string,
    limit: number = 50,
  ): Promise<Announcement[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTION_PATHS.ANNOUNCEMENTS)
        .where('groupId', '==', groupId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      // Call fromFirestore with the snapshot doc
      return snapshot.docs.map(doc => this.fromFirestore(doc));
    } catch (error) {
      console.error('Error fetching announcements for group:', groupId, error);
      throw new Error('Failed to fetch announcements.');
    }
  }

  /**
   * Create a new announcement for a group
   */
  static async createAnnouncement(
    groupId: string,
    data: {
      title: string;
      content: string;
      isPinned?: boolean;
      expiresAt?: Date | null;
      userId: string;
      memberId: string;
    },
  ): Promise<Announcement> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('Authentication required.');
    }

    // Permission check: Ensure user is an admin of the group
    const isAdmin = await GroupModel.isGroupAdmin(groupId, currentUser.uid);
    if (!isAdmin) {
      throw new Error('User does not have permission to create announcements.');
    }

    const now = new Date();
    const newDocRef = firestore()
      .collection(COLLECTION_PATHS.ANNOUNCEMENTS)
      .doc();

    const announcementData: AnnouncementDocument = {
      groupId: groupId,
      userId: data.userId,
      memberId: data.memberId,
      title: data.title,
      content: data.content,
      isPinned: data.isPinned ?? false,
      createdAt: firestore.Timestamp.fromDate(now),
      updatedAt: firestore.Timestamp.fromDate(now),
      createdBy: currentUser.uid,
      authorName: currentUser.displayName || 'Admin', // Use display name
      ...(data.expiresAt && {
        expiresAt: firestore.Timestamp.fromDate(data.expiresAt),
      }),
    };

    try {
      await newDocRef.set(announcementData);
      // Fetch the created doc to pass to fromFirestore
      const createdDoc = await newDocRef.get();
      return this.fromFirestore(createdDoc); // Pass the snapshot
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw new Error('Failed to create announcement.');
    }
  }

  /**
   * Delete an announcement
   */
  static async deleteAnnouncement(
    groupId: string,
    announcementId: string,
  ): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('Authentication required.');
    }

    // Permission check
    const isAdmin = await GroupModel.isGroupAdmin(groupId, currentUser.uid);
    // Optional: Allow creator to delete?
    // const announcementDoc = await firestore().collection(COLLECTION_PATHS.ANNOUNCEMENTS).doc(announcementId).get();
    // const isCreator = announcementDoc.data()?.createdBy === currentUser.uid;
    // if (!isAdmin && !isCreator) { ... }
    if (!isAdmin) {
      throw new Error(
        'User does not have permission to delete this announcement.',
      );
    }

    try {
      const docRef = firestore()
        .collection(COLLECTION_PATHS.ANNOUNCEMENTS)
        .doc(announcementId);
      await docRef.delete();
    } catch (error) {
      console.error('Error deleting announcement:', announcementId, error);
      throw new Error('Failed to delete announcement.');
    }
  }
}
