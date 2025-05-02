import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';

// Import types and Redux
import {GroupStackParamList} from '../../types/navigation';
import {HomeGroup, Meeting, MeetingInstance} from '../../types';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  fetchGroupById,
  selectGroupById,
  selectGroupsStatus,
  leaveGroup,
  requestGroupAdminAccess,
} from '../../store/slices/groupsSlice';
import {
  fetchAnnouncementsForGroup,
  selectAnnouncementsByGroupId,
} from '../../store/slices/announcementsSlice';
import {
  fetchGroupMembers,
  selectMembersByGroupId,
  fetchGroupMilestones,
  selectGroupMilestones,
  GroupMilestone,
} from '../../store/slices/membersSlice';
import {
  fetchUpcomingMeetingInstances,
  selectUpcomingMeetingInstances,
  selectMeetingsStatus,
  fetchGroupMeetings,
  selectGroupMeetingTemplateIds,
  selectMeetingById,
  selectGroupMeetings,
} from '../../store/slices/meetingsSlice';
import {upperFirst} from 'lodash';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RecoveryCelebration} from '../../types/domain';

type GroupOverviewScreenRouteProp = RouteProp<
  GroupStackParamList,
  'GroupOverview'
>;
type GroupOverviewScreenNavigationProp =
  StackNavigationProp<GroupStackParamList>;

const GroupOverviewScreen: React.FC = () => {
  const route = useRoute<GroupOverviewScreenRouteProp>();
  const navigation = useNavigation<GroupOverviewScreenNavigationProp>();
  const {groupId, groupName} = route.params;
  const currentUser = auth().currentUser;

  const dispatch = useAppDispatch();

  // Get data from Redux store
  const group = useAppSelector(state => selectGroupById(state, groupId));
  const announcements = useAppSelector(state =>
    selectAnnouncementsByGroupId(state, groupId),
  );
  const members = useAppSelector(state =>
    selectMembersByGroupId(state, groupId),
  );
  const meetingIds = useAppSelector(state =>
    selectGroupMeetingTemplateIds(state, groupId),
  );
  const meetings = useAppSelector(state => selectGroupMeetings(state, groupId));
  const celebrations = useAppSelector(state =>
    selectGroupMilestones(state, groupId),
  );

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [leaveGroupLoading, setLeaveGroupLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [adminRequestMessage, setAdminRequestMessage] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);

    try {
      // Dispatch actions to load data from Redux
      await Promise.all([
        dispatch(fetchGroupById(groupId)).unwrap(),
        dispatch(fetchAnnouncementsForGroup(groupId)).unwrap(),
        dispatch(fetchGroupMembers(groupId)).unwrap(),
        dispatch(fetchGroupMeetings(groupId)).unwrap(),
        dispatch(fetchGroupMilestones({groupId})).unwrap(),
      ]);
    } catch (error: any) {
      console.error('Error loading group data:', error);
      if (error && error.name !== 'ConditionError') {
        Alert.alert(
          'Error',
          'Failed to load group data. Please try again later.',
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId, dispatch]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const navigateToGroupMembers = () => {
    navigation.navigate('GroupMembers', {
      groupId,
      groupName,
    });
  };

  const navigateToGroupAnnouncements = () => {
    navigation.navigate('GroupAnnouncements', {
      groupId,
      groupName,
    });
  };

  const navigateToGroupTreasury = () => {
    navigation.navigate('GroupTreasury', {
      groupId,
      groupName,
    });
  };

  const navigateToGroupSchedule = () => {
    navigation.navigate('GroupSchedule', {
      groupId,
      groupName,
    });
  };

  const navigateToGroupLiterature = () => {
    navigation.navigate('GroupLiterature', {
      groupId,
      groupName,
    });
  };

  const navigateToGroupChat = () => {
    navigation.navigate('GroupChat', {
      groupId,
      groupName,
    });
  };

  const navigateToGroupSponsors = () => {
    navigation.navigate('GroupSponsors', {
      groupId,
      groupName,
    });
  };

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
            setLeaveGroupLoading(true);

            // Use Redux to leave the group
            await dispatch(leaveGroup(groupId)).unwrap();

            // Navigate back to the groups list
            navigation.goBack();
            Alert.alert('Success', `You've left ${groupName}`);
          } catch (error) {
            console.error('Error leaving group:', error);
            Alert.alert(
              'Error',
              'Failed to leave group. Please try again later.',
            );
          } finally {
            setLeaveGroupLoading(false);
          }
        },
      },
    ]);
  };

  // Check if the group is unclaimed
  const isGroupUnclaimed = useCallback(() => {
    return (
      group &&
      (!group.admins || group.admins.length === 0 || group.isClaimed === false)
    );
  }, [group]);

  // Check if the current user has a pending admin request
  const hasPendingAdminRequest = useCallback(() => {
    if (!group || !group.pendingAdminRequests || !currentUser) {
      return false;
    }
    return group.pendingAdminRequests.some(
      request => request.uid === currentUser.uid,
    );
  }, [group, currentUser]);

  // Check if the current user is already an admin
  const isCurrentUserAdmin = useCallback(() => {
    if (!group || !group.admins || !currentUser) {
      return false;
    }
    return group.admins.includes(currentUser.uid);
  }, [group, currentUser]);

  const handleRequestAdminAccess = async () => {
    if (!currentUser) {
      Alert.alert(
        'Please sign in',
        'You must be signed in to request admin access',
      );
      return;
    }

    setRequestSubmitting(true);
    try {
      await dispatch(
        requestGroupAdminAccess({
          groupId,
          userId: currentUser.uid,
          message: adminRequestMessage,
        }),
      ).unwrap();

      setClaimModalVisible(false);
      Alert.alert(
        'Request Submitted',
        'Your request to become an admin for this group has been submitted and is pending review.',
      );
    } catch (error) {
      console.error('Error submitting admin request:', error);
      Alert.alert(
        'Error',
        'Failed to submit your request. Please try again later.',
      );
    } finally {
      setRequestSubmitting(false);
      setAdminRequestMessage('');
    }
  };

  // Format date and time from the Meeting
  const formatMeetingDateTime = (
    meeting: Meeting,
  ): {date: string; time: string} => {
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    // Get the next occurrence of this meeting
    const now = new Date();
    const meetingTime = new Date();
    const [hours, minutes] = meeting.time.split(':').map(Number);
    meetingTime.setHours(hours, minutes, 0, 0);

    // Find the next occurrence of this meeting day
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const meetingDayIndex = days.indexOf(meeting.day.toLowerCase());
    const currentDayIndex = now.getDay();

    let daysUntilNextMeeting = meetingDayIndex - currentDayIndex;
    if (daysUntilNextMeeting <= 0) {
      daysUntilNextMeeting += 7;
    }

    const nextMeetingDate = new Date(now);
    nextMeetingDate.setDate(now.getDate() + daysUntilNextMeeting);
    nextMeetingDate.setHours(hours, minutes, 0, 0);

    return {
      date: nextMeetingDate.toLocaleDateString('en-US', dateOptions),
      time: nextMeetingDate.toLocaleTimeString('en-US', timeOptions),
    };
  };

  // Show loading indicator while initial data is loading
  if (loading && !group) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // Check if group is loaded
  if (!group) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Group not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadGroupData} />
      }
      testID={`group-overview-screen-${groupId}`}>
      {/* Group Info Section */}
      <View style={styles.section} testID="group-info-section">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Group Information</Text>
        </View>

        <View style={styles.groupInfoContainer}>
          <Text style={styles.meetingTimeText}>
            {group.type || '12 Step'} Group
          </Text>
          <Text style={styles.locationText}>
            {group.location || 'Location Unknown'}
          </Text>
          <Text style={styles.meetingTypeText}>
            {group.type || '12 Step'} Meeting
          </Text>
          <Text style={styles.memberCountText}>
            {group.memberCount} Members • Founded{' '}
            {group.foundedDate
              ? formatDate(new Date(group.foundedDate))
              : 'Recently'}
          </Text>
          <Text style={styles.groupDescriptionText}>{group.description}</Text>
        </View>

        {/* Claim Group Button - Only show if group is unclaimed and user doesn't have a pending request */}
        {isGroupUnclaimed() &&
          !hasPendingAdminRequest() &&
          !isCurrentUserAdmin() && (
            <TouchableOpacity
              style={styles.claimGroupButton}
              onPress={() => setClaimModalVisible(true)}
              testID="group-overview-claim-button">
              <Text style={styles.claimGroupButtonText}>
                Is this your group? Request admin access
              </Text>
            </TouchableOpacity>
          )}

        {/* Show pending status if user has submitted a request */}
        {hasPendingAdminRequest() && (
          <View
            style={styles.pendingRequestContainer}
            testID="group-overview-pending-request">
            <Text style={styles.pendingRequestText}>
              Admin request pending review
            </Text>
          </View>
        )}
      </View>

      {/* Members section */}
      {/* <TouchableOpacity
        style={styles.section}
        onPress={() =>
          navigation.navigate('GroupMembers', {
            groupId: groupId,
            groupName: group.name,
          })
        }>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members</Text>
          <Text style={styles.sectionCount}>{group.memberCount || 0}</Text>
        </View>
        <Text style={styles.sectionDescription}>
          View and manage group members
        </Text>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>

      </TouchableOpacity> */}

      {/* Navigation Tiles */}
      <View style={styles.navTilesContainer}>
        <TouchableOpacity
          style={styles.navTile}
          onPress={navigateToGroupMembers}
          testID="group-overview-members-tile">
          <View style={styles.navTileIcon}>
            <Text style={styles.navTileIconText}>👥</Text>
          </View>
          <Text style={styles.navTileText}>Members</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTile}
          onPress={navigateToGroupAnnouncements}
          testID="group-overview-announcements-tile">
          <View style={styles.navTileIcon}>
            <Text style={styles.navTileIconText}>📢</Text>
          </View>
          <Text style={styles.navTileText}>Announcements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTile}
          onPress={navigateToGroupTreasury}
          testID="group-overview-treasury-tile">
          <View style={styles.navTileIcon}>
            <Text style={styles.navTileIconText}>💰</Text>
          </View>
          <Text style={styles.navTileText}>Treasury</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTile}
          onPress={navigateToGroupSchedule}
          testID="group-overview-schedule-tile">
          <View style={styles.navTileIcon}>
            <Text style={styles.navTileIconText}>📅</Text>
          </View>
          <Text style={styles.navTileText}>Meetings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTile}
          onPress={navigateToGroupChat}
          testID="group-overview-chat-tile">
          <View style={styles.navTileIcon}>
            <Text style={styles.navTileIconText}>💬</Text>
          </View>
          <Text style={styles.navTileText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTile, {opacity: 0.5}]}
          disabled={true}
          testID="group-overview-literature-tile"
          onPress={navigateToGroupLiterature}>
          <View style={styles.navTileIcon}>
            <Text style={styles.navTileIconText}>📚</Text>
          </View>
          <Text style={styles.navTileText}>Literature</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTile}
          onPress={navigateToGroupSponsors}
          testID="group-overview-sponsors-tile">
          <View style={styles.navTileIcon}>
            <Text style={styles.navTileIconText}>🤝</Text>
          </View>
          <Text style={styles.navTileText}>Sponsors</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTile}
          onPress={() =>
            navigation.navigate('GroupServicePositions', {groupId, groupName})
          }>
          <View style={styles.navTileIcon}>
            <Text style={styles.navTileIconText}>🧑‍🤝‍🧑</Text>
          </View>
          <Text style={styles.navTileText}>Service Positions</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Actions */}
      {group.admins && group.admins.includes(auth().currentUser?.uid || '') && (
        <View style={styles.section} testID="group-admin-actions-section">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Admin Actions</Text>
          </View>

          <TouchableOpacity
            style={styles.adminButton}
            onPress={() =>
              navigation.navigate('GroupEditDetails', {
                groupId,
                groupName,
              })
            }
            testID="group-admin-edit-button">
            <Text style={styles.adminButtonText}>Edit Group Details</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upcoming Meetings Section */}
      <View style={styles.section} testID="group-upcoming-meetings-section">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
          <TouchableOpacity
            onPress={navigateToGroupSchedule}
            testID="group-overview-view-schedule-button">
            <Text style={styles.seeAllText}>View Full Schedule</Text>
          </TouchableOpacity>
        </View>

        {meetings && meetings.length > 0 ? (
          // Sort meetings by next occurrence
          [...meetings]
            .sort((a, b) => {
              const days = [
                'sunday',
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
              ];
              const now = new Date();
              const currentDayIndex = now.getDay();

              const aDayIndex = days.indexOf(a.day.toLowerCase());
              const bDayIndex = days.indexOf(b.day.toLowerCase());

              let aDaysUntilNext = aDayIndex - currentDayIndex;
              let bDaysUntilNext = bDayIndex - currentDayIndex;

              if (aDaysUntilNext <= 0) aDaysUntilNext += 7;
              if (bDaysUntilNext <= 0) bDaysUntilNext += 7;

              return aDaysUntilNext - bDaysUntilNext;
            })
            .slice(0, 3) // Show only the next 3 meetings
            .map(meeting => {
              const {date: meetingDate, time: meetingTime} =
                formatMeetingDateTime(meeting);
              return (
                <View
                  key={meeting.id}
                  style={styles.meetingItem}
                  testID={`group-overview-meeting-${meeting.id}`}>
                  <View style={styles.meetingTimeContainer}>
                    <Text style={styles.meetingDateText}>{meetingDate}</Text>
                    <Text style={styles.meetingTime}>{meetingTime}</Text>
                  </View>
                  <View style={styles.meetingContent}>
                    <Text style={styles.meetingName}>{meeting.name}</Text>
                    <Text style={styles.meetingLocation}>
                      {meeting.online
                        ? 'Online Meeting'
                        : meeting.locationName ||
                          meeting.address ||
                          'Location TBD'}
                    </Text>
                    <Text style={styles.meetingFormat}>
                      {meeting.format || meeting.type}
                    </Text>
                    {meeting.temporaryNotice && (
                      <View style={styles.noticeContainer}>
                        <Icon
                          name="information-outline"
                          size={14}
                          color="#FFA000"
                          style={{marginRight: 4}}
                        />
                        <Text style={styles.noticeText}>
                          {meeting.temporaryNotice}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
        ) : (
          <Text
            style={styles.emptyStateText}
            testID="group-overview-no-meetings">
            No upcoming meetings scheduled.
          </Text>
        )}
      </View>

      {/* Announcements Section */}
      <View style={styles.section} testID="group-announcements-section">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          <TouchableOpacity
            onPress={navigateToGroupAnnouncements}
            testID="group-overview-view-announcements-button">
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {announcements.length > 0 ? (
          announcements.slice(0, 2).map(announcement => (
            <View
              key={announcement.id}
              style={styles.announcementItem}
              testID={`group-overview-announcement-${announcement.id}`}>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementMessage} numberOfLines={2}>
                {announcement.content}
              </Text>
              <View style={styles.announcementFooter}>
                <Text style={styles.announcementMeta}>
                  Posted by {announcement.authorName} on{' '}
                  {formatDate(announcement.createdAt)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text
            style={styles.emptyStateText}
            testID="group-overview-no-announcements">
            No announcements
          </Text>
        )}
      </View>

      {/* Celebrations Section */}
      <View style={styles.section} testID="group-celebrations-section">
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Celebrations</Text>
        </View>

        {celebrations.length > 0 ? (
          celebrations.map((celebration: GroupMilestone, index: number) => (
            <View
              key={index}
              style={styles.celebrationItem}
              testID={`group-overview-celebration-${index}`}>
              <View style={styles.celebrationIcon}>
                <Text style={styles.celebrationIconText}>🎉</Text>
              </View>
              <View style={styles.celebrationInfo}>
                <Text style={styles.celebrationName}>
                  {celebration.memberName} - {celebration.years}{' '}
                  {celebration.years === 1 ? 'Year' : 'Years'}
                </Text>
                <Text style={styles.celebrationDate}>
                  {formatDate(celebration.date)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text
            style={styles.emptyStateText}
            testID="group-overview-no-celebrations">
            No upcoming celebrations
          </Text>
        )}
      </View>

      {/* Leave Group Button */}
      <TouchableOpacity
        style={styles.leaveGroupButton}
        onPress={handleLeaveGroup}
        disabled={leaveGroupLoading}
        testID="group-overview-leave-button">
        {leaveGroupLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.leaveGroupButtonText}>Leave Group</Text>
        )}
      </TouchableOpacity>

      {/* Claim Group Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={claimModalVisible}
        onRequestClose={() => setClaimModalVisible(false)}
        testID="group-claim-modal">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Admin Access</Text>

            <Text style={styles.modalDescription}>
              As a group admin, you'll help maintain accurate meeting
              information and details for the recovery community.
            </Text>

            <Text style={styles.inputLabel}>
              Please explain your connection to this group:
            </Text>
            <TextInput
              style={styles.messageInput}
              multiline={true}
              numberOfLines={4}
              placeholder="e.g., 'I am the group secretary' or 'I attend regularly'"
              value={adminRequestMessage}
              onChangeText={setAdminRequestMessage}
              testID="group-claim-message-input"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setClaimModalVisible(false);
                  setAdminRequestMessage('');
                }}
                testID="group-claim-cancel-button">
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleRequestAdminAccess}
                disabled={requestSubmitting}
                testID="group-claim-submit-button">
                {requestSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  groupInfoContainer: {
    marginBottom: 12,
  },
  meetingTimeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 4,
  },
  meetingTypeText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  memberCountText: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 12,
  },
  groupDescriptionText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    marginBottom: 16,
  },
  navTilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 12,
  },
  navTile: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navTileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  navTileIconText: {
    fontSize: 24,
  },
  navTileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  adminButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  adminButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  meetingItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3', // Default blue border
  },
  cancelledItem: {
    borderLeftColor: '#D32F2F', // Red border for cancelled
    backgroundColor: '#FFF0F0', // Lighter red background
  },
  meetingTimeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    minWidth: 100, // Adjusted width
  },
  meetingDateText: {
    // New style for Date
    fontSize: 13,
    color: '#757575',
    marginBottom: 4,
    textAlign: 'center',
  },
  meetingTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  cancelledText: {
    // Style for CANCELLED text
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginTop: 4,
  },
  meetingContent: {
    flex: 1,
    paddingLeft: 16,
  },
  meetingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  meetingLocation: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  meetingFormat: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 6, // Added margin
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 6, // Added margin
    alignSelf: 'flex-start', // Prevent full width
  },
  noticeText: {
    fontSize: 12,
    color: '#FFA000',
    flexShrink: 1, // Allow text to wrap
  },
  cancelledNoticeContainer: {
    backgroundColor: '#FFEBEE',
  },
  cancelledNoticeText: {
    color: '#D32F2F',
  },
  announcementItem: {
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 12,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  announcementMessage: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
    lineHeight: 20,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementMeta: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  celebrationItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  celebrationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  celebrationIconText: {
    fontSize: 20,
  },
  celebrationInfo: {
    flex: 1,
  },
  celebrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  celebrationDate: {
    fontSize: 14,
    color: '#757575',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  leaveGroupButton: {
    backgroundColor: '#FFEBEE',
    margin: 16,
    marginTop: 4,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  leaveGroupButtonText: {
    color: '#F44336',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionCount: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#757575',
  },
  arrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  claimGroupButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  claimGroupButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  pendingRequestContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  pendingRequestText: {
    color: '#FFA000',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#212121',
  },
  modalDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 12,
    fontSize: 14,
    color: '#212121',
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#757575',
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default GroupOverviewScreen;
