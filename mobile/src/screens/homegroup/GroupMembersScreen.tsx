import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

// Import types
import {GroupStackParamList} from '../../types/navigation';

// Import components
import GroupInviteModal from '../../components/groups/GroupInviteModal';
import {getAnonymizedName} from '../../utils/anonymous';

// Types for members
interface GroupMember {
  id: string;
  name: string;
  sobrietyDate?: string;
  position?: string; // secretary, treasurer, etc.
  isAdmin: boolean;
}

type GroupMembersScreenRouteProp = RouteProp<
  GroupStackParamList,
  'GroupMembers'
>;
type GroupMembersScreenNavigationProp =
  StackNavigationProp<GroupStackParamList>;

const GroupMembersScreen: React.FC = () => {
  const route = useRoute<GroupMembersScreenRouteProp>();
  const navigation = useNavigation<GroupMembersScreenNavigationProp>();
  const {groupId} = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    try {
      setLoading(true);

      // In a real app, this would fetch data from Firestore
      // For now, we'll use mock data

      // Get the group data
      const mockGroup = {
        id: groupId,
        name: 'Serenity Now Group',
        isAdmin: true,
      };

      setGroupName(mockGroup.name);
      setIsAdmin(mockGroup.isAdmin);

      // Mock members data
      const mockMembers: GroupMember[] = [
        {
          id: '1',
          name: 'Marcus Klein',
          sobrietyDate: '2020-06-12',
          position: 'Secretary',
          isAdmin: true,
        },
        {
          id: '2',
          name: 'Jack Doe',
          sobrietyDate: '2015-03-22',
          position: 'Treasurer',
          isAdmin: true,
        },
        {
          id: '3',
          name: 'S.',
          sobrietyDate: '2019-11-05',
          position: 'GSR',
          isAdmin: true,
        },
        {
          id: '4',
          name: 'T.',
          sobrietyDate: '2023-09-01',
          isAdmin: false,
        },
        {
          id: '5',
          name: 'L.',
          sobrietyDate: '2018-04-30',
          isAdmin: false,
        },
        {
          id: '6',
          name: 'R.',
          sobrietyDate: '2021-12-10',
          isAdmin: false,
        },
        {
          id: '7',
          name: 'K.',
          sobrietyDate: '2022-05-15',
          isAdmin: false,
        },
        {
          id: '8',
          name: 'P.',
          isAdmin: false,
        },
      ];

      setMembers(mockMembers);
    } catch (error) {
      console.error('Error loading members:', error);
      Alert.alert(
        'Error',
        'Failed to load group members. Please try again later.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMemberPress = (member: GroupMember) => {
    navigation.navigate('GroupMemberDetails', {
      groupId,
      memberId: member.id,
    });
  };

  const calculateSobrietyYears = (dateString?: string): number | null => {
    if (!dateString) return null;

    const sobrietyDate = new Date(dateString);
    const today = new Date();
    const yearInMs = 365.25 * 24 * 60 * 60 * 1000; // Average year including leap years
    const diffInMs = today.getTime() - sobrietyDate.getTime();
    return Math.floor(diffInMs / yearInMs);
  };

  const formatSobrietyDate = (dateString?: string): string => {
    if (!dateString) return 'Not set';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const renderMemberItem = ({item}: {item: GroupMember}) => (
    <TouchableOpacity
      style={styles.memberItem}
      onPress={() => handleMemberPress(item)}>
      <View style={styles.memberInitialContainer}>
        <Text style={styles.memberInitial}>{getAnonymizedName(item.name)}</Text>
      </View>

      <View style={styles.memberDetailsContainer}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{item.name}</Text>
          {item.isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        {item.position && (
          <Text style={styles.memberPosition}>{item.position}</Text>
        )}

        {item.sobrietyDate && (
          <Text style={styles.memberSobriety}>
            {formatSobrietyDate(item.sobrietyDate)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderServicePositions = () => {
    const serviceMembers = members.filter(member => member.position);

    if (serviceMembers.length === 0) {
      return null;
    }

    return (
      <View style={styles.servicePositionsContainer}>
        <Text style={styles.sectionTitle}>Service Positions</Text>

        {serviceMembers.map(member => (
          <View key={member.id} style={styles.servicePositionItem}>
            <View style={styles.positionNameContainer}>
              <Text style={styles.positionName}>{member.position}</Text>
            </View>
            <View style={styles.positionMemberContainer}>
              <Text style={styles.positionMember}>{member.name}</Text>
              {member.sobrietyDate && (
                <Text style={styles.positionSobriety}>
                  {calculateSobrietyYears(member.sobrietyDate)} years
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.memberCount}>{members.length} Members</Text>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={() => setInviteModalVisible(true)}>
                  <Text style={styles.inviteButtonText}>Invite</Text>
                </TouchableOpacity>
              )}
            </View>

            {renderServicePositions()}

            <Text style={styles.sectionTitle}>All Members</Text>
          </>
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadMembers} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No members found</Text>
          </View>
        }
      />

      {/* Invite Modal */}
      <GroupInviteModal
        visible={inviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
        groupId={groupId}
        groupName={groupName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  memberCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#616161',
  },
  inviteButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  servicePositionsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginBottom: 16,
  },
  servicePositionItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  positionNameContainer: {
    width: 100,
    marginRight: 16,
  },
  positionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  positionMemberContainer: {
    flex: 1,
  },
  positionMember: {
    fontSize: 14,
    color: '#212121',
  },
  positionSobriety: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  memberItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  memberInitialContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  memberDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginRight: 8,
  },
  adminBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
  },
  memberPosition: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 2,
  },
  memberSobriety: {
    fontSize: 14,
    color: '#2196F3',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default GroupMembersScreen;
