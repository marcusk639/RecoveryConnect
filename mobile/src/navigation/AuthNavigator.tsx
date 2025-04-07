import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

// Import auth screens
import LandingScreen from '../screens/auth/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MeetingsScreen from '../screens/meetings/MeetingScreen';

// Define the param types for auth navigator
type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  Meetings: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Meetings" component={MeetingsScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
