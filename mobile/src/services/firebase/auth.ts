import {auth, firestore} from './config';
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} = auth;
const {collection, doc} = firestore;
import FirebaseAuth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import Firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
const {GoogleAuthProvider} = FirebaseAuth;
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import {Platform} from 'react-native';

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  recoveryDate?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Register a new user with email and password
export const registerWithEmail = async (
  data: RegisterData,
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(
      data.email,
      data.password,
    );

    // Update display name
    if (userCredential.user) {
      await userCredential.user.updateProfile({
        displayName: data.displayName,
      });

      firestore
        .collection('users')
        .doc(userCredential.user.uid)
        .set({
          email: data.email,
          displayName: data.displayName,
          recoveryDate: data.recoveryDate ? new Date(data.recoveryDate) : null,
          createdAt: Firestore.FieldValue.serverTimestamp(),
          lastLogin: Firestore.FieldValue.serverTimestamp(),
        });
    }

    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in with email and password
export const loginWithEmail = async (
  data: LoginData,
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(
      data.email,
      data.password,
    );

    // Update last login timestamp
    if (userCredential.user) {
      await firestore.collection('users').doc(userCredential.user.uid).update({
        lastLogin: Firestore.FieldValue.serverTimestamp(),
      });
    }

    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out the current user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(email);
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw error;
  }
};

// Get the current user's profile data
export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await firestore.collection('users').doc(userId).get();

    if (userDoc.exists) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId:
    '421876308052-s558o9vfqjcj5faj1gfogo2sock2enpd.apps.googleusercontent.com', // Get this from Firebase Console
  offlineAccess: true,
});

/**
 * Sign in with Google
 */
export const signInWithGoogle =
  async (): Promise<FirebaseAuthTypes.UserCredential> => {
    try {
      // Get the user ID token
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;

      if (!idToken) {
        throw new Error('Google Sign-In failed - no ID token returned');
      }

      // Create a Google credential
      const googleCredential =
        FirebaseAuth.GoogleAuthProvider.credential(idToken);

      // Sign in with the credential
      const userCredential = await auth.signInWithCredential(googleCredential);

      // Check if this is a new user
      if (userCredential.additionalUserInfo?.isNewUser) {
        // Create a user profile in Firestore
        await createUserProfile(userCredential.user);
      } else {
        // Update last login time
        await updateLastLogin(userCredential.user.uid);
      }

      return userCredential;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

/**
 * Sign in with Apple
 */
export const signInWithApple =
  async (): Promise<FirebaseAuthTypes.UserCredential> => {
    // Apple Sign In is only available on iOS
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign In is only supported on iOS devices');
    }

    try {
      // Start the Apple authentication flow
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      // Create a Firebase credential from the response
      const {identityToken, nonce} = appleAuthRequestResponse;
      const appleCredential = FirebaseAuth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      // Sign in with the credential
      const userCredential = await auth.signInWithCredential(appleCredential);

      // Apple doesn't always return the user's name, so we need to handle that
      if (
        userCredential.additionalUserInfo?.isNewUser &&
        appleAuthRequestResponse.fullName?.givenName
      ) {
        // Update the user's profile with their name
        await userCredential.user.updateProfile({
          displayName: appleAuthRequestResponse.fullName.givenName,
        });

        // Create a user profile in Firestore
        await createUserProfile(userCredential.user);
      } else if (!userCredential.additionalUserInfo?.isNewUser) {
        // Update last login time
        await updateLastLogin(userCredential.user.uid);
      }

      return userCredential;
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw error;
    }
  };

/**
 * Sign in with Facebook
 */
export const signInWithFacebook =
  async (): Promise<FirebaseAuthTypes.UserCredential> => {
    try {
      // Log in with Facebook SDK
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        throw new Error('User cancelled the login process');
      }

      // Get the access token
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        throw new Error('Failed to get access token from Facebook');
      }

      // Create a Facebook credential
      const facebookCredential = FirebaseAuth.FacebookAuthProvider.credential(
        data.accessToken,
      );

      // Sign in with the credential
      const userCredential = await auth.signInWithCredential(
        facebookCredential,
      );

      // Check if this is a new user
      if (userCredential.additionalUserInfo?.isNewUser) {
        // Create a user profile in Firestore
        await createUserProfile(userCredential.user);
      } else {
        // Update last login time
        await updateLastLogin(userCredential.user.uid);
      }

      return userCredential;
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw error;
    }
  };

/**
 * Create a user profile in Firestore
 */
const createUserProfile = async (
  user: FirebaseAuthTypes.User,
): Promise<void> => {
  try {
    // Create a display name from email if none exists
    const displayName =
      user.displayName || user.email?.split('@')[0] || 'Anonymous';

    // Extract first name or initial only for anonymity
    const anonymousName = getAnonymousName(displayName);

    const now = new Date();

    // Create user document in Firestore
    await firestore
      .collection('users')
      .doc(user.uid)
      .set({
        uid: user.uid,
        email: user.email,
        displayName: anonymousName,
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
        // Default to no recovery date - user can add later
      });

    // Update Firebase Auth profile to use the anonymous name
    await user.updateProfile({
      displayName: anonymousName,
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Update the last login time for a user
 */
const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    await firestore.collection('users').doc(userId).update({
      lastLogin: new Date(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    // Non-critical error, so we don't throw
  }
};

/**
 * Extract first name or initial only from a display name
 */
const getAnonymousName = (name: string): string => {
  // Remove any extra whitespace and split by space
  const parts = name.trim().split(/\s+/);

  // Get just the first name
  const firstName = parts[0];

  // Return just the first initial if the user wants maximum anonymity
  // This could be a setting the user chooses during registration
  // return firstName.charAt(0) + '.';

  // For now, return the first name for better usability
  // return the first name and last initial
  return firstName + ' ' + parts[1].charAt(0) + '.';
};
