import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View} from 'react-native';

// Import types
import {MainTabParamList} from '../types/navigation';

// Import screens and navigators
import GroupStackNavigator from './GroupStackNavigator';
import MeetingsScreen from '../screens/meetings/MeetingScreen';
import TreasuryScreen from '../screens/treasury/TreasuryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Tab Icons
const HomeIcon = ({focused}: {focused: boolean}) => (
  <View
    style={{
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: focused ? '#E3F2FD' : 'transparent',
      borderRadius: 12,
    }}>
    <Text
      style={{
        fontSize: 16,
        color: focused ? '#2196F3' : '#9E9E9E',
      }}>
      🏠
    </Text>
  </View>
);

const MeetingsIcon = ({focused}: {focused: boolean}) => (
  <View
    style={{
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: focused ? '#E3F2FD' : 'transparent',
      borderRadius: 12,
    }}>
    <Text
      style={{
        fontSize: 16,
        color: focused ? '#2196F3' : '#9E9E9E',
      }}>
      📅
    </Text>
  </View>
);

const TreasuryIcon = ({focused}: {focused: boolean}) => (
  <View
    style={{
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: focused ? '#E3F2FD' : 'transparent',
      borderRadius: 12,
    }}>
    <Text
      style={{
        fontSize: 16,
        color: focused ? '#2196F3' : '#9E9E9E',
      }}>
      💰
    </Text>
  </View>
);

const ProfileIcon = ({focused}: {focused: boolean}) => (
  <View
    style={{
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: focused ? '#E3F2FD' : 'transparent',
      borderRadius: 12,
    }}>
    <Text
      style={{
        fontSize: 16,
        color: focused ? '#2196F3' : '#9E9E9E',
      }}>
      👤
    </Text>
  </View>
);

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={GroupStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({focused}) => <HomeIcon focused={focused} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Meetings"
        component={MeetingsScreen}
        options={{
          tabBarLabel: 'Meetings',
          tabBarIcon: ({focused}) => <MeetingsIcon focused={focused} />,
          headerShown: true,
          headerTitle: 'Meetings',
        }}
      />
      <Tab.Screen
        name="Treasury"
        component={TreasuryScreen}
        options={{
          tabBarLabel: 'Treasury',
          tabBarIcon: ({focused}) => <TreasuryIcon focused={focused} />,
          headerShown: true,
          headerTitle: 'Treasury',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({focused}) => <ProfileIcon focused={focused} />,
          headerShown: true,
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
