// src/navigation/ProfileNavigator.tsx
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import ProfileScreen from '../screens/profile/ProfileScreen';
import ProfileManagementScreen from '../screens/profile/ProfileManagementScreen';
// import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
// import EmailVerificationScreen from '../screens/profile/EmailVerificationScreen';

const Stack = createStackNavigator();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProfileManagement"
        component={ProfileManagementScreen}
        options={{
          headerShown: false,
        }}
      />
      {/* <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen} */}
      {/* /> */}
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
