import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  fetchGroupSponsors,
  requestSponsorship,
  acceptSponsorshipRequest,
  rejectSponsorshipRequest,
  selectGroupSponsors,
  selectSponsorshipRequests,
} from '../../store/slices/sponsorshipSlice';
import {GroupStackParamList} from '../../types/navigation';
import {Timestamp} from '../../types/schema';
import moment from 'moment';
import {RootState} from '../../store/types';

interface Sponsor {
  id: string;
  displayName: string;
  sobrietyDate: string;
  requirements: string[];
  bio: string;
  currentSponsees: number;
  maxSponsees: number;
}

interface SponsorshipRequest {
  id: string;
  sponseeId: string;
  sponseeName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

type ScreenRouteProp = RouteProp<GroupStackParamList, 'GroupSponsors'>;
type ScreenNavigationProp = StackNavigationProp<
  GroupStackParamList,
  'GroupSponsors'
>;

const GroupSponsorsScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const dispatch = useAppDispatch();
  const {groupId} = route.params;

  const sponsors = useAppSelector(state => selectGroupSponsors(state));
  const requests = useAppSelector(state => selectSponsorshipRequests(state));
  const [loading, setLoading] = useState(true);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    loadSponsors();
  }, [groupId]);

  const loadSponsors = async () => {
    try {
      setLoading(true);
      await dispatch(fetchGroupSponsors(groupId)).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSponsorship = async () => {
    if (!selectedSponsor) return;

    try {
      await dispatch(
        requestSponsorship({
          groupId,
          sponsorId: selectedSponsor.id,
          message: requestMessage,
        }),
      ).unwrap();
      setRequestModalVisible(false);
      setRequestMessage('');
      Alert.alert('Success', 'Sponsorship request sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to send sponsorship request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await dispatch(
        acceptSponsorshipRequest({
          groupId,
          requestId,
        }),
      ).unwrap();
      Alert.alert('Success', 'Sponsorship request accepted');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept sponsorship request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await dispatch(
        rejectSponsorshipRequest({
          groupId,
          requestId,
        }),
      ).unwrap();
      Alert.alert('Success', 'Sponsorship request rejected');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject sponsorship request');
    }
  };

  const getTimeSober = (sobrietyDate: string) => {
    // example result: 1 year, 2 months, 3 days
    const now = moment();
    const soberDate = moment(sobrietyDate);
    const diff = now.diff(sobrietyDate);
    const duration = moment.duration(diff);
    const years = duration.years();
    const months = duration.months();
    const days = duration.days();
    let result = '';
    if (years > 0) {
      result += `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      result += ' ';
      result += `${months} month${months > 1 ? 's' : ''}`;
    }
    if (days > 0) {
      result += ' ';
      result += `${days} day${days > 1 ? 's' : ''}`;
    }
    return result;
  };

  const renderSponsor = ({item}: {item: Sponsor}) => (
    <View style={styles.sponsorCard}>
      <View style={styles.sponsorHeader}>
        <Text style={styles.sponsorName}>{item.displayName}</Text>
        {/* Format sobriety date */}
        <Text style={styles.sponsorSobriety}>
          {getTimeSober(item.sobrietyDate)} sober
        </Text>
      </View>

      {item.bio && <Text style={styles.sponsorBio}>{item.bio}</Text>}

      <View style={styles.sponsorDetails}>
        <Text style={styles.sponsorDetail}>
          Requirements: {item.requirements.join(', ')}
        </Text>
        <Text style={styles.sponsorDetail}>
          Sponsees: {item.currentSponsees}/{item.maxSponsees}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => {
          setSelectedSponsor(item);
          setRequestModalVisible(true);
        }}>
        <Text style={styles.requestButtonText}>Request Sponsorship</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRequest = ({item}: {item: SponsorshipRequest}) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestName}>{item.sponseeName}</Text>
        <Text style={styles.requestDate}>
          {item.createdAt instanceof Date
            ? item.createdAt.toLocaleDateString()
            : item.createdAt.toDate().toLocaleDateString()}
        </Text>
      </View>

      {item.message && (
        <Text style={styles.requestMessage}>{item.message}</Text>
      )}

      {item.status === 'pending' && (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(item.id)}>
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectRequest(item.id)}>
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sponsors}
        renderItem={renderSponsor}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          requests.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              <FlatList
                data={requests}
                renderItem={renderRequest}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>No pending requests</Text>
          </View>
        }
      />

      <Modal
        visible={requestModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRequestModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Request Sponsorship from {selectedSponsor?.displayName}
            </Text>

            <TextInput
              style={styles.messageInput}
              multiline
              placeholder="Add a message (optional)"
              value={requestMessage}
              onChangeText={setRequestMessage}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setRequestModalVisible(false);
                  setRequestMessage('');
                }}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleRequestSponsorship}>
                <Text style={styles.modalButtonText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#212121',
  },
  sponsorCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sponsorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sponsorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  sponsorSobriety: {
    fontSize: 14,
    color: '#757575',
  },
  sponsorBio: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 12,
    lineHeight: 20,
  },
  sponsorDetails: {
    marginBottom: 16,
  },
  sponsorDetail: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  requestButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  requestDate: {
    fontSize: 12,
    color: '#757575',
  },
  requestMessage: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 12,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#212121',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default GroupSponsorsScreen;
