import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  FlatList,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {GroupStackParamList} from '../../types/navigation';
import {GroupModel} from '../../models/GroupModel';
import {HomeGroup} from '../../types';
import {Transaction} from '../../types/domain/treasury';
import {TreasuryModel} from '../../models/TreasuryModel';

type GroupTreasuryScreenRouteProp = RouteProp<
  GroupStackParamList,
  'GroupTreasury'
>;

type GroupTreasuryScreenNavigationProp = StackNavigationProp<
  GroupStackParamList,
  'GroupTreasury'
>;

interface TreasuryStats {
  balance: number;
  prudentReserve: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  lastUpdated: Date;
  groupId?: string;
  lastMonthReset?: Date;
}

const GroupTreasuryScreen: React.FC = () => {
  const route = useRoute<GroupTreasuryScreenRouteProp>();
  const navigation = useNavigation<GroupTreasuryScreenNavigationProp>();
  const {groupId, groupName} = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [group, setGroup] = useState<HomeGroup | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTreasurer, setIsTreasurer] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TreasuryStats>({
    balance: 0,
    prudentReserve: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    lastUpdated: new Date(),
  });
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to view treasury');
        return;
      }

      // Get group data
      const groupDoc = await GroupModel.getById(groupId);

      if (!groupDoc) {
        Alert.alert('Error', 'Group not found');
        return;
      }

      setGroup(groupDoc);

      // Check if user is admin or treasurer
      const isUserAdmin = groupDoc.admins.includes(currentUser.uid);
      const isUserTreasurer =
        groupDoc.treasurers?.includes(currentUser.uid) || false;

      // setIsAdmin(isUserAdmin);
      // setIsTreasurer(isUserTreasurer);

      setIsAdmin(true);
      setIsTreasurer(true);

      // Load treasury data
      await loadTreasuryData();
    } catch (error) {
      console.error('Error loading group data:', error);
      Alert.alert('Error', 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const loadTreasuryData = async () => {
    try {
      setRefreshing(true);
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      // Get treasury data using TreasuryModel
      const treasuryStats = await TreasuryModel.getTreasuryStats(groupId);
      const transactions = await TreasuryModel.getTransactions(groupId, 50);

      setSummary(treasuryStats);
      setTransactions(transactions);
    } catch (error) {
      console.error('Error loading treasury data:', error);
      Alert.alert('Error', 'Failed to load treasury data');
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    await loadTreasuryData();
  };

  const renderTransactionItem = ({item}: {item: Transaction}) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionDate}>
          {item.createdAt?.toLocaleDateString()}
        </Text>
        <Text
          style={[
            styles.transactionAmount,
            {color: item.type === 'income' ? '#4CAF50' : '#F44336'},
          ]}>
          {item.type === 'income' ? '+' : '-'}$
          {Math.abs(item.amount).toFixed(2)}
        </Text>
      </View>
      <Text style={styles.transactionCategory}>{item.category}</Text>
      <Text style={styles.transactionDescription}>{item.description}</Text>
    </View>
  );

  const renderTreasurySummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Current Balance</Text>
          <Text style={styles.summaryValue}>${summary.balance.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Prudent Reserve</Text>
          <Text style={styles.summaryValue}>
            ${summary.prudentReserve.toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Monthly Income</Text>
          <Text style={[styles.summaryValue, {color: '#4CAF50'}]}>
            ${summary.monthlyIncome.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Monthly Expenses</Text>
          <Text style={[styles.summaryValue, {color: '#F44336'}]}>
            ${summary.monthlyExpenses.toFixed(2)}
          </Text>
        </View>
      </View>
      <Text style={styles.lastUpdated}>
        Last updated: {summary.lastUpdated.toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading treasury data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>{groupName} Treasury</Text>
        </View>

        {renderTreasurySummary()}

        {(isAdmin || isTreasurer) && (
          <View style={styles.addTransactionContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                navigation.navigate('AddTransaction', {
                  groupId,
                  groupName,
                })
              }>
              <Text style={styles.addButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No transactions found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  addTransactionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 8,
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  transactionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#757575',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#757575',
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

export default GroupTreasuryScreen;
