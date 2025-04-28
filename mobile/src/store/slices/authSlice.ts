import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {RootState} from '../index';
import {UserModel} from '../../models/UserModel';
import {MemberModel} from '../../models/MemberModel';
import firestore from '@react-native-firebase/firestore';
import {UserDocument, Timestamp} from '../../types/schema';
import {Location} from '../../types';

interface UserData {
  uid: string;
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  homeGroups?: string[];
  adminGroups?: string[];
  phoneNumber?: string | null;
  showPhoneNumber?: boolean;
  showSobrietyDate?: boolean;
  sobrietyStartDate: string | null;
  subscriptionTier: 'free' | 'plus';
  subscriptionValidUntil: string | null;
  role?: 'user' | 'admin';
  favoriteMeetings?: string[];
  notificationSettings?: {
    meetings?: boolean;
    announcements?: boolean;
    celebrations?: boolean;
  } | null;
  privacySettings?: {
    allowDirectMessages?: boolean;
  } | null;
  fcmTokens?: string[];
}

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  userData: UserData | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isAuthenticated: boolean;
  lastFetched: number | null;
  location: Location | null;
}

const initialState: AuthState = {
  user: null,
  userData: null,
  status: 'idle',
  error: null,
  isAuthenticated: false,
  lastFetched: null,
  location: null,
};

const mapUserDocumentToUserData = (
  userDoc: UserDocument | null,
  docId: string,
): UserData | null => {
  if (!userDoc) return null;
  return {
    id: docId,
    uid: userDoc.uid,
    email: userDoc.email,
    displayName: userDoc.displayName,
    photoURL: userDoc.photoURL,
    homeGroups: userDoc.homeGroups,
    adminGroups: userDoc.adminGroups,
    phoneNumber: userDoc.phoneNumber,
    showPhoneNumber: userDoc.showPhoneNumber,
    showSobrietyDate: userDoc.showSobrietyDate,
    sobrietyStartDate:
      userDoc.sobrietyStartDate?.toDate().toISOString() || null,
    subscriptionTier: userDoc.subscriptionTier || 'free',
    subscriptionValidUntil:
      userDoc.subscriptionValidUntil?.toDate().toISOString() || null,
    role: userDoc.role,
    favoriteMeetings: userDoc.favoriteMeetings,
    notificationSettings: userDoc.notificationSettings
      ? {...userDoc.notificationSettings}
      : null,
    privacySettings: userDoc.privacySettings
      ? {...userDoc.privacySettings}
      : null,
    fcmTokens: userDoc.fcmTokens,
  };
};

export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, {dispatch}) => {
    return new Promise<FirebaseAuthTypes.User | null>(resolve => {
      const subscriber = auth().onAuthStateChanged(user => {
        dispatch(setUser(user));
        if (user) {
          dispatch(fetchUserData(user.uid));
        } else {
        }
        resolve(user);
        subscriber();
      });
    });
  },
);

export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (uid: string, {rejectWithValue}) => {
    try {
      const userDoc = await UserModel.getById(uid);
      return mapUserDocumentToUserData(userDoc, uid);
    } catch (error: any) {
      console.error('Fetch user data error:', error);
      return rejectWithValue(error.message || 'Failed to fetch user data');
    }
  },
);

export const updateDisplayName = createAsyncThunk(
  'auth/updateDisplayName',
  async (
    {
      displayName,
      useInitialOnly,
    }: {displayName: string; useInitialOnly: boolean},
    {getState, rejectWithValue},
  ) => {
    const state = getState() as RootState;
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('User not logged in');

    try {
      const formattedName = useInitialOnly
        ? `${displayName.trim().charAt(0)}.`
        : displayName.trim();

      await currentUser.updateProfile({displayName: formattedName});
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({displayName: formattedName});
      await MemberModel.updateUserAcrossMemberships(currentUser.uid, {
        displayName: formattedName,
      });

      return {displayName: formattedName};
    } catch (error: any) {
      return rejectWithValue('Failed to update display name');
    }
  },
);

export const updateSobrietyDate = createAsyncThunk(
  'auth/updateSobrietyDate',
  async ({date}: {date: Date | null}, {getState, rejectWithValue}) => {
    const state = getState() as RootState;
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('User not logged in');

    try {
      const firestoreTimestamp = date
        ? firestore.Timestamp.fromDate(date)
        : null;
      await firestore().collection('users').doc(currentUser.uid).update({
        sobrietyStartDate: firestoreTimestamp,
      });

      return {sobrietyStartDate: date ? date.toISOString() : null};
    } catch (error: any) {
      console.error('Error updating sobriety date:', error);
      return rejectWithValue(error.message || 'Failed to update sobriety date');
    }
  },
);

export const updateUserPrivacySettings = createAsyncThunk(
  'auth/updateUserPrivacySettings',
  async (
    settings: {
      showSobrietyDate: boolean;
      allowDirectMessages: boolean;
      showPhoneNumber: boolean;
    },
    {getState, rejectWithValue},
  ) => {
    const state = getState() as RootState;
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('User not logged in');
    const currentPrivacySettings = state.auth.userData?.privacySettings;

    try {
      const userUpdates: Partial<{[key: string]: any}> = {
        'privacySettings.allowDirectMessages': settings.allowDirectMessages,
        showSobrietyDate: settings.showSobrietyDate,
        showPhoneNumber: settings.showPhoneNumber,
      };
      const memberUpdates = {
        showSobrietyDate: settings.showSobrietyDate,
        showPhoneNumber: settings.showPhoneNumber,
      };

      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update(userUpdates);
      await MemberModel.updateUserAcrossMemberships(
        currentUser.uid,
        memberUpdates,
      );

      return {
        showSobrietyDate: settings.showSobrietyDate,
        showPhoneNumber: settings.showPhoneNumber,
        privacySettings: {
          allowDirectMessages: settings.allowDirectMessages,
        },
      };
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      return rejectWithValue('Failed to update privacy settings');
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

      await UserModel.updateNotificationSettings(currentUser.uid, settings);

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

      const updatedUser = await UserModel.updatePhotoURL(
        currentUser.uid,
        photoUrl,
      );

      if (!updatedUser) {
        throw new Error('Failed to update user photo');
      }

      await MemberModel.updateUserAcrossMemberships(currentUser.uid, {
        photoURL: photoUrl,
      });

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

      await userCredential.user.updateProfile({
        displayName,
      });

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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<FirebaseAuthTypes.User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (!action.payload) {
        state.userData = null;
        state.status = 'idle';
        state.lastFetched = null;
        state.error = null;
        state.location = null;
      }
    },
    setLocation: (state, action: PayloadAction<Location | null>) => {
      state.location = action.payload;
    },
  },
  extraReducers: builder => {
    builder
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

      .addCase(fetchUserData.pending, state => {
        state.status = 'loading';
      })
      .addCase(
        fetchUserData.fulfilled,
        (state, action: PayloadAction<UserData | null>) => {
          state.status = 'succeeded';
          state.userData = action.payload;
          state.lastFetched = Date.now();
          state.error = null;
        },
      )
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = 'failed';
        state.userData = null;
        state.error = (action.payload as string) || 'Failed to fetch user data';
      })

      .addCase(updateDisplayName.fulfilled, (state, action) => {
        if (state.userData) {
          state.userData.displayName = action.payload.displayName;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateDisplayName.rejected, (state, action) => {
        state.error = action.payload as string;
        state.status = 'failed';
      })

      .addCase(updateSobrietyDate.fulfilled, (state, action) => {
        if (state.userData) {
          state.userData.sobrietyStartDate = action.payload.sobrietyStartDate;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateSobrietyDate.rejected, (state, action) => {
        state.error = action.payload as string;
        state.status = 'failed';
      })

      .addCase(updateUserPrivacySettings.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateUserPrivacySettings.fulfilled, (state, action) => {
        if (state.userData) {
          state.userData.showSobrietyDate = action.payload.showSobrietyDate;
          state.userData.showPhoneNumber = action.payload.showPhoneNumber;
          state.userData.privacySettings = {
            ...(state.userData.privacySettings || {}),
            ...action.payload.privacySettings,
          };
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateUserPrivacySettings.rejected, (state, action) => {
        state.error = action.payload as string;
        state.status = 'failed';
      })

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

      .addCase(signOut.pending, state => {
        state.status = 'loading';
      })
      .addCase(signOut.fulfilled, state => {
        state.status = 'succeeded';
        state.user = null;
        state.userData = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastFetched = null;
        state.location = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to sign out';
      })

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

export const {clearError, setUser, setLocation} = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectUserData = (state: RootState) => state.auth.userData;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectUserLocation = (state: RootState) => state.auth.location;

export default authSlice.reducer;
