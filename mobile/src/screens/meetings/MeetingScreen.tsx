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

// Types for meetings data
import {Meeting, MeetingType, Location, DaysAndTimes} from '../../types';

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
  const [showTypeFilterModal, setShowTypeFilterModal] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<
    MeetingType | 'All'
  >('All');
  const [showOnline, setShowOnline] = useState(true);
  const [showInPerson, setShowInPerson] = useState(true);

  const days: (keyof DaysAndTimes)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ] as const;

  const meetingTypes: (MeetingType | 'All')[] = [
    'All',
    'AA',
    'NA',
    'Celebrate Recovery',
    'Custom',
  ];

  const meetings = useMemo(() => {
    return filteredMeetings.filter(meeting => {
      return meeting.name.toLowerCase().includes(nameQuery.toLowerCase());
    });
  }, [filteredMeetings, nameQuery]);

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
          filters: {
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
            filters: {
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
            type: selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
          },
        }),
      );
    }
  }, [
    getUserLocation,
    usingCustomLocation,
    customLocation,
    dispatch,
    selectedTypeFilter,
  ]);

  useEffect(() => {
    applyFilters();
  }, [nameQuery, selectedTypeFilter, showOnline, showInPerson]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const applyFilters = () => {
    dispatch(
      filterMeetings({
        searchQuery: nameQuery,
        showOnline: showOnline,
        showInPerson: showInPerson,
        meetingType:
          selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
      }),
    );
  };

  const fetchMeetingsWithCriteria = (locationToUse: Location | null) => {
    if (!locationToUse) {
      dispatch(
        fetchMeetings({
          filters: {
            type: selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
          },
        }),
      );
    } else {
      dispatch(
        fetchMeetings({
          location: locationToUse,
          filters: {
            type: selectedTypeFilter === 'All' ? undefined : selectedTypeFilter,
          },
        }),
      );
    }
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
    setSearchRadius(10);
    setUsingCustomLocation(false);
    setCustomLocation(null);
    setCustomLocationAddress(null);
    getUserLocation();
  };

  const showMeetingDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingDetailsVisible(true);
  };

  const handleToggleFavorite = (meetingId: string) => {
    dispatch(toggleFavoriteMeeting(meetingId));
  };

  const formatDayAndTime = (meeting: Meeting): string => {
    if (meeting.day && meeting.time) {
      const day = meeting.day.charAt(0).toUpperCase() + meeting.day.slice(1);
      return `${day}s at ${meeting.time}`;
    }
    return 'Time not specified';
  };

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

    return (
      <TouchableOpacity
        style={styles.meetingCard}
        onPress={() => showMeetingDetails(item)}>
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
  };

  const renderTypeFilterModal = () => (
    <Modal
      visible={showTypeFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTypeFilterModal(false)}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={() => setShowTypeFilterModal(false)}>
        <View style={styles.filterModalContainer}>
          <View style={styles.pullIndicator} />
          <View style={styles.locationModalHeader}>
            <Text style={styles.locationModalTitle}>Meeting Type</Text>
            <TouchableOpacity
              onPress={() => setShowTypeFilterModal(false)}
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
                  setSelectedTypeFilter(type);
                  fetchMeetingsWithCriteria(activeLocation);
                  setShowTypeFilterModal(false);
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
  );

  const renderMeetingDetailsModal = () => (
    <Modal
      visible={meetingDetailsVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setMeetingDetailsVisible(false)}>
      {selectedMeeting && (
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            <View style={styles.locationModalHeader}>
              <Text style={styles.locationModalTitle}>Meeting Details</Text>
              <TouchableOpacity
                onPress={() => setMeetingDetailsVisible(false)}
                style={styles.closeButton}>
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
                    }}>
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

  return (
    <SafeAreaView style={styles.container}>
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
          />
        </View>

        <View style={styles.filterButtonsRow}>
          <TouchableOpacity
            style={styles.filterChipButton}
            onPress={() => setShowTypeFilterModal(true)}>
            <Icon name="filter-variant" size={18} color="#1976D2" />
            <Text style={styles.filterChipButtonText}>
              {selectedTypeFilter === 'All' ? 'Type' : selectedTypeFilter}
            </Text>
            <Icon name="chevron-down" size={18} color="#1976D2" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterChipButton}
            onPress={() => setShowLocationPicker(true)}>
            <Icon name="map-marker-outline" size={18} color="#1976D2" />
            <Text style={styles.filterChipButtonText}>
              {customLocationAddress || 'Location'}
            </Text>
            <Icon name="chevron-down" size={18} color="#1976D2" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterChipButton}
            onPress={resetFilters}>
            <Icon name="filter-variant-remove" size={18} color="#757575" />
            <Text style={[styles.filterChipButtonText, {color: '#757575'}]}>
              Reset
            </Text>
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
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Finding meetings...</Text>
        </View>
      ) : (
        <FlatList
          data={meetings}
          renderItem={renderMeetingItem}
          keyExtractor={item => item.id || Math.random().toString()}
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
                  : 'Try adjusting your search location, radius, or filters.'}
              </Text>
              <TouchableOpacity
                style={styles.resetEmptyButton}
                onPress={resetFilters}>
                <Text style={styles.resetEmptyButtonText}>Reset Search</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {renderTypeFilterModal()}
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
    justifyContent: 'space-between',
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
    color: '#757575',
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
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  applyButtonText: {
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
  modalItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalItemButtonActive: {
    backgroundColor: '#2196F3',
  },
  modalItemText: {
    fontSize: 16,
    color: '#424242',
  },
  modalItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    marginTop: 16,
  },
  useMyLocationText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '600',
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
});

export default MeetingsScreen;
