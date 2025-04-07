import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

// Import types
import {GroupTabParamList, GroupStackParamList} from '../../types/navigation';

// Import components
import GroupInviteModal from '../../components/groups/GroupInviteModal';

// Types for home screen data
interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  createdBy: string;
}

interface Meeting {
  id: string;
  name: string;
  dayOfWeek: string;
  time: string;
  location: string;
  format: string;
}

interface Celebration {
  id: string;
  memberName: string;
  years: number;
  celebrationDate: Date;
}

interface HomeGroup {
  id: string;
  name: string;
  description: string;
  meetingDay: string;
  meetingTime: string;
  location: string;
  type: string;
  memberCount: number;
  foundedDate: string;
  isAdmin: boolean;
}

type GroupOverviewScreenRouteProp = RouteProp<
  GroupTabParamList,
  'GroupOverview'
>;
type GroupOverviewScreenNavigationProp =
  StackNavigationProp<GroupStackParamList>;

const GroupOverviewScreen: React.FC = () => {
  const route = useRoute<GroupOverviewScreenRouteProp>();
  const navigation = useNavigation<GroupOverviewScreenNavigationProp>();
  const {groupId} = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  // Data states
  const [group, setGroup] = useState<HomeGroup | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be fetched from Firestore
      // For now, we'll use mock data

      // Mock group data
      const mockGroup: HomeGroup = {
        id: groupId,
        name: 'Serenity Now Group',
        description:
          'A welcoming group focused on practical application of the principles. Meeting since 2010.',
        meetingDay: 'Tuesday',
        meetingTime: '7:00 PM',
        location: 'Community Center, Room 101, 123 Main St.',
        type: 'Open Discussion',
        memberCount: 35,
        foundedDate: '2010-05-15',
        isAdmin: true, // Current user is an admin
      };
      setGroup(mockGroup);

      // Mock announcements
      const mockAnnouncements: Announcement[] = [
        {
          id: '1',
          title: 'Group Inventory',
          message:
            'We will be conducting our annual group inventory after the meeting on May 15th. All members are encouraged to attend and participate.',
          createdAt: new Date('2024-04-30'),
          createdBy: 'J',
        },
        {
          id: '2',
          title: 'Literature Order',
          message:
            'We will be placing a bulk literature order next week. Please let M. know if you need any specific books or pamphlets.',
          createdAt: new Date('2024-04-25'),
          createdBy: 'M',
        },
      ];
      setAnnouncements(mockAnnouncements);

      // Mock upcoming meetings
      const mockMeetings: Meeting[] = [
        {
          id: '1',
          name: 'Regular Meeting',
          dayOfWeek: 'Tuesday',
          time: '7:00 PM',
          location: 'Community Center, Room 101',
          format: 'Open Discussion',
        },
        {
          id: '2',
          name: 'Business Meeting',
          dayOfWeek: 'Last Tuesday',
          time: '8:30 PM',
          location: 'Community Center, Room 101',
          format: 'Group Conscience',
        },
      ];
      setUpcomingMeetings(mockMeetings);

      // Mock celebrations
      const mockCelebrations: Celebration[] = [
        {
          id: '1',
          memberName: 'T',
          years: 1,
          celebrationDate: new Date('2024-05-15'),
        },
        {
          id: '2',
          memberName: 'S',
          years: 5,
          celebrationDate: new Date('2024-05-22'),
        },
      ];
      setCelebrations(mockCelebrations);
    } catch (error) {
      console.error('Error loading group data:', error);
      Alert.alert(
        'Error',
        'Failed to load group data. Please try again later.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadGroupData} />
      }>
      {/* Group Info Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Group Information</Text>
        </View>

        {group && (
          <View style={styles.groupInfoContainer}>
            <Text style={styles.meetingTimeText}>
              {group.meetingDay}s at {group.meetingTime}
            </Text>
            <Text style={styles.locationText}>{group.location}</Text>
            <Text style={styles.meetingTypeText}>{group.type} Meeting</Text>
            <Text style={styles.memberCountText}>
              {group.memberCount} Members • Founded{' '}
              {formatDate(new Date(group.foundedDate))}
            </Text>
            <Text style={styles.groupDescriptionText}>{group.description}</Text>

            {/* Admin Actions */}
            {group.isAdmin && (
              <View style={styles.adminActions}>
                <TouchableOpacity
                  style={styles.adminButton}
                  onPress={() => setInviteModalVisible(true)}>
                  <Text style={styles.adminButtonText}>Invite Members</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Upcoming Meetings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('GroupDetails', {
                screen: 'GroupAnnouncements',
                params: {groupId},
              })
            }>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {upcomingMeetings.length > 0 ? (
          upcomingMeetings.map(meeting => (
            <View key={meeting.id} style={styles.meetingItem}>
              <View style={styles.meetingTimeContainer}>
                <Text style={styles.meetingDay}>{meeting.dayOfWeek}</Text>
                <Text style={styles.meetingTime}>{meeting.time}</Text>
              </View>
              <View style={styles.meetingContent}>
                <Text style={styles.meetingName}>{meeting.name}</Text>
                <Text style={styles.meetingLocation}>{meeting.location}</Text>
                <Text style={styles.meetingFormat}>{meeting.format}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyStateText}>No upcoming meetings</Text>
        )}
      </View>

      {/* Announcements Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('GroupDetails', {
                screen: 'GroupAnnouncements',
                params: {groupId},
              })
            }>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {announcements.length > 0 ? (
          announcements.map(announcement => (
            <View key={announcement.id} style={styles.announcementItem}>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementMessage} numberOfLines={2}>
                {announcement.message}
              </Text>
              <View style={styles.announcementFooter}>
                <Text style={styles.announcementMeta}>
                  Posted by {announcement.createdBy} on{' '}
                  {formatDate(announcement.createdAt)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyStateText}>No announcements</Text>
        )}
      </View>

      {/* Celebrations Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Celebrations</Text>
        </View>

        {celebrations.length > 0 ? (
          celebrations.map(celebration => (
            <View key={celebration.id} style={styles.celebrationItem}>
              <View style={styles.celebrationIcon}>
                <Text style={styles.celebrationIconText}>🎉</Text>
              </View>
              <View style={styles.celebrationInfo}>
                <Text style={styles.celebrationName}>
                  {celebration.memberName} - {celebration.years}{' '}
                  {celebration.years === 1 ? 'Year' : 'Years'}
                </Text>
                <Text style={styles.celebrationDate}>
                  {formatDate(celebration.celebrationDate)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyStateText}>No upcoming celebrations</Text>
        )}
      </View>

      {/* Invite Modal */}
      {group && (
        <GroupInviteModal
          visible={inviteModalVisible}
          onClose={() => setInviteModalVisible(false)}
          groupId={groupId}
          groupName={group.name}
        />
      )}
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
  adminActions: {
    marginTop: 8,
  },
  adminButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
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
  },
  meetingTimeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    minWidth: 80,
  },
  meetingDay: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  meetingTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
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
});

export default GroupOverviewScreen;
