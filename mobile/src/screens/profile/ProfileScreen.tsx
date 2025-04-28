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
  updateUserPrivacySettings,
  updateSobrietyDate,
} from '../../store/slices/authSlice';
import {UserModel} from '../../models/UserModel';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

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
  recoveryDate?: string | null;
  notifications: {
    meetings: boolean;
    announcements: boolean;
    celebrations: boolean;
  };
  privacySettings: {
    showRecoveryDate: boolean;
    showPhoneNumber: boolean;
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
      showPhoneNumber: false,
      allowDirectMessages: true,
    },
  });

  const [editNameVisible, setEditNameVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [tempSobrietyDate, setTempSobrietyDate] = useState<Date | undefined>(
    userData?.sobrietyStartDate
      ? new Date(userData.sobrietyStartDate)
      : undefined,
  );

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
        recoveryDate: userData.sobrietyStartDate,
        notifications: {
          meetings: userData.notificationSettings?.meetings ?? true,
          announcements: userData.notificationSettings?.announcements ?? true,
          celebrations: userData.notificationSettings?.celebrations ?? true,
        },
        privacySettings: {
          showRecoveryDate: userData.showSobrietyDate ?? false,
          showPhoneNumber: userData.showPhoneNumber ?? false,
          allowDirectMessages:
            userData.privacySettings?.allowDirectMessages ?? true,
        },
      });

      setNewDisplayName(userData.displayName || '');
      setTempSobrietyDate(
        userData.sobrietyStartDate
          ? new Date(userData.sobrietyStartDate)
          : undefined,
      );
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
      const currentUser = auth().currentUser;
      if (currentUser && userData) {
        await currentUser.updateProfile({
          displayName: newDisplayName,
        });
        await firestore().collection('users').doc(currentUser.uid).update({
          displayName: newDisplayName,
        });
        await UserModel.update(currentUser.uid, {
          displayName: newDisplayName,
        });
        dispatch(fetchUserData(currentUser.uid));
        setEditNameVisible(false);
        Alert.alert('Success', 'Display name updated');
      }
    } catch (error) {
      console.error('Error updating display name:', error);
      Alert.alert('Error', 'Failed to update display name. Please try again.');
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
    setTempSobrietyDate(
      userData?.sobrietyStartDate
        ? new Date(userData.sobrietyStartDate)
        : new Date(),
    );
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    dispatch(updateSobrietyDate({date}))
      .unwrap()
      .then(() => {
        Alert.alert('Success', 'Sobriety date updated.');
      })
      .catch(error => {
        Alert.alert('Error', error.message || 'Failed to update date.');
      });
    hideDatePicker();
  };

  const clearSobrietyDate = () => {
    dispatch(updateSobrietyDate({date: null}))
      .unwrap()
      .then(() => {
        Alert.alert('Success', 'Sobriety date cleared.');
      })
      .catch(error => {
        Alert.alert('Error', error.message || 'Failed to clear date.');
      });
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

  const togglePrivacySetting = async (
    setting: 'showSobrietyDate' | 'showPhoneNumber' | 'allowDirectMessages',
  ) => {
    if (!userData) return;

    // Get current values, providing defaults
    const currentShowSobrietyDate = userData.showSobrietyDate ?? false;
    const currentShowPhoneNumber = userData.showPhoneNumber ?? false;
    const currentAllowDirectMessages =
      userData.privacySettings?.allowDirectMessages ?? true;

    // Determine the new value for the toggled setting
    let newValue: boolean;
    if (setting === 'showSobrietyDate') {
      newValue = !currentShowSobrietyDate;
    } else if (setting === 'showPhoneNumber') {
      newValue = !currentShowPhoneNumber;
    } else {
      // allowDirectMessages
      newValue = !currentAllowDirectMessages;
    }

    // Construct the full payload for the update thunk
    const settingsPayload = {
      showSobrietyDate:
        setting === 'showSobrietyDate' ? newValue : currentShowSobrietyDate,
      showPhoneNumber:
        setting === 'showPhoneNumber' ? newValue : currentShowPhoneNumber,
      allowDirectMessages:
        setting === 'allowDirectMessages'
          ? newValue
          : currentAllowDirectMessages,
    };

    try {
      await dispatch(updateUserPrivacySettings(settingsPayload)).unwrap();
      // Optional: Add success feedback if needed
      // Alert.alert('Success', 'Privacy setting updated.');
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update privacy settings. Please try again.',
      );
    }
  };

  const formatSobrietyDateForDisplay = (dateString?: string | null): string => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const calculateSobrietyTime = (dateString?: string | null): string => {
    if (!dateString) return '';
    try {
      const recoveryDate = new Date(dateString);
      if (isNaN(recoveryDate.getTime())) return '';
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - recoveryDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      const days = diffDays % 30;
      let sobrietyText = '';
      if (years > 0)
        sobrietyText += `${years} ${years === 1 ? 'year' : 'years'}`;
      if (months > 0)
        sobrietyText += sobrietyText
          ? `, ${months} ${months === 1 ? 'month' : 'months'}`
          : `${months} ${months === 1 ? 'month' : 'months'}`;
      if (days > 0 || (!years && !months))
        sobrietyText += sobrietyText
          ? `, ${days} ${days === 1 ? 'day' : 'days'}`
          : `${days} ${days === 1 ? 'day' : 'days'}`;
      return sobrietyText;
    } catch (error) {
      console.error('Error calculating sobriety time:', error);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {userData?.photoURL ? (
                <Image
                  source={{uri: userData.photoURL}}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {userData?.displayName
                    ? userData.displayName.charAt(0).toUpperCase()
                    : 'U'}
                </Text>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>
                {userData?.displayName || 'User'}
              </Text>
              <Text style={styles.email}>{userData?.email || 'No email'}</Text>
              {userData?.sobrietyStartDate && (
                <View style={styles.sobrietyContainer}>
                  <Text style={styles.sobrietyLabel}>Sober Time:</Text>
                  <Text style={styles.sobrietyTime}>
                    {calculateSobrietyTime(userData.sobrietyStartDate)}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.profileActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditNameVisible(true)}>
              <Text style={styles.editButtonText}>Edit Name</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={showDatePicker}>
              <Text style={styles.editButtonText}>Edit Sobriety Date</Text>
            </TouchableOpacity>
            {userData?.sobrietyStartDate && (
              <TouchableOpacity
                style={[styles.editButton, styles.clearButtonRed]}
                onPress={clearSobrietyDate}>
                <Text
                  style={[styles.editButtonText, styles.clearButtonTextRed]}>
                  Clear Date
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.recoveryDateContainer}>
            <Text style={styles.recoveryDateLabel}>Sobriety Date:</Text>
            <Text style={styles.recoveryDate}>
              {formatSobrietyDateForDisplay(userData?.sobrietyStartDate)}
            </Text>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Sobriety Time/Date</Text>
              <Text style={styles.settingDescription}>
                Allow others to see your sobriety time/date in groups
              </Text>
            </View>
            <Switch
              value={userData?.showSobrietyDate ?? false}
              onValueChange={() => togglePrivacySetting('showSobrietyDate')}
              trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
              thumbColor={userData?.showSobrietyDate ? '#2196F3' : '#FFFFFF'}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Phone Number</Text>
              <Text style={styles.settingDescription}>
                Allow group members to see your phone number
              </Text>
            </View>
            <Switch
              value={userData?.showPhoneNumber ?? false}
              onValueChange={() => togglePrivacySetting('showPhoneNumber')}
              trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
              thumbColor={userData?.showPhoneNumber ? '#2196F3' : '#FFFFFF'}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Allow Direct Messages</Text>
              <Text style={styles.settingDescription}>
                Allow members to send you direct messages
              </Text>
            </View>
            <Switch
              value={userData?.privacySettings?.allowDirectMessages ?? true}
              onValueChange={() => togglePrivacySetting('allowDirectMessages')}
              trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
              thumbColor={
                userData?.privacySettings?.allowDirectMessages ?? true
                  ? '#2196F3'
                  : '#FFFFFF'
              }
            />
          </View>
        </View>

        {/* Account Actions - Simplified for clarity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.accountAction}
            onPress={() => {
              navigation.navigate('ProfileManagement');
            }}>
            <Text style={styles.accountActionText}>Manage Profile Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.accountAction, styles.signOutAction]}
            onPress={confirmSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info - Keep as is */}
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
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={tempSobrietyDate || new Date()}
        maximumDate={new Date()}
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />
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
  clearButtonRed: {
    backgroundColor: '#F44336',
  },
  clearButtonTextRed: {
    color: '#FFFFFF',
  },
});

export default ProfileScreen;
