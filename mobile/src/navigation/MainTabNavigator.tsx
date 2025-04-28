import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// Import types
import {MainTabParamList} from '../types/navigation';

// Import screens and navigators
import GroupStackNavigator from './GroupStackNavigator';
import MeetingsScreen from '../screens/meetings/MeetingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import GroupSearchScreen from '../screens/homegroup/GroupSearchScreen';
import ProfileNavigator from './ProfileNavigator';

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

const GroupSearchIcon = ({focused}: {focused: boolean}) => (
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
      🔍
    </Text>
  </View>
);

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          height: Platform.OS === 'ios' ? 60 + insets.bottom : 60,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 8,
        },
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
          headerTitle: 'Meetings',
        }}
      />
      <Tab.Screen
        name="GroupSearch"
        component={GroupSearchScreen}
        options={{
          tabBarLabel: 'Groups',
          headerShown: false,
          tabBarIcon: ({focused}) => <GroupSearchIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({focused}) => <ProfileIcon focused={focused} />,
          headerTitle: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
