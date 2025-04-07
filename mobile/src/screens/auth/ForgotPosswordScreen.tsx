// src/screens/auth/ForgotPasswordScreen.tsx

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {validateEmail} from '../../utils/validation';
import {resetPassword} from '../../services/firebase/auth';

type ForgotPasswordScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSendResetEmail = async () => {
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (err) {
      let errorMessage =
        'Failed to send password reset email. Please try again.';

      if (err instanceof Error) {
        // Handle specific Firebase errors
        if (err.message.includes('user-not-found')) {
          errorMessage = 'No account found with this email address.';
        } else if (err.message.includes('invalid-email')) {
          errorMessage = 'The email address is not valid.';
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Logo and App Name */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>RC</Text>
            </View>
            <Text style={styles.appName}>Recovery Connect</Text>
          </View>

          <View style={styles.formCard}>
            {!emailSent ? (
              <>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.description}>
                  Enter your email address below and we'll send you instructions
                  to reset your password.
                </Text>

                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={error}
                />

                <Button
                  title="Send Reset Link"
                  onPress={handleSendResetEmail}
                  loading={loading}
                  disabled={loading || !email.trim()}
                  fullWidth
                  style={styles.submitButton}
                />
              </>
            ) : (
              <>
                <View style={styles.successContainer}>
                  <Text style={styles.successTitle}>Check Your Email</Text>
                  <Text style={styles.successDescription}>
                    We've sent instructions to reset your password to:
                  </Text>
                  <Text style={styles.emailText}>{email}</Text>
                  <Text style={styles.successDescription}>
                    If you don't see the email in your inbox, please check your
                    spam folder.
                  </Text>
                </View>

                <Button
                  title="Back to Login"
                  onPress={() => navigation.navigate('Login')}
                  variant="outline"
                  fullWidth
                  style={styles.backButton}
                />
              </>
            )}
          </View>

          {!emailSent && (
            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 8,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    fontSize: 14,
    color: '#2196F3',
  },
  successContainer: {
    alignItems: 'center',
    padding: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  successDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  emailText: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
    marginVertical: 8,
  },
  backButton: {
    marginTop: 24,
  },
});

export default ForgotPasswordScreen;
