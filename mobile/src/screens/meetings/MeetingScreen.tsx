import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
  Pressable,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Slider from '@react-native-community/slider';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  setUserLocation as setReduxUserLocation,
  fetchMeetings,
  filterMeetings,
  toggleFavoriteMeeting,
  selectFilteredMeetings,
  selectMeetingsStatus,
  selectMeetingsError,
  selectUserLocation as selectReduxUserLocation,
} from '../../store/slices/meetingsSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LocationPicker from '../../components/groups/LocationPicker';
import moment from 'moment';

// Types for meetings data
import {
  Meeting,
  MeetingType,
  Location,
  DaysAndTimes,
  MeetingFilters,
} from '../../types';

const MeetingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useAppDispatch();

  // Get meetings from Redux
  const filteredMeetings = useAppSelector(selectFilteredMeetings);
  const status = useAppSelector(selectMeetingsStatus);
  const error = useAppSelector(selectMeetingsError);
  const reduxUserLocation = useAppSelector(selectReduxUserLocation);

  const isLoading = status === 'loading';

  const [nameQuery, setNameQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [meetingDetailsVisible, setMeetingDetailsVisible] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [currentUserLocation, setCurrentUserLocation] =
    useState<Location | null>(reduxUserLocation);
  const [customLocation, setCustomLocation] = useState<Location | null>(null);
  const [customLocationAddress, setCustomLocationAddress] = useState<
    string | null
  >(null);
  const [usingCustomLocation, setUsingCustomLocation] = useState(false);
  const [searchRadius, setSearchRadius] = useState<number>(10);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<
    MeetingType | 'All'
  >('All');
  const [showOnline, setShowOnline] = useState(true);
  const [showInPerson, setShowInPerson] = useState(true);
  const [selectedDayFilter, setSelectedDayFilter] = useState<
    keyof DaysAndTimes | null
  >(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string | null>(
    null,
  );

  const meetingTypes: (MeetingType | 'All')[] = [
    'All',
    'AA',
    'NA',
    'Celebrate Recovery',
    'Custom',
  ];
  // Define days and time options
  const daysOfWeek = [
    'All',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const timeOfDayOptions = ['All', 'Morning', 'Afternoon', 'Evening']; // Define time ranges if needed

  const meetings = useMemo(() => {
    let dayFiltered = filteredMeetings;

    // Client-side day filtering
    if (selectedDayFilter) {
      dayFiltered = dayFiltered.filter(
        meeting => meeting.day?.toLowerCase() === selectedDayFilter,
      );
    }

    // Client-side time filtering (basic)
    let timeFiltered = dayFiltered;
    if (selectedTimeFilter) {
      const filterTime = selectedTimeFilter.toLowerCase();
      timeFiltered = timeFiltered.filter(meeting => {
        if (!meeting.time) return false;
        try {
          const hour = parseInt(meeting.time.split(':')[0], 10);
          if (isNaN(hour)) return false;

          if (filterTime === 'morning' && hour >= 5 && hour < 12) return true;
          if (filterTime === 'afternoon' && hour >= 12 && hour < 18)
            return true;
          if (filterTime === 'evening' && (hour >= 18 || hour < 5)) return true; // Includes late night/early AM
          return false;
        } catch {
          return false; // Invalid time format
        }
      });
    }

    // Format filtering (Online/In-Person)
    const formatFiltered = timeFiltered.filter(meeting => {
      if (!showOnline && meeting.online) return false;
      if (!showInPerson && !meeting.online) return false;
      return true;
    });

    // Name Query Filtering
    if (!nameQuery) return formatFiltered;
    const lowerNameQuery = nameQuery.toLowerCase();
    return formatFiltered.filter(meeting => {
      return meeting.name.toLowerCase().includes(lowerNameQuery);
    });
  }, [
    filteredMeetings,
    nameQuery,
    showOnline,
    showInPerson,
    selectedDayFilter,
    selectedTimeFilter,
  ]);

  const activeLocation = usingCustomLocation
    ? customLocation
    : currentUserLocation;

  const getUserLocation = useCallback(async () => {
    if (usingCustomLocation) return;

    setLocationError(null);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationError(
        'Location permission denied. Search for a location manually.',
      );
      dispatch(
        fetchMeetings({
          location: currentUserLocation || undefined,
          filters: {
            day: selectedDayFilter || undefined,
            type: selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
          },
        }),
      );
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentUserLocation(location);
        dispatch(setReduxUserLocation(location));
        dispatch(
          fetchMeetings({
            location,
            filters: {
              day: selectedDayFilter || undefined,
              type:
                selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
            },
          }),
        );
      },
      error => {
        console.error('Error getting location:', error);
        setLocationError(
          'Unable to get your location. Check permissions or search manually.',
        );
        dispatch(
          fetchMeetings({
            location: customLocation || undefined,
            filters: {
              day: selectedDayFilter || undefined,
              type:
                selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
            },
          }),
        );
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, [dispatch, selectedTypeFilter, usingCustomLocation]);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'Recovery Connect needs access to your location to find meetings near you.',
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

  useEffect(() => {
    if (!usingCustomLocation) {
      getUserLocation();
    } else if (customLocation) {
      dispatch(
        fetchMeetings({
          location: customLocation,
          filters: {
            day: selectedDayFilter || undefined,
            type: selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
          },
        }),
      );
    }
  }, [
    getUserLocation,
    usingCustomLocation,
    customLocation?.lat,
    customLocation?.lng,
    dispatch,
    selectedTypeFilter,
    selectedDayFilter,
  ]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const fetchMeetingsWithCriteria = (locationToUse: Location | null) => {
    let validDay: keyof DaysAndTimes | undefined = undefined;
    const potentialDay = selectedDayFilter; // Already string | null

    if (
      potentialDay &&
      daysOfWeek
        .slice(1)
        .map(d => d.toLowerCase())
        .includes(potentialDay)
    ) {
      // Only if the string is a valid day name (excluding 'All')
      validDay = potentialDay as keyof DaysAndTimes; // Assert here after validation
    }

    const filters: MeetingFilters = {
      type: selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
      day: validDay, // Now assigning the correctly typed variable
    };

    console.log('Fetching with filters:', filters);
    dispatch(fetchMeetings({location: locationToUse || undefined, filters}));
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeetingsWithCriteria(activeLocation);
    setRefreshing(false);
  };

  const handleSearchChange = (text: string) => {
    setNameQuery(text);
  };

  const resetFilters = () => {
    setNameQuery('');
    setSelectedTypeFilter('All');
    setShowOnline(true);
    setShowInPerson(true);
    setSelectedDayFilter(null);
    setSelectedTimeFilter(null);
    setUsingCustomLocation(false);
    setCustomLocation(null);
    setCustomLocationAddress(null);
    dispatch(
      fetchMeetings({location: currentUserLocation || undefined, filters: {}}),
    );
  };

  const showMeetingDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingDetailsVisible(true);
  };

  const onFilterModalClose = () => {
    setShowFilterModal(false);
    const locationToFetch = usingCustomLocation
      ? customLocation
      : currentUserLocation;
    if (locationToFetch) {
      fetchMeetingsWithCriteria(locationToFetch);
    }
  };

  const handleToggleFavorite = (meetingId: string) => {
    dispatch(toggleFavoriteMeeting(meetingId));
  };

  // Helper to format time string (HH:MM) to AM/PM
  const formatMeetingTime = (timeString?: string): string => {
    if (!timeString || !moment(timeString, 'HH:mm').isValid()) {
      return 'Time TBD';
    }
    return moment(timeString, 'HH:mm').format('h:mm A');
  };

  const formatDayAndTime = (meeting: Meeting): string => {
    if (meeting.day) {
      let meetingDay = meeting.day;
      if (typeof meetingDay === 'number') {
        meetingDay = daysOfWeek[meetingDay - 1];
      }
      const day = meetingDay.charAt(0).toUpperCase() + meetingDay.slice(1);
      const formattedTime = formatMeetingTime(meeting.time); // Use the new formatter
      return `${day} at ${formattedTime}`;
    }
    return 'Schedule TBD'; // Fallback if day is missing
  };

  const formatAddress = (meeting: Meeting): string => {
    if (meeting.online) {
      return 'Online Meeting';
    }

    const streetLine = meeting.address || meeting.street || '';
    const cityStateZipLine = [meeting.city, meeting.state, meeting.zip]
      .filter(Boolean)
      .join(', ');

    if (!streetLine && !cityStateZipLine) {
      return 'Address not specified';
    }

    return `${streetLine}\n${cityStateZipLine}`;
  };

  const calculateDistance = (meeting: Meeting): string => {
    if (!activeLocation || !meeting.lat || !meeting.lng) {
      return '';
    }

    const R = 3958.8;
    const dLat = ((meeting.lat - activeLocation.lat) * Math.PI) / 180;
    const dLon = ((meeting.lng - activeLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((activeLocation.lat * Math.PI) / 180) *
        Math.cos((meeting.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(1) + ' mi';
  };

  const renderMeetingItem = ({item}: {item: Meeting}) => {
    const distanceText = calculateDistance(item);
    const formattedAddress = formatAddress(item);

    return (
      <TouchableOpacity
        style={styles.meetingCard}
        onPress={() => showMeetingDetails(item)}
        testID={`meeting-card-${item.id || item.name}`}>
        <View style={styles.meetingHeader}>
          <View style={styles.meetingTimeContainer}>
            <Text style={styles.meetingDay}>{formatDayAndTime(item)}</Text>
            {distanceText && (
              <Text style={styles.meetingDistance}>{distanceText}</Text>
            )}
          </View>
        </View>

        <View style={styles.meetingContent}>
          <Text style={styles.meetingName}>{item.name}</Text>
          <Text style={styles.meetingLocation}>{formattedAddress}</Text>
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
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
      testID="meetings-filter-modal">
      <Pressable style={styles.modalOverlay}>
        <View style={styles.filterModalContainer}>
          <View style={styles.pullIndicator} />
          <View style={styles.locationModalHeader}>
            <Text style={styles.locationModalTitle}>Filters</Text>
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              style={styles.closeButton}
              testID="meetings-filter-close-button">
              <Icon name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {/* Format Filters */}
            <Text style={styles.filterSectionTitle}>Format</Text>
            <View style={styles.typeFilterContainer}>
              <TouchableOpacity
                style={[
                  styles.typeFilterButton,
                  showInPerson && styles.typeFilterActive,
                  !showOnline && !showInPerson && styles.typeFilterInactive,
                ]}
                onPress={() => setShowInPerson(!showInPerson)}
                testID="filter-inperson-button">
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
                onPress={() => setShowOnline(!showOnline)}
                testID="filter-online-button">
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

            {/* Program Type Filters */}
            <Text style={styles.filterSectionTitle}>Program Type</Text>
            <View style={styles.chipContainer}>
              {meetingTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chipButton,
                    selectedTypeFilter === type && styles.chipButtonActive,
                  ]}
                  onPress={() =>
                    setSelectedTypeFilter(
                      selectedTypeFilter === type ? 'All' : type,
                    )
                  }
                  testID={`filter-type-${type}-chip`}>
                  <Text
                    style={[
                      styles.chipText,
                      selectedTypeFilter === type && styles.chipTextActive,
                    ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Day of Week Filter */}
            <Text style={styles.filterSectionTitle}>Day of Week</Text>
            <View style={styles.chipContainer}>
              {daysOfWeek.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.chipButton,
                    selectedDayFilter ===
                      (day.toLowerCase() === 'all'
                        ? null
                        : day.toLowerCase()) && styles.chipButtonActive,
                  ]}
                  onPress={() =>
                    setSelectedDayFilter(
                      day === 'All'
                        ? null
                        : (day.toLowerCase() as keyof DaysAndTimes),
                    )
                  }
                  testID={`filter-day-${day}-chip`}>
                  <Text
                    style={[
                      styles.chipText,
                      selectedDayFilter ===
                        (day.toLowerCase() === 'all'
                          ? null
                          : day.toLowerCase()) && styles.chipTextActive,
                    ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time of Day Filter (Simplified) */}
            {/* More complex time range sliders could be added */}
            <Text style={styles.filterSectionTitle}>Time of Day</Text>
            <View style={styles.chipContainer}>
              {timeOfDayOptions.map(timeOption => (
                <TouchableOpacity
                  key={timeOption}
                  style={[
                    styles.chipButton,
                    selectedTimeFilter ===
                      (timeOption === 'All'
                        ? null
                        : timeOption.toLowerCase()) && styles.chipButtonActive,
                  ]}
                  onPress={() =>
                    setSelectedTimeFilter(
                      timeOption === 'All' ? null : timeOption.toLowerCase(),
                    )
                  }
                  testID={`filter-time-${timeOption}-chip`}>
                  <Text
                    style={[
                      styles.chipText,
                      selectedTimeFilter ===
                        (timeOption === 'All'
                          ? null
                          : timeOption.toLowerCase()) && styles.chipTextActive,
                    ]}>
                    {timeOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.applyFilterButton}
            onPress={onFilterModalClose}
            testID="meetings-filter-apply-button">
            <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  const renderLocationPickerModal = () => (
    <Modal
      visible={showLocationPicker}
      animationType="slide"
      onRequestClose={() => setShowLocationPicker(false)}
      testID="meetings-location-picker-modal">
      <SafeAreaView style={styles.locationModalContainer}>
        <View style={styles.locationModalHeader}>
          <Text style={styles.locationModalTitle}>Search Location</Text>
          <TouchableOpacity
            onPress={() => setShowLocationPicker(false)}
            style={styles.closeButton}
            testID="location-picker-close-button">
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
              setShowLocationPicker(false);
            }}
            initialAddress={customLocationAddress || ''}
            label="Search for meetings near..."
          />
          <TouchableOpacity
            style={styles.useMyLocationButton}
            onPress={() => {
              setShowLocationPicker(false);
            }}
            testID="location-picker-done-button">
            <Text style={styles.useMyLocationText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderMeetingDetailsModal = () => (
    <Modal
      visible={meetingDetailsVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setMeetingDetailsVisible(false)}
      testID={`meeting-details-modal-${selectedMeeting?.id}`}>
      {selectedMeeting && (
        <View style={styles.modalOverlay}>
          <View
            style={styles.detailsModalContent}
            testID={`meeting-details-modal-${selectedMeeting.id}`}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Meeting Details</Text>
              <TouchableOpacity
                onPress={() => setMeetingDetailsVisible(false)}
                style={styles.modalCloseButton}
                testID="meeting-details-close-button">
                <Text style={styles.closeButtonText}>✕</Text>
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
                      Linking.openURL(selectedMeeting.link || '#');
                    }}
                    testID="meeting-details-join-link-button">
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

              {activeLocation && selectedMeeting.lat && selectedMeeting.lng && (
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
                    }}
                    testID="meeting-details-create-group-button">
                    <Text style={styles.createGroupButtonText}>
                      Create Group
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {!selectedMeeting.online &&
                selectedMeeting.lat &&
                selectedMeeting.lng && (
                  <View style={styles.detailsSection}>
                    <TouchableOpacity
                      style={styles.directionsButton}
                      onPress={() => {
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
                        if (url) Linking.openURL(url);
                      }}>
                      <Text style={styles.directionsButtonText}>
                        Get Directions
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
            </ScrollView>

            <View style={styles.detailsFooter}></View>
          </View>
        </View>
      )}
    </Modal>
  );

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

  return (
    <SafeAreaView style={styles.container} testID="meetings-screen">
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Find Meetings</Text>
        <Text style={styles.headerSubtitle}>
          {usingCustomLocation && customLocationAddress
            ? `Near ${
                customLocationAddress.split(',')[0] || 'selected location'
              }`
            : currentUserLocation
            ? `Near your location`
            : 'Search for recovery meetings'}
        </Text>
      </View>

      <View style={styles.searchControlsContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            name="magnify"
            size={20}
            color="#757575"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            value={nameQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            testID="meetings-search-input"
          />
        </View>

        <View style={styles.filterButtonsRow}>
          <TouchableOpacity
            style={styles.filterChipButton}
            onPress={() => setShowFilterModal(true)}
            testID="meetings-filter-button">
            <Icon name="filter-variant" size={18} color="#1976D2" />
            <Text style={styles.filterChipButtonText}>
              {selectedTypeFilter === 'All' ? 'Filters' : selectedTypeFilter}
            </Text>
            <Icon name="chevron-down" size={18} color="#1976D2" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterChipButton}
            onPress={() => setShowLocationPicker(true)}
            testID="meetings-location-button">
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
            onPress={resetFilters}
            testID="meetings-reset-filters-button">
            <Icon name="filter-variant-remove" size={18} color="#757575" />
          </TouchableOpacity>
        </View>

        {/* {activeLocation && (
          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>
              Search radius: {searchRadius} miles
            </Text>
            <Slider
              style={styles.radiusSlider}
              minimumValue={1}
              maximumValue={100}
              step={1}
              value={searchRadius}
              onValueChange={setSearchRadius}
              onSlidingComplete={value =>
                fetchMeetingsWithCriteria(activeLocation)
              }
              minimumTrackTintColor="#2196F3"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#2196F3"
            />
          </View>
        )} */}
      </View>

      {locationError && !activeLocation && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setShowLocationPicker(true)}>
            <Text style={styles.retryButtonText}>Search Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && !refreshing ? (
        <View style={styles.loaderContainer} testID="meetings-loader">
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Finding meetings...</Text>
          <Text style={styles.loadingSubtext}>
            {usingCustomLocation && customLocationAddress
              ? `Searching near ${customLocationAddress.split(',')[0]}`
              : 'Searching near your location'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={meetings}
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
              <Icon
                name="calendar-search"
                size={64}
                color="#BDBDBD"
                style={{marginBottom: 16}}
              />
              <Text style={styles.emptyText}>No Meetings Found</Text>
              <Text style={styles.emptySubtext}>
                {error
                  ? 'There was an error loading meetings.'
                  : 'Try adjusting your search location or filters.'}
              </Text>
              <TouchableOpacity
                style={styles.resetEmptyButton}
                onPress={resetFilters}>
                <Text style={styles.resetEmptyButtonText}>Reset Search</Text>
              </TouchableOpacity>
            </View>
          }
          testID="meetings-list"
        />
      )}

      {renderFilterModal()}
      {renderLocationPickerModal()}
      {renderMeetingDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  searchControlsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#212121',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  filterChipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  filterChipButtonText: {
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
    marginRight: 2,
    maxWidth: 100,
  },
  resetChipButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
  },
  radiusContainer: {
    marginTop: 8,
  },
  radiusLabel: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 8,
    textAlign: 'center',
  },
  radiusSlider: {
    width: '100%',
    height: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    flex: 1,
    marginRight: 8,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#FFCDD2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  retryButtonText: {
    color: '#D32F2F',
    fontWeight: '600',
    fontSize: 14,
  },
  meetingsList: {
    padding: 16,
    paddingTop: 8,
  },
  meetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  meetingTimeContainer: {
    flexShrink: 1,
    marginRight: 8,
  },
  meetingDay: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 2,
    fontWeight: '500',
  },
  meetingDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976D2',
  },
  meetingContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  meetingName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 6,
  },
  meetingLocation: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 10,
  },
  meetingTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatTag: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
  },
  onlineTag: {
    backgroundColor: '#E3F2FD',
  },
  formatTagText: {
    fontSize: 12,
    color: '#616161',
    fontWeight: '500',
  },
  emptyContainer: {
    flexGrow: 1,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetEmptyButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetEmptyButtonText: {
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  locationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  locationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#757575',
    lineHeight: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 12,
    marginTop: 8,
  },
  typeFilterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  typeFilterButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeFilterActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  typeFilterText: {
    fontSize: 14,
    color: '#616161',
    fontWeight: '500',
  },
  typeFilterActiveText: {
    color: '#1E88E5',
    fontWeight: '600',
  },
  typeFilterInactive: {
    borderColor: '#E57373',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8, // Add gap between chips
  },
  chipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    color: '#616161',
  },
  chipTextActive: {
    color: '#1E88E5',
    fontWeight: '600',
  },
  filterModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '80%',
    width: '100%',
  },
  pullIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    marginBottom: 16,
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
  filterWarningText: {
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 8,
  },
  detailsModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingTop: 16,
    maxHeight: '85%',
  },
  meetingDetailContent: {
    paddingBottom: 16,
  },
  detailsName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
  },
  detailsSection: {
    marginBottom: 18,
  },
  detailsLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailsText: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 4,
    lineHeight: 22,
  },
  detailsSubtext: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  detailsNotes: {
    fontSize: 14,
    color: '#616161',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 20,
  },
  linkButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  directionsButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  directionsButtonText: {
    color: '#1E88E5',
    fontWeight: '600',
    fontSize: 15,
  },
  disabledButtonText: {
    color: '#BDBDBD',
  },
  detailsFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
    marginTop: 16,
  },
  createGroupButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  createGroupButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  locationModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  locationModalContent: {
    flex: 1,
    padding: 16,
  },
  useMyLocationButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 0,
  },
  useMyLocationText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
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
