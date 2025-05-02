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
import LoadingOverlay from '../../components/common/LoadingOverlay';

// Import types and Redux
import {GroupStackParamList} from '../../types/navigation';
import {Meeting} from '../../types';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  fetchGroupById,
  selectGroupById,
  selectGroupsStatus,
} from '../../store/slices/groupsSlice';
import {
  fetchGroupMeetings,
  selectGroupMeetings,
  selectMeetingsStatus,
  selectMeetingById,
  createMeeting,
  updateMeeting,
} from '../../store/slices/meetingsSlice';
import MeetingModal from '../../components/meetings/MeetingModal';

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
  const meetings = useAppSelector(state => selectGroupMeetings(state, groupId));
  const meetingsStatus = useAppSelector(selectMeetingsStatus);
  const groupsStatus = useAppSelector(selectGroupsStatus);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [errors, setErrors] = useState<{
    day?: string;
    time?: string;
    location?: string;
    address?: string;
    link?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCurrentUserAdmin = group?.admins?.includes(currentUser?.uid || '');

  const loadScheduleData = useCallback(async () => {
    setIsLoading(true);
    setRefreshing(true);
    try {
      await dispatch(fetchGroupMeetings(groupId)).unwrap();
      await dispatch(fetchGroupById(groupId)).unwrap();
    } catch (error: any) {
      console.error('Error loading group schedule data:', error);
      if (error?.name !== 'ConditionError') {
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

  const handleAddMeeting = () => {
    setSelectedMeeting(null);
    setIsModalVisible(true);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsModalVisible(true);
  };

  const handleSubmitMeeting = async (meetingData: Partial<Meeting>) => {
    setIsSubmitting(true);
    try {
      if (selectedMeeting?.id) {
        await dispatch(
          updateMeeting({meetingId: selectedMeeting.id, meetingData}),
        ).unwrap();
      } else {
        await dispatch(createMeeting({groupId, meetingData})).unwrap();
      }
      setIsModalVisible(false);
      setSelectedMeeting(null);
      loadScheduleData();
    } catch (error: any) {
      console.error('Error saving meeting:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to save meeting. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMeetingItem = ({item}: {item: Meeting}) => {
    const isOnline = item.online ?? false;
    const locationDisplay = isOnline
      ? 'Online Meeting'
      : item.locationName || item.address || 'Location TBD';

    return (
      <View style={styles.meetingItemContainer}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dayText}>
            {item.day ? item.day.toUpperCase() : 'TBD'}
          </Text>
          <Text style={styles.timeText}>{item.time || 'Time TBD'}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.meetingName}>{item.name}</Text>
          <Text style={styles.locationText}>{locationDisplay}</Text>
        </View>
        {isCurrentUserAdmin && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditMeeting(item)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            accessibilityLabel="Edit meeting"
            accessibilityHint="Double tap to edit this meeting">
            <View style={styles.editButtonContent}>
              <Icon
                name="pencil-outline"
                size={20}
                color={styles.editButtonText.color}
              />
              <Text style={styles.editButtonLabel}>Edit</Text>
            </View>
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

    return (
      <>
        <View style={{paddingVertical: 5}} />
        <FlatList
          data={meetings}
          renderItem={renderMeetingItem}
          keyExtractor={(item: Meeting) => item.id ?? `no-id-${item.name}`}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon
                name="calendar-clock"
                size={64}
                color="#BBDEFB"
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No Meetings</Text>
              <Text style={styles.emptyText}>
                {isCurrentUserAdmin
                  ? 'No meetings have been created yet. Press the button below to add meetings.'
                  : 'No meetings have been set up yet. Check back later or contact a group admin.'}
              </Text>
            </View>
          }
          contentContainerStyle={{paddingBottom: 20}}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading && <LoadingOverlay message="Loading schedule..." />}
      {isSubmitting && <LoadingOverlay message="Saving meeting..." />}

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

      {isCurrentUserAdmin && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMeeting}
          activeOpacity={0.8}>
          <Icon name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Meeting</Text>
        </TouchableOpacity>
      )}

      <MeetingModal
        formContainerStyle={{backgroundColor: 'white'}}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedMeeting(null);
          setErrors({});
        }}
        onSubmit={handleSubmitMeeting}
        initialMeeting={selectedMeeting || undefined}
        errors={errors}
      />
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
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    color: '#2196F3',
  },
  editButtonLabel: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default GroupScheduleScreen;
