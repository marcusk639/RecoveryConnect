import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {GroupStackParamList} from '../../types/navigation';
import {GroupModel} from '../../models/GroupModel';
import {Transaction} from '../../types/domain';
import {TreasuryModel} from '../../models/TreasuryModel';

type AddTransactionScreenRouteProp = RouteProp<
  GroupStackParamList,
  'AddTransaction'
>;

type AddTransactionScreenNavigationProp = StackNavigationProp<
  GroupStackParamList,
  'AddTransaction'
>;

const AddTransactionScreen: React.FC = () => {
  const route = useRoute<AddTransactionScreenRouteProp>();
  const navigation = useNavigation<AddTransactionScreenNavigationProp>();
  const {groupId, groupName} = route.params;

  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    'income',
  );
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!amount || !category || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to add transactions');
        return;
      }

      // Create the transaction document
      const transactionId = firestore().collection('groups').doc().id;
      const transaction: Transaction = {
        id: transactionId,
        type: transactionType,
        amount: numericAmount,
        category,
        description,
        createdAt: new Date(),
        createdBy: currentUser.uid,
        groupId: groupId,
      };

      // Add the transaction using TreasuryModel
      await TreasuryModel.createTransaction(transaction);
      Alert.alert('Success', 'Transaction added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Transaction</Text>
          <Text style={styles.subtitle}>{groupName}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.typeSelector}>
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
                  transactionType === 'expense' && styles.typeButtonTextActive,
                ]}>
                Expense
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#9E9E9E"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., 7th Tradition, Rent, Literature"
              placeholderTextColor="#9E9E9E"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description of the transaction"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#9E9E9E"
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Transaction</Text>
            )}
          </TouchableOpacity>
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
  header: {
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
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  typeSelector: {
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
  label: {
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
    backgroundColor: '#FFFFFF',
    color: '#212121',
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

export default AddTransactionScreen;
