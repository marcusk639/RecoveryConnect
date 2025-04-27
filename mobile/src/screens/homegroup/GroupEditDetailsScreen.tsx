import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {GroupStackParamList} from '../../types/navigation';
import {GroupModel} from '../../models/GroupModel';
import Button from '../../components/common/Button';
import {auth} from '../../services/firebase/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import LocationPicker, {
  LocationProps,
} from '../../components/groups/LocationPicker';
import {updateGroup} from '../../store/slices/groupsSlice';
import {useAppDispatch} from '../../store';

type GroupEditDetailsScreenProps = {
  navigation: StackNavigationProp<GroupStackParamList, 'GroupEditDetails'>;
  route: RouteProp<GroupStackParamList, 'GroupEditDetails'>;
};

const GroupEditDetailsScreen: React.FC<GroupEditDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const {groupId, groupName} = route.params;
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  // Form state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  // const [meetingDay, setMeetingDay] = useState<string>('');
  // const [meetingTime, setMeetingTime] = useState<Date>(new Date());
  const [location, setLocation] = useState<LocationProps>({
    address: '',
    latitude: 0,
    longitude: 0,
    placeName: '',
  });
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  // Load group data
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setLoading(true);

        // Get group details
        const groupData = await GroupModel.getById(groupId);

        if (groupData) {
          setGroup(groupData);
          setName(groupData.name || '');
          setDescription(groupData.description || '');
          // setMeetingDay(groupData.meetingDay || '');
          // setMeetingTime(
          //   groupData.meetingTime
          //     ? new Date(groupData.meetingTime)
          //     : new Date(),
          // );
          setLocation({
            address: groupData.address || '',
            latitude: groupData.lat || 0,
            longitude: groupData.lng || 0,
            placeName: groupData.location || '',
          });

          // Check if current user is admin
          setIsAdmin(
            groupData.admins?.includes(auth.currentUser?.uid || '') || false,
          );

          if (!groupData.admins?.includes(auth.currentUser?.uid || '')) {
            Alert.alert(
              'Error',
              'You do not have permission to edit this group',
            );
            navigation.goBack();
          }
        } else {
          setError('Group not found');
        }
      } catch (error) {
        console.error('Error loading group data:', error);
        setError('Failed to load group information');
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [groupId, navigation]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate inputs
      if (!name.trim()) {
        Alert.alert('Error', 'Group name is required');
        return;
      }

      // Update group details
      await GroupModel.update(groupId, {
        name: name.trim(),
        description: description.trim(),
        location: location.address.trim(),
        lat: location.latitude,
        lng: location.longitude,
        placeName: location.placeName,
      });

      dispatch(
        updateGroup({
          groupId,
          groupData: {
            name: name.trim(),
            description: description.trim(),
            location: location.address.trim(),
            lat: location.latitude,
            lng: location.longitude,
          },
        }),
      );

      Alert.alert('Success', 'Group details updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating group:', error);
      Alert.alert('Error', 'Failed to update group details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Group Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter group name"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter group description"
            multiline
            numberOfLines={4}
          />

          <LocationPicker
            initialAddress={location.address}
            initialLocation={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            onLocationSelect={location => {
              setLocation(location);
            }}
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    marginTop: 20,
  },
});

export default GroupEditDetailsScreen;
