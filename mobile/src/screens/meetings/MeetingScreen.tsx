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
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import Geolocation from '@react-native-community/geolocation';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Slider from '@react-native-community/slider';
import * as hashUtils from '../../utils/hashUtils';

// Types for meetings data
import {
  Meeting,
  MeetingType,
  Location,
  MeetingSearchInput,
  MeetingFilters,
  DaysAndTimes,
} from '../../types';
import {auth} from '../../services/firebase/config';

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
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [meetingDetailsVisible, setMeetingDetailsVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Filter state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    showOnline: true,
    showInPerson: true,
    meetingType: null,
    day: null,
    radius: 10, // Default to 10 miles radius
  });

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
    'IOP',
    'Religious',
    'Celebrate Recovery',
    'Custom',
  ];

  // Get user's current location
  const getUserLocation = useCallback(async () => {
    setLocationError(null);

    // Request permission (for Android)
    if (Platform.OS === 'android') {
      const granted = await requestLocationPermission();
      if (!granted) {
        setLocationError('Location permission denied');
        setLoading(false);
        return;
      }
    }

    Geolocation.getCurrentPosition(
      position => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        // Once we have location, fetch meetings
        loadMeetings(location);
      },
      error => {
        console.error('Error getting location:', error);
        setLocationError(
          'Unable to get your location. Please check app permissions.',
        );
        // Still attempt to load meetings with a default location
        loadMeetings(null);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);

  // For Android, request location permission
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
    // Get user location when component mounts
    getUserLocation();
  }, [getUserLocation]);

  // Reload meetings when filter options change
  useEffect(() => {
    if (userLocation) {
      searchMeetings();
    }
  }, [filterOptions, userLocation]);

  // Load meetings from the backend
  const loadMeetings = async (location: Location | null) => {
    setLoading(true);
    try {
      // If no user location, use a default (this could be a central location for your service area)
      const searchLocation = location || {
        lat: 40.7128, // NYC coordinates as fallback
        lng: -74.006,
      };

      // Build meeting search input
      const searchInput: MeetingSearchInput = {
        location: searchLocation,
        filters: buildMeetingFilters(),
      };

      // Call the cloud function
      const meetingsResult = await functions().httpsCallable('findMeetings')(
        searchInput,
      );

      if (meetingsResult.data && Array.isArray(meetingsResult.data)) {
        const meetings = meetingsResult.data.map(meeting => ({
          ...meeting,
          id: hashUtils.generateMeetingHash(meeting),
        }));
        setMeetings(meetings);
        // Initial filtering
        applyFiltersAndSearch(meetings, searchQuery);
      } else {
        console.error('Invalid response format from findMeetings function');
        setMeetings([]);
        setFilteredMeetings([]);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
      Alert.alert('Error', 'Failed to load meetings. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Build meeting filters from current filter options
  const buildMeetingFilters = (): MeetingFilters => {
    const filters: MeetingFilters = {};

    if (filterOptions.day) {
      filters.day = filterOptions.day;
    }

    if (filterOptions.meetingType) {
      filters.type = filterOptions.meetingType;
    }

    // Add location and radius to filters
    if (userLocation) {
      filters.location = userLocation;
      filters.radius = filterOptions.radius;
    }

    return filters;
  };

  // Search meetings based on current filters
  const searchMeetings = async () => {
    setLoading(true);
    try {
      if (!userLocation) {
        Alert.alert(
          'Location Required',
          'Please enable location services to search for meetings',
        );
        return;
      }

      // Build meeting search input
      const searchInput: MeetingSearchInput = {
        location: userLocation,
        filters: buildMeetingFilters(),
        criteria: searchQuery ? {name: searchQuery} : undefined,
      };

      // Call the cloud function
      const meetingsResult = await functions().httpsCallable('findMeetings')(
        searchInput,
      );

      if (meetingsResult.data && Array.isArray(meetingsResult.data)) {
        setMeetings(meetingsResult.data);
        // Apply any additional client-side filtering if needed
        applyFiltersAndSearch(meetingsResult.data, searchQuery);
      } else {
        console.error('Invalid response format from findMeetings function');
        setMeetings([]);
        setFilteredMeetings([]);
      }
    } catch (error) {
      console.error('Error searching meetings:', error);
      Alert.alert(
        'Error',
        'Failed to search meetings. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserLocation();
  };

  // Apply additional client-side filtering if needed
  const applyFiltersAndSearch = (meetingsList: Meeting[], query: string) => {
    let filtered = [...meetingsList];

    // Apply additional client-side filtering for online/in-person if needed
    if (!filterOptions.showOnline) {
      filtered = filtered.filter(meeting => !meeting.online);
    }

    if (!filterOptions.showInPerson) {
      filtered = filtered.filter(meeting => meeting.online);
    }

    // Additional local text search if needed
    if (query.trim()) {
      const queryLower = query.trim().toLowerCase();
      filtered = filtered.filter(
        meeting =>
          meeting.name.toLowerCase().includes(queryLower) ||
          (meeting.locationName &&
            meeting.locationName.toLowerCase().includes(queryLower)) ||
          (meeting.street &&
            meeting.street.toLowerCase().includes(queryLower)) ||
          (meeting.city && meeting.city.toLowerCase().includes(queryLower)),
      );
    }

    setFilteredMeetings(filtered);
  };

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    applyFiltersAndSearch(meetings, text);
  };

  // Reset all filters to default values
  const resetFilters = () => {
    setFilterOptions({
      showOnline: true,
      showInPerson: true,
      meetingType: null,
      day: null,
      radius: 10,
    });
  };

  // Show meeting details
  const showMeetingDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingDetailsVisible(true);
  };

  // Toggle favorite status for a meeting
  const toggleFavorite = async (meetingId: string) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert(
          'Authentication Required',
          'Please log in to save favorite meetings',
        );
        return;
      }

      const userRef = firestore().collection('users').doc(currentUser.uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const favorites = userData?.favoriteMeetings || [];

        if (favorites.includes(meetingId)) {
          // Remove from favorites
          await userRef.update({
            favoriteMeetings: firestore.FieldValue.arrayRemove(meetingId),
          });
        } else {
          // Add to favorites
          await userRef.update({
            favoriteMeetings: firestore.FieldValue.arrayUnion(meetingId),
          });
        }

        // Update local state
        setMeetings(
          meetings.map(meeting =>
            meeting.id === meetingId
              ? {...meeting, isFavorite: !meeting.isFavorite}
              : meeting,
          ),
        );

        // Update filtered meetings too
        setFilteredMeetings(
          filteredMeetings.map(meeting =>
            meeting.id === meetingId
              ? {...meeting, isFavorite: !meeting.isFavorite}
              : meeting,
          ),
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert(
        'Error',
        'Failed to update favorite status. Please try again.',
      );
    }
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

    const parts = [];
    if (meeting.street) parts.push(meeting.street);
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
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => item.id && toggleFavorite(item.id)}>
          <Text style={styles.favoriteIcon}>{item.isFavorite ? '★' : '☆'}</Text>
        </TouchableOpacity>
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
      </View>
    </TouchableOpacity>
  );

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Meetings</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            <Text style={styles.filterSectionTitle}>Meeting Type</Text>
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScrollView}>
              <TouchableOpacity
                style={[
                  styles.formatFilterButton,
                  filterOptions.meetingType === null &&
                    styles.formatFilterActive,
                ]}
                onPress={() =>
                  setFilterOptions({
                    ...filterOptions,
                    meetingType: null,
                  })
                }>
                <Text
                  style={[
                    styles.formatFilterText,
                    filterOptions.meetingType === null &&
                      styles.formatFilterActiveText,
                  ]}>
                  All
                </Text>
              </TouchableOpacity>

              {meetingTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.formatFilterButton,
                    filterOptions.meetingType === type &&
                      styles.formatFilterActive,
                  ]}
                  onPress={() =>
                    setFilterOptions({
                      ...filterOptions,
                      meetingType:
                        filterOptions.meetingType === type ? null : type,
                    })
                  }>
                  <Text
                    style={[
                      styles.formatFilterText,
                      filterOptions.meetingType === type &&
                        styles.formatFilterActiveText,
                    ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterSectionTitle}>Day of Week</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScrollView}>
              <TouchableOpacity
                style={[
                  styles.dayFilterButton,
                  filterOptions.day === null && styles.dayFilterActive,
                ]}
                onPress={() =>
                  setFilterOptions({
                    ...filterOptions,
                    day: null,
                  })
                }>
                <Text
                  style={[
                    styles.dayFilterText,
                    filterOptions.day === null && styles.dayFilterActiveText,
                  ]}>
                  All
                </Text>
              </TouchableOpacity>

              {days.map(day => (
                <TouchableOpacity
                  key={Math.random().toString()}
                  style={[
                    styles.dayFilterButton,
                    filterOptions.day === day && styles.dayFilterActive,
                  ]}
                  onPress={() =>
                    setFilterOptions({
                      ...filterOptions,
                      day: filterOptions.day === day ? null : day,
                    })
                  }>
                  <Text
                    style={[
                      styles.dayFilterText,
                      filterOptions.day === day && styles.dayFilterActiveText,
                    ]}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterSectionTitle}>Search Radius</Text>
            <View style={styles.radiusContainer}>
              <Text style={styles.radiusValue}>
                {filterOptions.radius} miles
              </Text>
              <Slider
                style={styles.radiusSlider}
                minimumValue={1}
                maximumValue={50}
                step={1}
                value={filterOptions.radius}
                onValueChange={value =>
                  setFilterOptions({
                    ...filterOptions,
                    radius: value,
                  })
                }
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#2196F3"
              />
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
      </View>
    </Modal>
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
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.meetingDetailContent}>
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
                    : selectedMeeting.locationName ||
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

              {selectedMeeting.types && selectedMeeting.types.length > 0 && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsLabel}>Meeting Format:</Text>
                  <View style={styles.detailsTags}>
                    {selectedMeeting.types.map(
                      (type: string, index: number) => (
                        <View key={index} style={styles.detailsTag}>
                          <Text style={styles.detailsTagText}>{type}</Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              )}

              {selectedMeeting.lat && selectedMeeting.lng && userLocation && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsLabel}>Distance:</Text>
                  <Text style={styles.detailsText}>
                    {calculateDistance(selectedMeeting)} from your location
                  </Text>
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

            <View style={styles.detailsFooter}>
              <TouchableOpacity
                style={[
                  styles.detailsActionButton,
                  selectedMeeting.isFavorite
                    ? styles.removeButton
                    : styles.addButton,
                ]}
                onPress={() => {
                  if (selectedMeeting.id) {
                    toggleFavorite(selectedMeeting.id);
                    setSelectedMeeting({
                      ...selectedMeeting,
                      isFavorite: !selectedMeeting.isFavorite,
                    });
                  }
                }}>
                <Text style={styles.detailsActionButtonText}>
                  {selectedMeeting.isFavorite
                    ? 'Remove from My Meetings'
                    : 'Add to My Meetings'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meetings</Text>
      </View>

      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search meetings..."
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}>
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Location error message */}
      {locationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getUserLocation}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Active filters display */}
      {(filterOptions.day ||
        filterOptions.meetingType ||
        filterOptions.radius !== 10) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            Filters:
            {filterOptions.radius !== 10
              ? ` ${filterOptions.radius} mi radius`
              : ''}
            {filterOptions.day
              ? ` | ${
                  filterOptions.day.charAt(0).toUpperCase() +
                  filterOptions.day.slice(1)
                }`
              : ''}
            {filterOptions.meetingType ? ` | ${filterOptions.meetingType}` : ''}
            {!filterOptions.showOnline || !filterOptions.showInPerson
              ? ` | ${
                  !filterOptions.showOnline ? 'In-person only' : 'Online only'
                }`
              : ''}
          </Text>
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={filteredMeetings}
          renderItem={renderMeetingItem}
          keyExtractor={() => Math.random().toString()}
          contentContainerStyle={styles.meetingsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No meetings found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      )}

      {renderFilterModal()}
      {renderMeetingDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  searchFilterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchContainer: {
    flex: 1,
    marginRight: 16,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loaderContainer: {
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
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3F2FD',
    padding: 10,
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#1976D2',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
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
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 24,
    color: '#FFC107',
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
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalScrollView: {
    flex: 1,
  },
  detailsModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#757575',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
    marginTop: 16,
  },
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
  typeFilterActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  typeFilterText: {
    fontSize: 14,
    color: '#757575',
  },
  typeFilterActiveText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  filterScrollView: {
    marginBottom: 24,
  },
  dayFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    marginRight: 8,
  },
  dayFilterActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  dayFilterText: {
    fontSize: 14,
    color: '#757575',
  },
  dayFilterActiveText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  formatFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    marginRight: 8,
  },
  formatFilterActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  formatFilterText: {
    fontSize: 14,
    color: '#757575',
  },
  formatFilterActiveText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  radiusContainer: {
    marginBottom: 24,
  },
  radiusValue: {
    fontSize: 14,
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },
  radiusSlider: {
    width: '100%',
    height: 40,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
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
  meetingDetailContent: {
    flex: 1,
    marginBottom: 16,
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
  detailsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  detailsTag: {
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  detailsTagText: {
    fontSize: 12,
    color: '#616161',
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
  detailsActionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#E3F2FD',
  },
  removeButton: {
    backgroundColor: '#FFEBEE',
  },
  detailsActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
});

export default MeetingsScreen;
