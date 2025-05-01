import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import types and Redux
import {GroupStackParamList} from '../../types/navigation'; // Adjust path as needed
import {Meeting, MeetingInstance} from '../../types'; // Adjust path as needed
import {useAppDispatch, useAppSelector} from '../../store';
import {
  fetchGroupById,
  selectGroupById,
  selectGroupsStatus,
} from '../../store/slices/groupsSlice';
import {
  fetchUpcomingMeetingInstances,
  selectUpcomingMeetingInstances,
  fetchGroupMeetings, // Fetch meeting templates
  selectGroupMeetingTemplateIds, // Correct selector name
  selectMeetingsStatus,
  selectMeetingById, // To get data for editing
} from '../../store/slices/meetingsSlice';
// import MeetingEditModal from '../../components/meetings/MeetingEditModal'; // Comment out for now

type GroupScheduleScreenRouteProp = RouteProp<
  GroupStackParamList,
  'GroupSchedule'
>;
type GroupScheduleScreenNavigationProp = StackNavigationProp<
  GroupStackParamList,
  'GroupSchedule'
>;

const GroupScheduleScreen: React.FC = () => {
  const route = useRoute<GroupScheduleScreenRouteProp>();
  const navigation = useNavigation<GroupScheduleScreenNavigationProp>();
  const {groupId, groupName} = route.params;
  const currentUser = auth().currentUser;

  const dispatch = useAppDispatch();

  // Get data from Redux store
  const group = useAppSelector(state => selectGroupById(state, groupId));
  const upcomingInstances = useAppSelector(state =>
    selectUpcomingMeetingInstances(state, groupId),
  );
  const meetingTemplates = useAppSelector(
    state =>
      selectGroupMeetingTemplateIds(state, groupId)
        .map(id => useAppSelector(state => selectMeetingById(state, id)))
        .filter((m): m is Meeting => !!m), // Get full template objects
  );
  const meetingsStatus = useAppSelector(selectMeetingsStatus);
  const groupsStatus = useAppSelector(selectGroupsStatus);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false); // Flag to show templates as fallback
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedMeetingToEdit, setSelectedMeetingToEdit] =
    useState<Meeting | null>(null);

  // Correct admin check using only 'admins' if 'adminUids' doesn't exist on HomeGroup type
  const isCurrentUserAdmin = group?.admins?.includes(currentUser?.uid || '');

  const loadScheduleData = useCallback(async () => {
    setIsLoading(true);
    setRefreshing(true);
    try {
      // Fetch instances first
      await dispatch(fetchUpcomingMeetingInstances(groupId)).unwrap();
      // Check if instances were fetched - need access to the result or updated state
      // For now, we'll check the state *after* the fetch completes in useEffect

      // Fetch group details (needed for admin check)
      await dispatch(fetchGroupById(groupId)).unwrap();
    } catch (error: any) {
      console.error('Error loading group schedule data:', error);
      if (error?.name !== 'ConditionError') {
        // Avoid duplicate errors if already handled
        Alert.alert(
          'Error',
          'Failed to load schedule data. Please try again later.',
        );
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [groupId, dispatch]);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  // Effect to decide whether to fetch/show templates
  useEffect(() => {
    // Only run this check once loading is finished and instances have been fetched (or failed)
    if (!isLoading && meetingsStatus !== 'loading') {
      if (upcomingInstances.length === 0) {
        setShowTemplates(true);
        // Fetch templates only if no instances are found and templates aren't loaded
        if (meetingTemplates.length === 0) {
          console.log(
            `No instances found for group ${groupId}, fetching templates...`,
          );
          dispatch(fetchGroupMeetings(groupId));
        }
      } else {
        setShowTemplates(false);
      }
    }
  }, [
    isLoading,
    meetingsStatus,
    upcomingInstances,
    meetingTemplates,
    groupId,
    dispatch,
  ]);

  const handleEditMeeting = (meetingId: string) => {
    // Explicitly type the parameter in find callback
    const meetingToEdit = meetingTemplates.find(
      (m: Meeting) => m.id === meetingId,
    );
    if (meetingToEdit) {
      setSelectedMeetingToEdit(meetingToEdit);
      // setIsEditModalVisible(true); // Comment out modal usage for now
    }
  };

  const renderMeetingItem = ({item}: {item: MeetingInstance | Meeting}) => {
    const isInstance = 'instanceId' in item;
    const scheduledAt = isInstance
      ? (item as MeetingInstance).scheduledAt
      : undefined;
    const dateStr = scheduledAt
      ? moment(scheduledAt).format('ddd, MMM D')
      : (item as Meeting).day;
    const timeStr = scheduledAt
      ? moment(scheduledAt).format('h:mm A')
      : (item as Meeting).time;
    const isCancelled = isInstance
      ? (item as MeetingInstance).isCancelled
      : false;
    const notice = isInstance
      ? (item as MeetingInstance).instanceNotice ||
        (item as MeetingInstance).temporaryNotice
      : null;
    // Use 'online' property which exists on both types (adjusting for boolean value)
    const isOnline = item.online ?? false;
    const locationDisplay = isOnline
      ? 'Online Meeting'
      : item.locationName || item.address || 'Location TBD';

    return (
      <View
        style={[
          styles.meetingItemContainer,
          isCancelled && styles.cancelledItem,
        ]}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dayText}>
            {dateStr ? dateStr.toUpperCase() : 'TBD'}
          </Text>
          <Text style={styles.timeText}>{timeStr || 'Time TBD'}</Text>
          {isCancelled && <Text style={styles.cancelledText}>CANCELLED</Text>}
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.meetingName}>{item.name}</Text>
          {!isCancelled && (
            <Text style={styles.locationText}>{locationDisplay}</Text>
          )}
          {notice && (
            <View
              style={[
                styles.noticeContainer,
                isCancelled && styles.cancelledNotice,
              ]}>
              <Icon
                name={isCancelled ? 'cancel' : 'information-outline'}
                size={14}
                color={
                  isCancelled
                    ? styles.cancelledNoticeText.color
                    : styles.noticeText.color
                }
                style={{marginRight: 4}}
              />
              <Text
                style={[
                  styles.noticeText,
                  isCancelled && styles.cancelledNoticeText,
                ]}>
                {notice}
              </Text>
            </View>
          )}
        </View>
        {!isInstance && isCurrentUserAdmin && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditMeeting(item.id!)}>
            <Icon
              name="pencil-outline"
              size={20}
              color={styles.editButtonText.color}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading && meetingsStatus === 'loading') {
      return (
        <ActivityIndicator
          size="large"
          color="#2196F3"
          style={{marginTop: 50}}
        />
      );
    }

    const dataToShow = showTemplates ? meetingTemplates : upcomingInstances;
    const listTitle = showTemplates ? 'Meeting Schedule' : 'Upcoming Meetings';
    const emptyText = showTemplates
      ? 'No meetings found for this group. An admin can add them.'
      : 'No upcoming meetings scheduled for the next week.';

    return (
      <>
        <Text style={styles.listTitle}>{listTitle}</Text>
        {showTemplates && upcomingInstances.length === 0 && (
          <Text style={styles.fallbackNotice}>
            Showing recurring schedule as no specific instances were found for
            the upcoming week.
          </Text>
        )}
        <FlatList
          data={dataToShow}
          renderItem={renderMeetingItem}
          keyExtractor={(item: MeetingInstance | Meeting, index: number) =>
            ('instanceId' in item ? item.instanceId : item.id) ??
            `no-id-${index}`
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon
                name={showTemplates ? 'calendar-clock' : 'calendar-check'}
                size={64}
                color="#BBDEFB"
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>
                {showTemplates
                  ? 'No Recurring Meetings'
                  : 'No Upcoming Meetings'}
              </Text>
              <Text style={styles.emptyText}>
                {showTemplates
                  ? isCurrentUserAdmin
                    ? 'No meetings have been created yet. Press the button below to add meetings.'
                    : 'No recurring meetings have been set up yet. Check back later or contact a group admin.'
                  : isCurrentUserAdmin
                  ? 'Add some upcoming meetings to keep your group members informed about when to meet.'
                  : 'No upcoming meetings have been scheduled. Check back later or contact a group admin.'}
              </Text>
              {isCurrentUserAdmin && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() =>
                    navigation.navigate('GroupSchedule', {groupId, groupName})
                  }>
                  <Text style={styles.addButtonText}>Add Meeting</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          contentContainerStyle={{paddingBottom: 20}}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadScheduleData}
          />
        }>
        {renderContent()}
      </ScrollView>

      {/* Keep Modal commented out */}
      {/* {selectedMeetingToEdit && (
        <MeetingEditModal
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedMeetingToEdit(null);
          }}
          meeting={selectedMeetingToEdit}
          groupId={groupId}
        />
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textAlign: 'center',
  },
  fallbackNotice: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#757575',
    paddingHorizontal: 16,
    paddingBottom: 12,
    textAlign: 'center',
  },
  meetingItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  cancelledItem: {
    backgroundColor: '#FFF0F0', // Lighter red for cancelled
    opacity: 0.7,
  },
  dateTimeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 12,
    marginRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
    minWidth: 80, // Ensure consistent width
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  cancelledText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginTop: 4,
  },
  detailsContainer: {
    flex: 1, // Take remaining space
  },
  meetingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  noticeText: {
    fontSize: 12,
    color: '#FFA000',
    flexShrink: 1,
  },
  cancelledNotice: {
    backgroundColor: '#FFEBEE',
  },
  cancelledNoticeText: {
    color: '#D32F2F',
  },
  editButton: {
    padding: 8, // Make touch target larger
    marginLeft: 8,
  },
  editButtonText: {
    color: '#2196F3', // Consistent blue color
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 16,
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
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupScheduleScreen;
