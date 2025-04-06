import {Announcement} from '../types';
import {FirestoreDocument, AnnouncementDocument} from '../types/schema';
import Firestore from '@react-native-firebase/firestore';
import {auth, firestore} from '../services/firebase/config';

/**
 * Announcement model for managing announcement data
 */
export class AnnouncementModel {
  /**
   * Convert a Firestore announcement document to an Announcement object
   */
  static fromFirestore(
    doc: FirestoreDocument<AnnouncementDocument>,
    groupId: string,
  ): Announcement {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      isPinned: data.isPinned,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      createdBy: data.createdBy,
      authorName: data.authorName,
      expiresAt: data.expiresAt ? data.expiresAt.toDate() : undefined,
      groupId: groupId,
    };
  }

  /**
   * Convert an Announcement object to a Firestore document
   */
  static toFirestore(
    announcement: Partial<Announcement>,
  ): Partial<AnnouncementDocument> {
    const firestoreData: Partial<AnnouncementDocument> = {};

    if (announcement.title !== undefined)
      firestoreData.title = announcement.title;
    if (announcement.content !== undefined)
      firestoreData.content = announcement.content;
    if (announcement.isPinned !== undefined)
      firestoreData.isPinned = announcement.isPinned;
    if (announcement.createdBy !== undefined)
      firestoreData.createdBy = announcement.createdBy;
    if (announcement.authorName !== undefined)
      firestoreData.authorName = announcement.authorName;
    if (announcement.createdAt !== undefined) {
      firestoreData.createdAt = Firestore.Timestamp.fromDate(
        announcement.createdAt,
      );
    }
    if (announcement.updatedAt !== undefined) {
      firestoreData.updatedAt = Firestore.Timestamp.fromDate(
        announcement.updatedAt,
      );
    }
    if (announcement.expiresAt !== undefined) {
      firestoreData.expiresAt = Firestore.Timestamp.fromDate(
        announcement.expiresAt,
      );
    }

    return firestoreData;
  }

  /**
   * Get announcements for a group
   */
  static async getByGroup(groupId: string): Promise<Announcement[]> {
    try {
      const announcementsSnapshot = await firestore
        .collection('groups')
        .doc(groupId)
        .collection('announcements')
        .orderBy('isPinned', 'desc')
        .orderBy('createdAt', 'desc')
        .get();

      return announcementsSnapshot.docs.map(doc =>
        AnnouncementModel.fromFirestore(
          {
            id: doc.id,
            data: () => doc.data() as AnnouncementDocument,
          },
          groupId,
        ),
      );
    } catch (error) {
      console.error('Error getting announcements:', error);
      throw error;
    }
  }

  /**
   * Create a new announcement
   */
  static async create(
    groupId: string,
    announcementData: Partial<Announcement>,
  ): Promise<Announcement> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const now = new Date();
      const defaultAnnouncement: Partial<Announcement> = {
        title: '',
        content: '',
        isPinned: false,
        createdAt: now,
        updatedAt: now,
        createdBy: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous',
        groupId: groupId,
      };

      const newAnnouncement = {...defaultAnnouncement, ...announcementData};

      // If pinned, check if we need to unpin any announcements
      if (newAnnouncement.isPinned) {
        await AnnouncementModel.managePinnedAnnouncements(groupId);
      }

      const docRef = await firestore
        .collection('groups')
        .doc(groupId)
        .collection('announcements')
        .add(AnnouncementModel.toFirestore(newAnnouncement));

      const createdAnnouncement = await docRef.get();
      return AnnouncementModel.fromFirestore(
        {
          id: createdAnnouncement.id,
          data: () => createdAnnouncement.data() as AnnouncementDocument,
        },
        groupId,
      );
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  /**
   * Update an announcement
   */
  static async update(
    groupId: string,
    announcementId: string,
    announcementData: Partial<Announcement>,
  ): Promise<Announcement> {
    try {
      const announcementRef = firestore
        .collection('groups')
        .doc(groupId)
        .collection('announcements')
        .doc(announcementId);

      const announcementDoc = await announcementRef.get();

      if (!announcementDoc.exists) {
        throw new Error('Announcement not found');
      }

      // Check if pinned status is changing
      const currentData = announcementDoc.data() as AnnouncementDocument;
      if (
        announcementData.isPinned !== undefined &&
        announcementData.isPinned !== currentData.isPinned &&
        announcementData.isPinned
      ) {
        // If pinning, check if we need to unpin any announcements
        await AnnouncementModel.managePinnedAnnouncements(groupId);
      }

      const updatedFields = {
        ...announcementData,
        updatedAt: new Date(),
      };

      await announcementRef.update(
        AnnouncementModel.toFirestore(updatedFields),
      );

      const updatedDoc = await announcementRef.get();
      return AnnouncementModel.fromFirestore(
        {
          id: updatedDoc.id,
          data: () => updatedDoc.data() as AnnouncementDocument,
        },
        groupId,
      );
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  /**
   * Delete an announcement
   */
  static async delete(groupId: string, announcementId: string): Promise<void> {
    try {
      await firestore
        .collection('groups')
        .doc(groupId)
        .collection('announcements')
        .doc(announcementId)
        .delete();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  /**
   * Manage pinned announcements (max 3)
   */
  private static async managePinnedAnnouncements(
    groupId: string,
  ): Promise<void> {
    try {
      const MAX_PINNED = 3;

      // Get current pinned announcements
      const pinnedSnapshot = await firestore
        .collection('groups')
        .doc(groupId)
        .collection('announcements')
        .where('isPinned', '==', true)
        .orderBy('updatedAt', 'asc') // Oldest first
        .get();

      // If we already have max pinned announcements, unpin the oldest one
      if (pinnedSnapshot.size >= MAX_PINNED) {
        // Unpin as many as needed
        const numToUnpin = pinnedSnapshot.size - MAX_PINNED + 1;
        const docsToUnpin = pinnedSnapshot.docs.slice(0, numToUnpin);

        // Batch update
        const batch = firestore.batch();
        docsToUnpin.forEach(doc => {
          batch.update(doc.ref, {
            isPinned: false,
            updatedAt: Firestore.FieldValue.serverTimestamp(),
          });
        });

        await batch.commit();
      }
    } catch (error) {
      console.error('Error managing pinned announcements:', error);
      throw error;
    }
  }
}
