import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

// Import types
import {GroupStackParamList} from '../types/navigation';

// Import screens and navigators
// import GroupsListScreen from '../screens/groups/GroupsListScreen';
import GroupTabNavigator from './GroupTabNavigator';
import GroupsListScreen from '../screens/homegroup/GroupListScreen';
// import GroupMemberDetailsScreen from '../screens/groups/GroupMemberDetailsScreen';
// import GroupAnnouncementDetailsScreen from '../screens/groups/GroupAnnouncementDetailsScreen';
// import GroupEventDetailsScreen from '../screens/groups/GroupEventDetailsScreen';
// import GroupBusinessMeetingScreen from '../screens/groups/GroupBusinessMeetingScreen';

const Stack = createStackNavigator<GroupStackParamList>();

const GroupStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="GroupsList"
      screenOptions={{
        headerBackTitle: undefined,
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen
        name="GroupsList"
        component={GroupsListScreen}
        options={{
          title: 'My Groups',
        }}
      />
      <Stack.Screen
        name="GroupDetails"
        component={GroupTabNavigator}
        options={({route}) => ({
          title: route.params.groupName,
          headerShown: false, // We'll show header in the tab navigator
        })}
      />
      {/* <Stack.Screen 
        name="GroupMemberDetails" 
        component={GroupMemberDetailsScreen} 
        options={{
          title: 'Member Details',
        }}
      />
      <Stack.Screen 
        name="GroupAnnouncementDetails" 
        component={GroupAnnouncementDetailsScreen} 
        options={{
          title: 'Announcement',
        }}
      />
      <Stack.Screen 
        name="GroupEventDetails" 
        component={GroupEventDetailsScreen} 
        options={{
          title: 'Event Details',
        }}
      />
      <Stack.Screen 
        name="GroupBusinessMeeting" 
        component={GroupBusinessMeetingScreen} 
        options={{
          title: 'Business Meeting',
        }}
      /> */}
    </Stack.Navigator>
  );
};

export default GroupStackNavigator;
