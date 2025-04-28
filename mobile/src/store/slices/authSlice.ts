import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {RootState} from '../index';
import {UserModel} from '../../models/UserModel';
import {MemberModel} from '../../models/MemberModel';
import firestore from '@react-native-firebase/firestore';

// Define the state structure
interface AuthState {
  user: FirebaseAuthTypes.User | null;
  userData: any | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isAuthenticated: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  userData: null,
  status: 'idle',
  error: null,
  isAuthenticated: false,
};

// Async thunks for authentication operations
export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, {dispatch}) => {
    return new Promise<FirebaseAuthTypes.User | null>(resolve => {
      const unsubscribe = auth().onAuthStateChanged(user => {
        unsubscribe();
        if (user) {
          dispatch(fetchUserData(user.uid));
        }
        resolve(user);
      });
    });
  },
);

export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (userId: string, {rejectWithValue}) => {
    try {
      const userData = await UserModel.getById(userId);
      if (!userData) {
        return rejectWithValue('User data not found');
      }
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user data');
    }
  },
);

export const updateUserDisplayName = createAsyncThunk(
  'auth/updateDisplayName',
  async (
    {
      displayName,
      useInitialOnly = false,
    }: {displayName: string; useInitialOnly?: boolean},
    {getState, rejectWithValue},
  ) => {
    try {
      const state = getState() as RootState;
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Format name based on preference
      const formattedName = useInitialOnly
        ? `${displayName.trim().charAt(0)}.`
        : displayName.trim();

      // Update Firebase Auth profile
      await currentUser.updateProfile({
        displayName: formattedName,
      });

      // Update Firestore user document
      await UserModel.update(currentUser.uid, {
        displayName: formattedName,
      });

      // Update all member documents with new display name
      await MemberModel.updateUserAcrossMemberships(currentUser.uid, {
        displayName: formattedName,
      });

      // Return updated user data
      return {
        ...state.auth.userData,
        displayName: formattedName,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update display name');
    }
  },
);

export const updateUserRecoveryDate = createAsyncThunk(
  'auth/updateRecoveryDate',
  async (recoveryDate: string, {getState, rejectWithValue}) => {
    try {
      const state = getState() as RootState;
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Update Firestore user document
      await UserModel.update(currentUser.uid, {
        recoveryDate: recoveryDate,
      });

      // Update all member documents with new recovery date
      await MemberModel.updateUserAcrossMemberships(currentUser.uid, {
        sobrietyDate: recoveryDate,
      });

      // Return updated user data
      return {
        ...state.auth.userData,
        recoveryDate: recoveryDate,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update recovery date');
    }
  },
);

export const updateUserPrivacySettings = createAsyncThunk(
  'auth/updateUserPrivacySettings',
  async (
    {
      showRecoveryDate,
      showPhoneNumber,
      allowDirectMessages,
    }: {
      showRecoveryDate: boolean;
      showPhoneNumber: boolean;
      allowDirectMessages: boolean;
    },
    {rejectWithValue},
  ) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return rejectWithValue('No authenticated user found');
      }

      // Update in Firestore user document
      await firestore().collection('users').doc(currentUser.uid).update({
        'privacySettings.showRecoveryDate': showRecoveryDate,
        'privacySettings.showPhoneNumber': showPhoneNumber,
        'privacySettings.allowDirectMessages': allowDirectMessages,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Also update the showSobrietyDate and showPhoneNumber fields in all member documents
      // for this user across all groups
      await MemberModel.updateUserAcrossMemberships(currentUser.uid, {
        showSobrietyDate: showRecoveryDate,
        showPhoneNumber: showPhoneNumber,
      });

      return {showRecoveryDate, showPhoneNumber, allowDirectMessages};
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to update privacy settings',
      );
    }
  },
);

export const updateUserNotificationSettings = createAsyncThunk(
  'auth/updateNotificationSettings',
  async (
    settings: {
      meetings: boolean;
      announcements: boolean;
      celebrations: boolean;
    },
    {getState, rejectWithValue},
  ) => {
    try {
      const state = getState() as RootState;
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Update notification settings
      await UserModel.updateNotificationSettings(currentUser.uid, settings);

      // Return updated user data
      return {
        ...state.auth.userData,
        notificationSettings: settings,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to update notification settings',
      );
    }
  },
);

export const updateUserPhoto = createAsyncThunk(
  'auth/updateUserPhoto',
  async (photoUrl: string, {getState, rejectWithValue}) => {
    try {
      const state = getState() as RootState;
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Use new helper method to update photo in both Auth and Firestore
      const updatedUser = await UserModel.updatePhotoURL(
        currentUser.uid,
        photoUrl,
      );

      if (!updatedUser) {
        throw new Error('Failed to update user photo');
      }

      // Update profile photo across memberships
      await MemberModel.updateUserAcrossMemberships(currentUser.uid, {
        photoURL: photoUrl,
      });

      // Return updated user data
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile photo');
    }
  },
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (
    {email, password}: {email: string; password: string},
    {dispatch, rejectWithValue},
  ) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      dispatch(fetchUserData(userCredential.user.uid));
      return userCredential.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sign in');
    }
  },
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (
    {
      email,
      password,
      displayName,
    }: {email: string; password: string; displayName: string},
    {dispatch, rejectWithValue},
  ) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      // Update user profile
      await userCredential.user.updateProfile({
        displayName,
      });

      // Create user document using UserModel
      await UserModel.create({
        uid: userCredential.user.uid,
        email,
        displayName,
        homeGroups: [],
      });

      dispatch(fetchUserData(userCredential.user.uid));
      return userCredential.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sign up');
    }
  },
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, {rejectWithValue}) => {
    try {
      await auth().signOut();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sign out');
    }
  },
);

export const updateUserPhoneNumber = createAsyncThunk(
  'auth/updateUserPhoneNumber',
  async (phoneNumber: string, {rejectWithValue}) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return rejectWithValue('No authenticated user found');
      }

      // Update in Firestore
      await firestore().collection('users').doc(currentUser.uid).update({
        phoneNumber,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return {phoneNumber};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update phone number');
    }
  },
);

// Create the slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Check auth state
      .addCase(checkAuthState.pending, state => {
        state.status = 'loading';
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null;
      })
      .addCase(checkAuthState.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to check auth state';
      })

      // Fetch user data
      .addCase(fetchUserData.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch user data';
      })

      .addCase(updateUserDisplayName.fulfilled, (state, action) => {
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(updateUserDisplayName.rejected, (state, action) => {
        state.error =
          (action.payload as string) || 'Failed to update display name';
      })

      .addCase(updateUserRecoveryDate.fulfilled, (state, action) => {
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(updateUserRecoveryDate.rejected, (state, action) => {
        state.error =
          (action.payload as string) || 'Failed to update recovery date';
      })

      // Update privacy settings
      .addCase(updateUserPrivacySettings.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateUserPrivacySettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(updateUserPrivacySettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to update privacy settings';
      })

      // Update notification settings
      .addCase(updateUserNotificationSettings.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateUserNotificationSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(updateUserNotificationSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) ||
          'Failed to update notification settings';
      })

      .addCase(updateUserPhoto.fulfilled, (state, action) => {
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(updateUserPhoto.rejected, (state, action) => {
        state.error =
          (action.payload as string) || 'Failed to update profile photo';
      })

      // Sign in
      .addCase(signIn.pending, state => {
        state.status = 'loading';
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to sign in';
      })

      // Sign up
      .addCase(signUp.pending, state => {
        state.status = 'loading';
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to sign up';
      })

      // Sign out
      .addCase(signOut.pending, state => {
        state.status = 'loading';
      })
      .addCase(signOut.fulfilled, state => {
        state.status = 'succeeded';
        state.user = null;
        state.userData = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to sign out';
      })

      // Update phone number
      .addCase(updateUserPhoneNumber.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateUserPhoneNumber.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.userData) {
          state.userData.phoneNumber = action.payload.phoneNumber;
        }
        state.error = null;
      })
      .addCase(updateUserPhoneNumber.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to update phone number';
      });
  },
});

// Export actions and reducer
export const {clearError} = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectUserData = (state: RootState) => state.auth.userData;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;

export default authSlice.reducer;
