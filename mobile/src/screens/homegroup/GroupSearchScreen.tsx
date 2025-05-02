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
  Modal,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MainTabParamList} from '../../types/navigation';
import auth from '@react-native-firebase/auth';
import {HomeGroup, MeetingType} from '../../types';
import Geolocation from '@react-native-community/geolocation';
import {Picker} from '@react-native-picker/picker';
import {useAppDispatch, useAppSelector} from '../../store';
import {selectUserData, fetchUserData} from '../../store/slices/authSlice';
import {
  searchGroupsByLocation,
  selectNearbyGroups,
  selectGroupsStatus,
  selectGroupsError,
} from '../../store/slices/groupsSlice';
import {GroupModel} from '../../models/GroupModel';
import LocationPicker from '../../components/groups/LocationPicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  // New state for location search
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [customLocation, setCustomLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(25);
  const [usingCustomLocation, setUsingCustomLocation] = useState(false);

  // New state for type filter modal
  const [showTypeFilterModal, setShowTypeFilterModal] = useState(false);

  // Get user data from Redux
  const userData = useAppSelector(selectUserData);
  const userJoinedGroups = userData?.homeGroups || [];

  // Get groups data from Redux
  const nearbyGroups = useAppSelector(selectNearbyGroups);
  const groupsStatus = useAppSelector(selectGroupsStatus);
  const groupsError = useAppSelector(selectGroupsError);

  // Define Meeting Types for Picker
  const meetingTypes: (MeetingType | 'All')[] = [
    'All',
    'AA',
    'NA',
    'Celebrate Recovery',
    'Custom',
  ];

  // Fetch Location on Mount
  useEffect(() => {
    if (!usingCustomLocation) {
      requestLocationPermission();
    }
  }, [usingCustomLocation]);

  // Load groups once location is available
  useEffect(() => {
    if (userLocation && !usingCustomLocation) {
      loadNearbyGroups(
        userLocation.latitude,
        userLocation.longitude,
        searchRadius,
      );
    } else if (customLocation && usingCustomLocation) {
      loadNearbyGroups(
        customLocation.latitude,
        customLocation.longitude,
        searchRadius,
      );
    }
    // Only show error if we're not using custom location and there's an error
    else if (locationError && !usingCustomLocation) {
      setLoading(false);
      setAllGroups([]);
      setFilteredGroups([]);
      Alert.alert(
        'Location Error',
        'Could not get your location. Please use the location search to find groups.',
      );
    }
  }, [
    userLocation,
    customLocation,
    locationError,
    usingCustomLocation,
    searchRadius,
  ]);

  // Update loading state from Redux
  useEffect(() => {
    setLoading(groupsStatus === 'loading');
  }, [groupsStatus]);

  // Update groups from Redux
  useEffect(() => {
    if (nearbyGroups) {
      setAllGroups(nearbyGroups);
    }
  }, [nearbyGroups]);

  // Handle Redux errors
  useEffect(() => {
    if (groupsError) {
      Alert.alert(
        'Error',
        'Failed to load nearby groups. Please try again later.',
      );
    }
  }, [groupsError]);

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

  const loadNearbyGroups = (
    latitude: number,
    longitude: number,
    radius: number = 25,
  ) => {
    // Dispatch the searchGroupsByLocation action
    dispatch(
      searchGroupsByLocation({
        latitude,
        longitude,
        radius,
      }),
    );
  };

  useEffect(() => {
    if (
      customLocation?.address ||
      customLocation?.latitude ||
      customLocation?.longitude
    ) {
      dispatch(
        searchGroupsByLocation({
          latitude: customLocation?.latitude,
          longitude: customLocation?.longitude,
          radius: searchRadius,
        }),
      );
    }
  }, [
    customLocation?.address,
    customLocation?.latitude,
    customLocation?.longitude,
  ]);

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

  const handleLocationSelect = (location: {
    address: string;
    latitude: number;
    longitude: number;
    placeName?: string;
  }) => {
    setCustomLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
    });
    setUsingCustomLocation(true);
  };

  const handleViewDetails = (group: HomeGroup) => {
    navigation.navigate('Home', {
      screen: 'GroupOverview',
      params: {
        groupId: group.id!,
        groupName: group.name,
      },
    });
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
        {item.distanceInKm !== undefined && (
          <Text style={styles.groupDetailText}>
            <Text style={styles.groupDetailLabel}>Distance: </Text>
            {item.distanceInKm.toFixed(1)} miles
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => handleViewDetails(item)}>
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Find Groups</Text>
        <Text style={styles.headerSubtitle}>
          {customLocation && usingCustomLocation
            ? `Showing groups near ${customLocation.address.split(',')[0]}`
            : userLocation
            ? `Showing groups within ${searchRadius} miles of your location`
            : 'Search for recovery groups'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        {/* Search by name/description */}
        <View style={styles.searchInputContainer}>
          <Icon
            name="magnify"
            size={20}
            color="#757575"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or description"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter and Location Search Buttons */}
        <View style={styles.filterButtonsRow}>
          {/* Filter by Type */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowTypeFilterModal(true)}>
            <Icon name="filter-variant" size={18} color="#2196F3" />
            <Text style={styles.filterButtonText}>
              {selectedTypeFilter === 'All' ? 'All Types' : selectedTypeFilter}
            </Text>
          </TouchableOpacity>

          {/* Location Search */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setShowLocationPicker(true)}>
            <Icon name="map-marker" size={18} color="#2196F3" />
            <Text style={styles.locationButtonText}>
              {customLocation ? 'Change Location' : 'Search Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search radius selector */}
        {(userLocation || (customLocation && usingCustomLocation)) && (
          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>
              Search radius: {searchRadius} miles
            </Text>
            <View style={styles.radiusButtonsRow}>
              {[5, 10, 25, 50, 100].map(radius => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusButton,
                    searchRadius === radius && styles.radiusButtonActive,
                  ]}
                  onPress={() => {
                    setSearchRadius(radius);
                    // Reload groups with new radius
                    if (usingCustomLocation && customLocation) {
                      loadNearbyGroups(
                        customLocation.latitude,
                        customLocation.longitude,
                        radius,
                      );
                    } else if (userLocation) {
                      loadNearbyGroups(
                        userLocation.latitude,
                        userLocation.longitude,
                        radius,
                      );
                    }
                  }}>
                  <Text
                    style={[
                      styles.radiusButtonText,
                      searchRadius === radius && styles.radiusButtonTextActive,
                    ]}>
                    {radius}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
                {!userLocation && !customLocation
                  ? 'Search for a location to find groups'
                  : groupsError
                  ? 'Error loading groups. Please try again later.'
                  : allGroups.length === 0
                  ? `No groups found within ${searchRadius} miles`
                  : 'No groups match your current filters'}
              </Text>
              {groupsError && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    if (usingCustomLocation && customLocation) {
                      loadNearbyGroups(
                        customLocation.latitude,
                        customLocation.longitude,
                        searchRadius,
                      );
                    } else if (userLocation) {
                      loadNearbyGroups(
                        userLocation.latitude,
                        userLocation.longitude,
                        searchRadius,
                      );
                    }
                  }}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowLocationPicker(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Search Location</Text>
            <TouchableOpacity
              onPress={() => setShowLocationPicker(false)}
              style={styles.closeButton}>
              <Icon name="close" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              label="Search for groups near..."
              initialAddress={customLocation?.address}
            />

            <TouchableOpacity
              style={styles.useMyLocationButton}
              onPress={() => {
                setUsingCustomLocation(true);
                setShowLocationPicker(false);
                requestLocationPermission();
              }}>
              <Text style={styles.useMyLocationText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Type Filter Modal */}
      <Modal
        visible={showTypeFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTypeFilterModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeFilterModal(false)}>
          <View style={styles.filterModalContainer}>
            <View style={styles.pullIndicator} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Group Type</Text>
              <TouchableOpacity
                onPress={() => setShowTypeFilterModal(false)}
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#2196F3" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={meetingTypes}
              keyExtractor={item => item}
              renderItem={({item: type}) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeFilterButton,
                    selectedTypeFilter === type &&
                      styles.typeFilterButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedTypeFilter(type);
                    setShowTypeFilterModal(false);
                  }}>
                  <View style={styles.typeFilterButtonContent}>
                    {/* Icons for different meeting types */}
                    <View style={styles.typeIconContainer}>
                      {type === 'AA' && (
                        <Icon
                          name="alpha-a"
                          size={24}
                          color={
                            selectedTypeFilter === type ? '#FFFFFF' : '#2196F3'
                          }
                        />
                      )}
                      {type === 'NA' && (
                        <Icon
                          name="alpha-n"
                          size={24}
                          color={
                            selectedTypeFilter === type ? '#FFFFFF' : '#2196F3'
                          }
                        />
                      )}
                      {type === 'IOP' && (
                        <Icon
                          name="hospital-building"
                          size={24}
                          color={
                            selectedTypeFilter === type ? '#FFFFFF' : '#2196F3'
                          }
                        />
                      )}
                      {type === 'Religious' && (
                        <Icon
                          name="church"
                          size={24}
                          color={
                            selectedTypeFilter === type ? '#FFFFFF' : '#2196F3'
                          }
                        />
                      )}
                      {type === 'Celebrate Recovery' && (
                        <Icon
                          name="party-popper"
                          size={24}
                          color={
                            selectedTypeFilter === type ? '#FFFFFF' : '#2196F3'
                          }
                        />
                      )}
                      {type === 'Custom' && (
                        <Icon
                          name="cog"
                          size={24}
                          color={
                            selectedTypeFilter === type ? '#FFFFFF' : '#2196F3'
                          }
                        />
                      )}
                      {type === 'All' && (
                        <Icon
                          name="filter-variant-remove"
                          size={24}
                          color={
                            selectedTypeFilter === type ? '#FFFFFF' : '#2196F3'
                          }
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.typeFilterButtonText,
                        selectedTypeFilter === type &&
                          styles.typeFilterButtonTextActive,
                      ]}>
                      {type}
                    </Text>
                  </View>
                  {selectedTypeFilter === type && (
                    <Icon
                      name="check"
                      size={24}
                      color="#FFFFFF"
                      style={styles.typeFilterCheckIcon}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    marginRight: 8,
  },
  filterButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  locationButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  radiusContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  radiusLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  radiusButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    backgroundColor: '#FFFFFF',
  },
  radiusButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  radiusButtonText: {
    color: '#2196F3',
    fontSize: 14,
  },
  radiusButtonTextActive: {
    color: '#FFFFFF',
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  useMyLocationButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
  },
  useMyLocationText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  typeFilterButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeFilterButtonActive: {
    backgroundColor: '#2196F3',
  },
  typeFilterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeFilterButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    textAlign: 'center',
  },
  typeFilterButtonTextActive: {
    color: '#FFFFFF',
  },
  typeFilterCheckIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 34, // Extra padding for bottom to account for home indicator on iPhone
    maxHeight: '70%', // Reduced height to ensure it fits on screen
  },
  pullIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    marginBottom: 16,
    alignSelf: 'center',
  },
});

export default GroupSearchScreen;
