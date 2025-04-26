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
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

// Import types
import {GroupStackParamList, MainTabParamList} from '../../types/navigation';
import {GroupDocument, UserDocument} from '../../types/schema';
import {GroupModel} from '../../models/GroupModel';
import {HomeGroup} from '../../types';
import {UserModel} from '../../models/UserModel';
type GroupsListScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<GroupStackParamList, 'GroupsList'>,
  BottomTabNavigationProp<MainTabParamList>
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

      // Get current user
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to view groups');
        return;
      }

      // Fetch the user document to get their group IDs
      const userDoc = await UserModel.getById(currentUser.uid);
      const userGroupIds = userDoc?.homeGroups || [];

      // Fetch groups where the user is an admin
      const adminGroupsSnapshot = await firestore()
        .collection('groups')
        .where('admins', 'array-contains', currentUser.uid)
        .get();

      // Combine group IDs
      const allGroupIds = [
        ...new Set([
          ...userGroupIds,
          ...adminGroupsSnapshot.docs.map(doc => doc.id),
        ]),
      ];

      // Fetch the actual group documents
      const groupPromises = allGroupIds.map(groupId =>
        firestore().collection('groups').doc(groupId).get(),
      );

      const groupSnapshots = await Promise.all(groupPromises);
      const validGroupSnapshots = groupSnapshots.filter(
        snapshot => snapshot.exists,
      );

      // Map Firestore documents to HomeGroup objects
      const groups: HomeGroup[] = validGroupSnapshots.map(doc =>
        GroupModel.fromFirestore({
          id: doc.id,
          data: () => doc.data() as GroupDocument,
        }),
      );

      setHomeGroups(groups);
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Failed to load groups. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  const navigateToGroupDetails = (group: HomeGroup) => {
    navigation.navigate('GroupOverview', {
      groupId: group.id!,
      groupName: group.name,
    });
  };

  const navigateToCreateGroup = () => {
    navigation.navigate('CreateGroup', {});
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
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.createGroupButton}
                onPress={navigateToCreateGroup}>
                <Text style={styles.createGroupButtonText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('GroupSearch')}>
                <Text style={styles.seeAllText}>Join New</Text>
              </TouchableOpacity>
            </View>
          </View>

          {homeGroups.length > 0 ? (
            <FlatList
              data={homeGroups}
              renderItem={renderHomeGroupItem}
              keyExtractor={item => item.id!}
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
                onPress={() => navigation.navigate('GroupSearch')}>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  createGroupButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 12,
  },
  createGroupButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
