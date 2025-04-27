import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../store';
import {
  checkAuthState,
  selectIsAuthenticated,
  selectAuthStatus,
} from '../store/slices/authSlice';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authStatus = useAppSelector(selectAuthStatus);

  useEffect(() => {
    const initializeApp = async () => {
      // If auth check hasn't started yet, dispatch it
      if (authStatus === 'idle') {
        await dispatch(checkAuthState());
      }

      // Give splash screen time to display (minimum 1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate based on authentication state
      if (isAuthenticated) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main' as never}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'Auth' as never}],
        });
      }
    };

    initializeApp();
  }, [isAuthenticated, authStatus]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Recovery Connect</Text>
      <Text style={styles.subtitle}>Supporting your recovery journey</Text>
      <ActivityIndicator style={styles.loading} size="large" color="#2196F3" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 32,
    textAlign: 'center',
  },
  loading: {
    marginTop: 24,
  },
});

export default SplashScreen;
