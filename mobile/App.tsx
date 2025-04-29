import React, {useEffect, useRef} from 'react';
import {
  NavigationContainer,
  LinkingOptions,
  NavigationContainerRef,
} from '@react-navigation/native';
import {Provider} from 'react-redux';
import store, {useAppDispatch} from './src/store';
import {
  checkAuthState,
  selectIsAuthenticated,
  setUser,
  fetchUserData,
  updateFcmToken,
} from './src/store/slices/authSlice';
import AppNavigator from './src/navigation/AppNavigator';
import {Linking, Alert, Text, Platform} from 'react-native';
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {RootStackParamList} from './src/types/navigation';

// Define the structure of expected deep link params - Simplified
type LinkingParams = RootStackParamList & {
  // Define only the routes handled by custom logic or needing specific paths
  JoinGroupFlow: {code: string};
  // Let React Navigation infer types for Main/Home/GroupOverview etc.
};

const linking: LinkingOptions<LinkingParams> = {
  prefixes: ['homegroups-app://', 'https://homegroups-app.com'],
  config: {
    screens: {
      // Define only the explicit mapping needed for the custom handler
      JoinGroupFlow: 'join',
      // Let React Navigation handle other routes based on screen names if possible
      // or add them back carefully one by one if needed later.
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    return url;
  },
  subscribe(listener) {
    const subscription = Linking.addEventListener('url', ({url}) => {
      listener(url);
    });
    return () => {
      subscription.remove();
    };
  },
};

const App = () => {
  const navigationRef = useRef<NavigationContainerRef<LinkingParams>>(null);
  const dispatch = useAppDispatch();

  // --- Notification Setup ---
  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log('Authorization status:', authStatus);
    return enabled;
  }

  useEffect(() => {
    // --- Authentication Check ---
    const unsubscribeAuth = auth().onAuthStateChanged(
      async (user: FirebaseAuthTypes.User | null) => {
        console.log('Auth state changed, user:', user?.uid);
        dispatch(setUser(user)); // Update user in Redux store
        if (user) {
          await dispatch(fetchUserData(user.uid)); // Fetch user data

          // --- Notification Permission & Token Handling ---
          const permissionEnabled = await requestUserPermission();
          if (permissionEnabled) {
            console.log('Notification permission enabled.');
            messaging()
              .getToken()
              .then(token => {
                if (token) {
                  console.log('FCM Token obtained:', token);
                  dispatch(updateFcmToken({userId: user.uid, token}));
                }
              })
              .catch(error => {
                console.error('Error getting FCM token:', error);
              });

            // Listen for token refresh
            messaging().onTokenRefresh(token => {
              console.log('FCM Token refreshed:', token);
              dispatch(updateFcmToken({userId: user.uid, token}));
            });
          } else {
            console.log('Notification permission denied.');
          }
        } else {
          // User signed out - potentially clear FCM token if needed, though
          // the backend should handle invalid tokens during send.
        }
      },
    );

    // --- Foreground Message Handler ---
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('FCM Message Received in Foreground:', remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title ?? 'New Notification',
        remoteMessage.notification?.body ?? '',
      );
    });

    // --- Background/Quit Notification Open Handler ---
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background:',
        remoteMessage,
      );
      const groupId = remoteMessage?.data?.groupId as string | undefined;
      if (groupId) {
        setTimeout(() => {
          navigationRef.current?.navigate('Main', {
            screen: 'Home',
            params: {
              screen: 'GroupOverview',
              params: {groupId: groupId, groupName: 'Group'},
            },
          });
        }, 500);
      }
    });

    // Check if app was opened from a quit state notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage,
          );
          const groupId = remoteMessage?.data?.groupId as string | undefined;
          if (groupId) {
            setTimeout(() => {
              navigationRef.current?.navigate('Main', {
                screen: 'Home',
                params: {
                  screen: 'GroupOverview',
                  params: {groupId: groupId, groupName: 'Group'},
                },
              });
            }, 1000);
          }
        }
      });

    // Clean up listeners on unmount
    return () => {
      unsubscribeAuth();
      // unsubscribeForeground(); // Ensure this is cleaned up if defined
    };
  }, [dispatch]);

  // --- Deep Link Handling Logic ---
  const handleDeepLink = async (url: string | null) => {
    if (!url) return;
    console.log('Handling deep link:', url);
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      const code = parsedUrl.searchParams.get('code');

      if (path === '/join' && code) {
        console.log('Extracted invite code:', code);
        const state = store.getState();
        if (!state.auth.isAuthenticated || !state.auth.user) {
          Alert.alert(
            'Please Sign In',
            'You need to be signed in to join a group.',
            [
              {
                text: 'OK',
                onPress: () => navigationRef.current?.navigate('Auth' as any),
              },
            ], // Use 'as any' for now if Auth isn't in LinkingParams
          );
          return;
        }
        try {
          console.log(`Calling joinGroupByInviteCode with code: ${code}`);
          const joinGroupFunction = functions().httpsCallable(
            'joinGroupByInviteCode',
          );
          const result = await joinGroupFunction({code});
          const {success, groupId, message} = result.data as {
            success: boolean;
            groupId: string;
            message: string;
          };

          if (success && groupId) {
            console.log(`Successfully joined group ${groupId}`);
            if (navigationRef.current) {
              // Use the standard nested navigation pattern
              navigationRef.current.navigate('Main', {
                screen: 'Home', // Target the navigator within Main
                params: {
                  // Params for the Home navigator
                  screen: 'GroupOverview', // Target screen within Home
                  params: {groupId: groupId, groupName: 'Group'}, // Params for GroupOverview
                },
              });
            }
          } else {
            console.error('Failed to join group:', message);
            Alert.alert(
              'Join Failed',
              message || 'Could not join the group using this code.',
            );
          }
        } catch (error: any) {
          console.error('Error calling joinGroupByInviteCode:', error);
          Alert.alert(
            'Error',
            error.message ||
              'An error occurred while trying to join the group.',
          );
        }
      } else {
        console.log('Deep link was not a group join link or missing code.');
      }
    } catch (e) {
      console.error('Error parsing deep link URL:', url, e);
    }
  };

  // Handle initial URL on app open
  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };
    getUrlAsync();
  }, []);

  // Handle URL changes while app is open
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({url}) => {
      handleDeepLink(url);
    });
    return () => subscription.remove();
  }, []);
  // --- End Deep Link Handling ---

  return (
    <Provider store={store}>
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        fallback={<Text>Loading...</Text>}>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
