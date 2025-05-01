import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {GroupStackParamList} from '../../types/navigation';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  fetchServicePositionsForGroup,
  selectServicePositionsByGroup,
  selectServicePositionsStatus,
  selectServicePositionsError,
  deleteServicePosition,
} from '../../store/slices/servicePositionsSlice';
import {selectGroupById} from '../../store/slices/groupsSlice'; // To check admin status
import {ServicePosition} from '../../types';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type ScreenRouteProp = RouteProp<GroupStackParamList, 'GroupServicePositions'>;
type ScreenNavigationProp = StackNavigationProp<
  GroupStackParamList,
  'GroupServicePositions'
>;

const GroupServicePositionsScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<ScreenNavigationProp>();
  const {groupId, groupName} = route.params;
  const dispatch = useAppDispatch();

  const positions = useAppSelector(state =>
    selectServicePositionsByGroup(state, groupId),
  );
  const status = useAppSelector(selectServicePositionsStatus);
  const error = useAppSelector(selectServicePositionsError);
  const group = useAppSelector(state => selectGroupById(state, groupId));
  const currentUser = auth().currentUser;

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (group && currentUser) {
      setIsAdmin(group.admins.includes(currentUser.uid));
    }
  }, [group, currentUser]);

  const loadPositions = useCallback(() => {
    dispatch(fetchServicePositionsForGroup(groupId));
  }, [dispatch, groupId]);

  useEffect(() => {
    loadPositions();
    navigation.setOptions({title: `${groupName} - Service`});
  }, [loadPositions, navigation, groupName]);

  const handleAddPosition = () => {
    navigation.navigate('AddEditServicePosition', {
      groupId,
      groupName,
    });
  };

  const handleEditPosition = (position: ServicePosition) => {
    navigation.navigate('AddEditServicePosition', {
      groupId,
      groupName,
      positionId: position.id,
      position,
    });
  };

  const handleDeletePosition = (positionId: string) => {
    Alert.alert(
      'Delete Position',
      'Are you sure you want to delete this service position definition?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(
                deleteServicePosition({groupId, positionId}),
              ).unwrap();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete position.');
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item}: {item: ServicePosition}) => (
    <View style={styles.positionCard} testID={`service-pos-item-${item.id}`}>
      <View style={styles.positionHeader}>
        <Text style={styles.positionName}>{item.name}</Text>
        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              onPress={() => handleEditPosition(item)}
              style={styles.actionButton}
              testID={`service-pos-edit-button-${item.id}`}>
              <Icon name="pencil-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeletePosition(item.id)}
              style={styles.actionButton}
              testID={`service-pos-delete-button-${item.id}`}>
              <Icon name="delete-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {item.description && (
        <Text style={styles.positionDescription}>{item.description}</Text>
      )}
      <View style={styles.holderInfo}>
        <Icon
          name="account-circle-outline"
          size={18}
          color="#757575"
          style={styles.holderIcon}
        />
        <Text style={styles.holderText}>
          {item.currentHolderName
            ? `Held by: ${item.currentHolderName}`
            : 'Open Position'}
        </Text>
      </View>
      <View style={styles.termInfo}>
        <Icon
          name="calendar-range"
          size={18}
          color="#757575"
          style={styles.holderIcon}
        />
        <Text style={styles.termText}>
          {item.termStartDate || item.commitmentLength
            ? `Term: ${
                item.termStartDate instanceof Date
                  ? item.termStartDate.toLocaleDateString()
                  : 'Not Set'
              }${
                item.termEndDate instanceof Date
                  ? ` - ${item.termEndDate.toLocaleDateString()}`
                  : item.commitmentLength
                  ? ` (${item.commitmentLength} mo)`
                  : ''
              }`
            : 'No term set'}
        </Text>
      </View>
      {!item.currentHolderId && isAdmin && (
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => handleEditPosition(item)}
          testID={`service-pos-assign-button-${item.id}`}>
          <Text style={styles.assignButtonText}>Assign Member</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
      testID={`group-service-positions-screen-${groupId}`}>
      {isAdmin && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPosition}
          testID="service-pos-add-button">
          <Icon name="plus-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Position</Text>
        </TouchableOpacity>
      )}
      {status === 'loading' && positions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#2196F3"
            style={styles.loader}
            testID="service-pos-loader"
          />
          <Text style={styles.loadingText}>Loading service positions...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText} testID="service-pos-error">
            Error: {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadPositions}
            testID="service-pos-retry-button">
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={positions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          testID="service-pos-list"
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={status === 'loading'}
              onRefresh={loadPositions}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer} testID="service-pos-empty-list">
              <View style={styles.emptyIconContainer}>
                <Icon
                  name="account-group-outline"
                  size={64}
                  color="#BBDEFB"
                  style={styles.emptyIcon}
                />
              </View>
              <Text style={styles.emptyTitle}>No Service Positions</Text>
              <Text style={styles.emptyText}>
                {isAdmin
                  ? 'Start organizing your group by adding service positions. This helps members know what roles are available and who is responsible for what.'
                  : 'No service positions have been defined for this group yet. Check back later or contact a group admin.'}
              </Text>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddPosition}>
                  <Text style={styles.addButtonText}>Add Position</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  loader: {marginTop: 20},
  list: {padding: 16},
  positionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  positionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1, // Allow name to take space
  },
  adminActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
  positionDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  holderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  holderIcon: {
    marginRight: 8,
  },
  holderText: {
    fontSize: 14,
    color: '#424242',
    fontStyle: 'italic',
  },
  termInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Add margin if assign button is present
  },
  termText: {
    fontSize: 14,
    color: '#424242',
  },
  assignButton: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  assignButtonText: {
    color: '#388E3C',
    fontWeight: '600',
    fontSize: 13,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 16,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#F44336',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default GroupServicePositionsScreen;
