import React, {useState, useEffect} from 'react';
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
  FlatList,
  TextInput,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {MainStackParamList, Meeting, MeetingType, HomeGroup} from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {GroupModel} from '../../models/GroupModel';
import DayPicker from '../../components/groups/DayPicker';
import TimePicker from '../../components/groups/TimePicker';
import MeetingTypeSelector from '../../components/groups/MeetingTypeSelector';
import LocationPicker from '../../components/groups/LocationPicker';
import DatePicker from '../../components/common/DatePicker';
import {generateMeetingHash} from '../../utils/hashUtils';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {GroupStackParamList} from '../../types/navigation';

// Interface for meeting form data
type MeetingFormData = Meeting;

const CreateGroupScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<GroupStackParamList, 'CreateGroup'>>();
  const route = useRoute<RouteProp<GroupStackParamList, 'CreateGroup'>>();
  const initialMeeting = route.params?.meeting;

  // Step management
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Group details form state
  const [groupName, setGroupName] = useState<string>(
    initialMeeting ? `${initialMeeting.name} Group` : '',
  );
  const [groupDescription, setGroupDescription] = useState<string>(
    initialMeeting
      ? `A recovery group that meets at ${initialMeeting.name}`
      : '',
  );
  const [foundedDate, setFoundedDate] = useState<string>('');
  const [placeName, setPlaceName] = useState<string>('');

  // Meetings state
  const [meetings, setMeetings] = useState<MeetingFormData[]>(
    initialMeeting
      ? [
          {
            id: initialMeeting.id || generateMeetingHash(initialMeeting),
            name: initialMeeting.name,
            day: initialMeeting.day,
            time: initialMeeting.time,
            format: initialMeeting.format || 'Open Discussion',
            online: initialMeeting.online,
            location: initialMeeting.location,
            address: initialMeeting.address || '',
            city: initialMeeting.city || '',
            state: initialMeeting.state || '',
            zip: initialMeeting.zip || '',
            link: initialMeeting.link || '',
            type: initialMeeting.type,
            types: initialMeeting.types || [],
          },
        ]
      : [],
  );

  // Current meeting being edited
  const [currentMeetingIndex, setCurrentMeetingIndex] = useState<number>(0);

  // Form validation errors
  const [errors, setErrors] = useState({
    groupName: '',
    groupDescription: '',
    meetingDay: '',
    meetingTime: '',
    location: '',
    address: '',
    link: '',
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
    const currentMeeting = meetings[currentMeetingIndex];

    if (!currentMeeting.day) {
      newErrors.meetingDay = 'Meeting day is required';
      isValid = false;
    } else {
      newErrors.meetingDay = '';
    }

    if (!currentMeeting.time) {
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
    const currentMeeting = meetings[currentMeetingIndex];

    if (currentMeeting.online) {
      if (!currentMeeting.link?.trim()) {
        newErrors.link = 'Meeting link is required for online meetings';
        isValid = false;
      } else {
        newErrors.link = '';
      }
    } else {
      if (!currentMeeting.location?.trim()) {
        newErrors.location = 'Location name is required';
        isValid = false;
      } else {
        newErrors.location = '';
      }

      if (!currentMeeting.address?.trim()) {
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

  // Add a new meeting
  const addMeeting = (): void => {
    const baseMeeting = meetings[0] || {
      name: groupName,
      day: '',
      time: '',
      format: 'Open Discussion',
      isOnline: false,
      location: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      onlineLink: '',
      type: 'AA' as MeetingType,
      types: [],
    };

    const meetingId = generateMeetingHash({
      id: baseMeeting.id || '',
      name: groupName,
      type: baseMeeting.type,
      day: baseMeeting.day,
      time: baseMeeting.time,
      location: baseMeeting.location,
      types: [baseMeeting.type],
      online: baseMeeting.online,
      verified: true,
      addedBy: auth().currentUser?.uid || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newMeeting: MeetingFormData = {
      id: meetingId,
      name: groupName,
      day: baseMeeting.day,
      time: baseMeeting.time,
      format: baseMeeting.format,
      online: baseMeeting.online,
      location: baseMeeting.location,
      address: baseMeeting.address,
      city: baseMeeting.city,
      state: baseMeeting.state,
      zip: baseMeeting.zip,
      link: baseMeeting.link,
      type: baseMeeting.type,
      types: [baseMeeting.type],
    };

    setMeetings([...meetings, newMeeting]);
    setCurrentMeetingIndex(meetings.length);
  };

  // Remove a meeting
  const removeMeeting = (index: number): void => {
    if (meetings.length <= 1) {
      Alert.alert('Error', 'You must have at least one meeting');
      return;
    }

    const updatedMeetings = [...meetings];
    updatedMeetings.splice(index, 1);
    setMeetings(updatedMeetings);

    // Adjust current meeting index if needed
    if (currentMeetingIndex >= updatedMeetings.length) {
      setCurrentMeetingIndex(updatedMeetings.length - 1);
    }
  };

  // Update current meeting
  const updateCurrentMeeting = (
    field: keyof MeetingFormData,
    value: any,
  ): void => {
    const updatedMeetings = [...meetings];
    updatedMeetings[currentMeetingIndex] = {
      ...updatedMeetings[currentMeetingIndex],
      [field]: value,
    };
    setMeetings(updatedMeetings);
  };

  // Create the group in Firestore
  const createGroup = async (): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Prepare group data
      const groupData: Partial<HomeGroup> = {
        name: groupName,
        description: groupDescription,
        type: meetings[0].type,
        meetings: meetings.map(meeting => ({
          id: meeting.id,
          name: meeting.name,
          type: meeting.type,
          day: meeting.day,
          time: meeting.time,
          location: meeting.location,
          address: meeting.address,
          city: meeting.city,
          state: meeting.state,
          zip: meeting.zip,
          types: [meeting.type],
          online: meeting.online,
          link: meeting.link,
          verified: true,
          addedBy: currentUser.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        location: meetings[0].location,
        address: meetings[0].address,
        city: meetings[0].city,
        state: meetings[0].state,
        zip: meetings[0].zip,
        createdAt: new Date(),
        updatedAt: new Date(),
        memberCount: 1,
        admins: [currentUser.uid],
      };

      // Create the group
      const group = await GroupModel.create(groupData);

      // Update all meetings with the new group ID
      const batch = firestore().batch();
      for (const meeting of meetings) {
        const meetingRef = firestore().collection('meetings').doc(meeting.id);
        batch.set(meetingRef, {
          groupId: group.id,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          ...meeting,
        });
      }

      await batch.commit();

      navigation.navigate('GroupOverview', {
        groupId: group.id!,
        groupName: group.name,
      });
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
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
          Group Basics
        </Text>
      </View>
      <View style={styles.progressLine} />
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
          Meeting Schedule
        </Text>
      </View>
      <View style={styles.progressLine} />
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

  // Render step 1 (group basics)
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Group Information</Text>
      <Input
        label="Group Name"
        value={groupName}
        onChangeText={setGroupName}
        error={errors.groupName}
        placeholder="Enter group name"
      />
      <Input
        label="Description"
        value={groupDescription}
        onChangeText={setGroupDescription}
        error={errors.groupDescription}
        placeholder="Enter group description"
        multiline
        numberOfLines={3}
      />
      <DatePicker
        visible={false}
        onClose={() => {}}
        onSelect={date => setFoundedDate(date?.toISOString() || '')}
        initialDate={foundedDate ? new Date(foundedDate) : undefined}
      />
      <Input
        label="Place Name (Optional)"
        value={placeName}
        onChangeText={setPlaceName}
        placeholder="Enter place name"
      />
    </View>
  );

  // Render step 2 (meeting schedule)
  const renderStep2 = () => {
    const currentMeeting = meetings[currentMeetingIndex];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Meeting Schedule</Text>

        {/* Meeting selector */}
        <View style={styles.meetingSelector}>
          <Text style={styles.meetingSelectorLabel}>Meetings:</Text>
          <FlatList
            data={meetings}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={[
                  styles.meetingTab,
                  currentMeetingIndex === index && styles.activeMeetingTab,
                ]}
                onPress={() => setCurrentMeetingIndex(index)}>
                <Text
                  style={[
                    styles.meetingTabText,
                    currentMeetingIndex === index &&
                      styles.activeMeetingTabText,
                  ]}>
                  Meeting {index + 1}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => `meeting-${index}`}
          />
          <TouchableOpacity
            style={styles.addMeetingButton}
            onPress={addMeeting}>
            <Text style={styles.addMeetingButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Meeting details */}
        <View style={styles.meetingDetails}>
          <View style={styles.meetingHeader}>
            <Text style={styles.meetingTitle}>
              Meeting {currentMeetingIndex + 1}
            </Text>
            {meetings.length > 1 && (
              <TouchableOpacity
                style={styles.removeMeetingButton}
                onPress={() => removeMeeting(currentMeetingIndex)}>
                <Text style={styles.removeMeetingButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          <Input
            label="Meeting Name"
            value={currentMeeting.name}
            onChangeText={value => updateCurrentMeeting('name', value)}
            placeholder="Enter meeting name"
          />

          <DayPicker
            selectedDay={currentMeeting.day}
            onSelectDay={value => updateCurrentMeeting('day', value)}
          />

          <TimePicker
            selectedTime={currentMeeting.time}
            onSelectTime={value => updateCurrentMeeting('time', value)}
          />

          <Input
            label="Format"
            value={currentMeeting.format}
            onChangeText={value => updateCurrentMeeting('format', value)}
            placeholder="Enter meeting format"
          />
        </View>
      </View>
    );
  };

  const getMeetingAddress = (meeting: Meeting) => {
    if (meeting.online) {
      return meeting.link;
    }
    return `${meeting.address}, ${meeting.city}, ${meeting.state} ${meeting.zip}`;
  };

  // Render step 3 (location)
  const renderStep3 = () => {
    const currentMeeting = meetings[currentMeetingIndex];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Meeting Location</Text>

        {/* Meeting selector */}
        <View style={styles.meetingSelector}>
          <Text style={styles.meetingSelectorLabel}>Meetings:</Text>
          <FlatList
            data={meetings}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={[
                  styles.meetingTab,
                  currentMeetingIndex === index && styles.activeMeetingTab,
                ]}
                onPress={() => setCurrentMeetingIndex(index)}>
                <Text
                  style={[
                    styles.meetingTabText,
                    currentMeetingIndex === index &&
                      styles.activeMeetingTabText,
                  ]}>
                  Meeting {index + 1}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => `meeting-${index}`}
          />
        </View>

        {/* Location details */}
        <View style={styles.meetingDetails}>
          <View style={styles.meetingHeader}>
            <Text style={styles.meetingTitle}>
              Meeting {currentMeetingIndex + 1} Location
            </Text>
          </View>

          <View style={styles.onlineToggle}>
            <Text style={styles.onlineToggleLabel}>Online Meeting</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                currentMeeting.online ? styles.toggleButtonActive : {},
              ]}
              onPress={() =>
                updateCurrentMeeting('online', !currentMeeting.online)
              }>
              <Text
                style={[
                  styles.toggleButtonText,
                  currentMeeting.online ? styles.toggleButtonTextActive : {},
                ]}>
                {currentMeeting.online ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>
          </View>

          {currentMeeting.online ? (
            <Input
              label="Online Meeting Link"
              value={currentMeeting.link}
              onChangeText={value => updateCurrentMeeting('link', value)}
              error={errors.link}
              placeholder="Enter online meeting link"
            />
          ) : (
            <>
              <Input
                label="Location Name"
                value={currentMeeting.location}
                onChangeText={value => updateCurrentMeeting('location', value)}
                error={errors.location}
                placeholder="Enter location name"
              />

              <LocationPicker
                label="Address"
                initialAddress={getMeetingAddress(currentMeeting)}
                initialLocation={
                  currentMeeting.lat && currentMeeting.lng
                    ? {
                        latitude: currentMeeting.lat,
                        longitude: currentMeeting.lng,
                      }
                    : undefined
                }
                onLocationSelect={location =>
                  updateCurrentMeeting('address', location.address)
                }
              />

              <Input
                label="City"
                value={currentMeeting.city}
                onChangeText={value => updateCurrentMeeting('city', value)}
                placeholder="Enter city"
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="State"
                    value={currentMeeting.state}
                    onChangeText={value => updateCurrentMeeting('state', value)}
                    placeholder="State"
                  />
                </View>

                <View style={styles.halfWidth}>
                  <Input
                    label="ZIP"
                    value={currentMeeting.zip}
                    onChangeText={value => updateCurrentMeeting('zip', value)}
                    placeholder="ZIP"
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  // Render the current step content
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ProgressIndicator />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}>
          {renderStepContent()}
        </ScrollView>

        <View
          style={{
            ...styles.footer,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}>
          {currentStep > 1 && (
            <Button
              style={{height: 50, width: '48%'}}
              size="medium"
              fullWidth={false}
              title="Back"
              onPress={prevStep}
              variant="secondary"
              disabled={loading}
            />
          )}
          <Button
            style={{height: 50, width: '48%'}}
            title={currentStep === 3 ? 'Create Group' : 'Next'}
            onPress={nextStep}
            disabled={loading}
            size="medium"
            fullWidth={false}
          />
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#2196F3',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  progressStep: {
    alignItems: 'center',
  },
  progressLine: {
    height: 2,
    width: 40,
    backgroundColor: '#E0E0E0',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: '#2196F3',
  },
  stepNumber: {
    fontSize: 16,
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
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  stepContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  onlineToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  onlineToggleLabel: {
    fontSize: 16,
    color: '#212121',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  toggleButtonActive: {
    backgroundColor: '#2196F3',
  },
  toggleButtonText: {
    color: '#757575',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  meetingSelector: {
    marginBottom: 16,
  },
  meetingSelectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meetingTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  activeMeetingTab: {
    backgroundColor: '#2196F3',
  },
  meetingTabText: {
    color: '#757575',
  },
  activeMeetingTabText: {
    color: '#FFFFFF',
  },
  addMeetingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addMeetingButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  meetingDetails: {
    marginTop: 16,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  removeMeetingButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
  },
  removeMeetingButtonText: {
    color: '#F44336',
    fontSize: 12,
  },
});

export default CreateGroupScreen;
