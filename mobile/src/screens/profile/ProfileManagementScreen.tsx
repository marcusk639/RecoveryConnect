// src/screens/profile/ProfileManagementScreen.tsx

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';
import {RootStackParamList} from '../../types';
import {Button} from '../../components/common/Button';
import {Input} from '../../components/common/Input';
import DatePicker from '../../components/common/DatePicker';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  selectUserData,
  selectAuthStatus,
  selectAuthError,
  updateDisplayName,
  updateSobrietyDate,
  updateUserPrivacySettings,
  updateUserNotificationSettings,
  updateUserPhoto,
  fetchUserData,
  updateUserPhoneNumber,
} from '../../store/slices/authSlice';

// Define the navigation param list for the Profile stack
type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileManagement: undefined;
};

type ProfileManagementScreenProps = {
  navigation: StackNavigationProp<ProfileStackParamList, 'ProfileManagement'>;
};

const ProfileManagementScreen: React.FC<ProfileManagementScreenProps> = ({
  navigation,
}) => {
  const rootNavigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  // Redux state
  const userData = useAppSelector(selectUserData);
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const loading = authStatus === 'loading';

  // UI state
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [editingName, setEditingName] = useState<boolean>(false);
  const [editingRecoveryDate, setEditingRecoveryDate] =
    useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [editingPhoneNumber, setEditingPhoneNumber] = useState<boolean>(false);

  // Form values - Maintain local copies for editing
  const [displayName, setDisplayName] = useState<string>('');
  const [useInitialOnly, setUseInitialOnly] = useState<boolean>(false);
  const [recoveryDate, setRecoveryDate] = useState<string>('');
  const [photoURL, setPhotoURL] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [showRecoveryDate, setShowRecoveryDate] = useState<boolean>(true);
  const [showPhoneNumber, setShowPhoneNumber] = useState<boolean>(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState<boolean>(true);
  const [meetingNotifications, setMeetingNotifications] =
    useState<boolean>(true);
  const [announcementNotifications, setAnnouncementNotifications] =
    useState<boolean>(true);
  const [celebrationNotifications, setCelebrationNotifications] =
    useState<boolean>(true);

  // Load user data from Redux store and initialize local state
  useEffect(() => {
    // Get current user
    const currentUser = auth().currentUser;

    if (!currentUser) {
      rootNavigation.navigate('Auth');
      return;
    }

    // If userData is not available, fetch it
    if (!userData) {
      dispatch(fetchUserData(currentUser.uid));
      return;
    }

    // Set form values from Redux state when userData changes
    setDisplayName(userData.displayName || '');
    setPhotoURL(userData.photoURL || '');
    setPhoneNumber(userData.phoneNumber || currentUser.phoneNumber || '');

    // Determine useInitialOnly based on fetched displayName
    if (
      userData.displayName &&
      userData.displayName.length === 2 &&
      userData.displayName.endsWith('.')
    ) {
      setUseInitialOnly(true);
    }

    setRecoveryDate(userData.sobrietyStartDate || '');
    setShowRecoveryDate(userData.showSobrietyDate ?? true);
    setShowPhoneNumber(userData.showPhoneNumber ?? true);
    setAllowDirectMessages(
      userData.privacySettings?.allowDirectMessages !== false,
    );
    setMeetingNotifications(userData.notificationSettings?.meetings !== false);
    setAnnouncementNotifications(
      userData.notificationSettings?.announcements !== false,
    );
    setCelebrationNotifications(
      userData.notificationSettings?.celebrations !== false,
    );
  }, [userData, rootNavigation, dispatch]);

  // Show errors from Redux
  useEffect(() => {
    if (authError && authStatus === 'failed') {
      Alert.alert('Error', authError);
      // Consider dispatching an action to clear the error after showing it
      // dispatch(clearError());
    }
  }, [authError, authStatus]);

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

      // Local state update for UI responsiveness (already updated via useEffect)
      // setPhotoURL(downloadUrl);
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setShowDatePicker(false);
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setRecoveryDate(formattedDate);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string): string => {
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

  // Calculate sobriety time
  const calculateSobrietyTime = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const recoveryDateObj = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - recoveryDateObj.getTime());
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
      return '';
    }
  };

  // Save profile name via Redux
  const saveDisplayName = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }
    try {
      await dispatch(
        updateDisplayName({
          displayName: displayName.trim(),
        }),
      ).unwrap();
      setEditingName(false);
    } catch (error: any) {
      console.error('Error updating display name:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update display name. Please try again.',
      );
    }
  };

  // Save recovery date via Redux
  const saveRecoveryDate = async () => {
    try {
      const dateToSend = recoveryDate ? new Date(recoveryDate) : null;
      if (dateToSend && isNaN(dateToSend.getTime())) {
        Alert.alert('Error', 'Invalid date selected.');
        return;
      }
      await dispatch(updateSobrietyDate({date: dateToSend})).unwrap();
      setEditingRecoveryDate(false);
    } catch (error: any) {
      console.error('Error updating recovery date:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update recovery date. Please try again.',
      );
    }
  };

  // Save phone number
  const savePhoneNumber = async () => {
    try {
      await dispatch(updateUserPhoneNumber(phoneNumber)).unwrap();
      Alert.alert('Success', 'Phone number updated successfully');
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update phone number. Please try again.',
      );
    }
  };

  // Save privacy settings via Redux
  const savePrivacySettings = async () => {
    try {
      await dispatch(
        updateUserPrivacySettings({
          showSobrietyDate: showRecoveryDate,
          showPhoneNumber,
          allowDirectMessages,
        }),
      ).unwrap();
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update privacy settings. Please try again.',
      );
    }
  };

  // Save notification settings via Redux
  const saveNotificationSettings = async () => {
    try {
      const currentSettings = userData?.notificationSettings || {};
      const hasChanges =
        meetingNotifications !== currentSettings.meetings ||
        announcementNotifications !== currentSettings.announcements ||
        celebrationNotifications !== currentSettings.celebrations;

      if (hasChanges) {
        await dispatch(
          updateUserNotificationSettings({
            meetings: meetingNotifications,
            announcements: announcementNotifications,
            celebrations: celebrationNotifications,
          }),
        ).unwrap();
      } else {
        Alert.alert('Info', 'No changes were made to notification settings.');
      }
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      Alert.alert(
        'Error',
        error.message ||
          'Failed to update notification settings. Please try again.',
      );
    }
  };

  // Display loading indicator if loading or userData is not yet available
  if (loading || !userData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Formatting helpers
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholderView} />
          </View>

          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {/* Display photo from local state (updated from Redux) */}
              {photoURL ? (
                <Image source={{uri: photoURL}} style={styles.profilePhoto} />
              ) : (
                <View style={styles.profileInitials}>
                  <Text style={styles.initialsText}>
                    {/* Display initial from Redux data */}
                    {userData?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={handleChoosePhoto}
                disabled={uploadingPhoto || loading}>
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.changePhotoText}>
                    {photoURL ? 'Change Photo' : 'Add Photo'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            {/* Display Name */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelContainer}>
                <Text style={styles.fieldLabel}>Display Name</Text>
                <TouchableOpacity
                  onPress={() => setEditingName(!editingName)}
                  style={styles.editButton}>
                  <Text style={styles.editButtonText}>
                    {editingName ? 'Cancel' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              {editingName ? (
                <View>
                  <Input
                    value={displayName} // Use local state for input
                    onChangeText={setDisplayName}
                    placeholder="Your name or nickname"
                  />
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>
                      Use first initial only
                    </Text>
                    <Switch
                      value={useInitialOnly} // Use local state
                      onValueChange={setUseInitialOnly}
                      trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                      thumbColor={useInitialOnly ? '#2196F3' : '#FFFFFF'}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    Only your first name and last initial will be shown to other
                    users (e.g., "John S.")
                  </Text>
                  <Button
                    title="Save Name"
                    onPress={saveDisplayName}
                    loading={loading} // Use Redux loading status
                    disabled={loading || !displayName.trim()}
                    size="small"
                    style={styles.saveButton}
                  />
                </View>
              ) : (
                <Text style={styles.fieldValue}>
                  {/* Display name from Redux store */}
                  {userData?.displayName || 'Not set'}
                </Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelContainer}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <TouchableOpacity
                  onPress={() => setEditingPhoneNumber(!editingPhoneNumber)}
                  style={styles.editButton}>
                  <Text style={styles.editButtonText}>
                    {editingPhoneNumber ? 'Cancel' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              {editingPhoneNumber ? (
                <View>
                  <Input
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Your phone number"
                    keyboardType="phone-pad"
                  />
                  <Text style={styles.helperText}>
                    This will be used for calls and text messages if you choose
                    to share it.
                  </Text>
                  <Button
                    title="Save Phone Number"
                    onPress={savePhoneNumber}
                    loading={loading}
                    disabled={loading}
                    size="small"
                    style={styles.saveButton}
                  />
                </View>
              ) : (
                <Text style={styles.fieldValue}>
                  {userData?.phoneNumber
                    ? formatPhoneNumber(userData.phoneNumber)
                    : 'Not set'}
                </Text>
              )}
            </View>

            {/* Recovery Date */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelContainer}>
                <Text style={styles.fieldLabel}>Recovery Date</Text>
                <TouchableOpacity
                  onPress={() => setEditingRecoveryDate(!editingRecoveryDate)}
                  style={styles.editButton}>
                  <Text style={styles.editButtonText}>
                    {editingRecoveryDate ? 'Cancel' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              {editingRecoveryDate ? (
                <View>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.datePickerButtonText}>
                      {recoveryDate // Use local state for display during edit
                        ? formatDateForDisplay(recoveryDate)
                        : 'Select your recovery date'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.helperText}>
                    This is used for calculating sobriety time and for optional
                    celebrations.
                  </Text>
                  <View style={styles.buttonRow}>
                    {recoveryDate && (
                      <Button
                        title="Clear Date"
                        variant="outline"
                        onPress={() => setRecoveryDate('')} // Clear local state
                        size="small"
                        style={styles.clearButton}
                      />
                    )}
                    <Button
                      title="Save Date"
                      onPress={saveRecoveryDate}
                      loading={loading} // Use Redux loading status
                      disabled={loading}
                      size="small"
                      style={styles.saveButton}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.fieldValue}>
                    {/* Display recovery date from Redux store */}
                    {userData?.sobrietyStartDate
                      ? formatDateForDisplay(userData.sobrietyStartDate)
                      : 'Not set'}
                  </Text>
                  {userData?.sobrietyStartDate && (
                    <Text style={styles.sobrietyText}>
                      {calculateSobrietyTime(userData.sobrietyStartDate)} of
                      sobriety
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                Share recovery date with groups
              </Text>
              <Switch
                value={showRecoveryDate} // Use local state for switch
                onValueChange={setShowRecoveryDate}
                trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                thumbColor={showRecoveryDate ? '#2196F3' : '#FFFFFF'}
              />
            </View>
            <Text style={styles.helperText}>
              Allow your recovery date to be visible to members of your home
              groups.
            </Text>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                Share phone number with groups
              </Text>
              <Switch
                value={showPhoneNumber}
                onValueChange={setShowPhoneNumber}
                trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                thumbColor={showPhoneNumber ? '#2196F3' : '#FFFFFF'}
              />
            </View>
            <Text style={styles.helperText}>
              Allow your phone number to be visible to members of your home
              groups. They will be able to call or text you directly.
            </Text>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Allow direct messages</Text>
              <Switch
                value={allowDirectMessages} // Use local state for switch
                onValueChange={setAllowDirectMessages}
                trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                thumbColor={allowDirectMessages ? '#2196F3' : '#FFFFFF'}
              />
            </View>
            <Text style={styles.helperText}>
              Allow other members to send you private messages.
            </Text>
            <Button
              title="Save Privacy Settings"
              onPress={savePrivacySettings}
              loading={loading} // Use Redux loading status
              disabled={loading}
              style={styles.sectionButton}
            />
          </View>

          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Meeting Reminders</Text>
              <Switch
                value={meetingNotifications} // Use local state for switch
                onValueChange={setMeetingNotifications}
                trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                thumbColor={meetingNotifications ? '#2196F3' : '#FFFFFF'}
              />
            </View>
            <Text style={styles.helperText}>
              Receive notifications before your scheduled meetings.
            </Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Group Announcements</Text>
              <Switch
                value={announcementNotifications} // Use local state for switch
                onValueChange={setAnnouncementNotifications}
                trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                thumbColor={announcementNotifications ? '#2196F3' : '#FFFFFF'}
              />
            </View>
            <Text style={styles.helperText}>
              Receive notifications for announcements from your groups.
            </Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Celebrations</Text>
              <Switch
                value={celebrationNotifications} // Use local state for switch
                onValueChange={setCelebrationNotifications}
                trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                thumbColor={celebrationNotifications ? '#2196F3' : '#FFFFFF'}
              />
            </View>
            <Text style={styles.helperText}>
              Receive notifications for sobriety milestones and celebrations.
            </Text>
            <Button
              title="Save Notification Settings"
              onPress={saveNotificationSettings}
              loading={loading} // Use Redux loading status
              disabled={loading}
              style={styles.sectionButton}
            />
          </View>

          {/* Account Security, Data & Privacy, Policy Sections remain the same */}
          {/* Account Security */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Security</Text>
            <TouchableOpacity
              style={styles.securityOption}
              onPress={() => {
                Alert.alert(
                  'Coming Soon',
                  'Two-factor authentication will be available in a future update.',
                );
              }}>
              <Text style={styles.securityOptionText}>
                Two-Factor Authentication
              </Text>
              <Text style={styles.securityOptionArrow}>→</Text>
            </TouchableOpacity>
          </View> */}

          {/* Data & Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Privacy</Text>
            <TouchableOpacity
              style={styles.securityOption}
              onPress={() => {
                Alert.alert(
                  'View Data',
                  'Would you like to download all your personal data?',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {
                      text: 'Download',
                      onPress: () => {
                        Alert.alert(
                          'Data Request Submitted',
                          'Your data will be prepared and sent to your email address within 48 hours.',
                        );
                      },
                    },
                  ],
                );
              }}>
              <Text style={styles.securityOptionText}>Download My Data</Text>
              <Text style={styles.securityOptionArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.securityOption}
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {
                      text: 'Delete Account',
                      style: 'destructive',
                      onPress: () => {
                        Alert.alert(
                          'Account Deletion Requested',
                          'Your account will be scheduled for deletion. You will receive a confirmation email with further instructions.',
                        );
                      },
                    },
                  ],
                );
              }}>
              <Text style={[styles.securityOptionText, styles.deleteText]}>
                Delete My Account
              </Text>
              <Text style={styles.securityOptionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Policy & Terms */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.securityOption}
              onPress={() => {
                Alert.alert(
                  'Privacy Policy',
                  'The full privacy policy would be displayed here.',
                );
              }}>
              <Text style={styles.securityOptionText}>Privacy Policy</Text>
              <Text style={styles.securityOptionArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.securityOption}
              onPress={() => {
                Alert.alert(
                  'Terms of Service',
                  'The full terms of service would be displayed here.',
                );
              }}>
              <Text style={styles.securityOptionText}>Terms of Service</Text>
              <Text style={styles.securityOptionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Homegroups v1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
        initialDate={recoveryDate ? new Date(recoveryDate) : new Date()}
        maxDate={new Date()}
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
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#2196F3',
  },
  placeholderView: {
    width: 40,
  },
  photoSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  photoContainer: {
    alignItems: 'center',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  profileInitials: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  initialsText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changePhotoButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
  },
  editButton: {
    padding: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: '#2196F3',
  },
  fieldValue: {
    fontSize: 16,
    color: '#212121',
  },
  sobrietyText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginTop: 4,
  },
  helperText: {
    color: '#757575',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
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
    flex: 1,
    paddingRight: 8,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#212121',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  clearButton: {
    flex: 0.48,
  },
  saveButton: {
    flex: 0.48,
  },
  sectionButton: {
    marginTop: 16,
  },
  securityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  securityOptionText: {
    fontSize: 16,
    color: '#212121',
  },
  securityOptionArrow: {
    fontSize: 18,
    color: '#BDBDBD',
  },
  deleteText: {
    color: '#F44336',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
});

export default ProfileManagementScreen;
