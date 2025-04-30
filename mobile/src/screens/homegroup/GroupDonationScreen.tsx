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

type ScreenRouteProp = RouteProp<GroupStackParamList, 'GroupDonation'>;
type ScreenNavigationProp = StackNavigationProp<
  GroupStackParamList,
  'GroupDonation'
>;

const GroupDonationScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<ScreenNavigationProp>();
  const {groupId, groupName} = route.params;

  const {initPaymentSheet, presentPaymentSheet, confirmPayment} = useStripe();
  const [amount, setAmount] = useState('10'); // Default $10
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Function to fetch payment intent from backend
  const fetchPaymentIntentClientSecret = async () => {
    setLoading(true);
    try {
      const amountInCents = parseInt(amount, 10) * 100;
      if (isNaN(amountInCents) || amountInCents < 50) {
        // Stripe minimum is $0.50
        Alert.alert('Invalid Amount', 'Minimum donation is $0.50');
        setLoading(false);
        return;
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
      Alert.alert(
        'Error',
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

    const {error} = await initPaymentSheet({
      merchantDisplayName: 'Recovery Connect',
      // customerId: customerId, // Optional: Prefill customer if you have it
      // customerEphemeralKeySecret: ephemeralKey, // Optional: Needed for reusing cards
      paymentIntentClientSecret: secret,
      allowsDelayedPaymentMethods: false, // Recommended false for donations
      returnURL: 'recoveryconnect://stripe-redirect', // Your custom URL scheme
      defaultBillingDetails: {
        // name: 'Jane Doe', // Optional
      },
    });

    if (error) {
      console.error('Stripe initPaymentSheet error:', error);
      Alert.alert(`Error initializing payment: ${error.code}`, error.message);
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
    const {error} = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Payment Error: ${error.code}`, error.message);
      console.error('Stripe presentPaymentSheet error:', error);
      // Reset clientSecret so init is called next time
      setClientSecret(null);
    } else {
      Alert.alert('Success', 'Your donation was successful! Thank you.');
      console.log('Donation successful!');
      // Navigate back or show success state
      navigation.goBack();
    }
    setLoading(false);
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
                onChangeText={text => setAmount(text.replace(/[^0-9]/g, ''))} // Allow only numbers
                keyboardType="numeric"
                testID="donation-amount-input"
              />
              <Text style={styles.currencyCode}>USD</Text>
            </View>

            {/* Placeholder for where Stripe Element would go if not using PaymentSheet */}
            {/* <CardField style={styles.cardField} /> */}

            <TouchableOpacity
              style={[styles.donateButton, loading && styles.disabledButton]}
              onPress={handleDonatePress}
              disabled={loading}
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
});

export default GroupDonationScreen;
