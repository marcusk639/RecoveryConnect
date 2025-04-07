// src/screens/groups/CreateGroupScreen.tsx

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MainStackParamList} from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {GroupModel} from '../../models/GroupModel';
import DayPicker from '../../components/groups/DayPicker';
import TimePicker from '../../components/groups/TimePicker';
import MeetingTypeSelector from '../../components/groups/MeetingTypeSelector';
import LocationPicker from '../../components/groups/LocationPicker';

type CreateGroupScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'CreateGroup'>;
};

const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({navigation}) => {
  // Step management
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Group details form state
  const [groupName, setGroupName] = useState<string>('');
  const [groupDescription, setGroupDescription] = useState<string>('');
  const [meetingDay, setMeetingDay] = useState<string>('');
  const [meetingTime, setMeetingTime] = useState<string>('');
  const [meetingFormat, setMeetingFormat] = useState<string>('Open Discussion');
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [location, setLocation] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [onlineLink, setOnlineLink] = useState<string>('');

  // Form validation errors
  const [errors, setErrors] = useState({
    groupName: '',
    groupDescription: '',
    meetingDay: '',
    meetingTime: '',
    location: '',
    address: '',
    onlineLink: '',
  });

  // Validate step 1 (basic info)
  const validateStep1 = (): boolean => {
    let isValid = true;
    const newErrors = {...errors};

    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
      isValid = false;
    } else if (groupName.length < 3) {
      newErrors.groupName = 'Group name must be at least 3 characters';
      isValid = false;
    } else {
      newErrors.groupName = '';
    }

    if (!groupDescription.trim()) {
      newErrors.groupDescription = 'Group description is required';
      isValid = false;
    } else {
      newErrors.groupDescription = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  // Validate step 2 (meeting details)
  const validateStep2 = (): boolean => {
    let isValid = true;
    const newErrors = {...errors};

    if (!meetingDay) {
      newErrors.meetingDay = 'Meeting day is required';
      isValid = false;
    } else {
      newErrors.meetingDay = '';
    }

    if (!meetingTime) {
      newErrors.meetingTime = 'Meeting time is required';
      isValid = false;
    } else {
      newErrors.meetingTime = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  // Validate step 3 (location info)
  const validateStep3 = (): boolean => {
    let isValid = true;
    const newErrors = {...errors};

    if (isOnline) {
      if (!onlineLink.trim()) {
        newErrors.onlineLink = 'Meeting link is required for online meetings';
        isValid = false;
      } else {
        newErrors.onlineLink = '';
      }
    } else {
      if (!location.trim()) {
        newErrors.location = 'Location name is required';
        isValid = false;
      } else {
        newErrors.location = '';
      }

      if (!address.trim()) {
        newErrors.address = 'Address is required';
        isValid = false;
      } else {
        newErrors.address = '';
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle navigation between steps
  const nextStep = (): void => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      createGroup();
    }
  };

  const prevStep = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  // Create the group in Firestore
  const createGroup = async (): Promise<void> => {
    setLoading(true);

    try {
      const groupData = {
        name: groupName,
        description: groupDescription,
        meetingDay: meetingDay,
        meetingTime: meetingTime,
        format: meetingFormat,
        isOnline: isOnline,
        location: isOnline ? 'Online Meeting' : location,
        address: isOnline ? '' : address,
        onlineLink: isOnline ? onlineLink : '',
      };

      const newGroup = await GroupModel.create(groupData);

      // Navigate to the new group screen
      if (newGroup.id) {
        navigation.replace('HomeGroup', {groupId: newGroup.id});
      } else {
        Alert.alert('Error', 'Failed to get group ID. Please try again.');
      }

      // Show success message
      Alert.alert(
        'Group Created',
        `${groupName} has been created successfully!`,
      );
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Component to render progress indicator
  const ProgressIndicator = (): React.ReactElement => (
    <View style={styles.progressContainer}>
      <View style={styles.progressStep}>
        <View
          style={[
            styles.stepCircle,
            currentStep >= 1 ? styles.activeStep : {},
          ]}>
          <Text
            style={[
              styles.stepNumber,
              currentStep >= 1 ? styles.activeStepNumber : {},
            ]}>
            1
          </Text>
        </View>
        <Text
          style={[
            styles.stepLabel,
            currentStep >= 1 ? styles.activeStepLabel : {},
          ]}>
          Basics
        </Text>
      </View>

      <View
        style={[
          styles.progressLine,
          currentStep >= 2 ? styles.activeProgressLine : {},
        ]}
      />

      <View style={styles.progressStep}>
        <View
          style={[
            styles.stepCircle,
            currentStep >= 2 ? styles.activeStep : {},
          ]}>
          <Text
            style={[
              styles.stepNumber,
              currentStep >= 2 ? styles.activeStepNumber : {},
            ]}>
            2
          </Text>
        </View>
        <Text
          style={[
            styles.stepLabel,
            currentStep >= 2 ? styles.activeStepLabel : {},
          ]}>
          Schedule
        </Text>
      </View>

      <View
        style={[
          styles.progressLine,
          currentStep >= 3 ? styles.activeProgressLine : {},
        ]}
      />

      <View style={styles.progressStep}>
        <View
          style={[
            styles.stepCircle,
            currentStep >= 3 ? styles.activeStep : {},
          ]}>
          <Text
            style={[
              styles.stepNumber,
              currentStep >= 3 ? styles.activeStepNumber : {},
            ]}>
            3
          </Text>
        </View>
        <Text
          style={[
            styles.stepLabel,
            currentStep >= 3 ? styles.activeStepLabel : {},
          ]}>
          Location
        </Text>
      </View>
    </View>
  );

  // Render step 1: Group Basics
  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Group Information</Text>
      <Text style={styles.stepDescription}>
        Tell us about your group to help others find and join it.
      </Text>

      <Input
        label="Group Name"
        value={groupName}
        onChangeText={text => setGroupName(text)}
        placeholder="e.g., Serenity Group"
        error={errors.groupName}
      />

      <Input
        label="Group Description"
        value={groupDescription}
        onChangeText={text => setGroupDescription(text)}
        placeholder="Describe your group, focus, and who it's for"
        multiline
        numberOfLines={4}
        error={errors.groupDescription}
      />

      <MeetingTypeSelector
        selectedFormat={meetingFormat}
        onSelectFormat={setMeetingFormat}
      />

      <View style={styles.buttonsContainer}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Button title="Next" onPress={nextStep} style={styles.continueButton} />
      </View>
    </View>
  );

  // Render step 2: Meeting Schedule
  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Meeting Schedule</Text>
      <Text style={styles.stepDescription}>
        When does your group meet? This helps members find and attend your
        meetings.
      </Text>

      <Text style={styles.inputLabel}>Meeting Day</Text>
      <DayPicker selectedDay={meetingDay} onSelectDay={setMeetingDay} />
      {errors.meetingDay ? (
        <Text style={styles.errorText}>{errors.meetingDay}</Text>
      ) : null}

      <Text style={styles.inputLabel}>Meeting Time</Text>
      <TimePicker selectedTime={meetingTime} onSelectTime={setMeetingTime} />
      {errors.meetingTime ? (
        <Text style={styles.errorText}>{errors.meetingTime}</Text>
      ) : null}

      <View style={styles.buttonsContainer}>
        <Button
          title="Back"
          variant="outline"
          onPress={prevStep}
          style={styles.backButton}
        />
        <Button title="Next" onPress={nextStep} style={styles.continueButton} />
      </View>
    </View>
  );

  // Render step 3: Location
  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Meeting Location</Text>
      <Text style={styles.stepDescription}>
        Where does your group meet? Members need this information to find you.
      </Text>

      <View style={styles.meetingTypeContainer}>
        <TouchableOpacity
          style={[
            styles.meetingTypeButton,
            !isOnline && styles.activeTypeButton,
          ]}
          onPress={() => setIsOnline(false)}>
          <Text
            style={[
              styles.meetingTypeText,
              !isOnline && styles.activeTypeText,
            ]}>
            In Person
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.meetingTypeButton,
            isOnline && styles.activeTypeButton,
          ]}
          onPress={() => setIsOnline(true)}>
          <Text
            style={[styles.meetingTypeText, isOnline && styles.activeTypeText]}>
            Online
          </Text>
        </TouchableOpacity>
      </View>

      {isOnline ? (
        <View>
          <Input
            label="Meeting Link"
            value={onlineLink}
            onChangeText={text => setOnlineLink(text)}
            placeholder="https://zoom.us/j/yourmeeting"
            error={errors.onlineLink}
          />
          <Text style={styles.helperText}>
            Provide a link to your online meeting (Zoom, Google Meet, etc.)
          </Text>
        </View>
      ) : (
        <View>
          <Input
            label="Location Name"
            value={location}
            onChangeText={text => setLocation(text)}
            placeholder="e.g., Community Center, Room 101"
            error={errors.location}
          />

          <LocationPicker
            initialAddress={address}
            onLocationSelect={location => {
              setAddress(location.address);
              setLocation(location.placeName || '');
            }}
            error={errors.address}
          />
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <Button
          title="Back"
          variant="outline"
          onPress={prevStep}
          style={styles.backButton}
        />
        <Button
          title="Create Group"
          onPress={nextStep}
          loading={loading}
          disabled={loading}
          style={styles.continueButton}
        />
      </View>
    </View>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Group</Text>
        <View style={{width: 40}} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Progress Indicator */}
          <ProgressIndicator />

          {/* Form Content */}
          <View style={styles.formContainer}>{renderStepContent()}</View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  backButtonText: {
    fontSize: 24,
    color: '#2196F3',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  progressStep: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeStep: {
    backgroundColor: '#2196F3',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#757575',
  },
  activeStepNumber: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#757575',
  },
  activeStepLabel: {
    color: '#2196F3',
    fontWeight: '500',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  activeProgressLine: {
    backgroundColor: '#2196F3',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  helperText: {
    color: '#757575',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  backButton: {
    flex: 0.48,
  },
  continueButton: {
    flex: 0.48,
  },
  meetingTypeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    marginTop: 8,
  },
  meetingTypeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeTypeButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  meetingTypeText: {
    fontSize: 14,
    color: '#757575',
  },
  activeTypeText: {
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default CreateGroupScreen;
