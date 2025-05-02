import React, {useState, useEffect} from 'react';
import {Platform, TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {CommonActions} from '@react-navigation/native';

// Import types
import {MainTabParamList} from '../types/navigation';

// Import screens and navigators
import GroupStackNavigator from './GroupStackNavigator';
import MeetingsScreen from '../screens/meetings/MeetingScreen';
import ProfileNavigator from './ProfileNavigator';
import GroupSearchScreen from '../screens/homegroup/GroupSearchScreen';
import AdminPanelScreen from '../screens/admin/AdminPanelScreen';
import {GroupModel} from '../models/GroupModel';
import {UserModel} from '../models/UserModel';

// Define tab icons
const HomeIcon = ({focused}: {focused: boolean}) => (
  <Icon
    name={focused ? 'home' : 'home-outline'}
    size={28}
    color={focused ? '#2196F3' : '#9E9E9E'}
  />
);

const MeetingsIcon = ({focused}: {focused: boolean}) => (
  <Icon
    name={focused ? 'calendar' : 'calendar-outline'}
    size={28}
    color={focused ? '#2196F3' : '#9E9E9E'}
  />
);

const GroupSearchIcon = ({focused}: {focused: boolean}) => (
  <Icon
    name={focused ? 'account-group' : 'account-group-outline'}
    size={28}
    color={focused ? '#2196F3' : '#9E9E9E'}
  />
);

const ProfileIcon = ({focused}: {focused: boolean}) => (
  <Icon
    name={focused ? 'account-circle' : 'account-circle-outline'}
    size={28}
    color={focused ? '#2196F3' : '#9E9E9E'}
  />
);

const AdminPanelIcon = ({focused}: {focused: boolean}) => (
  <Icon
    name={focused ? 'shield-account' : 'shield-account-outline'}
    size={28}
    color={focused ? '#2196F3' : '#9E9E9E'}
  />
);

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const isSuperAdminUser = await UserModel.isSuperAdmin();
        setIsSuperAdmin(isSuperAdminUser);
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      }
    };

    checkSuperAdmin();
  }, []);

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
        listeners={({navigation}) => ({
          tabPress: e => {
            // Prevent default tab press behavior
            e.preventDefault();

            // Reset the GroupStackNavigator to GroupsList screen
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Home',
                    state: {
                      routes: [{name: 'GroupsList'}],
                    },
                  },
                ],
              }),
            );
          },
        })}
      />
      <Tab.Screen
        name="Meetings"
        component={MeetingsScreen}
        options={{
          tabBarLabel: 'Meetings',
          tabBarIcon: ({focused}) => <MeetingsIcon focused={focused} />,
          headerShown: false,
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

      {/* Admin Panel Tab - Only visible to super admins */}
      {isSuperAdmin && (
        <Tab.Screen
          name="AdminPanel"
          component={AdminPanelScreen}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({focused}) => <AdminPanelIcon focused={focused} />,
            headerShown: false,
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
