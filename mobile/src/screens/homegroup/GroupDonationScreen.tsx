import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {GroupStackParamList} from '../../types/navigation';
import {useStripe} from '@stripe/stripe-react-native'; // Import Stripe hook
import functions from '@react-native-firebase/functions'; // Import Firebase Functions
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {selectUser, selectUserData} from '../../store/slices/authSlice';
import {completeDonation} from '../../store/slices/groupsSlice';
import {useAppDispatch} from '../../store';
type ScreenRouteProp = RouteProp<GroupStackParamList, 'GroupDonation'>;
type ScreenNavigationProp = StackNavigationProp<
  GroupStackParamList,
  'GroupDonation'
>;

const GroupDonationScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<ScreenNavigationProp>();
  const {groupId, groupName} = route.params;

  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const [amount, setAmount] = useState('10'); // Default $10
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [donationId, setDonationId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  // Function to fetch payment intent from backend
  const fetchPaymentIntentClientSecret = async () => {
    setLoading(true);
    setError(null);
    try {
      const amountInCents = parseInt(amount, 10) * 100;
      if (isNaN(amountInCents) || amountInCents < 50) {
        // Stripe minimum is $0.50
        setError('Minimum donation is $0.50');
        setLoading(false);
        return null;
      }

      const createPaymentIntent = functions().httpsCallable(
        'createStripePaymentIntent',
      );
      const response = await createPaymentIntent({
        groupId,
        amount: amountInCents,
      });

      const secret = response?.data?.clientSecret as string | undefined;
      if (!secret) {
        throw new Error('Failed to get payment client secret from server.');
      }
      setClientSecret(secret);
      return secret; // Return for immediate use
    } catch (error: any) {
      console.error('Error fetching Payment Intent:', error);
      setError(
        error.message || 'Could not initiate donation. Please try again.',
      );
      setLoading(false);
      return null;
    }
    // setLoading(false) will happen after sheet is initialized or fails
  };

  // Initialize Payment Sheet
  const initializePaymentSheet = async () => {
    const secret = await fetchPaymentIntentClientSecret();
    if (!secret) return;

    const customerId = useSelector(selectUserData)?.customerId;

    const {error: initError} = await initPaymentSheet({
      merchantDisplayName: 'Recovery Connect',
      customerId: customerId, // Optional: Prefill customer if you have it
      // customerEphemeralKeySecret: ephemeralKey, // Optional: Needed for reusing cards
      paymentIntentClientSecret: secret,
      allowsDelayedPaymentMethods: false, // Recommended false for donations
      returnURL: 'recoveryconnect://stripe-redirect', // Your custom URL scheme
      defaultBillingDetails: {
        // name: 'Jane Doe', // Optional
      },
    });

    if (initError) {
      console.error('Stripe initPaymentSheet error:', initError);
      setError(`Error initializing payment: ${initError.message}`);
      setLoading(false);
    } else {
      console.log('Payment sheet initialized successfully');
      // Allow donation button to be pressed now
      setLoading(false);
    }
  };

  // Present Payment Sheet and handle result
  const handleDonatePress = async () => {
    if (!clientSecret) {
      // Fetch/Initialize first if clientSecret isn't ready
      setLoading(true);
      await initializePaymentSheet();
      // setLoading(false) is handled within initializePaymentSheet
      return;
    }

    setLoading(true); // Show loading for payment presentation
    const {error: presentError} = await presentPaymentSheet();

    if (presentError) {
      console.error('Stripe presentPaymentSheet error:', presentError);
      setError(`Payment Error: ${presentError.message}`);
      // Reset clientSecret so init is called next time
      setClientSecret(null);
    } else {
      setSuccess(true);
      dispatch(
        completeDonation({
          groupId,
          amount: parseInt(amount, 10),
          donationId: donationId!,
        }),
      );
      setDonationId(null);
      setAmount('10');
      // Show success message and navigate back after a delay
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    }
    setLoading(false);
  };

  // Handle amount input changes
  const handleAmountChange = (text: string) => {
    setError(null);
    // Only allow numbers and ensure it's a valid amount
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '' || parseInt(numericValue, 10) >= 0) {
      setAmount(numericValue);
    }
  };

  // Fetch client secret when amount changes (debounced)
  useEffect(() => {
    // Debounce to avoid excessive calls while typing
    const handler = setTimeout(() => {
      if (amount && parseInt(amount, 10) >= 1) {
        // Fetch only if amount is valid
        // We fetch *before* initializing now, triggered by button press
        // initializePaymentSheet();
        // Instead, clear old secret so button re-initializes
        setClientSecret(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [amount, groupId]);

  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <Icon name="check-circle" size={80} color="#4CAF50" />
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successText}>
            Your donation of ${amount} has been processed successfully.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Donate to {groupName}</Text>
            <Text style={styles.subtitle}>
              Support this group's 7th Tradition
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Donation Amount ($)</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                testID="donation-amount-input"
              />
              <Text style={styles.currencyCode}>USD</Text>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.donateButton, loading && styles.disabledButton]}
              onPress={handleDonatePress}
              disabled={loading || !amount || parseInt(amount, 10) < 1}
              testID="donation-submit-button">
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.donateButtonText}>
                  Donate ${amount || '0'}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.infoText}>
              Secure payment processing powered by Stripe. Your contribution
              helps the group cover expenses like rent and literature.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F5F5F5'},
  container: {flex: 1},
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#757575',
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 28, // Larger font for amount
    fontWeight: 'bold',
    color: '#212121',
  },
  currencyCode: {
    fontSize: 16,
    color: '#BDBDBD',
    marginLeft: 8,
  },
  donateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  donateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  infoText: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default GroupDonationScreen;
