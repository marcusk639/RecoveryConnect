import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

// Import types
import {GroupStackParamList} from '../types/navigation';

// Import screens
import GroupsListScreen from '../screens/homegroup/GroupListScreen';
import GroupOverviewScreen from '../screens/homegroup/GroupOverviewScreen';
import GroupMembersScreen from '../screens/homegroup/GroupMembersScreen';
import GroupAnnouncementsScreen from '../screens/homegroup/GroupAnnouncementsScreen';
// import GroupLiteratureScreen from '../screens/groups/GroupLiteratureScreen';
import GroupMemberDetailsScreen from '../screens/homegroup/MemberDetailScreen';
import GroupAnnouncementDetailsScreen from '../screens/homegroup/GroupAnnouncementDetailsScreen';
import GroupTreasuryScreen from '../screens/homegroup/GroupTreasuryScreen';
import GroupEditDetailsScreen from '../screens/homegroup/GroupEditDetailsScreen';
import CreateGroupScreen from '../screens/homegroup/CreateGroupScreen';
import GroupScheduleScreen from '../screens/homegroup/GroupScheduleScreen';
import AddTransactionScreen from '../screens/homegroup/AddTransactionScreen';
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
        name="GroupOverview"
        component={GroupOverviewScreen}
        options={({route}) => ({
          title: route.params.groupName || 'Group Details',
        })}
      />
      <Stack.Screen
        name="GroupMembers"
        component={GroupMembersScreen}
        options={({route}) => ({
          title: `${route.params.groupName} - Members`,
        })}
      />
      <Stack.Screen
        name="GroupAnnouncements"
        component={GroupAnnouncementsScreen}
        options={({route}) => ({
          title: `${route.params.groupName} - Announcements`,
        })}
      />
      <Stack.Screen
        name="GroupTreasury"
        component={GroupTreasuryScreen}
        options={({route}) => ({
          title: `${route.params.groupName} - Treasury`,
        })}
      />
      {/* <Stack.Screen 
        name="GroupLiterature" 
        component={GroupLiteratureScreen} 
        options={({route}) => ({
          title: `${route.params.groupName} - Literature`,
        })}
      /> */}
      <Stack.Screen
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
      {/* <Stack.Screen 
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
      />  */}
      <Stack.Screen
        name="GroupEditDetails"
        component={GroupEditDetailsScreen}
        options={{
          title: 'Edit Group Details',
        }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          title: 'Create Group',
        }}
      />
      <Stack.Screen
        name="GroupSchedule"
        component={GroupScheduleScreen}
        options={({route}) => ({
          title: `${route.params.groupName} - Schedule`,
        })}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{
          presentation: 'modal',
          title: 'Add Transaction',
        }}
      />
    </Stack.Navigator>
  );
};

export default GroupStackNavigator;
