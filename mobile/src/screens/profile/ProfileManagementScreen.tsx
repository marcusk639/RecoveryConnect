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
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {MainStackParamList, RootStackParamList} from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DatePicker from '../../components/common/DatePicker';
import {UserModel} from '../../models/UserModel';

type ProfileManagementScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'Profile'>;
};

const ProfileManagementScreen: React.FC<ProfileManagementScreenProps> = ({
  navigation,
}) => {
  const rootNavigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  // User data state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Profile edit states
  const [editingName, setEditingName] = useState<boolean>(false);
  const [editingRecoveryDate, setEditingRecoveryDate] =
    useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Form values
  const [displayName, setDisplayName] = useState<string>('');
  const [useInitialOnly, setUseInitialOnly] = useState<boolean>(false);
  const [recoveryDate, setRecoveryDate] = useState<string>('');

  // Privacy settings
  const [showRecoveryDate, setShowRecoveryDate] = useState<boolean>(false);
  const [allowDirectMessages, setAllowDirectMessages] = useState<boolean>(true);

  // Notification settings
  const [meetingNotifications, setMeetingNotifications] =
    useState<boolean>(true);
  const [announcementNotifications, setAnnouncementNotifications] =
    useState<boolean>(true);
  const [celebrationNotifications, setCelebrationNotifications] =
    useState<boolean>(true);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = auth().currentUser;

        if (!currentUser) {
          rootNavigation.navigate('Auth');
          return;
        }

        const userData = await UserModel.getById(currentUser.uid);

        if (userData) {
          setUser(userData);
          setDisplayName(userData.displayName || '');

          // Check if using initial only
          if (
            userData.displayName &&
            userData.displayName.length === 2 &&
            userData.displayName.endsWith('.')
          ) {
            setUseInitialOnly(true);
          }

          setRecoveryDate(userData.recoveryDate || '');
          setShowRecoveryDate(userData.privacySettings.showRecoveryDate);
          setAllowDirectMessages(userData.privacySettings.allowDirectMessages);

          // Notification settings
          setMeetingNotifications(userData.notificationSettings.meetings);
          setAnnouncementNotifications(
            userData.notificationSettings.announcements,
          );
          setCelebrationNotifications(
            userData.notificationSettings.celebrations,
          );
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert(
          'Error',
          'Failed to load your profile data. Please try again later.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [rootNavigation]);

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
      const recoveryDate = new Date(dateString);
      const today = new Date();

      const diffTime = Math.abs(today.getTime() - recoveryDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

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

  // Save profile name
  const saveDisplayName = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Format name based on preference
      const formattedName = useInitialOnly
        ? `${displayName.trim().charAt(0)}.`
        : displayName.trim();

      // Update Firebase Auth profile
      await currentUser.updateProfile({
        displayName: formattedName,
      });

      // Update Firestore user document
      await UserModel.update(currentUser.uid, {
        displayName: formattedName,
      });

      // Update local state
      setUser({...user, displayName: formattedName});
      setDisplayName(formattedName);

      setEditingName(false);
      Alert.alert('Success', 'Display name updated successfully');
    } catch (error) {
      console.error('Error updating display name:', error);
      Alert.alert('Error', 'Failed to update display name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Save recovery date
  const saveRecoveryDate = async () => {
    setSaving(true);
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Update Firestore user document
      await UserModel.update(currentUser.uid, {
        recoveryDate: recoveryDate,
      });

      // Update local state
      setUser({...user, recoveryDate: recoveryDate});

      setEditingRecoveryDate(false);
      Alert.alert('Success', 'Recovery date updated successfully');
    } catch (error) {
      console.error('Error updating recovery date:', error);
      Alert.alert('Error', 'Failed to update recovery date. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Save privacy settings
  const savePrivacySettings = async () => {
    setSaving(true);
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const privacySettings = {
        showRecoveryDate,
        allowDirectMessages,
      };

      // Update privacy settings
      await UserModel.updatePrivacySettings(currentUser.uid, privacySettings);

      // Update local state
      setUser({...user, privacySettings});

      Alert.alert('Success', 'Privacy settings updated successfully');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      Alert.alert(
        'Error',
        'Failed to update privacy settings. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const notificationSettings = {
        meetings: meetingNotifications,
        announcements: announcementNotifications,
        celebrations: celebrationNotifications,
      };

      // Update notification settings
      await UserModel.updateNotificationSettings(
        currentUser.uid,
        notificationSettings,
      );

      // Update local state
      setUser({...user, notificationSettings});

      Alert.alert('Success', 'Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert(
        'Error',
        'Failed to update notification settings. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

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
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Your name or nickname"
                  />

                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>
                      Use first initial only
                    </Text>
                    <Switch
                      value={useInitialOnly}
                      onValueChange={setUseInitialOnly}
                      trackColor={{false: '#E0E0E0', true: '#90CAF9'}}
                      thumbColor={useInitialOnly ? '#2196F3' : '#FFFFFF'}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    If enabled, only your first initial will be shown to other
                    users (e.g., "J.")
                  </Text>

                  <Button
                    title="Save Name"
                    onPress={saveDisplayName}
                    loading={saving}
                    disabled={saving || !displayName.trim()}
                    size="small"
                    style={styles.saveButton}
                  />
                </View>
              ) : (
                <Text style={styles.fieldValue}>
                  {user?.displayName || 'Not set'}
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
                      {recoveryDate
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
                        onPress={() => setRecoveryDate('')}
                        size="small"
                        style={styles.clearButton}
                      />
                    )}

                    <Button
                      title="Save Date"
                      onPress={saveRecoveryDate}
                      loading={saving}
                      disabled={saving}
                      size="small"
                      style={styles.saveButton}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.fieldValue}>
                    {recoveryDate
                      ? formatDateForDisplay(recoveryDate)
                      : 'Not set'}
                  </Text>

                  {recoveryDate && (
                    <Text style={styles.sobrietyText}>
                      {calculateSobrietyTime(recoveryDate)} of sobriety
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
                value={showRecoveryDate}
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
              <Text style={styles.switchLabel}>Allow direct messages</Text>
              <Switch
                value={allowDirectMessages}
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
              loading={saving}
              disabled={saving}
              style={styles.sectionButton}
            />
          </View>

          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Meeting Reminders</Text>
              <Switch
                value={meetingNotifications}
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
                value={announcementNotifications}
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
                value={celebrationNotifications}
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
              loading={saving}
              disabled={saving}
              style={styles.sectionButton}
            />
          </View>

          {/* Account Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Security</Text>

            {/* <TouchableOpacity
              style={styles.securityOption}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.securityOptionText}>Change Password</Text>
              <Text style={styles.securityOptionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.securityOption}
              onPress={() => navigation.navigate('EmailVerification')}>
              <Text style={styles.securityOptionText}>Verify Email</Text>
              <Text style={styles.securityOptionArrow}>→</Text>
            </TouchableOpacity> */}

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
          </View>

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
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
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
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Delete Account',
                      style: 'destructive',
                      onPress: () => {
                        // Implement account deletion here
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
            <Text style={styles.versionText}>Recovery Connect v1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
        initialDate={recoveryDate ? new Date(recoveryDate) : new Date()}
        maxDate={new Date()} // Can't select future dates
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
