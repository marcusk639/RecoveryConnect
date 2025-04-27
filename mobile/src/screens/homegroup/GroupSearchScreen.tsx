import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MainTabParamList} from '../../types/navigation';
import auth from '@react-native-firebase/auth';
import {GroupModel} from '../../models/GroupModel';
import {HomeGroup, MeetingType} from '../../types';
import Geolocation from '@react-native-community/geolocation';
import {Picker} from '@react-native-picker/picker';
import {useAppDispatch, useAppSelector} from '../../store';
import {selectUserData, fetchUserData} from '../../store/slices/authSlice';

// Define a more specific type for the Home tab navigation
type HomeTabParams = {
  screen: 'GroupOverview';
  params: {
    groupId: string;
    groupName: string;
  };
};

// Define a composite type for nested navigation
type CompositeParamList = {
  Home: HomeTabParams;
  Meetings: undefined;
  Treasury: undefined;
  Profile: undefined;
  GroupSearch: undefined;
};

type GroupSearchScreenNavigationProp = StackNavigationProp<
  CompositeParamList,
  'GroupSearch'
>;

const GroupSearchScreen: React.FC = () => {
  const navigation = useNavigation<GroupSearchScreenNavigationProp>();
  const dispatch = useAppDispatch();

  // Local state for UI and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [allGroups, setAllGroups] = useState<HomeGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<HomeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<
    MeetingType | 'All'
  >('All');

  // Get user data from Redux
  const userData = useAppSelector(selectUserData);
  const userJoinedGroups = userData?.homeGroups || [];

  // Define Meeting Types for Picker
  const meetingTypes: (MeetingType | 'All')[] = [
    'All',
    'AA',
    'NA',
    'IOP',
    'Religious',
    'Celebrate Recovery',
    'Custom',
  ];

  // Fetch Location and Groups on Mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Load groups once location is available
  useEffect(() => {
    if (userLocation) {
      loadNearbyGroups();
    }
    // If location fails, don't load groups initially, show message in empty state
    else if (locationError) {
      setLoading(false);
      setAllGroups([]);
      setFilteredGroups([]);
      Alert.alert(
        'Location Error',
        'Could not get your location. Please enable location services to find nearby groups.',
      );
    }
  }, [userLocation, locationError]);

  // Filter groups whenever dependencies change
  useEffect(() => {
    filterGroups();
  }, [searchQuery, allGroups, selectedTypeFilter]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      getOneTimeLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message:
              'This app needs to access your location to find nearby groups.',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getOneTimeLocation();
        } else {
          setLocationError('Location permission denied');
          setLoading(false);
        }
      } catch (err) {
        console.warn(err);
        setLocationError('Error requesting location permission');
        setLoading(false);
      }
    }
  };

  const getOneTimeLocation = () => {
    setLocationError(null);
    Geolocation.getCurrentPosition(
      position => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        setLocationError(error.message);
        console.error('Geolocation Error:', error);
        setLoading(false);
      },
      {enableHighAccuracy: false, timeout: 30000, maximumAge: 1000 * 60 * 5},
    );
  };

  const loadNearbyGroups = async () => {
    if (!userLocation) return;
    try {
      setLoading(true);
      const nearbyGroups = await GroupModel.searchGroupsByLocation(
        userLocation.latitude,
        userLocation.longitude,
        25,
      );
      setAllGroups(nearbyGroups);
    } catch (error) {
      console.error('Error loading nearby groups:', error);
      Alert.alert(
        'Error',
        'Failed to load nearby groups. Please try again later.',
      );
      setAllGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    let tempFiltered = [...allGroups];

    if (selectedTypeFilter !== 'All') {
      tempFiltered = tempFiltered.filter(
        group => group.type === selectedTypeFilter,
      );
    }

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      tempFiltered = tempFiltered.filter(
        group =>
          group.name.toLowerCase().includes(lowerQuery) ||
          group.description.toLowerCase().includes(lowerQuery) ||
          (group.location &&
            group.location.toLowerCase().includes(lowerQuery)) ||
          (group.city && group.city.toLowerCase().includes(lowerQuery)) ||
          (group.state && group.state.toLowerCase().includes(lowerQuery)),
      );
    }

    setFilteredGroups(tempFiltered);
  };

  const handleJoinGroup = async (group: HomeGroup) => {
    if (!group.id) return;
    try {
      setJoining(group.id);

      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to join a group.');
        setJoining(null);
        return;
      }

      await GroupModel.addMember(group.id, currentUser.uid);

      setAllGroups(prevGroups =>
        prevGroups.map(g =>
          g.id === group.id ? {...g, memberCount: g.memberCount + 1} : g,
        ),
      );

      await dispatch(fetchUserData(currentUser.uid)).unwrap();

      Alert.alert('Success', `You\'ve joined ${group.name}!`, [
        {
          text: 'View Group',
          onPress: () =>
            navigation.navigate('Home', {
              screen: 'GroupOverview',
              params: {
                groupId: group.id!,
                groupName: group.name,
              },
            }),
        },
        {
          text: 'Stay Here',
          style: 'cancel',
        },
      ]);
    } catch (error: any) {
      console.error('Error joining group:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to join group. Please try again.',
      );
    } finally {
      setJoining(null);
    }
  };

  const isUserJoinedGroup = (groupId?: string) => {
    if (!groupId) return false;
    return userJoinedGroups.includes(groupId);
  };

  const renderGroupItem = ({item}: {item: HomeGroup}) => (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{item.name}</Text>
        {isUserJoinedGroup(item.id) ? (
          <View style={styles.joinedBadge}>
            <Text style={styles.joinedBadgeText}>Joined</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoinGroup(item)}
            disabled={joining === item.id}>
            {joining === item.id ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>Join</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.groupDescription}>{item.description}</Text>

      <View style={styles.groupDetails}>
        <Text style={styles.groupDetailText}>
          <Text style={styles.groupDetailLabel}>Type: </Text>
          {item.type}
        </Text>
        <Text style={styles.groupDetailText}>
          <Text style={styles.groupDetailLabel}>Location: </Text>
          {item.location ||
            (item.city && item.state
              ? `${item.city}, ${item.state}`
              : 'Not specified')}
        </Text>
        <Text style={styles.groupDetailText}>
          <Text style={styles.groupDetailLabel}>Members: </Text>
          {item.memberCount}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() =>
          navigation.navigate('Home', {
            screen: 'GroupOverview',
            params: {
              groupId: item.id!,
              groupName: item.name,
            },
          })
        }>
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Find Groups</Text>
        <Text style={styles.headerSubtitle}>
          {userLocation
            ? 'Showing groups within 25 miles'
            : 'Enable location to find nearby groups'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, description, location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedTypeFilter}
            onValueChange={(itemValue: MeetingType | 'All') =>
              setSelectedTypeFilter(itemValue)
            }
            style={styles.picker}
            itemStyle={styles.pickerItem}
            dropdownIconColor="#2196F3">
            {meetingTypes.map(type => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={item => item.id!}
          contentContainerStyle={styles.groupList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {!userLocation && !locationError
                  ? 'Enable location services to find nearby groups'
                  : allGroups.length === 0 && userLocation
                  ? 'No groups found within 25 miles'
                  : 'No groups match your current filters'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupList: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  joinButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  joinedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  joinedBadgeText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  groupDescription: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 12,
    lineHeight: 20,
  },
  groupDetails: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  groupDetailText: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  groupDetailLabel: {
    fontWeight: '600',
    color: '#424242',
  },
  viewButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default GroupSearchScreen;
