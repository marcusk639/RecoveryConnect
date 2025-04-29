import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {GroupModel} from '../../models/GroupModel';
import {HomeGroup} from '../../types';
import {UserModel} from '../../models/UserModel';
import {formatDistanceToNow} from 'date-fns';

interface AdminRequest {
  uid: string;
  requestedAt: Date;
  message?: string;
  userName?: string;
  userEmail?: string;
  userPhotoURL?: string;
}

interface GroupWithRequests extends HomeGroup {
  requests: AdminRequest[];
}

const AdminPanelScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [pendingGroups, setPendingGroups] = useState<GroupWithRequests[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithRequests | null>(
    null,
  );
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [directAssignModalVisible, setDirectAssignModalVisible] =
    useState(false);
  const [userIdToAssign, setUserIdToAssign] = useState('');
  const [processing, setProcessing] = useState(false);

  const navigation = useNavigation();

  // Check if the user is a super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const isSuperAdminUser = await UserModel.isSuperAdmin();
        setIsSuperAdmin(isSuperAdminUser);
        if (!isSuperAdminUser) {
          Alert.alert(
            'Access Denied',
            'You need super admin privileges to access this panel.',
          );
          navigation.goBack();
        } else {
          fetchPendingRequests();
        }
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      }
    };

    checkSuperAdmin();
  }, [navigation]);

  // Fetch all groups with pending admin requests
  const fetchPendingRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const groups = await GroupModel.getGroupsWithPendingRequests();

      // Get user details for each request
      const groupsWithDetails = await Promise.all(
        groups.map(async group => {
          // Convert to GroupWithRequests format
          const pendingRequests =
            group.pendingAdminRequests?.map(req => ({
              uid: req.uid,
              requestedAt:
                req.requestedAt instanceof Date
                  ? req.requestedAt
                  : new Date((req.requestedAt as any).seconds * 1000),
              message: req.message,
            })) || [];

          // Fetch user details for each request
          const enrichedRequests = await Promise.all(
            pendingRequests.map(async request => {
              try {
                const userDoc = await firestore()
                  .collection('users')
                  .doc(request.uid)
                  .get();
                const userData = userDoc.data();
                return {
                  ...request,
                  userName: userData?.displayName || 'Unknown User',
                  userEmail: userData?.email || 'No email',
                  userPhotoURL: userData?.photoURL || undefined,
                };
              } catch (error) {
                console.error('Error fetching user data:', error);
                return request;
              }
            }),
          );

          return {
            ...group,
            requests: enrichedRequests,
          };
        }),
      );

      setPendingGroups(groupsWithDetails);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      Alert.alert('Error', 'Failed to load pending admin requests.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingRequests();
  };

  const handleApproveRequest = async () => {
    if (!selectedGroup || !selectedRequest) return;

    try {
      setProcessing(true);
      await GroupModel.approveAdminRequest(
        selectedGroup.id,
        selectedRequest.uid,
      );

      // Update the local state to remove the approved request
      const updatedGroups = pendingGroups.map(group => {
        if (group.id === selectedGroup.id) {
          const updatedRequests = group.requests.filter(
            req => req.uid !== selectedRequest.uid,
          );
          return {
            ...group,
            requests: updatedRequests,
          };
        }
        return group;
      });

      // Remove any groups that no longer have pending requests
      const filteredGroups = updatedGroups.filter(
        group => group.requests.length > 0,
      );

      setPendingGroups(filteredGroups);
      Alert.alert('Success', 'Admin request approved successfully.');

      // TODO: Send notification to the user (optional)
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve admin request.');
    } finally {
      setModalVisible(false);
      setSelectedGroup(null);
      setSelectedRequest(null);
      setProcessing(false);
    }
  };

  const handleDenyRequest = async () => {
    if (!selectedGroup || !selectedRequest) return;

    try {
      setProcessing(true);
      await GroupModel.denyAdminRequest(selectedGroup.id, selectedRequest.uid);

      // Update the local state to remove the denied request
      const updatedGroups = pendingGroups.map(group => {
        if (group.id === selectedGroup.id) {
          const updatedRequests = group.requests.filter(
            req => req.uid !== selectedRequest.uid,
          );
          return {
            ...group,
            requests: updatedRequests,
          };
        }
        return group;
      });

      // Remove any groups that no longer have pending requests
      const filteredGroups = updatedGroups.filter(
        group => group.requests.length > 0,
      );

      setPendingGroups(filteredGroups);
      Alert.alert('Success', 'Admin request denied.');

      // TODO: Send notification to the user (optional)
    } catch (error) {
      console.error('Error denying request:', error);
      Alert.alert('Error', 'Failed to deny admin request.');
    } finally {
      setModalVisible(false);
      setSelectedGroup(null);
      setSelectedRequest(null);
      setProcessing(false);
    }
  };

  const handleDirectAssign = async () => {
    if (!selectedGroup || !userIdToAssign) {
      Alert.alert('Error', 'Group or user ID is missing.');
      return;
    }

    try {
      setProcessing(true);
      await GroupModel.assignAdmin(selectedGroup.id, userIdToAssign);
      Alert.alert('Success', 'User assigned as admin successfully.');
      fetchPendingRequests(); // Refresh the data
    } catch (error) {
      console.error('Error assigning admin:', error);
      Alert.alert('Error', 'Failed to assign admin.');
    } finally {
      setDirectAssignModalVisible(false);
      setUserIdToAssign('');
      setSelectedGroup(null);
      setProcessing(false);
    }
  };

  const renderRequestItem = ({item}: {item: AdminRequest}) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => {
        setSelectedRequest(item);
        setModalVisible(true);
      }}>
      <View style={styles.requestHeader}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.requestTime}>
          {formatDistanceToNow(item.requestedAt, {addSuffix: true})}
        </Text>
      </View>
      <Text style={styles.userEmail}>{item.userEmail}</Text>
      {item.message && (
        <Text style={styles.requestMessage} numberOfLines={2}>
          "{item.message}"
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderGroupItem = ({item}: {item: GroupWithRequests}) => (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.requestCount}>
          {item.requests.length}{' '}
          {item.requests.length === 1 ? 'request' : 'requests'}
        </Text>
      </View>
      <Text style={styles.groupLocation}>{item.location || 'No location'}</Text>

      <FlatList
        data={item.requests}
        renderItem={renderRequestItem}
        keyExtractor={req => req.uid}
        scrollEnabled={false}
      />

      <TouchableOpacity
        style={styles.directAssignButton}
        onPress={() => {
          setSelectedGroup(item);
          setDirectAssignModalVisible(true);
        }}>
        <Text style={styles.directAssignButtonText}>Directly Assign Admin</Text>
      </TouchableOpacity>
    </View>
  );

  // Render loading state
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading admin requests...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
      </View>

      {pendingGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="check-circle-outline" size={64} color="#BBDEFB" />
          <Text style={styles.emptyTitle}>No Pending Requests</Text>
          <Text style={styles.emptyText}>
            There are no groups with pending admin requests at this time.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingGroups}
          renderItem={renderGroupItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {/* Request Action Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Admin Request</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            {selectedGroup && selectedRequest && (
              <>
                <Text style={styles.modalGroupName}>{selectedGroup.name}</Text>
                <View style={styles.modalUserInfo}>
                  <Text style={styles.modalUserName}>
                    {selectedRequest.userName}
                  </Text>
                  <Text style={styles.modalUserEmail}>
                    {selectedRequest.userEmail}
                  </Text>
                  <Text style={styles.modalRequestTime}>
                    Requested{' '}
                    {formatDistanceToNow(selectedRequest.requestedAt, {
                      addSuffix: true,
                    })}
                  </Text>
                </View>

                {selectedRequest.message && (
                  <View style={styles.modalMessageContainer}>
                    <Text style={styles.modalMessageLabel}>Message:</Text>
                    <Text style={styles.modalMessage}>
                      {selectedRequest.message}
                    </Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.denyButton]}
                    onPress={handleDenyRequest}
                    disabled={processing}>
                    {processing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.denyButtonText}>Deny</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.approveButton]}
                    onPress={handleApproveRequest}
                    disabled={processing}>
                    {processing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.approveButtonText}>Approve</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Direct Assign Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={directAssignModalVisible}
        onRequestClose={() => setDirectAssignModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Directly Assign Admin</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDirectAssignModalVisible(false)}>
                <Icon name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            {selectedGroup && (
              <>
                <Text style={styles.modalGroupName}>{selectedGroup.name}</Text>
                <Text style={styles.inputLabel}>Enter User ID:</Text>
                <TextInput
                  style={styles.input}
                  value={userIdToAssign}
                  onChangeText={setUserIdToAssign}
                  placeholder="User ID (UID)"
                />
                <Text style={styles.helperText}>
                  Enter the Firebase UID of the user to assign as admin
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setDirectAssignModalVisible(false)}
                    disabled={processing}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.assignButton]}
                    onPress={handleDirectAssign}
                    disabled={processing || !userIdToAssign}>
                    {processing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.assignButtonText}>Assign</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  listContainer: {
    padding: 12,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  requestCount: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  groupLocation: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  requestItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  requestTime: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  userEmail: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 8,
  },
  requestMessage: {
    fontSize: 14,
    color: '#424242',
    fontStyle: 'italic',
  },
  directAssignButton: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  directAssignButtonText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  modalGroupName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 12,
  },
  modalUserInfo: {
    marginBottom: 16,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  modalUserEmail: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  modalRequestTime: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  modalMessageContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalMessageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#616161',
    marginBottom: 4,
  },
  modalMessage: {
    fontSize: 14,
    color: '#424242',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  denyButton: {
    backgroundColor: '#FFCDD2',
  },
  denyButtonText: {
    color: '#D32F2F',
    fontWeight: '500',
  },
  approveButton: {
    backgroundColor: '#2196F3',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#EEEEEE',
  },
  cancelButtonText: {
    color: '#616161',
    fontWeight: '500',
  },
  assignButton: {
    backgroundColor: '#4CAF50',
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    color: '#212121',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 20,
  },
});

export default AdminPanelScreen;
