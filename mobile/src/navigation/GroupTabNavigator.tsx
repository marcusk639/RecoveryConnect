import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View, Platform} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// Import types
import {GroupStackParamList} from '../types/navigation';
import GroupMembersScreen from '../screens/homegroup/GroupMembersScreen';
import GroupOverviewScreen from '../screens/homegroup/GroupOverviewScreen';

// Import screens
// import GroupOverviewScreen from '../screens/groups/GroupOverviewScreen';
// import GroupMembersScreen from '../screens/groups/GroupMembersScreen';
// import GroupAnnouncementsScreen from '../screens/groups/GroupAnnouncementsScreen';
// import GroupTreasuryScreen from '../screens/groups/GroupTreasuryScreen';
// import GroupLiteratureScreen from '../screens/groups/GroupLiteratureScreen';

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

const MembersIcon = ({focused}: {focused: boolean}) => (
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
      👥
    </Text>
  </View>
);

const AnnouncementsIcon = ({focused}: {focused: boolean}) => (
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
      📢
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

const LiteratureIcon = ({focused}: {focused: boolean}) => (
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
      📚
    </Text>
  </View>
);

const Tab = createBottomTabNavigator<any>();

type GroupTabNavigatorRouteProp = RouteProp<
  GroupStackParamList,
  'GroupOverview'
>;

const GroupTabNavigator: React.FC = () => {
  const route = useRoute<GroupTabNavigatorRouteProp>();
  const {groupId, groupName} = route.params;
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
        headerTitle: groupName || 'Group Details',
      }}>
      <Tab.Screen
        name="GroupOverview"
        component={GroupOverviewScreen}
        initialParams={{groupId}}
        options={{
          tabBarLabel: 'Overview',
          tabBarIcon: ({focused}) => <HomeIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="GroupMembers"
        component={GroupMembersScreen}
        initialParams={{groupId}}
        options={{
          tabBarLabel: 'Members',
          tabBarIcon: ({focused}) => <MembersIcon focused={focused} />,
        }}
      />
      {/* <Tab.Screen
        name="GroupAnnouncements"
        component={GroupAnnouncementsScreen}
        initialParams={{groupId}}
        options={{
          tabBarLabel: 'Announcements',
          tabBarIcon: ({focused}) => <AnnouncementsIcon focused={focused} />,
        }}
      /> */}
      {/* <Tab.Screen
        name="GroupTreasury"
        component={GroupTreasuryScreen}
        initialParams={{groupId}}
        options={{
          tabBarLabel: 'Treasury',
          tabBarIcon: ({focused}) => <TreasuryIcon focused={focused} />,
        }}
      /> */}
      {/* <Tab.Screen
        name="GroupLiterature"
        component={GroupLiteratureScreen}
        initialParams={{groupId}}
        options={{
          tabBarLabel: 'Literature',
          tabBarIcon: ({focused}) => <LiteratureIcon focused={focused} />,
        }}
      /> */}
    </Tab.Navigator>
  );
};

export default GroupTabNavigator;
