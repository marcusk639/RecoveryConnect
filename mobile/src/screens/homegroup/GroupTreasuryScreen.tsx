import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Import types
import {GroupStackParamList} from '../../types/navigation';

// Types for treasury data
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdBy: string;
  createdAt: Date;
}

interface TreasurySummary {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  prudentReserve: number;
  prudentReservePercentage: number;
}

type GroupTreasuryScreenRouteProp = RouteProp<
  GroupStackParamList,
  'GroupTreasury'
>;
type GroupTreasuryScreenNavigationProp =
  StackNavigationProp<GroupStackParamList>;

const GroupTreasuryScreen: React.FC = () => {
  const route = useRoute<GroupTreasuryScreenRouteProp>();
  const navigation = useNavigation<GroupTreasuryScreenNavigationProp>();
  const {groupId, groupName} = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TreasurySummary | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add transaction modal state
  const [addTransactionModalVisible, setAddTransactionModalVisible] =
    useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    'income',
  );
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(
    'all',
  );
  const [filterPeriod, setFilterPeriod] = useState<
    'all' | 'month' | 'quarter' | 'year'
  >('all');

  useEffect(() => {
    loadTreasuryData();
  }, [groupId]);

  const loadTreasuryData = async () => {
    try {
      setLoading(true);

      // In a real app, this would fetch from Firestore
      // For now, we'll use mock data
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          amount: 150.0,
          category: '7th Tradition',
          description: 'Weekly contributions',
          date: new Date('2024-04-01'),
          createdBy: 'user1',
          createdAt: new Date('2024-04-01'),
        },
        {
          id: '2',
          type: 'expense',
          amount: 25.0,
          category: 'Literature',
          description: 'Big Book purchase',
          date: new Date('2024-04-05'),
          createdBy: 'user2',
          createdAt: new Date('2024-04-05'),
        },
        {
          id: '3',
          type: 'income',
          amount: 120.0,
          category: '7th Tradition',
          description: 'Weekly contributions',
          date: new Date('2024-04-08'),
          createdBy: 'user1',
          createdAt: new Date('2024-04-08'),
        },
        {
          id: '4',
          type: 'expense',
          amount: 50.0,
          category: 'Rent',
          description: 'Monthly meeting space rent',
          date: new Date('2024-04-10'),
          createdBy: 'user2',
          createdAt: new Date('2024-04-10'),
        },
        {
          id: '5',
          type: 'income',
          amount: 135.0,
          category: '7th Tradition',
          description: 'Weekly contributions',
          date: new Date('2024-04-15'),
          createdBy: 'user1',
          createdAt: new Date('2024-04-15'),
        },
      ];

      const mockSummary: TreasurySummary = {
        currentBalance: 330.0,
        monthlyIncome: 405.0,
        monthlyExpenses: 75.0,
        prudentReserve: 165.0,
        prudentReservePercentage: 50,
      };

      setTransactions(mockTransactions);
      setSummary(mockSummary);

      // Check if current user is admin
      const currentUser = auth().currentUser;
      // For demo, just set as admin
      setIsAdmin(true);
    } catch (error) {
      console.error('Error loading treasury data:', error);
      Alert.alert(
        'Error',
        'Failed to load treasury data. Please try again later.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTreasuryData();
  };

  const handleAddTransaction = async () => {
    if (!amount || !category || !description) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    try {
      setSaving(true);

      // In a real app, this would save to Firestore
      // For now, we'll simulate a network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a new transaction
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: transactionType,
        amount: numericAmount,
        category,
        description,
        date: new Date(),
        createdBy: auth().currentUser?.uid || 'user1',
        createdAt: new Date(),
      };

      // Update local state
      setTransactions([newTransaction, ...transactions]);

      // Update summary
      if (summary) {
        const updatedSummary: TreasurySummary = {
          ...summary,
          currentBalance:
            transactionType === 'income'
              ? summary.currentBalance + numericAmount
              : summary.currentBalance - numericAmount,
          monthlyIncome:
            transactionType === 'income'
              ? summary.monthlyIncome + numericAmount
              : summary.monthlyIncome,
          monthlyExpenses:
            transactionType === 'expense'
              ? summary.monthlyExpenses + numericAmount
              : summary.monthlyExpenses,
          prudentReserve: summary.prudentReserve,
          prudentReservePercentage: summary.prudentReservePercentage,
        };

        setSummary(updatedSummary);
      }

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
      setAddTransactionModalVisible(false);

      Alert.alert('Success', 'Transaction added successfully.');
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFilteredTransactions = (): Transaction[] => {
    let filtered = [...transactions];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Apply period filter
    if (filterPeriod !== 'all') {
      const now = new Date();
      const startDate = new Date();

      if (filterPeriod === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (filterPeriod === 'quarter') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (filterPeriod === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      filtered = filtered.filter(t => t.date >= startDate);
    }

    return filtered;
  };

  const renderTransactionItem = ({item}: {item: Transaction}) => {
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text
            style={[
              styles.transactionAmount,
              item.type === 'income' ? styles.incomeText : styles.expenseText,
            ]}>
            {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
          </Text>
        </View>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* Treasury Summary Card */}
        {summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Treasury Summary</Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Current Balance</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(summary.currentBalance)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Monthly Income</Text>
                <Text style={[styles.summaryValue, styles.incomeText]}>
                  {formatCurrency(summary.monthlyIncome)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Monthly Expenses</Text>
                <Text style={[styles.summaryValue, styles.expenseText]}>
                  {formatCurrency(summary.monthlyExpenses)}
                </Text>
              </View>
            </View>

            <View style={styles.prudentReserveContainer}>
              <Text style={styles.prudentReserveLabel}>Prudent Reserve</Text>
              <Text style={styles.prudentReserveValue}>
                {formatCurrency(summary.prudentReserve)} (
                {summary.prudentReservePercentage}%)
              </Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(
                        100,
                        summary.prudentReservePercentage,
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Filter Controls */}
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Type:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === 'all' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterType('all')}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === 'all' && styles.filterButtonTextActive,
                  ]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === 'income' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterType('income')}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === 'income' && styles.filterButtonTextActive,
                  ]}>
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === 'expense' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterType('expense')}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === 'expense' && styles.filterButtonTextActive,
                  ]}>
                  Expenses
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Period:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterPeriod === 'all' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterPeriod('all')}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filterPeriod === 'all' && styles.filterButtonTextActive,
                  ]}>
                  All Time
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterPeriod === 'month' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterPeriod('month')}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filterPeriod === 'month' && styles.filterButtonTextActive,
                  ]}>
                  Month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterPeriod === 'quarter' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterPeriod('quarter')}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filterPeriod === 'quarter' && styles.filterButtonTextActive,
                  ]}>
                  Quarter
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterPeriod === 'year' && styles.filterButtonActive,
                ]}
                onPress={() => setFilterPeriod('year')}>
                <Text
                  style={[
                    styles.filterButtonText,
                    filterPeriod === 'year' && styles.filterButtonTextActive,
                  ]}>
                  Year
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setAddTransactionModalVisible(true)}>
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {getFilteredTransactions().length > 0 ? (
            <FlatList
              data={getFilteredTransactions()}
              renderItem={renderTransactionItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ListFooterComponent={<View style={{height: 20}} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal
        visible={addTransactionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddTransactionModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAddTransactionModalVisible(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.transactionTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'income' && styles.typeButtonActive,
                ]}
                onPress={() => setTransactionType('income')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    transactionType === 'income' && styles.typeButtonTextActive,
                  ]}>
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'expense' && styles.typeButtonActive,
                ]}
                onPress={() => setTransactionType('expense')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    transactionType === 'expense' &&
                      styles.typeButtonTextActive,
                  ]}>
                  Expense
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g., 7th Tradition, Rent, Literature"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description of the transaction"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddTransaction}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Transaction</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#2196F3',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    fontSize: 24,
    color: '#757575',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
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
    fontWeight: '600',
    color: '#333333',
  },
  incomeText: {
    color: '#4CAF50',
  },
  expenseText: {
    color: '#F44336',
  },
  prudentReserveContainer: {
    marginTop: 8,
  },
  prudentReserveLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  prudentReserveValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  filterContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#757575',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  transactionsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
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
    fontWeight: '700',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#757575',
  },
  transactionTypeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  typeButtonActive: {
    backgroundColor: '#2196F3',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupTreasuryScreen;
