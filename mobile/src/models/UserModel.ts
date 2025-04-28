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
  static toFirestore(user: Partial<User>): Partial<UserDocument> {
    const firestoreData: Partial<UserDocument> = {};

    // Only include properties that are defined
    if (user.uid !== undefined) firestoreData.uid = user.uid;
    if (user.email !== undefined) firestoreData.email = user.email;
    if (user.displayName !== undefined)
      firestoreData.displayName = user.displayName;
    if (user.photoUrl !== undefined) firestoreData.photoUrl = user.photoUrl;

    // Handle dates safely - check if they exist and are valid
    if (user.recoveryDate) {
      try {
        firestoreData.recoveryDate = Firestore.Timestamp.fromDate(
          new Date(user.recoveryDate),
        );
      } catch (error) {
        console.warn('Invalid recovery date format:', user.recoveryDate);
      }
    }

    if (user.createdAt) {
      try {
        firestoreData.createdAt = Firestore.Timestamp.fromDate(
          new Date(user.createdAt),
        );
      } catch (error) {
        console.warn('Invalid createdAt date format:', user.createdAt);
      }
    }

    if (user.updatedAt) {
      try {
        firestoreData.updatedAt = Firestore.Timestamp.fromDate(
          new Date(user.updatedAt),
        );
      } catch (error) {
        console.warn('Invalid updatedAt date format:', user.updatedAt);
      }
    }

    if (user.lastLogin) {
      try {
        firestoreData.lastLogin = Firestore.Timestamp.fromDate(
          new Date(user.lastLogin),
        );
      } catch (error) {
        console.warn('Invalid lastLogin date format:', user.lastLogin);
      }
    }

    // Handle other properties
    if (user.notificationSettings !== undefined)
      firestoreData.notificationSettings = user.notificationSettings;
    if (user.privacySettings !== undefined)
      firestoreData.privacySettings = user.privacySettings;
    if (user.homeGroups !== undefined)
      firestoreData.homeGroups = user.homeGroups;
    if (user.role !== undefined) firestoreData.role = user.role;
    if (user.favoriteMeetings !== undefined)
      firestoreData.favoriteMeetings = user.favoriteMeetings;

    return firestoreData;
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
        photoUrl: currentUser.photoURL || '',
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

  /**
   * Sync user profile from Firebase Auth to Firestore
   * This ensures that any changes made directly to the auth profile
   * (like photoURL) are reflected in our Firestore user document
   */
  static async syncUserProfileFromAuth(uid: string): Promise<User | null> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser || currentUser.uid !== uid) {
        throw new Error('User not authenticated or ID mismatch');
      }

      const userRef = firestore.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.warn(
          'User document not found in Firestore when syncing from auth',
        );
        return null;
      }

      const updates: Partial<User> = {
        updatedAt: new Date(),
      };

      // Only update fields that exist in auth and have values
      if (currentUser.displayName) {
        updates.displayName = currentUser.displayName;
      }

      if (currentUser.email) {
        updates.email = currentUser.email;
      }

      if (currentUser.photoURL) {
        updates.photoUrl = currentUser.photoURL;
      }

      // Update the document with auth profile data
      await userRef.update(UserModel.toFirestore(updates));

      // Get the updated document
      const updatedDoc = await userRef.get();
      return UserModel.fromFirestore({
        id: updatedDoc.id,
        data: () => updatedDoc.data() as UserDocument,
      });
    } catch (error) {
      console.error('Error syncing user profile from auth:', error);
      return null;
    }
  }

  /**
   * Update user's photo URL in both Firestore and Auth profile
   */
  static async updatePhotoURL(
    uid: string,
    photoUrl: string,
  ): Promise<User | null> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser || currentUser.uid !== uid) {
        throw new Error('User not authenticated or ID mismatch');
      }

      // Update auth profile first
      await currentUser.updateProfile({
        photoURL: photoUrl,
      });

      // Then update Firestore document
      const userRef = firestore.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User document not found');
      }

      const updates: Partial<User> = {
        photoUrl: photoUrl,
        updatedAt: new Date(),
      };

      await userRef.update(UserModel.toFirestore(updates));

      // Get the updated document
      const updatedDoc = await userRef.get();
      return UserModel.fromFirestore({
        id: updatedDoc.id,
        data: () => updatedDoc.data() as UserDocument,
      });
    } catch (error) {
      console.error('Error updating user photo URL:', error);
      throw error;
    }
  }
}
