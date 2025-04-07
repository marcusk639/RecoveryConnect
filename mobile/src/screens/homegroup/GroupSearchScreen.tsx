import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MainTabParamList} from '../../types/navigation';

interface Group {
  id: string;
  name: string;
  description: string;
  meetingDay: string;
  meetingTime: string;
  location: string;
  memberCount: number;
  isJoined: boolean;
}

// Define a more specific type for the Home tab navigation
type HomeTabParams = {
  screen: 'GroupOverview';
  params: {
    groupId: string;
    groupName: string;
  };
};

// Define a composite type for nested navigation
type CompositeParamList = {
  Home: HomeTabParams;
  Meetings: undefined;
  Treasury: undefined;
  Profile: undefined;
  GroupSearch: undefined;
};

type GroupSearchScreenNavigationProp = StackNavigationProp<
  CompositeParamList,
  'GroupSearch'
>;

const GroupSearchScreen: React.FC = () => {
  const navigation = useNavigation<GroupSearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    // Filter groups based on search query
    if (searchQuery.trim() === '') {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(
        group =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.location.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, groups]);

  const loadGroups = async () => {
    try {
      setLoading(true);

      // In a real app, this would fetch all available groups from Firestore
      // and compare with user's joined groups
      // For now, we'll use mock data

      // Mock data for available groups
      const mockGroups: Group[] = [
        {
          id: 'group1',
          name: 'Serenity Now Group',
          description:
            'A welcoming group focused on practical application of the principles.',
          meetingDay: 'Tuesday',
          meetingTime: '7:00 PM',
          location: 'Community Center, Room 101, 123 Main St.',
          memberCount: 35,
          isJoined: true,
        },
        {
          id: 'group2',
          name: 'Recovery Warriors',
          description: 'A solution-focused home group with rotating speakers.',
          meetingDay: 'Friday',
          meetingTime: '8:00 PM',
          location: 'Main Street Church, Basement Level, 456 Main St.',
          memberCount: 42,
          isJoined: false,
        },
        {
          id: 'group3',
          name: 'Hope and Healing',
          description: 'Focused on the spiritual aspects of recovery.',
          meetingDay: 'Sunday',
          meetingTime: '10:00 AM',
          location: 'Community Hospital, Conference Room B, 789 Health Dr.',
          memberCount: 28,
          isJoined: false,
        },
        {
          id: 'group4',
          name: 'New Beginnings',
          description: 'A group for those in their first year of recovery.',
          meetingDay: 'Monday',
          meetingTime: '6:30 PM',
          location: 'Recovery Center, Suite 101, 234 Hope Ave.',
          memberCount: 15,
          isJoined: false,
        },
        {
          id: 'group5',
          name: 'Freedom Fellowship',
          description:
            'Discussion-based meetings with a focus on living in freedom.',
          meetingDay: 'Thursday',
          meetingTime: '7:30 PM',
          location: 'Community Library, Meeting Room 3, 567 Book St.',
          memberCount: 32,
          isJoined: false,
        },
      ];

      setGroups(mockGroups);
      setFilteredGroups(mockGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (group: Group) => {
    try {
      setJoining(group.id);

      // In a real app, this would update Firestore to add the user to the group
      // and the group to the user's groups
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // Update local state
      setGroups(prevGroups =>
        prevGroups.map(g => (g.id === group.id ? {...g, isJoined: true} : g)),
      );

      Alert.alert('Success', `You've joined ${group.name}!`, [
        {
          text: 'View Group',
          onPress: () =>
            navigation.navigate('Home', {
              screen: 'GroupOverview',
              params: {
                groupId: group.id,
                groupName: group.name,
              },
            }),
        },
        {
          text: 'Stay Here',
          style: 'cancel',
        },
      ]);
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join group. Please try again.');
    } finally {
      setJoining(null);
    }
  };

  const renderGroupItem = ({item}: {item: Group}) => (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{item.name}</Text>
        {item.isJoined ? (
          <View style={styles.joinedBadge}>
            <Text style={styles.joinedBadgeText}>Joined</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoinGroup(item)}
            disabled={joining === item.id}>
            {joining === item.id ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>Join</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.groupDescription}>{item.description}</Text>

      <View style={styles.groupDetails}>
        <Text style={styles.groupDetailText}>
          <Text style={styles.groupDetailLabel}>Meets: </Text>
          {item.meetingDay}s at {item.meetingTime}
        </Text>
        <Text style={styles.groupDetailText}>
          <Text style={styles.groupDetailLabel}>Location: </Text>
          {item.location}
        </Text>
        <Text style={styles.groupDetailText}>
          <Text style={styles.groupDetailLabel}>Members: </Text>
          {item.memberCount}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() =>
          navigation.navigate('Home', {
            screen: 'GroupOverview',
            params: {
              groupId: item.id,
              groupName: item.name,
            },
          })
        }>
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Find Groups</Text>
        <Text style={styles.headerSubtitle}>
          Join local recovery groups in your community
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, description, or location"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.groupList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.trim() !== ''
                  ? 'No groups match your search'
                  : 'No groups available in your area'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupList: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  joinButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  joinedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  joinedBadgeText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  groupDescription: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 12,
    lineHeight: 20,
  },
  groupDetails: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  groupDetailText: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  groupDetailLabel: {
    fontWeight: '600',
    color: '#424242',
  },
  viewButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default GroupSearchScreen;
