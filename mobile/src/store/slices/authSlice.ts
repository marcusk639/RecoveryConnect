import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {RootState} from '../types';
import {UserModel} from '../../models/UserModel';
import {MemberModel} from '../../models/MemberModel';
import {UserDocument, Timestamp} from '../../types/schema';
import {
  Location,
  User,
  NotificationSettings,
  PrivacySettings,
} from '../../types';
import {Sponsorship, SponsorSettings} from '../../types/sponsorship';

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
    sponsorship?: boolean;
  } | null;
  privacySettings?: {
    allowDirectMessages?: boolean;
    sponsorship?: boolean;
  } | null;
  fcmTokens?: string[];
  sponsorship?: Sponsorship;
  customerId?: string;
  sponsorSettings?: SponsorSettings;
}

// Define entity types
interface UserEntity extends UserData {
  id: string;
}

// Create entity adapter
const usersAdapter = createEntityAdapter<UserEntity>();

// Update action payload types
interface UpdateDisplayNamePayload {
  id: string;
  displayName: string;
}

interface UpdateSobrietyDatePayload {
  id: string;
  sobrietyStartDate: string | null;
}

interface UpdateUserPhotoPayload {
  id: string;
  photoURL: string | null;
}

interface UpdateUserPhoneNumberPayload {
  id: string;
  phoneNumber: string | null;
}

export interface AuthState {
  user: FirebaseAuthTypes.User | null;
  users: ReturnType<typeof usersAdapter.getInitialState>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isAuthenticated: boolean;
  lastFetched: number | null;
  location: Location | null;
  pendingNavigation: {route: string; params: any} | null;
}

const initialState: AuthState = {
  user: null,
  users: usersAdapter.getInitialState(),
  status: 'idle',
  error: null,
  isAuthenticated: false,
  lastFetched: null,
  location: null,
  pendingNavigation: null,
};

const mapUserToSliceData = (
  user: User | UserDocument | Partial<User> | null | undefined,
): UserData | null => {
  if (!user || !user.uid) return null;

  const photoUrl = ('photoUrl' in user ? user.photoUrl : null) ?? null;

  const sobrietyStartDateISO =
    ('recoveryDate' in user
      ? user.recoveryDate
      : 'sobrietyStartDate' in user && user.sobrietyStartDate
      ? (user.sobrietyStartDate as Timestamp).toDate().toISOString()
      : null) ?? null;

  const notificationSettingsData = user.notificationSettings ?? {};
  const privacySettingsData = user.privacySettings ?? {};

  const adminGroups = 'adminGroups' in user ? user.adminGroups : undefined;
  const subscriptionTier =
    ('subscriptionTier' in user ? user.subscriptionTier : 'free') ?? 'free';
  const subscriptionValidUntilISO =
    ('subscriptionValidUntil' in user && user.subscriptionValidUntil
      ? (user.subscriptionValidUntil as Timestamp).toDate().toISOString()
      : null) ?? null;
  const fcmTokens = ('fcmTokens' in user ? user.fcmTokens : []) ?? [];
  const phoneNumber = ('phoneNumber' in user ? user.phoneNumber : null) ?? null;

  return {
    id: user.uid,
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: photoUrl,
    homeGroups: user.homeGroups ?? [],
    adminGroups: adminGroups,
    phoneNumber: phoneNumber,
    showPhoneNumber: privacySettingsData.showPhoneNumber ?? false,
    showSobrietyDate: privacySettingsData.showRecoveryDate ?? false,
    sobrietyStartDate: sobrietyStartDateISO as string | null,
    subscriptionTier: subscriptionTier as 'free' | 'plus',
    subscriptionValidUntil: subscriptionValidUntilISO,
    role: user.role ?? 'user',
    favoriteMeetings: user.favoriteMeetings ?? [],
    notificationSettings: {
      meetings: notificationSettingsData.meetings ?? true,
      announcements: notificationSettingsData.announcements ?? true,
      celebrations: notificationSettingsData.celebrations ?? true,
      ...((notificationSettingsData as any).groupChatMentions !== undefined && {
        groupChatMentions: (notificationSettingsData as any).groupChatMentions,
      }),
      ...((notificationSettingsData as any).allowPushNotifications !==
        undefined && {
        allowPushNotifications: (notificationSettingsData as any)
          .allowPushNotifications,
      }),
    },
    privacySettings: {
      allowDirectMessages: privacySettingsData.allowDirectMessages ?? true,
    },
    fcmTokens: fcmTokens,
    sponsorSettings: user.sponsorSettings ?? {
      isAvailable: false,
      maxSponsees: 3,
      requirements: ['30 days sober', 'Working the steps'],
      bio: '',
    },
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

export const fetchUserData = createAsyncThunk<
  UserData | null,
  string,
  {rejectValue: string}
>('auth/fetchUserData', async (uid: string, {rejectWithValue}) => {
  try {
    const user: User | null = await UserModel.getById(uid);
    const userData = mapUserToSliceData(user);
    if (!userData) {
      console.warn(`No user document found or mapping failed for UID: ${uid}`);
    }
    return userData;
  } catch (error: any) {
    console.error('Fetch user data error (UserModel):', error);
    return rejectWithValue(error.message || 'Failed to fetch user data');
  }
});

export const updateDisplayName = createAsyncThunk<
  {id: string; displayName: string},
  {displayName: string; useInitialOnly: boolean},
  {state: RootState; rejectValue: string}
>(
  'auth/updateDisplayName',
  async ({displayName, useInitialOnly}, {getState, rejectWithValue}) => {
    const state = getState();
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('User not logged in');

    try {
      const formattedName = useInitialOnly
        ? `${displayName.trim().charAt(0)}.`
        : displayName.trim();

      await currentUser.updateProfile({displayName: formattedName});
      await UserModel.update(currentUser.uid, {displayName: formattedName});
      await MemberModel.updateUserAcrossMemberships(currentUser.uid, {
        displayName: formattedName,
      });

      return {id: currentUser.uid, displayName: formattedName};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update display name');
    }
  },
);

export const updateSobrietyDate = createAsyncThunk<
  {id: string; sobrietyStartDate: string | null},
  {date: Date | null},
  {state: RootState; rejectValue: string}
>('auth/updateSobrietyDate', async ({date}, {getState, rejectWithValue}) => {
  const state = getState();
  const currentUser = state.auth.user;
  if (!currentUser) return rejectWithValue('User not logged in');

  try {
    const dateISO = date ? date.toISOString() : null;
    await UserModel.update(currentUser.uid, {
      recoveryDate: dateISO || undefined,
    });

    return {id: currentUser.uid, sobrietyStartDate: dateISO};
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to update sobriety date');
  }
});

export const updateUserPrivacySettings = createAsyncThunk<
  {
    userData: UserData | null;
  },
  {
    showSobrietyDate: boolean;
    allowDirectMessages: boolean;
    showPhoneNumber: boolean;
  },
  {state: RootState; rejectValue: string}
>(
  'auth/updateUserPrivacySettings',
  async (settings, {getState, rejectWithValue}) => {
    const state = getState();
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('User not logged in');

    try {
      const userUpdatePayload: Partial<User> = {
        privacySettings: {
          showRecoveryDate: settings.showSobrietyDate,
          allowDirectMessages: settings.allowDirectMessages,
          showPhoneNumber: settings.showPhoneNumber,
        },
      };

      const updatedUser = await UserModel.update(
        currentUser.uid,
        userUpdatePayload,
      );

      const memberUpdates = {
        showSobrietyDate: settings.showSobrietyDate,
        showPhoneNumber: settings.showPhoneNumber,
      };
      await MemberModel.updateUserAcrossMemberships(
        currentUser.uid,
        memberUpdates,
      );

      return {
        userData: mapUserToSliceData(updatedUser),
      };
    } catch (error: any) {
      console.error('Error updating privacy settings (UserModel):', error);
      return rejectWithValue(
        error.message || 'Failed to update privacy settings',
      );
    }
  },
);

export const updateUserNotificationSettings = createAsyncThunk<
  {
    userData: UserData | null;
  },
  Partial<NotificationSettings>,
  {state: RootState; rejectValue: string}
>(
  'auth/updateNotificationSettings',
  async (
    settings: Partial<NotificationSettings>,
    {getState, rejectWithValue},
  ) => {
    const state = getState();
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('User not logged in');

    try {
      const userUpdatePayload: Partial<User> = {
        notificationSettings: settings as NotificationSettings,
      };

      const updatedUser = await UserModel.update(
        currentUser.uid,
        userUpdatePayload,
      );

      return {
        userData: mapUserToSliceData(updatedUser),
      };
    } catch (error: any) {
      console.error('Error updating notification settings (UserModel):', error);
      return rejectWithValue(
        error.message || 'Failed to update notification settings',
      );
    }
  },
);

export const updateUserPhoto = createAsyncThunk<
  {id: string; photoURL: string | null},
  string,
  {state: RootState; rejectValue: string}
>('auth/updateUserPhoto', async (photoUrl, {getState, rejectWithValue}) => {
  const state = getState();
  const currentUser = state.auth.user;
  if (!currentUser) return rejectWithValue('User not logged in');

  try {
    await UserModel.updatePhotoURL(currentUser.uid, photoUrl);
    await MemberModel.updateUserAcrossMemberships(currentUser.uid, {
      photoURL: photoUrl,
    });

    return {id: currentUser.uid, photoURL: photoUrl};
  } catch (error: any) {
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

export const updateUserPhoneNumber = createAsyncThunk<
  {id: string; phoneNumber: string | null},
  string | null,
  {state: RootState; rejectValue: string}
>(
  'auth/updateUserPhoneNumber',
  async (phoneNumber, {getState, rejectWithValue}) => {
    const state = getState();
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('User not logged in');

    try {
      await UserModel.update(currentUser.uid, {phoneNumber});
      return {id: currentUser.uid, phoneNumber};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update phone number');
    }
  },
);

export const updateFcmToken = createAsyncThunk<
  {id: string; fcmToken: string},
  {userId: string; token: string},
  {rejectValue: string}
>('auth/updateFcmToken', async ({userId, token}, {rejectWithValue}) => {
  try {
    await UserModel.addFcmToken(userId, token);
    return {id: userId, fcmToken: token};
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to update FCM token');
  }
});

export const updateSponsorSettings = createAsyncThunk<
  {id: string; sponsorSettings: SponsorSettings},
  SponsorSettings,
  {state: RootState; rejectValue: string}
>(
  'auth/updateSponsorSettings',
  async (settings, {getState, rejectWithValue}) => {
    const state = getState();
    const currentUser = state.auth.user;
    if (!currentUser) return rejectWithValue('User not logged in');

    try {
      await UserModel.update(currentUser.uid, {
        sponsorSettings: settings,
      });
      return {id: currentUser.uid, sponsorSettings: settings};
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to update sponsor settings',
      );
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
    setPendingNavigation: (
      state,
      action: PayloadAction<{route: string; params: any} | null>,
    ) => {
      state.pendingNavigation = action.payload;
    },
    clearPendingNavigation: state => {
      state.pendingNavigation = null;
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
          if (action.payload) {
            usersAdapter.upsertOne(state.users, action.payload);
          }
          state.lastFetched = Date.now();
          state.error = null;
        },
      )
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      .addCase(
        updateDisplayName.fulfilled,
        (state, action: PayloadAction<UpdateDisplayNamePayload>) => {
          if (state.users.entities[action.payload.id]) {
            usersAdapter.updateOne(state.users, {
              id: action.payload.id,
              changes: {displayName: action.payload.displayName},
            });
          }
          state.status = 'succeeded';
          state.error = null;
        },
      )
      .addCase(updateDisplayName.rejected, (state, action) => {
        state.error = action.payload as string;
        state.status = 'failed';
      })

      .addCase(
        updateSobrietyDate.fulfilled,
        (state, action: PayloadAction<UpdateSobrietyDatePayload>) => {
          if (state.users.entities[action.payload.id]) {
            usersAdapter.updateOne(state.users, {
              id: action.payload.id,
              changes: {sobrietyStartDate: action.payload.sobrietyStartDate},
            });
          }
          state.status = 'succeeded';
          state.error = null;
        },
      )
      .addCase(updateSobrietyDate.rejected, (state, action) => {
        state.error = action.payload as string;
        state.status = 'failed';
      })

      .addCase(updateUserPrivacySettings.fulfilled, (state, action) => {
        if (action.payload.userData) {
          usersAdapter.upsertOne(state.users, action.payload.userData);
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateUserPrivacySettings.rejected, (state, action) => {
        state.error = action.payload as string;
        state.status = 'failed';
      })

      .addCase(updateUserNotificationSettings.fulfilled, (state, action) => {
        if (action.payload.userData) {
          usersAdapter.upsertOne(state.users, action.payload.userData);
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateUserNotificationSettings.rejected, (state, action) => {
        state.error = action.payload as string;
        state.status = 'failed';
      })

      .addCase(
        updateUserPhoto.fulfilled,
        (state, action: PayloadAction<UpdateUserPhotoPayload>) => {
          if (state.users.entities[action.payload.id]) {
            usersAdapter.updateOne(state.users, {
              id: action.payload.id,
              changes: {photoURL: action.payload.photoURL},
            });
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
      .addCase(
        updateUserPhoneNumber.fulfilled,
        (state, action: PayloadAction<UpdateUserPhoneNumberPayload>) => {
          if (state.users.entities[action.payload.id]) {
            usersAdapter.updateOne(state.users, {
              id: action.payload.id,
              changes: {phoneNumber: action.payload.phoneNumber},
            });
          }
          state.status = 'succeeded';
          state.error = null;
        },
      )
      .addCase(updateUserPhoneNumber.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to update phone number';
      })

      .addCase(updateFcmToken.fulfilled, (state, action) => {
        if (state.users.entities[action.payload.id]) {
          const currentTokens =
            state.users.entities[action.payload.id].fcmTokens || [];
          if (!currentTokens.includes(action.payload.fcmToken)) {
            state.users.entities[action.payload.id].fcmTokens = [
              ...currentTokens,
              action.payload.fcmToken,
            ];
          }
        }
      })
      .addCase(updateFcmToken.rejected, (state, action) => {
        console.error('FCM Token update failed (reducer):', action.payload);
      })

      .addCase(updateSponsorSettings.fulfilled, (state, action) => {
        if (state.users.entities[action.payload.id]) {
          state.users.entities[action.payload.id].sponsorSettings =
            action.payload.sponsorSettings;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateSponsorSettings.rejected, (state, action) => {
        state.error = action.payload as string;
        state.status = 'failed';
      });
  },
});

// Memoized selectors
const usersSelectors = usersAdapter.getSelectors<RootState>(
  state => state.auth.users,
);

export const selectUser = (state: RootState) => state.auth.user;
export const selectUserData = createSelector(
  [usersSelectors.selectAll, (state: RootState) => state.auth.user?.uid],
  (users, currentUserId) => {
    if (!currentUserId) return null;
    return users.find(user => user.id === currentUserId) || null;
  },
);
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectUserLocation = (state: RootState) => state.auth.location;
export const selectPendingNavigation = (state: RootState) =>
  state.auth.pendingNavigation;

export const {
  clearError,
  setUser,
  setLocation,
  setPendingNavigation,
  clearPendingNavigation,
} = authSlice.actions;

export default authSlice.reducer;
