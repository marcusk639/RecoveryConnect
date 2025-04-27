import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {MainStackParamList} from '../../types';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  selectUser,
  selectUserData,
  selectAuthStatus,
  selectAuthError,
  signOut,
  fetchUserData,
} from '../../store/slices/authSlice';
import {UserModel} from '../../models/UserModel';

// Define the navigation param list for the Profile stack
type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileManagement: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'ProfileMain'
>;

// Types for user profile
interface UserProfile {
  displayName: string;
  email: string;
  recoveryDate?: string;
  notifications: {
    meetings: boolean;
    announcements: boolean;
    celebrations: boolean;
  };
  privacySettings: {
    showRecoveryDate: boolean;
    allowDirectMessages: boolean;
  };
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useAppDispatch();

  // Get user data from Redux
  const user = useAppSelector(selectUser);
  const userData = useAppSelector(selectUserData);
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    notifications: {
      meetings: true,
      announcements: true,
      celebrations: true,
    },
    privacySettings: {
      showRecoveryDate: false,
      allowDirectMessages: true,
    },
  });

  const [editNameVisible, setEditNameVisible] = useState(false);
  const [editDateVisible, setEditDateVisible] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRecoveryDate, setNewRecoveryDate] = useState('');

  // Load user data from Redux or fetch if needed
  useEffect(() => {
    if (user && (!userData || authStatus === 'idle')) {
      dispatch(fetchUserData(user.uid));
    }

    if (userData) {
      // Map Redux userData to local state
      setUserProfile({
        displayName: userData.displayName || '',
        email: userData.email || '',
        recoveryDate: userData.recoveryDate,
        notifications: {
          meetings: userData.notificationSettings?.meetings ?? true,
          announcements: userData.notificationSettings?.announcements ?? true,
          celebrations: userData.notificationSettings?.celebrations ?? true,
        },
        privacySettings: {
          showRecoveryDate: userData.privacySettings?.showRecoveryDate ?? false,
          allowDirectMessages:
            userData.privacySettings?.allowDirectMessages ?? true,
        },
      });

      setNewDisplayName(userData.displayName || '');
      setNewRecoveryDate(userData.recoveryDate || '');
    }
  }, [user, userData, authStatus]);

  // Show errors
  useEffect(() => {
    if (authError) {
      Alert.alert('Error', authError);
    }
  }, [authError]);

  const handleSignOut = async () => {
    dispatch(signOut());
  };

  const confirmSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        onPress: handleSignOut,
        style: 'destructive',
      },
    ]);
  };

  const updateDisplayName = async () => {
    if (!newDisplayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    try {
      // Update using UserModel
      const currentUser = auth().currentUser;
      if (currentUser) {
        await currentUser.updateProfile({
          displayName: newDisplayName,
        });

        if (userData) {
          await UserModel.update(currentUser.uid, {
            ...userData,
            displayName: newDisplayName,
          });

          // Refresh user data in Redux
          dispatch(fetchUserData(currentUser.uid));
        }

        setEditNameVisible(false);
        Alert.alert('Success', 'Display name updated successfully');
      }
    } catch (error) {
      console.error('Error updating display name:', error);
      Alert.alert('Error', 'Failed to update display name. Please try again.');
    }
  };

  const updateRecoveryDate = async () => {
    // Validate date format (YYYY-MM-DD)
    if (newRecoveryDate && !/^\d{4}-\d{2}-\d{2}$/.test(newRecoveryDate)) {
      Alert.alert('Error', 'Please use the format YYYY-MM-DD');
      return;
    }

    try {
      // In a real app, this would update Firestore
      setUserProfile({
        ...userProfile,
        recoveryDate: newRecoveryDate,
      });

      setEditDateVisible(false);
      Alert.alert('Success', 'Recovery date updated successfully');
    } catch (error) {
      console.error('Error updating recovery date:', error);
      Alert.alert('Error', 'Failed to update recovery date. Please try again.');
    }
  };

  const toggleNotificationSetting = (
    setting: keyof UserProfile['notifications'],
  ) => {
    setUserProfile({
      ...userProfile,
      notifications: {
        ...userProfile.notifications,
        [setting]: !userProfile.notifications[setting],
      },
    });

    // In a real app, this would also update Firestore
  };

  const togglePrivacySetting = (
    setting: keyof UserProfile['privacySettings'],
  ) => {
    setUserProfile({
      ...userProfile,
      privacySettings: {
        ...userProfile.privacySettings,
        [setting]: !userProfile.privacySettings[setting],
      },
    });

    // In a real app, this would also update Firestore
  };

  const formatRecoveryDate = (dateString?: string): string => {
    if (!dateString) return 'Not set';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const calculateSobrietyTime = (dateString?: string): string => {
    if (!dateString) return '';

    try {
      const recoveryDate = new Date(dateString);
      const today = new Date();

      // Calculate difference in milliseconds
      const diffTime = Math.abs(today.getTime() - recoveryDate.getTime());

      // Convert to days
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Calculate years, months, days
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      const days = diffDays % 30;

      let sobrietyText = '';

      if (years > 0) {
        sobrietyText += `${years} ${years === 1 ? 'year' : 'years'}`;
      }

      if (months > 0) {
        sobrietyText += sobrietyText
          ? `, ${months} ${months === 1 ? 'month' : 'months'}`
          : `${months} ${months === 1 ? 'month' : 'months'}`;
      }

      if (days > 0 || (!years && !months)) {
        sobrietyText += sobrietyText
          ? `, ${days} ${days === 1 ? 'day' : 'days'}`
          : `${days} ${days === 1 ? 'day' : 'days'}`;
      }

      return sobrietyText;
    } catch (error) {
      return '';
    }
  };

  const renderEditNameModal = () => (
    <Modal
      visible={editNameVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setEditNameVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Display Name</Text>
            <TouchableOpacity
              onPress={() => setEditNameVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>Display Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newDisplayName}
              onChangeText={setNewDisplayName}
              placeholder="Enter your display name"
            />
            <Text style={styles.modalHelper}>
              For anonymity, we recommend using only your first name or initial.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditNameVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={updateDisplayName}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEditDateModal = () => (
    <Modal
      visible={editDateVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setEditDateVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Recovery Date</Text>
            <TouchableOpacity
              onPress={() => setEditDateVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>Recovery Date</Text>
            <TextInput
              style={styles.modalInput}
              value={newRecoveryDate}
              onChangeText={setNewRecoveryDate}
              placeholder="YYYY-MM-DD"
            />
            <Text style={styles.modalHelper}>
              This date is used to calculate your sober time and for sobriety
              celebrations.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditDateVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={updateRecoveryDate}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {userData?.photoUrl ? (
                <Image
                  source={{uri: userData.photoUrl}}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {userProfile.displayName
                    ? userProfile.displayName.charAt(0).toUpperCase()
                    : 'A'}
                </Text>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>{userProfile.displayName}</Text>
              <Text style={styles.email}>{userProfile.email}</Text>

              {userProfile.recoveryDate && (
                <View style={styles.sobrietyContainer}>
                  <Text style={styles.sobrietyLabel}>Sober Time:</Text>
                  <Text style={styles.sobrietyTime}>
                    {calculateSobrietyTime(userProfile.recoveryDate)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                // Navigate to the ProfileManagementScreen which is in the same folder
                navigation.navigate('ProfileManagement');
              }}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {userProfile.recoveryDate && (
            <View style={styles.recoveryDateContainer}>
              <Text style={styles.recoveryDateLabel}>Recovery Date:</Text>
              <Text style={styles.recoveryDate}>
                {formatRecoveryDate(userProfile.recoveryDate)}
              </Text>
            </View>
          )}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>

          {/* <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Meeting Reminders</Text>
              <Text style={styles.settingDescription}>
                Receive notifications before your scheduled meetings
              </Text>
            </View>

            <Switch
              value={userProfile.notifications.meetings}
              onValueChange={() => toggleNotificationSetting('meetings')}
              trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
              thumbColor={
                userProfile.notifications.meetings ? '#2196F3' : '#FFFFFF'
              }
            />
          </View> */}

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Announcements</Text>
              <Text style={styles.settingDescription}>
                Receive notifications for group announcements
              </Text>
            </View>

            <Switch
              value={userProfile.notifications.announcements}
              onValueChange={() => toggleNotificationSetting('announcements')}
              trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
              thumbColor={
                userProfile.notifications.announcements ? '#2196F3' : '#FFFFFF'
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Celebrations</Text>
              <Text style={styles.settingDescription}>
                Receive notifications for sobriety celebrations
              </Text>
            </View>

            <Switch
              value={userProfile.notifications.celebrations}
              onValueChange={() => toggleNotificationSetting('celebrations')}
              trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
              thumbColor={
                userProfile.notifications.celebrations ? '#2196F3' : '#FFFFFF'
              }
            />
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>

          {/* <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Recovery Date</Text>
              <Text style={styles.settingDescription}>
                Allow others to see your recovery date
              </Text>
            </View>

            <Switch
              value={userProfile.privacySettings.showRecoveryDate}
              onValueChange={() => togglePrivacySetting('showRecoveryDate')}
              trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
              thumbColor={
                userProfile.privacySettings.showRecoveryDate
                  ? '#2196F3'
                  : '#FFFFFF'
              }
            />
          </View> */}

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Allow Direct Messages</Text>
              <Text style={styles.settingDescription}>
                Allow others to send you direct messages
              </Text>
            </View>

            <Switch
              value={userProfile.privacySettings.allowDirectMessages}
              onValueChange={() => togglePrivacySetting('allowDirectMessages')}
              trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
              thumbColor={
                userProfile.privacySettings.allowDirectMessages
                  ? '#2196F3'
                  : '#FFFFFF'
              }
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.accountAction}
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'This feature will be available in a future update.',
              )
            }>
            <Text style={styles.accountActionText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accountAction}
            onPress={() => {
              // Navigate to the ProfileManagementScreen which is in the same folder
              navigation.navigate('ProfileManagement');
            }}>
            <Text style={styles.accountActionText}>Edit Profile</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.accountAction}
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'This feature will be available in a future update.',
              )
            }>
            <Text style={styles.accountActionText}>Manage Linked Groups</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={[styles.accountAction, styles.signOutAction]}
            onPress={confirmSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.appInfo}>Recovery Connect v1.0.0</Text>
          <View style={styles.linksContainer}>
            <TouchableOpacity>
              <Text style={styles.link}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>•</Text>
            <TouchableOpacity>
              <Text style={styles.link}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {renderEditNameModal()}
      {renderEditDateModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  sobrietyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sobrietyLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 4,
  },
  sobrietyTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  profileActions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    marginRight: 12,
  },
  editButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  recoveryDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recoveryDateLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 4,
  },
  recoveryDate: {
    fontSize: 14,
    color: '#212121',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#757575',
  },
  accountAction: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  accountActionText: {
    fontSize: 16,
    color: '#2196F3',
  },
  signOutAction: {
    borderBottomWidth: 0,
  },
  signOutText: {
    fontSize: 16,
    color: '#F44336',
  },
  appInfo: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 8,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    color: '#2196F3',
  },
  linkSeparator: {
    fontSize: 14,
    color: '#9E9E9E',
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontSize: 18,
    color: '#757575',
  },
  modalBody: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  modalHelper: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#757575',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ProfileScreen;
