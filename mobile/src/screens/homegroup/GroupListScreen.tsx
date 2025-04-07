import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
  FlatList,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

// Import types
import {GroupStackParamList} from '../../types/navigation';

// Interface for HomeGroup data
interface HomeGroup {
  id: string;
  name: string;
  description: string;
  meetingDay: string;
  meetingTime: string;
  memberCount: number;
  isAdmin: boolean;
}

type GroupsListScreenNavigationProp = StackNavigationProp<
  GroupStackParamList,
  'GroupsList'
>;

const GroupsListScreen: React.FC = () => {
  const navigation = useNavigation<GroupsListScreenNavigationProp>();
  const [homeGroups, setHomeGroups] = useState<HomeGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get current user's display name
    const currentUser = auth().currentUser;
    if (currentUser?.displayName) {
      setUserName(currentUser.displayName);
    }

    // Load initial data
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);

      // In a real app, this would fetch the user's groups from Firestore
      // For now, we'll use mock data
      const mockHomeGroups: HomeGroup[] = [
        {
          id: 'group1',
          name: 'Serenity Now Group',
          description:
            'A welcoming group focused on practical application of the principles.',
          meetingDay: 'Tuesday',
          meetingTime: '7:00 PM',
          memberCount: 35,
          isAdmin: true,
        },
        {
          id: 'group2',
          name: 'Recovery Warriors',
          description: 'A solution-focused homegroup with rotating speakers.',
          meetingDay: 'Friday',
          meetingTime: '8:00 PM',
          memberCount: 42,
          isAdmin: false,
        },
        {
          id: 'group3',
          name: 'Hope and Healing',
          description: 'Focused on the spiritual aspects of recovery.',
          meetingDay: 'Sunday',
          meetingTime: '10:00 AM',
          memberCount: 28,
          isAdmin: false,
        },
      ];

      setHomeGroups(mockHomeGroups);
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Failed to load groups. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  const navigateToGroupDetails = (group: HomeGroup) => {
    navigation.navigate('GroupOverview', {
      groupId: group.id,
      groupName: group.name,
    });
  };

  const renderHomeGroupItem = ({item}: {item: HomeGroup}) => (
    <TouchableOpacity
      style={styles.homeGroupCard}
      onPress={() => navigateToGroupDetails(item)}>
      <View style={styles.homeGroupHeader}>
        <Text style={styles.homeGroupName}>{item.name}</Text>
        {item.isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
      </View>
      <Text style={styles.homeGroupDescription}>{item.description}</Text>
      <View style={styles.homeGroupFooter}>
        <Text style={styles.homeGroupMeetingTime}>
          {item.meetingDay}s at {item.meetingTime}
        </Text>
        <Text style={styles.homeGroupMemberCount}>
          {item.memberCount} members
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        }>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hello, {userName || 'Friend'}</Text>
          <Text style={styles.subtitleText}>
            Your recovery journey continues
          </Text>
        </View>

        {/* Home Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Home Groups</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Join Group',
                  'This feature will allow you to join new groups.',
                )
              }>
              <Text style={styles.seeAllText}>Join New</Text>
            </TouchableOpacity>
          </View>

          {homeGroups.length > 0 ? (
            <FlatList
              data={homeGroups}
              renderItem={renderHomeGroupItem}
              keyExtractor={item => item.id}
              horizontal={false}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.homeGroupsList}
            />
          ) : (
            <View style={styles.emptyHomeGroups}>
              <Text style={styles.emptyStateText}>
                You haven't joined any home groups yet
              </Text>
              <TouchableOpacity
                style={styles.joinGroupButton}
                onPress={() =>
                  Alert.alert(
                    'Join Group',
                    'This feature will allow you to join new groups.',
                  )
                }>
                <Text style={styles.joinGroupButtonText}>Find a Group</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 24,
    backgroundColor: '#2196F3',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
  },
  homeGroupsList: {
    paddingBottom: 8,
  },
  homeGroupCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  homeGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  homeGroupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  adminBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2196F3',
  },
  homeGroupDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
    flex: 1,
  },
  homeGroupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  homeGroupMeetingTime: {
    fontSize: 12,
    color: '#616161',
  },
  homeGroupMemberCount: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  emptyHomeGroups: {
    padding: 24,
    alignItems: 'center',
  },
  joinGroupButton: {
    marginTop: 12,
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  joinGroupButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

export default GroupsListScreen;
