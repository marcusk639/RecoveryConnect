import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {GroupStackParamList} from '../../types/navigation';
import {Meeting, MeetingInstance} from '../../types';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  fetchUpcomingMeetingInstances,
  selectUpcomingMeetingInstances,
  selectMeetingsStatus,
  selectMeetingsError,
} from '../../store/slices/meetingsSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type GroupScheduleScreenProps = {
  navigation: StackNavigationProp<GroupStackParamList, 'GroupSchedule'>;
  route: RouteProp<GroupStackParamList, 'GroupSchedule'>;
};

const GroupScheduleScreen: React.FC<GroupScheduleScreenProps> = ({
  navigation,
  route,
}) => {
  const {groupId, groupName} = route.params;
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const meetingInstances = useAppSelector(state =>
    selectUpcomingMeetingInstances(state, groupId),
  );
  const status = useAppSelector(selectMeetingsStatus);
  const error = useAppSelector(selectMeetingsError);
  const loading = status === 'loading';

  useEffect(() => {
    // Dispatch the action to fetch meeting instances
    dispatch(fetchUpcomingMeetingInstances(groupId));
  }, [groupId, dispatch]);

  // Format date and time from the MeetingInstance
  const formatDateTime = (date?: Date): string => {
    if (!date) return 'TBD';
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Render a meeting instance item
  const renderMeetingInstanceItem = ({item}: {item: MeetingInstance}) => (
    <View
      style={[styles.meetingCard, item.isCancelled && styles.cancelledCard]}>
      <View style={styles.meetingHeader}>
        <Text style={styles.meetingName}>{item.name}</Text>
        {item.isCancelled ? (
          <View style={[styles.meetingBadge, styles.cancelledBadge]}>
            <Text style={[styles.meetingBadgeText, styles.cancelledBadgeText]}>
              Cancelled
            </Text>
          </View>
        ) : (
          <View
            style={[styles.meetingBadge, item.isOnline && styles.onlineBadge]}>
            <Text
              style={[
                styles.meetingBadgeText,
                item.isOnline && styles.onlineBadgeText,
              ]}>
              {item.isOnline ? 'Online' : 'In-Person'}
            </Text>
          </View>
        )}
      </View>

      {(item.instanceNotice || item.temporaryNotice) && !item.isCancelled && (
        <View style={styles.noticeContainer}>
          <Icon name="information-outline" size={16} color="#FFA000" />
          <Text style={styles.noticeText}>
            {item.instanceNotice || item.temporaryNotice}
          </Text>
        </View>
      )}

      {item.isCancelled && item.instanceNotice && (
        <View style={styles.noticeContainer}>
          <Icon name="cancel" size={16} color="#D32F2F" />
          <Text style={[styles.noticeText, styles.cancelledNoticeText]}>
            {item.instanceNotice}
          </Text>
        </View>
      )}

      <View style={styles.meetingDetails}>
        <View style={styles.meetingDetailRow}>
          <Icon
            name="calendar-clock"
            size={16}
            color="#757575"
            style={styles.detailIcon}
          />
          <Text style={styles.meetingDetailValue}>
            {formatDateTime(item.scheduledAt)}
          </Text>
        </View>
        <View style={styles.meetingDetailRow}>
          <Icon
            name="tag-outline"
            size={16}
            color="#757575"
            style={styles.detailIcon}
          />
          <Text style={styles.meetingDetailValue}>
            {item.format || 'Standard'}
          </Text>
        </View>
      </View>

      {!item.isCancelled && item.isOnline && item.link && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => {
            // Handle joining online meeting
            Alert.alert(
              'Join Meeting',
              'This feature will open the meeting link.',
            );
          }}>
          <Text style={styles.joinButtonText}>Join Online</Text>
        </TouchableOpacity>
      )}

      {!item.isCancelled &&
        !item.isOnline &&
        (item.address || item.locationName) && (
          <View style={styles.locationContainer}>
            <Icon
              name="map-marker-outline"
              size={16}
              color="#757575"
              style={styles.detailIcon}
            />
            <View style={styles.locationDetails}>
              {item.locationName && (
                <Text style={styles.locationNameText}>{item.locationName}</Text>
              )}
              <Text style={styles.locationText}>
                {item.address}
                {item.city && item.state && `, ${item.city}, ${item.state}`}
                {item.zip && ` ${item.zip}`}
              </Text>
            </View>
          </View>
        )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(fetchUpcomingMeetingInstances(groupId))}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : meetingInstances.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No meetings scheduled for this group.
          </Text>
        </View>
      ) : (
        <FlatList
          data={meetingInstances}
          renderItem={renderMeetingInstanceItem}
          keyExtractor={item => item.instanceId}
          contentContainerStyle={styles.meetingsList}
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#2196F3',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  meetingsList: {
    padding: 16,
  },
  meetingCard: {
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
  cancelledCard: {
    backgroundColor: '#fce8e6',
    borderColor: '#ea4335',
    borderWidth: 1,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  meetingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  meetingBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  meetingBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E88E5',
  },
  onlineBadge: {
    backgroundColor: '#E8F5E9',
  },
  onlineBadgeText: {
    color: '#388E3C',
  },
  cancelledBadge: {
    backgroundColor: '#FAD2CF',
  },
  cancelledBadgeText: {
    color: '#D32F2F',
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  noticeText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#FFA000',
    flex: 1,
  },
  cancelledNoticeText: {
    color: '#D32F2F',
    fontWeight: '500',
  },
  meetingDetails: {
    marginBottom: 12,
  },
  meetingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
  },
  meetingDetailValue: {
    fontSize: 14,
    color: '#424242',
    flex: 1,
  },
  joinButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationNameText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});

export default GroupScheduleScreen;
