import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
  Platform,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Slider from '@react-native-community/slider';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  setUserLocation,
  fetchMeetings,
  filterMeetings,
  toggleFavoriteMeeting,
  selectFilteredMeetings,
  selectMeetingsStatus,
  selectMeetingsError,
  selectUserLocation,
} from '../../store/slices/meetingsSlice';

// Import Location Picker component
import LocationPicker from '../../components/groups/LocationPicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Types for meetings data
import {Meeting, MeetingType, Location, DaysAndTimes} from '../../types';

// Filter options type
interface FilterOptions {
  showOnline: boolean;
  showInPerson: boolean;
  meetingType: MeetingType | null;
  day: keyof DaysAndTimes | null;
  radius: number; // search radius in miles
}

const MeetingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useAppDispatch();

  // Get meetings from Redux
  const filteredMeetings = useAppSelector(selectFilteredMeetings);
  const status = useAppSelector(selectMeetingsStatus);
  const error = useAppSelector(selectMeetingsError);
  const userLocation = useAppSelector(selectUserLocation);

  const isLoading = status === 'loading';

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [meetingDetailsVisible, setMeetingDetailsVisible] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // New state for location search
  const [showLocationPicker, setShowLocationPicker] = useState(false);
<<<<<<< Updated upstream
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<
    MeetingType | 'All'
  >('All');
  const [showOnline, setShowOnline] = useState(true);
  const [showInPerson, setShowInPerson] = useState(true);
=======
  const [customLocation, setCustomLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [usingCustomLocation, setUsingCustomLocation] = useState(false);

  // New state for type filter modal
  const [showTypeFilterModal, setShowTypeFilterModal] = useState(false);

  // Filter state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    showOnline: true,
    showInPerson: true,
    meetingType: null,
    day: null,
    radius: 25, // Default to 25 miles radius (matching GroupSearchScreen)
  });
>>>>>>> Stashed changes

  const days: (keyof DaysAndTimes)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ] as const;

  const meetingTypes: MeetingType[] = [
    'AA',
    'NA',
    'Celebrate Recovery',
    'Custom',
  ];

<<<<<<< Updated upstream
  const meetings = useMemo(() => {
    const formatFiltered = filteredMeetings.filter(meeting => {
      if (showOnline && showInPerson) {
        return true;
      }
      if (showOnline && meeting.online) {
        return true;
      }
      if (showInPerson && !meeting.online) {
        return true;
      }
      return false;
    });

    if (!nameQuery) return formatFiltered;
    const lowerNameQuery = nameQuery.toLowerCase();
    return formatFiltered.filter(meeting => {
      return meeting.name.toLowerCase().includes(lowerNameQuery);
    });
  }, [filteredMeetings, nameQuery, showOnline, showInPerson]);

  const activeLocation = usingCustomLocation
    ? customLocation
    : currentUserLocation;

=======
  // Get user's current location
>>>>>>> Stashed changes
  const getUserLocation = useCallback(async () => {
    setLocationError(null);
<<<<<<< Updated upstream
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationError(
        'Location permission denied. Search for a location manually.',
      );
      dispatch(
        fetchMeetings({
          location: currentUserLocation || undefined,
          filters: {
            type: selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
          },
        }),
      );
      return;
=======

    // Request permission (for Android)
    if (Platform.OS === 'android') {
      const granted = await requestLocationPermission();
      if (!granted) {
        setLocationError('Location permission denied');
        return;
      }
>>>>>>> Stashed changes
    }

    Geolocation.getCurrentPosition(
      position => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // Dispatch location to Redux
        dispatch(setUserLocation(location));

        // Instead of relying on the setUserLocation to trigger the fetch,
        // we'll do it explicitly with filters
        const filters = {
          day: filterOptions.day || undefined,
          type: filterOptions.meetingType || undefined,
          radius: filterOptions.radius,
        };
        dispatch(fetchMeetings({location, filters}));
      },
      error => {
        console.error('Error getting location:', error);
        setLocationError(
<<<<<<< Updated upstream
          'Unable to get your location. Check permissions or search manually.',
        );
        dispatch(
          fetchMeetings({
            location: customLocation || undefined,
            filters: {
              type:
                selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
            },
          }),
=======
          'Unable to get your location. Please check app permissions.',
>>>>>>> Stashed changes
        );
        // Try to fetch meetings without location but with current filters
        const filters = {
          day: filterOptions.day || undefined,
          type: filterOptions.meetingType || undefined,
          radius: filterOptions.radius,
        };
        dispatch(fetchMeetings({filters}));
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, [dispatch, filterOptions]);

  // For Android, request location permission
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message:
              'This app needs to access your location to find nearby meetings.',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      return false;
    }
  };

  // Initialize - get location on component mount
  useEffect(() => {
    if (!usingCustomLocation) {
      getUserLocation();
    }
<<<<<<< Updated upstream
  }, [
    getUserLocation,
    usingCustomLocation,
    customLocation?.lat,
    customLocation?.lng,
    dispatch,
    selectedTypeFilter,
  ]);
=======
  }, [getUserLocation, usingCustomLocation]);
>>>>>>> Stashed changes

  // Load meetings when custom location changes
  useEffect(() => {
    if (customLocation && usingCustomLocation) {
      const location: Location = {
        lat: customLocation.latitude,
        lng: customLocation.longitude,
      };
      dispatch(setUserLocation(location));

      const filters = {
        day: filterOptions.day || undefined,
        type: filterOptions.meetingType || undefined,
        radius: filterOptions.radius,
      };
      dispatch(fetchMeetings({location, filters}));
    }
  }, [customLocation, usingCustomLocation, dispatch, filterOptions]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filterOptions, searchQuery]);

  // Show error alert if there's an error from Redux
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  // Apply filters to meetings
  const applyFilters = () => {
    // Update the filtered results in state
    dispatch(
      filterMeetings({
        searchQuery,
        showOnline: filterOptions.showOnline,
        showInPerson: filterOptions.showInPerson,
        meetingType: filterOptions.meetingType,
        day: filterOptions.day,
      }),
    );

<<<<<<< Updated upstream
  const fetchMeetingsWithCriteria = (locationToUse: Location | null) => {
    const filters: any = {
      type: selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
    };

    dispatch(fetchMeetings({location: locationToUse || undefined, filters}));
=======
    // Also fetch new meetings with the updated filters if we have location
    if (userLocation) {
      dispatch(
        fetchMeetings({
          location: userLocation,
          filters: {
            day: filterOptions.day || undefined,
            type: filterOptions.meetingType || undefined,
            radius: filterOptions.radius,
          },
        }),
      );
    }
>>>>>>> Stashed changes
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);

    // Pass current filter options when refreshing
    const filters = {
      day: filterOptions.day || undefined,
      type: filterOptions.meetingType || undefined,
      radius: filterOptions.radius,
    };

    if (userLocation) {
      dispatch(fetchMeetings({location: userLocation, filters}));
    } else {
      await getUserLocation();
    }

    setRefreshing(false);
  };

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Reset all filters to default values
  const resetFilters = () => {
<<<<<<< Updated upstream
    setNameQuery('');
    setSelectedTypeFilter('All');
    setShowOnline(true);
    setShowInPerson(true);
    setUsingCustomLocation(false);
    setCustomLocation(null);
    setCustomLocationAddress(null);
    fetchMeetingsWithCriteria(currentUserLocation);
=======
    setFilterOptions({
      showOnline: true,
      showInPerson: true,
      meetingType: null,
      day: null,
      radius: 25,
    });
    setSearchQuery('');
>>>>>>> Stashed changes
  };

  // Handle location selection
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
    setShowLocationPicker(false);
  };

  // Show meeting details
  const showMeetingDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingDetailsVisible(true);
  };

<<<<<<< Updated upstream
  const onFilterModalClose = () => {
    setShowFilterModal(false);
    setShowLocationPicker(false);
    fetchMeetingsWithCriteria(
      usingCustomLocation ? customLocation : currentUserLocation,
    );
  };

=======
  // Toggle favorite status
>>>>>>> Stashed changes
  const handleToggleFavorite = (meetingId: string) => {
    dispatch(toggleFavoriteMeeting(meetingId));
  };

  // Format day and time for display
  const formatDayAndTime = (meeting: Meeting): string => {
    if (meeting.day && meeting.time) {
      // Capitalize first letter of day
      const day = meeting.day.charAt(0).toUpperCase() + meeting.day.slice(1);
      return `${day}s at ${meeting.time}`;
    }
    return 'Time not specified';
  };

  // Format address for display
  const formatAddress = (meeting: Meeting): string => {
    if (meeting.online) {
      return 'Online Meeting';
    }

    const parts: string[] = [];
    if (meeting.address) parts.push(meeting.address);
    if (meeting.city) parts.push(meeting.city);
    if (meeting.state) parts.push(meeting.state);
    if (meeting.zip) parts.push(meeting.zip);

    return parts.length > 0 ? parts.join(', ') : 'Address not specified';
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (meeting: Meeting): string => {
    if (!userLocation || !meeting.lat || !meeting.lng) {
      return '';
    }

    const R = 3958.8; // Earth's radius in miles
    const dLat = ((meeting.lat - userLocation.lat) * Math.PI) / 180;
    const dLon = ((meeting.lng - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((meeting.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(1) + ' mi';
  };

  // Render meeting list item
  const renderMeetingItem = ({item}: {item: Meeting}) => (
    <TouchableOpacity
      style={styles.meetingCard}
      onPress={() => showMeetingDetails(item)}>
      <View style={styles.meetingHeader}>
        <View style={styles.meetingTimeContainer}>
          <Text style={styles.meetingDay}>{formatDayAndTime(item)}</Text>
          {userLocation && item.lat && item.lng && (
            <Text style={styles.meetingDistance}>
              {calculateDistance(item)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.meetingContent}>
        <Text style={styles.meetingName}>{item.name}</Text>
        <Text style={styles.meetingLocation}>{formatAddress(item)}</Text>
        <View style={styles.meetingTags}>
          <View style={styles.formatTag}>
            <Text style={styles.formatTagText}>{item.type}</Text>
          </View>
          {item.online && (
            <View style={[styles.formatTag, styles.onlineTag]}>
              <Text style={styles.formatTagText}>Online</Text>
            </View>
          )}
        </View>
<<<<<<< Updated upstream
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={() => setShowFilterModal(false)}>
        <View style={styles.filterModalContainer}>
          <View style={styles.pullIndicator} />
          <View style={styles.locationModalHeader}>
            <Text style={styles.locationModalTitle}>Filters</Text>
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              style={styles.closeButton}>
              <Icon name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <Text style={styles.filterSectionTitle}>Format</Text>
          <View style={styles.typeFilterContainer}>
            <TouchableOpacity
              style={[
                styles.typeFilterButton,
                showInPerson && styles.typeFilterActive,
                !showOnline && !showInPerson && styles.typeFilterInactive,
              ]}
              onPress={() => setShowInPerson(!showInPerson)}>
              <Text
                style={[
                  styles.typeFilterText,
                  showInPerson && styles.typeFilterActiveText,
                ]}>
                In-Person
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeFilterButton,
                showOnline && styles.typeFilterActive,
                !showOnline && !showInPerson && styles.typeFilterInactive,
              ]}
              onPress={() => setShowOnline(!showOnline)}>
              <Text
                style={[
                  styles.typeFilterText,
                  showOnline && styles.typeFilterActiveText,
                ]}>
                Online
              </Text>
            </TouchableOpacity>
          </View>

          {!showOnline && !showInPerson && (
            <Text style={styles.filterWarningText}>
              Warning: No meeting formats selected.
            </Text>
          )}

          <Text style={styles.filterSectionTitle}>Program Type</Text>
          <FlatList
            data={meetingTypes}
            keyExtractor={item => item}
            renderItem={({item: type}) => (
              <TouchableOpacity
                style={[
                  styles.modalItemButton,
                  selectedTypeFilter === type && styles.modalItemButtonActive,
                ]}
                onPress={() => {
                  const newType = selectedTypeFilter === type ? 'All' : type;
                  setSelectedTypeFilter(newType);
                }}>
                <Text
                  style={[
                    styles.modalItemText,
                    selectedTypeFilter === type && styles.modalItemTextActive,
                  ]}>
                  {type}
                </Text>
                {selectedTypeFilter === type && (
                  <Icon name="check" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.applyFilterButton}
            onPress={onFilterModalClose}>
            <Text style={styles.applyFilterButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderLocationPickerModal = () => (
    <Modal
      visible={showLocationPicker}
      animationType="slide"
      onRequestClose={() => setShowLocationPicker(false)}>
      <SafeAreaView style={styles.locationModalContainer}>
        <View style={styles.locationModalHeader}>
          <Text style={styles.locationModalTitle}>Search Location</Text>
          <TouchableOpacity
            onPress={() => setShowLocationPicker(false)}
            style={styles.closeButton}>
            <Icon name="close" size={24} color="#757575" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.locationModalContent}>
          <LocationPicker
            onLocationSelect={locationData => {
              const newLocation: Location = {
                lat: locationData.latitude,
                lng: locationData.longitude,
                city: locationData.city,
                state: locationData.state,
                zip: locationData.zip,
              };
              setCustomLocation(newLocation);
              setCustomLocationAddress(locationData.address);
              setUsingCustomLocation(true);
            }}
            initialAddress={customLocationAddress || ''}
            label="Search for meetings near..."
          />
          <TouchableOpacity
            style={styles.useMyLocationButton}
            onPress={() => {
              setShowLocationPicker(false);
            }}>
            <Text style={styles.useMyLocationText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
=======
      </View>
    </TouchableOpacity>
>>>>>>> Stashed changes
  );

  // Render meeting details modal
  const renderMeetingDetailsModal = () => (
    <Modal
      visible={meetingDetailsVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setMeetingDetailsVisible(false)}>
      {selectedMeeting && (
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Meeting Details</Text>
              <TouchableOpacity
                onPress={() => setMeetingDetailsVisible(false)}
<<<<<<< Updated upstream
                style={styles.modalCloseButton}>
                <Text style={styles.closeButtonText}>✕</Text>
=======
                style={styles.closeButton}>
                <Icon name="close" size={24} color="#2196F3" />
>>>>>>> Stashed changes
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'flex-start',
                width: '100%',
              }}
              style={styles.meetingDetailContent}>
              <Text style={styles.detailsName}>{selectedMeeting.name}</Text>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsLabel}>Time:</Text>
                <Text style={styles.detailsText}>
                  {formatDayAndTime(selectedMeeting)}
                </Text>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsLabel}>Location:</Text>
                <Text style={styles.detailsText}>
                  {selectedMeeting.online
                    ? 'Online Meeting'
                    : selectedMeeting.location ||
                      selectedMeeting.name ||
                      'Location name not specified'}
                </Text>
                {!selectedMeeting.online && (
                  <Text style={styles.detailsSubtext}>
                    {formatAddress(selectedMeeting)}
                  </Text>
                )}
                {selectedMeeting.online && selectedMeeting.link && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => {
                      // Open meeting link
                      Linking.openURL(selectedMeeting.link || '#');
                    }}>
                    <Text style={styles.linkButtonText}>Join Meeting</Text>
                  </TouchableOpacity>
                )}
                {selectedMeeting.online && selectedMeeting.onlineNotes && (
                  <Text style={styles.detailsNotes}>
                    {selectedMeeting.onlineNotes}
                  </Text>
                )}
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsLabel}>Type:</Text>
                <Text style={styles.detailsText}>{selectedMeeting.type}</Text>
              </View>

              {selectedMeeting.lat && selectedMeeting.lng && userLocation && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsLabel}>Distance:</Text>
                  <Text style={styles.detailsText}>
                    {calculateDistance(selectedMeeting)} from your location
                  </Text>
                </View>
              )}

              {!selectedMeeting.groupId && (
                <View style={styles.detailsSection}>
                  <TouchableOpacity
                    style={styles.createGroupButton}
                    onPress={() => {
                      navigation.navigate('Home', {
                        screen: 'CreateGroup',
                        params: {
                          meeting: selectedMeeting,
                        },
                      });
                      setMeetingDetailsVisible(false);
                    }}>
                    <Text style={styles.createGroupButtonText}>
                      Create Group
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.detailsSection}>
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => {
                    // Open map directions if meeting has coordinates
                    if (selectedMeeting.lat && selectedMeeting.lng) {
                      const scheme = Platform.select({
                        ios: 'maps:0,0?q=',
                        android: 'geo:0,0?q=',
                      });
                      const latLng = `${selectedMeeting.lat},${selectedMeeting.lng}`;
                      const label = selectedMeeting.name;
                      const url = Platform.select({
                        ios: `${scheme}${label}@${latLng}`,
                        android: `${scheme}${latLng}(${label})`,
                      });

                      if (url) {
                        Linking.openURL(url);
                      }
                    }
                  }}
                  disabled={
                    !selectedMeeting.lat ||
                    !selectedMeeting.lng ||
                    selectedMeeting.online
                  }>
                  <Text
                    style={[
                      styles.directionsButtonText,
                      (!selectedMeeting.lat ||
                        !selectedMeeting.lng ||
                        selectedMeeting.online) &&
                        styles.disabledButtonText,
                    ]}>
                    Get Directions
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </Modal>
  );

<<<<<<< Updated upstream
  const getLocationChipText = () => {
    if (usingCustomLocation && customLocationAddress) {
      const addressPart = customLocationAddress.split(',')[0].trim();
      if (addressPart.length > 15) {
        return `${addressPart.substring(0, 15)}...`;
      }
      return addressPart;
    } else if (usingCustomLocation) {
      return 'Custom Location';
    }
    return 'Near Me';
  };
=======
  // Render filter modal - Modified to match GroupSearch style
  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterModalVisible(false)}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setFilterModalVisible(false)}>
        <View style={styles.filterModalContainer}>
          <View style={styles.pullIndicator} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Meetings</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={styles.closeButton}>
              <Icon name="close" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            <Text style={styles.filterSectionTitle}>Meeting Format</Text>
            <View style={styles.typeFilterContainer}>
              <TouchableOpacity
                style={[
                  styles.typeFilterButton,
                  filterOptions.showInPerson && styles.typeFilterActive,
                ]}
                onPress={() =>
                  setFilterOptions({
                    ...filterOptions,
                    showInPerson: !filterOptions.showInPerson,
                  })
                }>
                <Text
                  style={[
                    styles.typeFilterText,
                    filterOptions.showInPerson && styles.typeFilterActiveText,
                  ]}>
                  In-Person
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeFilterButton,
                  filterOptions.showOnline && styles.typeFilterActive,
                ]}
                onPress={() =>
                  setFilterOptions({
                    ...filterOptions,
                    showOnline: !filterOptions.showOnline,
                  })
                }>
                <Text
                  style={[
                    styles.typeFilterText,
                    filterOptions.showOnline && styles.typeFilterActiveText,
                  ]}>
                  Online
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionTitle}>Program Type</Text>
            <FlatList
              data={[null, ...meetingTypes]}
              keyExtractor={item => (item === null ? 'all' : item)}
              renderItem={({item: type}) => (
                <TouchableOpacity
                  style={[
                    styles.typeFilterListButton,
                    filterOptions.meetingType === type &&
                      styles.typeFilterButtonActive,
                  ]}
                  onPress={() => {
                    setFilterOptions({
                      ...filterOptions,
                      meetingType:
                        filterOptions.meetingType === type ? null : type,
                    });
                  }}>
                  <View style={styles.typeFilterButtonContent}>
                    {/* Icons for different meeting types */}
                    <View style={styles.typeIconContainer}>
                      {type === 'AA' && (
                        <Icon
                          name="alpha-a"
                          size={24}
                          color={
                            filterOptions.meetingType === type
                              ? '#FFFFFF'
                              : '#2196F3'
                          }
                        />
                      )}
                      {type === 'NA' && (
                        <Icon
                          name="alpha-n"
                          size={24}
                          color={
                            filterOptions.meetingType === type
                              ? '#FFFFFF'
                              : '#2196F3'
                          }
                        />
                      )}
                      {type === 'Celebrate Recovery' && (
                        <Icon
                          name="party-popper"
                          size={24}
                          color={
                            filterOptions.meetingType === type
                              ? '#FFFFFF'
                              : '#2196F3'
                          }
                        />
                      )}
                      {type === 'Custom' && (
                        <Icon
                          name="cog"
                          size={24}
                          color={
                            filterOptions.meetingType === type
                              ? '#FFFFFF'
                              : '#2196F3'
                          }
                        />
                      )}
                      {type === null && (
                        <Icon
                          name="filter-variant-remove"
                          size={24}
                          color={
                            filterOptions.meetingType === type
                              ? '#FFFFFF'
                              : '#2196F3'
                          }
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.typeFilterButtonText,
                        filterOptions.meetingType === type &&
                          styles.typeFilterButtonTextActive,
                      ]}>
                      {type === null ? 'All Types' : type}
                    </Text>
                  </View>
                  {filterOptions.meetingType === type && (
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

            <Text style={styles.filterSectionTitle}>Day of Week</Text>
            <FlatList
              data={[null, ...days]}
              keyExtractor={item => (item === null ? 'all-days' : item)}
              renderItem={({item: day}) => (
                <TouchableOpacity
                  style={[
                    styles.typeFilterListButton,
                    filterOptions.day === day && styles.typeFilterButtonActive,
                  ]}
                  onPress={() => {
                    setFilterOptions({
                      ...filterOptions,
                      day: filterOptions.day === day ? null : day,
                    });
                  }}>
                  <View style={styles.typeFilterButtonContent}>
                    <View style={styles.typeIconContainer}>
                      <Icon
                        name={day === null ? 'calendar-month' : 'calendar-day'}
                        size={24}
                        color={
                          filterOptions.day === day ? '#FFFFFF' : '#2196F3'
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeFilterButtonText,
                        filterOptions.day === day &&
                          styles.typeFilterButtonTextActive,
                      ]}>
                      {day === null
                        ? 'All Days'
                        : day.charAt(0).toUpperCase() + day.slice(1)}
                    </Text>
                  </View>
                  {filterOptions.day === day && (
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

            <Text style={styles.filterSectionTitle}>Search Radius</Text>
            <View style={styles.radiusContainer}>
              <Text style={styles.radiusValue}>
                {filterOptions.radius} miles
              </Text>
              <View style={styles.radiusButtonsRow}>
                {[5, 10, 25, 50, 100].map(radius => (
                  <TouchableOpacity
                    key={radius}
                    style={[
                      styles.radiusButton,
                      filterOptions.radius === radius &&
                        styles.radiusButtonActive,
                    ]}
                    onPress={() =>
                      setFilterOptions({
                        ...filterOptions,
                        radius,
                      })
                    }>
                    <Text
                      style={[
                        styles.radiusButtonText,
                        filterOptions.radius === radius &&
                          styles.radiusButtonTextActive,
                      ]}>
                      {radius}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render location picker modal
  const renderLocationPickerModal = () => (
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
            label="Search for meetings near..."
            initialAddress={customLocation?.address}
          />

          <TouchableOpacity
            style={styles.useMyLocationButton}
            onPress={() => {
              setUsingCustomLocation(false);
              setShowLocationPicker(false);
              getUserLocation();
            }}>
            <Text style={styles.useMyLocationText}>Use My Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setShowLocationPicker(false)}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
>>>>>>> Stashed changes

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Find Meetings</Text>
        <Text style={styles.headerSubtitle}>
          {customLocation && usingCustomLocation
            ? `Showing meetings near ${customLocation.address.split(',')[0]}`
            : userLocation
            ? `Showing meetings within ${filterOptions.radius} miles of your location`
            : 'Search for recovery meetings'}
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
<<<<<<< Updated upstream
            style={styles.filterChipButton}
            onPress={() => setShowFilterModal(true)}>
            <Icon name="filter-variant" size={18} color="#1976D2" />
            <Text style={styles.filterChipButtonText}>
              {selectedTypeFilter === 'All' ? 'Filters' : selectedTypeFilter}
=======
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}>
            <Icon name="filter-variant" size={18} color="#2196F3" />
            <Text style={styles.filterButtonText}>
              {filterOptions.meetingType || 'All Types'}
>>>>>>> Stashed changes
            </Text>
          </TouchableOpacity>

          {/* Location Search */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setShowLocationPicker(true)}>
<<<<<<< Updated upstream
            <Icon name="map-marker-outline" size={18} color="#1976D2" />
            <Text
              style={styles.filterChipButtonText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {getLocationChipText()}
            </Text>
            <Icon name="chevron-down" size={18} color="#1976D2" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChipButton, styles.resetChipButton]}
            onPress={resetFilters}>
            <Icon name="filter-variant-remove" size={18} color="#757575" />
=======
            <Icon name="map-marker" size={18} color="#2196F3" />
            <Text style={styles.locationButtonText}>
              {customLocation ? 'Change Location' : 'Search Location'}
            </Text>
>>>>>>> Stashed changes
          </TouchableOpacity>
        </View>

        {/* Search radius selector */}
        {(userLocation || (customLocation && usingCustomLocation)) && (
          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>
              Search radius: {filterOptions.radius} miles
            </Text>
            <View style={styles.radiusButtonsRow}>
              {[5, 10, 25, 50, 100].map(radius => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusButton,
                    filterOptions.radius === radius &&
                      styles.radiusButtonActive,
                  ]}
                  onPress={() => {
                    setFilterOptions({
                      ...filterOptions,
                      radius,
                    });
                  }}>
                  <Text
                    style={[
                      styles.radiusButtonText,
                      filterOptions.radius === radius &&
                        styles.radiusButtonTextActive,
                    ]}>
                    {radius}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Location error message */}
      {locationError && !usingCustomLocation && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getUserLocation}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={filteredMeetings}
          renderItem={renderMeetingItem}
          keyExtractor={(item, index) =>
            item.id ? `${item.id}-${index}` : `no-id-${index}`
          }
          contentContainerStyle={styles.meetingsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No meetings found</Text>
              <Text style={styles.emptySubtext}>
<<<<<<< Updated upstream
                {error
                  ? 'There was an error loading meetings.'
                  : 'Try adjusting your search location or filters.'}
=======
                {!userLocation && !customLocation
                  ? 'Search for a location to find meetings'
                  : error
                  ? 'Error loading meetings. Please try again later.'
                  : filteredMeetings.length === 0
                  ? `No meetings found within ${filterOptions.radius} miles`
                  : 'No meetings match your current filters'}
>>>>>>> Stashed changes
              </Text>
              {error && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    if (usingCustomLocation && customLocation) {
                      const location: Location = {
                        lat: customLocation.latitude,
                        lng: customLocation.longitude,
                      };
                      dispatch(
                        fetchMeetings({
                          location,
                          filters: {
                            day: filterOptions.day || undefined,
                            type: filterOptions.meetingType || undefined,
                            radius: filterOptions.radius,
                          },
                        }),
                      );
                    } else if (userLocation) {
                      dispatch(
                        fetchMeetings({
                          location: userLocation,
                          filters: {
                            day: filterOptions.day || undefined,
                            type: filterOptions.meetingType || undefined,
                            radius: filterOptions.radius,
                          },
                        }),
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

      {renderFilterModal()}
<<<<<<< Updated upstream
      {renderLocationPickerModal()}
=======
>>>>>>> Stashed changes
      {renderMeetingDetailsModal()}
      {renderLocationPickerModal()}
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
<<<<<<< Updated upstream
    marginRight: 2,
    maxWidth: 100,
  },
  resetChipButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
=======
>>>>>>> Stashed changes
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    flex: 1,
    marginRight: 8,
  },
  retryButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  meetingsList: {
    padding: 16,
  },
  meetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  meetingHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    padding: 16,
  },
  meetingTimeContainer: {
    flex: 1,
  },
  meetingDay: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  meetingDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  meetingContent: {
    padding: 16,
  },
  meetingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  meetingLocation: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  meetingTags: {
    flexDirection: 'row',
  },
  formatTag: {
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  onlineTag: {
    backgroundColor: '#E3F2FD',
  },
  formatTagText: {
    fontSize: 12,
    color: '#616161',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9E9E9E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
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
    paddingBottom: 12,
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
  closeButtonText: {
    fontSize: 20,
    color: '#757575',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
<<<<<<< Updated upstream
=======
  modalScrollView: {
    width: '100%',
  },
  filterModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 34, // Extra padding for bottom to account for home indicator on iPhone
    maxHeight: '80%',
  },
  pullIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    marginBottom: 16,
    alignSelf: 'center',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
    marginTop: 16,
  },
>>>>>>> Stashed changes
  typeFilterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  typeFilterButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
  },
  typeFilterListButton: {
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
  typeFilterActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  typeFilterText: {
    fontSize: 14,
    color: '#757575',
  },
  typeFilterButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  typeFilterButtonTextActive: {
    color: '#FFFFFF',
  },
  typeFilterActiveText: {
    color: '#2196F3',
    fontWeight: '600',
  },
<<<<<<< Updated upstream
  typeFilterInactive: {
    borderColor: '#E57373',
  },
  modalItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
=======
  typeFilterCheckIcon: {
    position: 'absolute',
    right: 16,
  },
  radiusValue: {
    fontSize: 14,
    color: '#212121',
    textAlign: 'center',
>>>>>>> Stashed changes
    marginBottom: 8,
  },
  radiusSlider: {
    width: '100%',
    height: 40,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    marginRight: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    flex: 1,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  useMyLocationButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    alignItems: 'center',
  },
  useMyLocationText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 16,
  },
  doneButton: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  detailsModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  meetingDetailContent: {
    marginBottom: 16,
    width: '100%',
  },
  detailsName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 4,
  },
  detailsSubtext: {
    fontSize: 14,
    color: '#757575',
  },
  detailsNotes: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
    marginTop: 8,
  },
  linkButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  directionsButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  directionsButtonText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#BDBDBD',
  },
  detailsFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  createGroupButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  createGroupButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterWarningText: {
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 8,
  },
  applyFilterButton: {
    marginTop: 16,
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyFilterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filterModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  pullIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    marginBottom: 16,
    alignSelf: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
  },
  modalCloseButton: {
    padding: 8,
    marginLeft: 16,
  },
});

export default MeetingsScreen;
