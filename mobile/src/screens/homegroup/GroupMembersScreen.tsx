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
  Image,
  SafeAreaView,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import types
import {GroupStackParamList} from '../../types/navigation';

// Import components
import GroupInviteModal from '../../components/groups/GroupInviteModal';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  fetchGroupMembers,
  selectMembersByGroupId,
  selectGroupAdmins,
  selectMembersStatus,
  selectMembersError,
  toggleAdmin,
  removeMember,
} from '../../store/slices/membersSlice';
import {
  selectGroupById,
  selectGroupsStatus,
} from '../../store/slices/groupsSlice';
import {selectServicePositionsByMember} from '../../store/slices/servicePositionsSlice';
import {GroupMember} from '../../types';

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
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const members = useAppSelector(state =>
    selectMembersByGroupId(state, groupId),
  );
  const admins = useAppSelector(state => selectGroupAdmins(state, groupId));
  const group = useAppSelector(state => selectGroupById(state, groupId));
  const membersStatus = useAppSelector(selectMembersStatus);
  const membersError = useAppSelector(selectMembersError);
  const groupsStatus = useAppSelector(selectGroupsStatus);

  const loading = membersStatus === 'loading' || groupsStatus === 'loading';
  const [refreshing, setRefreshing] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  // Update group name when group data is loaded
  useEffect(() => {
    if (group) {
      setGroupName(group.name);

      // Check if current user is admin
      const currentUser = auth().currentUser;
      if (currentUser) {
        setIsAdmin(group.admins?.includes(currentUser.uid) || false);
      }
    }
  }, [group]);

  // Show errors from Redux
  useEffect(() => {
    if (membersError) {
      Alert.alert('Error', membersError);
    }
  }, [membersError]);

  const loadMembers = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchGroupMembers(groupId)).unwrap();
    } catch (error) {
      // Error is already handled in the useEffect above
    } finally {
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

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    if (!name) return '?';

    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleToggleAdmin = (member: GroupMember) => {
    Alert.alert(
      'Toggle Admin',
      'Are you sure you want to make this member an admin?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Toggle',
          onPress: () =>
            dispatch(toggleAdmin({groupId, userId: member.userId})),
        },
      ],
    );
  };

  const confirmRemoveMember = (member: GroupMember) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the group?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          onPress: () =>
            dispatch(removeMember({groupId, userId: member.userId})),
        },
      ],
    );
  };

  const renderMemberItem = ({item}: {item: GroupMember}) => {
    const servicePositions = useAppSelector(state =>
      selectServicePositionsByMember(state, item.id),
    );

    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => handleMemberPress(item)}
        testID={`group-member-item-${item.id}`}>
        <View style={styles.memberInitialContainer}>
          {item.photoUrl ? (
            <Image
              source={{uri: item.photoUrl}}
              style={styles.memberPhoto}
              onError={() => {
                console.log(`Failed to load photo for ${item.name}`);
              }}
            />
          ) : (
            <Text style={styles.memberInitial}>{getInitials(item.name)}</Text>
          )}
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

          {servicePositions.length > 0 && (
            <View style={styles.servicePositionsContainer}>
              {servicePositions.map(position => (
                <View key={position.id} style={styles.servicePositionBadge}>
                  <Text style={styles.servicePositionText}>
                    {position.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {item.sobrietyDate && (
            <Text style={styles.memberSobriety}>
              {formatSobrietyDate(item.sobrietyDate)}
            </Text>
          )}
        </View>

        {isAdmin && !item.isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              onPress={() => handleToggleAdmin(item)}
              testID={`member-admin-toggle-${item.id}`}>
              <Icon name="account-plus-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmRemoveMember(item)}
              testID={`member-remove-button-${item.id}`}>
              <Icon name="account-remove-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderServicePositions = () => {
    const serviceMembers = members.filter(
      (member: GroupMember) => member.position,
    );

    if (serviceMembers.length === 0) {
      return null;
    }

    return (
      <View style={styles.servicePositionsContainer}>
        <Text style={styles.sectionTitle}>Service Positions</Text>

        {serviceMembers.map((member: GroupMember) => (
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      testID={`group-members-screen-${groupId}`}>
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
                  onPress={() => setInviteModalVisible(true)}
                  testID="group-members-invite-button">
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
            <Icon
              name="account-group-outline"
              size={64}
              color="#BBDEFB"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No Members Yet</Text>
            <Text style={styles.emptyText}>
              {isAdmin
                ? 'Start building your group by inviting members. You can invite them via email or share an invite link.'
                : 'No members have joined this group yet. Check back later or contact a group admin.'}
            </Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => setInviteModalVisible(true)}
                testID="empty-state-invite-button">
                <Text style={styles.inviteButtonText}>Invite Members</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        testID="group-members-list"
      />

      {/* Invite Modal */}
      <GroupInviteModal
        visible={inviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
        groupId={groupId}
        groupName={groupName}
      />
    </SafeAreaView>
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
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1E1E1',
  },
  memberInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
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
    marginRight: 8,
  },
  adminBadgeText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
  },
  servicePositionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  servicePositionBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  servicePositionText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
  },
  memberSobriety: {
    fontSize: 14,
    color: '#2196F3',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    marginTop: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  adminActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 8,
  },
});

export default GroupMembersScreen;
