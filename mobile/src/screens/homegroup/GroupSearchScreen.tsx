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
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {GroupModel} from '../../models/GroupModel';
import {HomeGroup} from '../../types';

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
  const [groups, setGroups] = useState<HomeGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<HomeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [userJoinedGroups, setUserJoinedGroups] = useState<string[]>([]);

  useEffect(() => {
    loadUserJoinedGroups();
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
          (group.location &&
            group.location.toLowerCase().includes(searchQuery.toLowerCase())),
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, groups]);

  const loadUserJoinedGroups = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const userDoc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        setUserJoinedGroups(userData?.homeGroups || []);
      }
    } catch (error) {
      console.error('Error loading user joined groups:', error);
    }
  };

  const loadGroups = async () => {
    try {
      setLoading(true);

      // Fetch all groups from Firestore
      const groupsSnapshot = await firestore().collection('groups').get();

      const fetchedGroups = groupsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          location: data.location || '',
          memberCount: data.memberCount || 0,
          type: data.type || 'AA',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          admins: data.admins || [],
          meetings: [], // Will be populated when needed
        } as HomeGroup;
      });

      setGroups(fetchedGroups);
      setFilteredGroups(fetchedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (group: HomeGroup) => {
    try {
      setJoining(group.id!);

      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to join a group.');
        return;
      }

      // Add user to group's members collection
      await firestore()
        .collection('groups')
        .doc(group.id)
        .collection('members')
        .doc(currentUser.uid)
        .set({
          id: currentUser.uid,
          displayName: currentUser.displayName || 'Anonymous',
          joinedAt: firestore.FieldValue.serverTimestamp(),
          isAdmin: false,
          showSobrietyDate: false,
        });

      // Increment member count
      await firestore()
        .collection('groups')
        .doc(group.id)
        .update({
          memberCount: firestore.FieldValue.increment(1),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Add group to user's homeGroups
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          homeGroups: firestore.FieldValue.arrayUnion(group.id),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Update local state
      setUserJoinedGroups(prev => [...prev, group.id!]);
      setGroups(prevGroups =>
        prevGroups.map(g =>
          g.id === group.id ? {...g, memberCount: g.memberCount + 1} : g,
        ),
      );

      Alert.alert('Success', `You've joined ${group.name}!`, [
        {
          text: 'View Group',
          onPress: () =>
            navigation.navigate('Home', {
              screen: 'GroupOverview',
              params: {
                groupId: group.id!,
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

  const isUserJoinedGroup = (groupId: string) => {
    return userJoinedGroups.includes(groupId);
  };

  const renderGroupItem = ({item}: {item: HomeGroup}) => (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{item.name}</Text>
        {isUserJoinedGroup(item.id!) ? (
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
          <Text style={styles.groupDetailLabel}>Location: </Text>
          {item.location || 'Not specified'}
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
              groupId: item.id!,
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
          keyExtractor={item => item.id!}
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
