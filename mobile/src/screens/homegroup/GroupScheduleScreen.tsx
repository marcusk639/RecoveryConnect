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
  FlatList,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {GroupStackParamList} from '../../types/navigation';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Interface for meeting data
interface Meeting {
  id: string;
  name: string;
  day: string;
  time: string;
  format: string;
  online: boolean;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  link?: string;
}

type GroupScheduleScreenProps = {
  navigation: StackNavigationProp<GroupStackParamList, 'GroupSchedule'>;
  route: RouteProp<GroupStackParamList, 'GroupSchedule'>;
};

const GroupScheduleScreen: React.FC<GroupScheduleScreenProps> = ({
  navigation,
  route,
}) => {
  const {groupId, groupName} = route.params;
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeetings();
  }, [groupId]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch meetings from Firestore
      const meetingsSnapshot = await firestore()
        .collection('meetings')
        .where('groupId', '==', groupId)
        .get();

      const meetingsData: Meeting[] = [];
      meetingsSnapshot.forEach(doc => {
        meetingsData.push({
          id: doc.id,
          ...doc.data(),
        } as Meeting);
      });

      // Sort meetings by day and time
      const sortedMeetings = sortMeetingsByDayAndTime(meetingsData);
      setMeetings(sortedMeetings);
    } catch (err) {
      console.error('Error loading meetings:', err);
      setError('Failed to load meeting schedule. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to sort meetings by day and time
  const sortMeetingsByDayAndTime = (meetingsList: Meeting[]): Meeting[] => {
    const dayOrder = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    return [...meetingsList].sort((a, b) => {
      // First sort by day
      const dayA = dayOrder.indexOf(a.day);
      const dayB = dayOrder.indexOf(b.day);

      if (dayA !== dayB) {
        return dayA - dayB;
      }

      // If same day, sort by time
      return a.time.localeCompare(b.time);
    });
  };

  // Format time for display (e.g., "7:00 PM")
  const formatTime = (time: string): string => {
    return time; // Assuming time is already formatted correctly
  };

  // Render a meeting item
  const renderMeetingItem = ({item}: {item: Meeting}) => (
    <View style={styles.meetingCard}>
      <View style={styles.meetingHeader}>
        <Text style={styles.meetingName}>{item.name}</Text>
        <View style={styles.meetingBadge}>
          <Text style={styles.meetingBadgeText}>
            {item.online ? 'Online' : 'In-Person'}
          </Text>
        </View>
      </View>

      <View style={styles.meetingDetails}>
        <View style={styles.meetingDetailRow}>
          <Text style={styles.meetingDetailLabel}>Day:</Text>
          <Text style={styles.meetingDetailValue}>{item.day}</Text>
        </View>
        <View style={styles.meetingDetailRow}>
          <Text style={styles.meetingDetailLabel}>Time:</Text>
          <Text style={styles.meetingDetailValue}>{formatTime(item.time)}</Text>
        </View>
        <View style={styles.meetingDetailRow}>
          <Text style={styles.meetingDetailLabel}>Format:</Text>
          <Text style={styles.meetingDetailValue}>{item.format}</Text>
        </View>
      </View>

      {item.online && item.link && (
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

      {!item.online && item.address && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Location:</Text>
          <Text style={styles.locationText}>
            {item.address}
            {item.city && item.state && `, ${item.city}, ${item.state}`}
            {item.zip && ` ${item.zip}`}
          </Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={loadMeetings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : meetings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No meetings scheduled for this group.
          </Text>
        </View>
      ) : (
        <FlatList
          data={meetings}
          renderItem={renderMeetingItem}
          keyExtractor={item => item.id}
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
  },
  meetingBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  meetingBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2196F3',
  },
  meetingDetails: {
    marginBottom: 12,
  },
  meetingDetailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  meetingDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    width: 60,
  },
  meetingDetailValue: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },
  joinButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  locationContainer: {
    marginTop: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#212121',
  },
});

export default GroupScheduleScreen;
