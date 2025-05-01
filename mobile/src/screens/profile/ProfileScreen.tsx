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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';
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
  updateDisplayName,
  updateUserPhoneNumber,
  updateUserPhoto,
  updateUserNotificationSettings,
  updateSponsorSettings,
} from '../../store/slices/authSlice';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import {Sponsorship, SponsorSettings} from '../../types/sponsorship';

// Define the navigation param list for the Profile stack
type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileManagement: undefined;
  SobrietyTracker: undefined;
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
    sponsorship: boolean;
  };
  privacySettings: {
    showRecoveryDate: boolean;
    showPhoneNumber: boolean;
    allowDirectMessages: boolean;
    sponsorship: boolean;
  };
  sponsorSettings: SponsorSettings;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useAppDispatch();

  // Get user data from Redux
  const user = useAppSelector(selectUser);
  const userData = useAppSelector(selectUserData);
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const loading = authStatus === 'loading';

  // Editing states
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Form values
  const [newDisplayName, setNewDisplayName] = useState('');
  const [useInitialOnly, setUseInitialOnly] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [tempSobrietyDate, setTempSobrietyDate] = useState<Date | undefined>(
    userData?.sobrietyStartDate
      ? new Date(userData.sobrietyStartDate)
      : undefined,
  );
  const [meetingNotifications, setMeetingNotifications] =
    useState<boolean>(true);
  const [announcementNotifications, setAnnouncementNotifications] =
    useState<boolean>(true);
  const [celebrationNotifications, setCelebrationNotifications] =
    useState<boolean>(true);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    notifications: {
      meetings: true,
      announcements: true,
      celebrations: true,
      sponsorship: true,
    },
    privacySettings: {
      showRecoveryDate: false,
      showPhoneNumber: false,
      allowDirectMessages: true,
      sponsorship: true,
    },
    sponsorSettings: {
      isAvailable: false,
      maxSponsees: 3,
      requirements: ['30 days sober', 'Working the steps'],
      bio: '',
    },
  });

  const [sponsorshipSettings, setSponsorshipSettings] = useState({
    isAvailable: false,
    maxSponsees: 3,
    requirements: ['30 days sober', 'Working the steps'],
    bio: '',
  });

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
          sponsorship: userData.notificationSettings?.sponsorship ?? true,
        },
        privacySettings: {
          showRecoveryDate: userData.showSobrietyDate ?? false,
          showPhoneNumber: userData.showPhoneNumber ?? false,
          allowDirectMessages:
            userData.privacySettings?.allowDirectMessages ?? true,
          sponsorship: userData.privacySettings?.sponsorship ?? true,
        },
        sponsorSettings: {
          isAvailable: userData.sponsorSettings?.isAvailable ?? false,
          maxSponsees: userData.sponsorSettings?.maxSponsees ?? 3,
          requirements: userData.sponsorSettings?.requirements ?? [
            '30 days sober',
            'Working the steps',
          ],
          bio: userData.sponsorSettings?.bio ?? '',
        },
      });

      setNewDisplayName(userData.displayName || '');
      setPhoneNumber(userData.phoneNumber || user?.phoneNumber || '');
      setTempSobrietyDate(
        userData.sobrietyStartDate
          ? new Date(userData.sobrietyStartDate)
          : undefined,
      );
      setMeetingNotifications(
        userData.notificationSettings?.meetings !== false,
      );
      setAnnouncementNotifications(
        userData.notificationSettings?.announcements !== false,
      );
      setCelebrationNotifications(
        userData.notificationSettings?.celebrations !== false,
      );

      // Determine useInitialOnly based on fetched displayName
      if (
        userData.displayName &&
        userData.displayName.length === 2 &&
        userData.displayName.endsWith('.')
      ) {
        setUseInitialOnly(true);
      }
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

  // Handle image picker and upload
  const handleChoosePhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
        includeBase64: false,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedImage = result.assets[0];

      if (!selectedImage.uri) {
        throw new Error('No image URI found');
      }

      await uploadPhoto(selectedImage.uri);
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Upload photo to Firebase Storage and update Redux store
  const uploadPhoto = async (uri: string) => {
    try {
      setUploadingPhoto(true);
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const storageRef = storage().ref(
        `users/${currentUser.uid}/images/profileImage`,
      );

      await storageRef.putFile(uri);
      const downloadUrl = await storageRef.getDownloadURL();

      // Dispatch action to update user photo in Redux and Firestore
      await dispatch(updateUserPhoto(downloadUrl)).unwrap();
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveDisplayName = async () => {
    if (!newDisplayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }
    try {
      await dispatch(
        updateDisplayName({
          displayName: newDisplayName.trim(),
          useInitialOnly: useInitialOnly,
        }),
      ).unwrap();
      setEditingSection(null);
    } catch (error: any) {
      console.error('Error updating display name:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update display name. Please try again.',
      );
    }
  };

  const savePhoneNumber = async () => {
    try {
      await dispatch(updateUserPhoneNumber(phoneNumber)).unwrap();
      setEditingSection(null);
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update phone number. Please try again.',
      );
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
        setEditingSection(null);
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
        setEditingSection(null);
      })
      .catch(error => {
        Alert.alert('Error', error.message || 'Failed to clear date.');
      });
  };

  const saveNotificationSettings = async () => {
    try {
      await dispatch(
        updateUserNotificationSettings({
          meetings: meetingNotifications,
          announcements: announcementNotifications,
          celebrations: celebrationNotifications,
        }),
      ).unwrap();
      setEditingSection(null);
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      Alert.alert(
        'Error',
        error.message ||
          'Failed to update notification settings. Please try again.',
      );
    }
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

  const formatPhoneNumber = (phone: string): string => {
    // Basic US phone number formatting: (555) 555-5555
    if (!phone) return 'Not set';

    // Strip all non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Check for US format (10 digits)
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
      )}`;
    }

    // International number or other format
    return phone;
  };

  const saveSponsorshipSettings = async () => {
    try {
      await dispatch(updateSponsorSettings(sponsorshipSettings)).unwrap();
      setEditingSection(null);
    } catch (error: any) {
      console.error('Error updating sponsorship settings:', error);
      Alert.alert(
        'Error',
        error.message ||
          'Failed to update sponsorship settings. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        <ScrollView style={styles.scrollView}>
          {/* Profile Header */}
          <View style={styles.section}>
            <View style={styles.profileHeader}>
              {/* Avatar/Photo Section */}
              <View style={styles.avatarSection}>
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
                <TouchableOpacity
                  style={styles.photoEditButton}
                  onPress={handleChoosePhoto}
                  disabled={uploadingPhoto || loading}>
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.photoEditButtonText}>
                      {userData?.photoURL ? 'Change Photo' : 'Add Photo'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.displayName}>
                  {userData?.displayName || 'User'}
                </Text>
                <Text style={styles.email}>
                  {userData?.email || 'No email'}
                </Text>
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
          </View>

          {/* Display Name Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Display Name</Text>
              <TouchableOpacity
                onPress={() =>
                  setEditingSection(editingSection === 'name' ? null : 'name')
                }
                style={styles.editButton}>
                <Text style={styles.editButtonText}>
                  {editingSection === 'name' ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {editingSection === 'name' ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.textInput}
                  value={newDisplayName}
                  onChangeText={setNewDisplayName}
                  placeholder="Your name"
                />
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Use first initial only</Text>
                  <Switch
                    value={useInitialOnly}
                    onValueChange={setUseInitialOnly}
                    trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                    thumbColor={useInitialOnly ? '#2196F3' : '#FFFFFF'}
                  />
                </View>
                <Text style={styles.helperText}>
                  For anonymity, we recommend using only your first name or
                  initial.
                </Text>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveDisplayName}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.fieldValue}>
                {userData?.displayName || 'Not set'}
              </Text>
            )}
          </View>

          {/* Phone Number Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Phone Number</Text>
              <TouchableOpacity
                onPress={() =>
                  setEditingSection(editingSection === 'phone' ? null : 'phone')
                }
                style={styles.editButton}>
                <Text style={styles.editButtonText}>
                  {editingSection === 'phone' ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {editingSection === 'phone' ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Your phone number"
                  keyboardType="phone-pad"
                />
                <Text style={styles.helperText}>
                  This will be used for calls and text messages if you choose to
                  share it.
                </Text>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={savePhoneNumber}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.fieldValue}>
                {userData?.phoneNumber
                  ? formatPhoneNumber(userData.phoneNumber)
                  : 'Not set'}
              </Text>
            )}
          </View>

          {/* Sobriety Date Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sobriety Date</Text>
              <TouchableOpacity
                onPress={() =>
                  setEditingSection(
                    editingSection === 'sobriety' ? null : 'sobriety',
                  )
                }
                style={styles.editButton}>
                <Text style={styles.editButtonText}>
                  {editingSection === 'sobriety' ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {editingSection === 'sobriety' ? (
              <View style={styles.editContainer}>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={showDatePicker}>
                  <Text style={styles.datePickerButtonText}>
                    {userData?.sobrietyStartDate
                      ? formatSobrietyDateForDisplay(userData.sobrietyStartDate)
                      : 'Select Sobriety Date'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  This is used for calculating sobriety time and for optional
                  celebrations.
                </Text>
                <View style={styles.buttonRow}>
                  {userData?.sobrietyStartDate && (
                    <TouchableOpacity
                      style={[styles.button, styles.clearButton]}
                      onPress={clearSobrietyDate}>
                      <Text style={styles.clearButtonText}>Clear Date</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.fieldValue}>
                  {userData?.sobrietyStartDate
                    ? formatSobrietyDateForDisplay(userData.sobrietyStartDate)
                    : 'Not set'}
                </Text>
                {userData?.sobrietyStartDate && (
                  <Text style={styles.sobrietyTimeText}>
                    {calculateSobrietyTime(userData.sobrietyStartDate)}
                  </Text>
                )}
              </>
            )}
          </View>

          {/* Sobriety Tracker Section */}
          {userData?.sobrietyStartDate && (
            <TouchableOpacity
              style={[styles.section, styles.sobrietyTrackerCard]}
              onPress={() => navigation.navigate('SobrietyTracker')}
              testID="profile-sobriety-tracker-button">
              <View style={styles.sobrietyTrackerContent}>
                <View style={styles.sobrietyTrackerIconContainer}>
                  <Icon name="medal-outline" size={36} color="#FFB300" />
                </View>
                <View style={styles.sobrietyTrackerTextContainer}>
                  <Text style={styles.sobrietyTrackerTitle}>
                    Sobriety Journey
                  </Text>
                  <Text style={styles.sobrietyTrackerTimeValue}>
                    {calculateSobrietyTime(userData.sobrietyStartDate)}
                  </Text>
                  <Text style={styles.sobrietyTrackerSubtitle}>
                    View milestones & progress
                  </Text>
                </View>
                <Icon name="chevron-right" size={28} color="#BDBDBD" />
              </View>
            </TouchableOpacity>
          )}

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
                onValueChange={() =>
                  togglePrivacySetting('allowDirectMessages')
                }
                trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                thumbColor={
                  userData?.privacySettings?.allowDirectMessages ?? true
                    ? '#2196F3'
                    : '#FFFFFF'
                }
              />
            </View>
          </View>

          {/* Notification Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notification Settings</Text>
              <TouchableOpacity
                onPress={() =>
                  setEditingSection(
                    editingSection === 'notifications' ? null : 'notifications',
                  )
                }
                style={styles.editButton}>
                <Text style={styles.editButtonText}>
                  {editingSection === 'notifications' ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {editingSection === 'notifications' ? (
              <View style={styles.editContainer}>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Meeting Reminders</Text>
                  <Switch
                    value={meetingNotifications}
                    onValueChange={setMeetingNotifications}
                    trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                    thumbColor={meetingNotifications ? '#2196F3' : '#FFFFFF'}
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Group Announcements</Text>
                  <Switch
                    value={announcementNotifications}
                    onValueChange={setAnnouncementNotifications}
                    trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                    thumbColor={
                      announcementNotifications ? '#2196F3' : '#FFFFFF'
                    }
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Celebrations</Text>
                  <Switch
                    value={celebrationNotifications}
                    onValueChange={setCelebrationNotifications}
                    trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                    thumbColor={
                      celebrationNotifications ? '#2196F3' : '#FFFFFF'
                    }
                  />
                </View>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveNotificationSettings}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.notificationItem}>
                  <Text style={styles.notificationLabel}>
                    Meeting Reminders:
                  </Text>
                  <Text style={styles.notificationValue}>
                    {userData?.notificationSettings?.meetings !== false
                      ? 'On'
                      : 'Off'}
                  </Text>
                </View>
                <View style={styles.notificationItem}>
                  <Text style={styles.notificationLabel}>
                    Group Announcements:
                  </Text>
                  <Text style={styles.notificationValue}>
                    {userData?.notificationSettings?.announcements !== false
                      ? 'On'
                      : 'Off'}
                  </Text>
                </View>
                <View style={styles.notificationItem}>
                  <Text style={styles.notificationLabel}>Celebrations:</Text>
                  <Text style={styles.notificationValue}>
                    {userData?.notificationSettings?.celebrations !== false
                      ? 'On'
                      : 'Off'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Sponsorship Settings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sponsorship</Text>
              <TouchableOpacity
                onPress={() =>
                  setEditingSection(
                    editingSection === 'sponsorship' ? null : 'sponsorship',
                  )
                }
                style={styles.editButton}>
                <Text style={styles.editButtonText}>
                  {editingSection === 'sponsorship' ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {editingSection === 'sponsorship' ? (
              <View style={styles.editContainer}>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Available to Sponsor</Text>
                  <Switch
                    value={sponsorshipSettings.isAvailable}
                    onValueChange={value =>
                      setSponsorshipSettings(prev => ({
                        ...prev,
                        isAvailable: value,
                      }))
                    }
                    trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                    thumbColor={
                      sponsorshipSettings.isAvailable ? '#2196F3' : '#FFFFFF'
                    }
                  />
                </View>

                {sponsorshipSettings.isAvailable && (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Maximum Sponsees</Text>
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        value={sponsorshipSettings.maxSponsees.toString()}
                        onChangeText={value =>
                          setSponsorshipSettings(prev => ({
                            ...prev,
                            maxSponsees: parseInt(value) || 0,
                          }))
                        }
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Requirements</Text>
                      <TextInput
                        style={[styles.textInput, styles.multilineInput]}
                        multiline
                        value={sponsorshipSettings.requirements.join(', ')}
                        onChangeText={value =>
                          setSponsorshipSettings(prev => ({
                            ...prev,
                            requirements: value.split(',').map(r => r.trim()),
                          }))
                        }
                        placeholder="Enter requirements separated by commas"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Sponsorship Bio</Text>
                      <TextInput
                        style={[styles.textInput, styles.multilineInput]}
                        multiline
                        value={sponsorshipSettings.bio}
                        onChangeText={value =>
                          setSponsorshipSettings(prev => ({
                            ...prev,
                            bio: value,
                          }))
                        }
                        placeholder="Tell potential sponsees about your sponsorship style"
                      />
                    </View>
                  </>
                )}

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveSponsorshipSettings}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Available to Sponsor</Text>
                  <Text style={styles.settingValue}>
                    {userData?.sponsorSettings?.isAvailable ? 'Yes' : 'No'}
                  </Text>
                </View>

                {userData?.sponsorSettings?.isAvailable && (
                  <>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Maximum Sponsees</Text>
                      <Text style={styles.settingValue}>
                        {userData.sponsorSettings.maxSponsees}
                      </Text>
                    </View>

                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Requirements</Text>
                      <Text style={styles.settingValue}>
                        {userData.sponsorSettings.requirements.join(', ')}
                      </Text>
                    </View>

                    {userData.sponsorSettings.bio && (
                      <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>Bio</Text>
                        <Text style={styles.settingValue}>
                          {userData.sponsorSettings.bio}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}
          </View>

          {/* Account Actions - Simplified for clarity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
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
      </KeyboardAvoidingView>

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
  keyboardContainer: {
    flex: 1,
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
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  photoEditButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  photoEditButtonText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  editButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  editContainer: {
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  fieldValue: {
    fontSize: 16,
    color: '#212121',
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#424242',
  },
  helperText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#212121',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  clearButton: {
    backgroundColor: '#FFEBEE',
  },
  clearButtonText: {
    color: '#F44336',
    fontWeight: '600',
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
  notificationItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  notificationLabel: {
    fontSize: 15,
    color: '#424242',
    fontWeight: '500',
    marginRight: 8,
  },
  notificationValue: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '500',
  },
  accountAction: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  signOutAction: {
    borderBottomWidth: 0,
  },
  signOutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '500',
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
  sobrietyTrackerCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sobrietyTrackerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sobrietyTrackerIconContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 25,
    padding: 10,
    marginRight: 16,
  },
  sobrietyTrackerTextContainer: {
    flex: 1,
  },
  sobrietyTrackerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  sobrietyTrackerTimeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4,
  },
  sobrietyTrackerSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  sobrietyTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  settingValue: {
    fontSize: 16,
    color: '#212121',
  },
});

export default ProfileScreen;
