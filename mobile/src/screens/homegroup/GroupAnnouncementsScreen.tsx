import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {GroupStackParamList} from '../../types/navigation';

// Types for announcements data
interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  createdBy: string;
  authorName: string;
}

type GroupAnnouncementsScreenRouteProp = RouteProp<
  GroupStackParamList,
  'GroupAnnouncements'
>;
type GroupAnnouncementsScreenNavigationProp =
  StackNavigationProp<GroupStackParamList>;

const GroupAnnouncementsScreen: React.FC = () => {
  const route = useRoute<GroupAnnouncementsScreenRouteProp>();
  const navigation = useNavigation<GroupAnnouncementsScreenNavigationProp>();
  const {groupId, groupName} = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // New announcement form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
    checkAdminStatus();
  }, [groupId]);

  const checkAdminStatus = async () => {
    try {
      // In a real app, this would check if the current user is an admin
      // For now, we'll just simulate
      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      setLoading(true);

      // In a real app, fetch from Firestore
      // For now, use mock data
      const mockAnnouncements: Announcement[] = [
        {
          id: '1',
          title: 'Group Inventory',
          content:
            'We will be conducting our annual group inventory after the meeting on May 15th. All members are encouraged to attend and participate.',
          isPinned: true,
          createdAt: new Date('2024-04-30'),
          createdBy: 'user1',
          authorName: 'J.',
        },
        {
          id: '2',
          title: 'Literature Order',
          content:
            'We will be placing a bulk literature order next week. Please let M. know if you need any specific books or pamphlets.',
          isPinned: false,
          createdAt: new Date('2024-04-25'),
          createdBy: 'user2',
          authorName: 'M.',
        },
        {
          id: '3',
          title: 'New Meeting Format',
          content:
            'Starting next month, we will be incorporating a 10-minute meditation at the beginning of our meetings. This change comes after a discussion at our last business meeting. Please give it a try and share your feedback.',
          isPinned: false,
          createdAt: new Date('2024-04-20'),
          createdBy: 'user3',
          authorName: 'S.',
        },
      ];

      // Sort: pinned first, then by date (newest first)
      const sorted = mockAnnouncements.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      setAnnouncements(sorted);
    } catch (error) {
      console.error('Error loading announcements:', error);
      Alert.alert(
        'Error',
        'Failed to load announcements. Please try again later.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please enter both a title and content.');
      return;
    }

    try {
      setSubmitting(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const currentUser = auth().currentUser;
      const userName = currentUser?.displayName || 'Anonymous';

      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title,
        content,
        isPinned,
        createdAt: new Date(),
        createdBy: currentUser?.uid || 'unknown',
        authorName: userName,
      };

      // Add to list and sort
      const updatedAnnouncements = [newAnnouncement, ...announcements];
      const sorted = updatedAnnouncements.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      setAnnouncements(sorted);
      setModalVisible(false);
      resetForm();

      Alert.alert('Success', 'Announcement created successfully.');
    } catch (error) {
      console.error('Error creating announcement:', error);
      Alert.alert('Error', 'Failed to create announcement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setIsPinned(false);
  };

  const handleViewDetails = (announcement: Announcement) => {
    navigation.navigate('GroupAnnouncementDetails', {
      groupId,
      announcementId: announcement.id,
    });
    // In a real app, you would pass the announcement ID and fetch the details there
    // For now, we'll just simulate it
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderAnnouncementItem = ({item}: {item: Announcement}) => (
    <TouchableOpacity
      style={[styles.announcementCard, item.isPinned && styles.pinnedCard]}
      onPress={() => handleViewDetails(item)}>
      {item.isPinned && (
        <View style={styles.pinnedBadge}>
          <Text style={styles.pinnedText}>📌 Pinned</Text>
        </View>
      )}
      <Text style={styles.announcementTitle}>{item.title}</Text>
      <Text style={styles.announcementContent} numberOfLines={3}>
        {item.content}
      </Text>
      <View style={styles.announcementFooter}>
        <Text style={styles.announcementMeta}>
          Posted by {item.authorName} on {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setModalVisible(false);
        resetForm();
      }}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Announcement</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter announcement title"
              maxLength={100}
            />

            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Enter announcement details..."
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={2000}
            />

            <TouchableOpacity
              style={styles.pinnedCheckbox}
              onPress={() => setIsPinned(!isPinned)}>
              <View
                style={[styles.checkbox, isPinned && styles.checkboxActive]}>
                {isPinned && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Pin this announcement</Text>
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Pinned announcements will appear at the top of the list. Only 3
              announcements can be pinned at a time.
            </Text>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreate}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Post Announcement</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Announcements</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={announcements}
          renderItem={renderAnnouncementItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.announcementsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadAnnouncements}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No announcements yet</Text>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setModalVisible(true)}>
                  <Text style={styles.createButtonText}>
                    Create Announcement
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {renderModal()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementsList: {
    padding: 16,
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pinnedCard: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  pinnedBadge: {
    marginBottom: 8,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 12,
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
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#757575',
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 160,
  },
  pinnedCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#424242',
  },
  helperText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupAnnouncementsScreen;
