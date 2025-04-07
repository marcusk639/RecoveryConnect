// src/screens/groups/GroupMembersScreen.tsx

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {MainStackParamList} from '../../types';
import {GroupModel} from '../../models/GroupModel';
import Button from '../../components/common/Button';
import GroupInviteModal from '../../components/groups/GroupInviteModal';
import GroupMemberDetailModal from '../../components/groups/GroupMemberDetailModal';

type GroupMembersScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'GroupMembers'>;
  route: RouteProp<MainStackParamList, 'GroupMembers'>;
};

interface GroupMember {
  id: string;
  name: string;
  sobrietyDate?: string;
  position?: string;
  isAdmin: boolean;
}

const GroupMembersScreen: React.FC<GroupMembersScreenProps> = ({
  navigation,
  route,
}) => {
  const {groupId, groupName} = route.params;
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
    null,
  );
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);

  // Load members data
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);

        // Get all members
        const membersList = await GroupModel.getMembers(groupId);
        setMembers(membersList);

        // Check if current user is admin
        const currentUser = auth().currentUser;
        const group = await GroupModel.getById(groupId);
        setIsAdmin(group?.admins?.includes(currentUser?.uid) || false);
      } catch (error) {
        console.error('Error loading members:', error);
        Alert.alert('Error', 'Failed to load members. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [groupId]);

  // Handle member selection
  const handleMemberPress = (member: GroupMember) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  // Make member an admin
  const handleMakeAdmin = async (memberId: string) => {
    try {
      await GroupModel.makeAdmin(groupId, memberId);

      // Update local state
      setMembers(
        members.map(member =>
          member.id === memberId ? {...member, isAdmin: true} : member,
        ),
      );

      // Close modal
      setShowMemberModal(false);

      Alert.alert('Success', 'Member is now an admin');
    } catch (error) {
      console.error('Error making member admin:', error);
      Alert.alert('Error', 'Failed to update member role. Please try again.');
    }
  };

  // Remove member as admin
  const handleRemoveAdmin = async (memberId: string) => {
    try {
      await GroupModel.removeAdmin(groupId, memberId);

      // Update local state
      setMembers(
        members.map(member =>
          member.id === memberId ? {...member, isAdmin: false} : member,
        ),
      );

      // Close modal
      setShowMemberModal(false);

      Alert.alert('Success', 'Member is no longer an admin');
    } catch (error) {
      console.error('Error removing member as admin:', error);
      Alert.alert('Error', 'Failed to update member role. Please try again.');
    }
  };

  // Remove member from group
  const handleRemoveMember = async (memberId: string) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the group?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await GroupModel.removeMember(groupId, memberId);

              // Update local state
              setMembers(members.filter(member => member.id !== memberId));

              // Close modal
              setShowMemberModal(false);

              Alert.alert('Success', 'Member has been removed from the group');
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert(
                'Error',
                'Failed to remove member. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const renderMemberItem = ({item}: {item: GroupMember}) => {
    const isCurrentUser = item.id === auth().currentUser?.uid;

    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => handleMemberPress(item)}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitial}>{item.name.charAt(0)}</Text>
        </View>

        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>
              {item.name} {isCurrentUser ? '(You)' : ''}
            </Text>

            {item.isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>

          {item.position && (
            <Text style={styles.memberPosition}>{item.position}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{groupName} - Members</Text>
        <View style={{width: 40}} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      ) : (
        <>
          <View style={styles.countContainer}>
            <Text style={styles.memberCount}>
              {members.length} {members.length === 1 ? 'Member' : 'Members'}
            </Text>

            {isAdmin && (
              <Button
                title="Invite People"
                size="small"
                onPress={() => setShowInviteModal(true)}
              />
            )}
          </View>

          <FlatList
            data={members}
            renderItem={renderMemberItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No members found</Text>
              </View>
            }
          />
        </>
      )}

      {/* Invite Modal */}
      <GroupInviteModal
        visible={showInviteModal}
        groupId={groupId}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Member Detail Modal */}
      {selectedMember && (
        <GroupMemberDetailModal
          visible={showMemberModal}
          member={selectedMember}
          isAdmin={isAdmin}
          isCurrentUser={selectedMember.id === auth().currentUser?.uid}
          onClose={() => setShowMemberModal(false)}
          onMakeAdmin={() => handleMakeAdmin(selectedMember.id)}
          onRemoveAdmin={() => handleRemoveAdmin(selectedMember.id)}
          onRemoveMember={() => handleRemoveMember(selectedMember.id)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#2196F3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  memberCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
  },
  listContainer: {
    paddingVertical: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginRight: 8,
  },
  adminBadge: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  adminText: {
    fontSize: 12,
    color: '#FFA000',
    fontWeight: '500',
  },
  memberPosition: {
    fontSize: 14,
    color: '#757575',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default GroupMembersScreen;
