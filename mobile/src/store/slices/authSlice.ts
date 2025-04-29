import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {RootState, AppDispatch} from '../index';
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
  pendingNavigation: {route: string; params: any} | null;
}

const initialState: AuthState = {
  user: null,
  userData: null,
  status: 'idle',
  error: null,
  isAuthenticated: false,
  lastFetched: null,
  location: null,
  pendingNavigation: null,
};

const mapUserDocumentToUserData = (
  userDocData: UserDocument | null,
  docId: string,
): UserData | null => {
  if (!userDocData) return null;
  return {
    id: docId,
    uid: userDocData.uid,
    email: userDocData.email,
    displayName: userDocData.displayName,
    photoURL: userDocData.photoUrl,
    homeGroups: userDocData.homeGroups,
    adminGroups: userDocData.adminGroups,
    phoneNumber: userDocData.phoneNumber,
    showPhoneNumber: userDocData.showPhoneNumber,
    showSobrietyDate: userDocData.showSobrietyDate,
    sobrietyStartDate:
      userDocData.sobrietyStartDate?.toDate().toISOString() || null,
    subscriptionTier: userDocData.subscriptionTier || 'free',
    subscriptionValidUntil:
      userDocData.subscriptionValidUntil?.toDate().toISOString() || null,
    role: userDocData.role,
    favoriteMeetings: userDocData.favoriteMeetings,
    notificationSettings: userDocData.notificationSettings
      ? {...userDocData.notificationSettings}
      : null,
    privacySettings: userDocData.privacySettings
      ? {...userDocData.privacySettings}
      : null,
    fcmTokens: userDocData.fcmTokens,
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

export const fetchUserData = createAsyncThunk<UserData | null, string>(
  'auth/fetchUserData',
  async (uid: string, {rejectWithValue}) => {
    try {
      const docSnap = await firestore().collection('users').doc(uid).get();

      if (!docSnap.exists) {
        console.warn(`No user document found for UID: ${uid} in Firestore.`);
        return null;
      }

      const userDocData = docSnap.data() as UserDocument;
      return mapUserDocumentToUserData(userDocData, uid);
    } catch (error: any) {
      console.error('Fetch user data error:', error);
      return rejectWithValue(error.message || 'Failed to fetch user data');
    }
  },
);

export const updateDisplayName = createAsyncThunk<
  {displayName: string},
  {displayName: string; useInitialOnly: boolean}
>(
  'auth/updateDisplayName',
  async ({displayName, useInitialOnly}, {getState, rejectWithValue}) => {
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

export const updateSobrietyDate = createAsyncThunk<
  {sobrietyStartDate: string | null},
  {date: Date | null}
>('auth/updateSobrietyDate', async ({date}, {getState, rejectWithValue}) => {
  const state = getState() as RootState;
  const currentUser = state.auth.user;
  if (!currentUser) return rejectWithValue('User not logged in');

  try {
    const firestoreTimestamp = date ? firestore.Timestamp.fromDate(date) : null;
    await firestore().collection('users').doc(currentUser.uid).update({
      sobrietyStartDate: firestoreTimestamp,
    });

    return {sobrietyStartDate: date ? date.toISOString() : null};
  } catch (error: any) {
    console.error('Error updating sobriety date:', error);
    return rejectWithValue(error.message || 'Failed to update sobriety date');
  }
});

export const updateUserPrivacySettings = createAsyncThunk<
  {
    showSobrietyDate: boolean;
    showPhoneNumber: boolean;
    privacySettings: {allowDirectMessages: boolean} | null;
  },
  {
    showSobrietyDate: boolean;
    allowDirectMessages: boolean;
    showPhoneNumber: boolean;
  }
>(
  'auth/updateUserPrivacySettings',
  async (settings, {getState, rejectWithValue}) => {
    const state = getState() as RootState;
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('User not logged in');

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

export const updateUserNotificationSettings = createAsyncThunk<
  {
    notificationSettings?: {
      meetings?: boolean;
      announcements?: boolean;
      celebrations?: boolean;
    } | null;
  },
  {meetings: boolean; announcements: boolean; celebrations: boolean},
  {state: RootState}
>(
  'auth/updateNotificationSettings',
  async (settings, {getState, rejectWithValue}) => {
    const state = getState();
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('User not logged in');

    try {
      await UserModel.updateNotificationSettings(currentUser.uid, settings);

      return {notificationSettings: settings};
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to update notification settings',
      );
    }
  },
);

export const updateUserPhoto = createAsyncThunk<
  {photoURL: string | null},
  string,
  {state: RootState}
>('auth/updateUserPhoto', async (photoUrl, {getState, rejectWithValue}) => {
  const state = getState();
  const currentUser = state.auth.user;
  if (!currentUser) return rejectWithValue('User not logged in');

  try {
    await UserModel.updatePhotoURL(currentUser.uid, photoUrl);

    await MemberModel.updateUserAcrossMemberships(currentUser.uid, {
      photoURL: photoUrl,
    });

    return {photoURL: photoUrl};
  } catch (error: any) {
    console.error('Error updating photo URL:', error);
    return rejectWithValue(error.message || 'Failed to update profile photo');
  }
});

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
    },
    setLocation: (state, action: PayloadAction<Location | null>) => {
      state.location = action.payload;
    },
  },
  extraReducers: builder => {
    builder
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
        state.error = action.payload as string;
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

      .addCase(
        updateUserNotificationSettings.fulfilled,
        (
          state,
          action: PayloadAction<{
            notificationSettings?: {
              meetings?: boolean;
              announcements?: boolean;
              celebrations?: boolean;
            } | null;
          }>,
        ) => {
          if (state.userData) {
            state.userData.notificationSettings = {
              ...(state.userData.notificationSettings || {}),
              ...action.payload.notificationSettings,
            };
          }
          state.status = 'succeeded';
          state.error = null;
        },
      )
      .addCase(updateUserNotificationSettings.rejected, (state, action) => {
        state.error = action.payload as string;
        state.status = 'failed';
      })

      .addCase(
        updateUserPhoto.fulfilled,
        (state, action: PayloadAction<{photoURL: string | null}>) => {
          if (state.userData) {
            state.userData.photoURL = action.payload.photoURL;
          }
          state.status = 'succeeded';
          state.error = null;
        },
      )
      .addCase(updateUserPhoto.rejected, (state, action) => {
        state.error =
          (action.payload as string) || 'Failed to update profile photo';
        state.status = 'failed';
      })

      .addCase(signIn.pending, state => {
        state.status = 'loading';
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = 'succeeded';
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
      })
      .addCase(signOut.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to sign out';
      })

      .addCase(updateUserPhoneNumber.pending, state => {
        state.status = 'loading';
      })
      .addCase(updateUserPhoneNumber.fulfilled, (state, action) => {
        if (state.userData) {
          state.userData.phoneNumber = action.payload.phoneNumber;
        }
        state.status = 'succeeded';
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
