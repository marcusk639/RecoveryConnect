// src/screens/groups/GroupDetailsScreen.tsx

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {MainStackParamList} from '../../types';
import {GroupModel} from '../../models/GroupModel';
import Button from '../../components/common/Button';
import GroupInviteModal from '../../components/groups/GroupInviteModal';
import {auth} from '../../services/firebase/config';

type GroupDetailsScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'GroupDetails'>;
  route: RouteProp<MainStackParamList, 'GroupDetails'>;
};

const GroupDetailsScreen: React.FC<GroupDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const {groupId} = route.params;
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [joiningGroup, setJoiningGroup] = useState<boolean>(false);

  // Load group data
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setLoading(true);

        // Get group details
        const groupData = await GroupModel.getById(groupId);

        if (groupData) {
          setGroup(groupData);

          // Get group members
          const membersList = await GroupModel.getMembers(groupId);
          setMembers(membersList);

          // Check if current user is admin
          setIsAdmin(
            groupData.admins?.includes(auth.currentUser?.uid || '') || false,
          );

          // Check if current user is a member
          setIsMember(
            membersList.some(member => member.id === auth.currentUser?.uid),
          );
        } else {
          setError('Group not found');
        }
      } catch (error) {
        console.error('Error loading group data:', error);
        setError('Failed to load group information');
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [groupId]);

  // Join group
  const handleJoinGroup = async () => {
    try {
      setJoiningGroup(true);

      // Add current user to group members
      await GroupModel.addMember(groupId, auth.currentUser?.uid || '', false);

      // Update local state
      setIsMember(true);

      // Refresh member list
      const updatedMembers = await GroupModel.getMembers(groupId);
      setMembers(updatedMembers);

      Alert.alert('Success', 'You have joined the group');
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join group. Please try again.');
    } finally {
      setJoiningGroup(false);
    }
  };

  // Leave group
  const handleLeaveGroup = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            // Remove current user from group members
            await GroupModel.removeMember(groupId, auth.currentUser?.uid || '');

            // Update local state
            setIsMember(false);

            // Refresh member list
            const updatedMembers = await GroupModel.getMembers(groupId);
            setMembers(updatedMembers);

            Alert.alert('Success', 'You have left the group');

            // If the user was an admin, update isAdmin state
            setIsAdmin(false);
          } catch (error) {
            console.error('Error leaving group:', error);
            Alert.alert('Error', 'Failed to leave group. Please try again.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading group details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Details</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Group Header */}
        <View style={styles.groupHeader}>
          <View style={styles.groupIconContainer}>
            <Text style={styles.groupIconText}>
              {group?.name.charAt(0) || 'G'}
            </Text>
          </View>

          <Text style={styles.groupName}>{group?.name}</Text>
          <Text style={styles.memberCount}>
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </Text>

          {isMember ? (
            <View style={styles.membershipBadge}>
              <Text style={styles.membershipText}>Member</Text>
            </View>
          ) : null}
        </View>

        {/* Group Description */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{group?.description}</Text>
        </View>

        {/* Meeting Details */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Meeting Details</Text>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Day & Time:</Text>
            <Text style={styles.detailText}>
              {group?.meetingDay}s at {group?.meetingTime}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Format:</Text>
            <Text style={styles.detailText}>{group?.format}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailText}>
              {group?.isOnline ? 'Online Meeting' : group?.location}
            </Text>
          </View>

          {!group?.isOnline && group?.address ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailText}>{group?.address}</Text>
            </View>
          ) : null}

          {group?.isOnline && group?.onlineLink ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Meeting Link:</Text>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL(group.onlineLink);
                }}>
                <Text style={styles.linkText}>{group.onlineLink}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Members Preview */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Members</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('GroupMembers', {
                  groupId,
                  groupName: group?.name,
                })
              }>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.membersPreview}>
            {members.slice(0, 5).map(member => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>
                    {member.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
                {member.isAdmin ? (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminText}>Admin</Text>
                  </View>
                ) : null}
              </View>
            ))}

            {members.length > 5 ? (
              <TouchableOpacity
                style={styles.moreMembers}
                onPress={() =>
                  navigation.navigate('GroupMembers', {
                    groupId,
                    groupName: group?.name,
                  })
                }>
                <Text style={styles.moreMembersText}>
                  +{members.length - 5} more
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {isMember ? (
            <>
              <Button
                title="Go to Group Home"
                onPress={() => navigation.navigate('HomeGroup', {groupId})}
                fullWidth
                style={styles.actionButton}
              />

              {isAdmin && (
                <Button
                  title="Invite People"
                  variant="outline"
                  onPress={() => setShowInviteModal(true)}
                  fullWidth
                  style={styles.actionButton}
                />
              )}

              <Button
                title="Leave Group"
                variant="outline"
                onPress={handleLeaveGroup}
                fullWidth
                style={{...styles.actionButton, ...styles.leaveButton}}
                textStyle={styles.leaveButtonText}
              />
            </>
          ) : (
            <Button
              title={joiningGroup ? 'Joining...' : 'Join Group'}
              onPress={handleJoinGroup}
              loading={joiningGroup}
              disabled={joiningGroup}
              fullWidth
              style={styles.actionButton}
            />
          )}
        </View>
      </ScrollView>

      {/* Invite Modal */}
      <GroupInviteModal
        visible={showInviteModal}
        groupId={groupId}
        groupName={group?.name}
        onClose={() => setShowInviteModal(false)}
      />
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
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    minWidth: 120,
  },
  groupHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  groupIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupIconText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
    textAlign: 'center',
  },
  memberCount: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  membershipBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2196F3',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
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
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
  },
  description: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: '#212121',
  },
  linkText: {
    fontSize: 16,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  membersPreview: {
    marginBottom: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
  },
  memberName: {
    fontSize: 16,
    color: '#212121',
    flex: 1,
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
  moreMembers: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  moreMembersText: {
    fontSize: 14,
    color: '#2196F3',
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  leaveButton: {
    borderColor: '#F44336',
  },
  leaveButtonText: {
    color: '#F44336',
  },
});

export default GroupDetailsScreen;
