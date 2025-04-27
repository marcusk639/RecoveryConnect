import {
  User,
  NotificationSettings,
  PrivacySettings,
  FirestoreDocument,
} from '../types';
import {UserDocument} from '../types/schema';
import {firestore, auth} from '../services/firebase/config';
import Firestore from '@react-native-firebase/firestore';

/**
 * User model for managing user data
 */
export class UserModel {
  /**
   * Convert a Firestore user document to a User object
   */
  static fromFirestore(doc: FirestoreDocument<UserDocument>): User {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email,
      displayName: data.displayName,
      recoveryDate: data.recoveryDate
        ? data.recoveryDate.toDate().toISOString()
        : undefined,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      lastLogin: data.lastLogin.toDate(),
      notificationSettings: data.notificationSettings,
      privacySettings: data.privacySettings,
      homeGroups: data.homeGroups,
      role: data.role,
      favoriteMeetings: data.favoriteMeetings,
      photoUrl: data.photoUrl,
    };
  }

  /**
   * Convert a User object to a Firestore document
   */
  static toFirestore(user: User): Partial<UserDocument> {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      recoveryDate: user.recoveryDate
        ? Firestore.Timestamp.fromDate(new Date(user.recoveryDate))
        : undefined,
      createdAt: Firestore.Timestamp.fromDate(user.createdAt),
      updatedAt: Firestore.Timestamp.fromDate(user.updatedAt),
      lastLogin: Firestore.Timestamp.fromDate(user.lastLogin),
      notificationSettings: user.notificationSettings,
      privacySettings: user.privacySettings,
      homeGroups: user.homeGroups,
      role: user.role,
      favoriteMeetings: user.favoriteMeetings,
    };
  }

  /**
   * Get a user by ID
   */
  static async getById(uid: string): Promise<User | null> {
    try {
      const doc = await firestore.collection('users').doc(uid).get();

      if (!doc.exists) {
        return null;
      }

      return UserModel.fromFirestore({
        id: doc.id,
        data: () => doc.data() as UserDocument,
      });
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  static async create(userData: Partial<User>): Promise<User> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const now = new Date();
      const defaultUser: User = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Anonymous',
        createdAt: now,
        updatedAt: now,
        lastLogin: now,
        notificationSettings: {
          meetings: true,
          announcements: true,
          celebrations: true,
        },
        privacySettings: {
          showRecoveryDate: false,
          allowDirectMessages: true,
        },
        homeGroups: [],
        role: 'user',
      };

      const newUser = {...defaultUser, ...userData};

      await firestore
        .collection('users')
        .doc(newUser.uid)
        .set(UserModel.toFirestore(newUser));

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update a user
   */
  static async update(uid: string, userData: Partial<User>): Promise<User> {
    try {
      const userRef = firestore.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const updatedFields = {
        ...userData,
        updatedAt: new Date(),
      };

      await userRef.update(UserModel.toFirestore(updatedFields as User));

      const updatedDoc = await userRef.get();
      return UserModel.fromFirestore({
        id: updatedDoc.id,
        data: () => updatedDoc.data() as UserDocument,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(
    uid: string,
    settings: Partial<NotificationSettings>,
  ): Promise<NotificationSettings> {
    try {
      const userRef = firestore.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as UserDocument;
      const updatedSettings = {
        ...userData.notificationSettings,
        ...settings,
      };

      await userRef.update({
        notificationSettings: updatedSettings,
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });

      return updatedSettings;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  /**
   * Update privacy settings
   */
  static async updatePrivacySettings(
    uid: string,
    settings: Partial<PrivacySettings>,
  ): Promise<PrivacySettings> {
    try {
      const userRef = firestore.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as UserDocument;
      const updatedSettings = {
        ...userData.privacySettings,
        ...settings,
      };

      await userRef.update({
        privacySettings: updatedSettings,
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });

      return updatedSettings;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  /**
   * Add a favorite meeting
   */
  static async addFavoriteMeeting(
    uid: string,
    meetingId: string,
  ): Promise<string[]> {
    try {
      const userRef = firestore.collection('users').doc(uid);

      await userRef.update({
        favoriteMeetings: Firestore.FieldValue.arrayUnion(meetingId),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });

      const updatedDoc = await userRef.get();
      const userData = updatedDoc.data() as UserDocument;

      return userData.favoriteMeetings || [];
    } catch (error) {
      console.error('Error adding favorite meeting:', error);
      throw error;
    }
  }

  /**
   * Remove a favorite meeting
   */
  static async removeFavoriteMeeting(
    uid: string,
    meetingId: string,
  ): Promise<string[]> {
    try {
      const userRef = firestore.collection('users').doc(uid);

      await userRef.update({
        favoriteMeetings: Firestore.FieldValue.arrayRemove(meetingId),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });

      const updatedDoc = await userRef.get();
      const userData = updatedDoc.data() as UserDocument;

      return userData.favoriteMeetings || [];
    } catch (error) {
      console.error('Error removing favorite meeting:', error);
      throw error;
    }
  }
}
