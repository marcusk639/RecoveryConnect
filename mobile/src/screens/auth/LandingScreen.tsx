import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {theme} from '../../theme/theme';
import {Button} from '../../components/common/Button';
import {Card} from '../../components/common/Card';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Meetings: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LandingScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container} testID="landing-screen">
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>RC</Text>
          </View>
          <Text style={styles.headerTitle}>Recovery Connect</Text>
        </View>
        <Button
          title="Sign In"
          variant="outline"
          size="small"
          onPress={() => navigation.navigate('Login')}
          testID="landing-signin-button"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Find support in your recovery journey
          </Text>
          <Text style={styles.heroSubtitle}>
            Connect with your recovery community while maintaining anonymity and
            privacy. Meeting schedules, group announcements, and treasury
            management made simple.
          </Text>

          <View style={styles.actionButtons}>
            <Button
              title="Find a Meeting"
              variant="primary"
              size="large"
              onPress={() => navigation.navigate('Meetings')}
              testID="landing-find-meeting-button"
            />

            <Button
              title="Register"
              variant="secondary"
              size="large"
              onPress={() => navigation.navigate('Register')}
              testID="landing-register-button"
            />
          </View>

          <Card variant="filled" style={styles.privacyCard}>
            <Text style={styles.privacyNoteText}>
              <Text style={styles.privacyNoteBold}>Privacy First:</Text> We
              respect anonymity. First names only, encrypted messages, and no
              social media integration.
            </Text>
          </Card>
        </View>

        <View style={styles.featuresSection}>
          <Card variant="elevated" style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              {/* <Image
                source={require('../../assets/icons/calendar.png')}
                style={styles.featureIcon}
              /> */}
            </View>
            <Text style={styles.featureTitle}>Meeting Directory</Text>
            <Text style={styles.featureDescription}>
              Find meetings, save your schedule, and get reminders for your
              homegroup.
            </Text>
          </Card>

          <Card variant="elevated" style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              {/* <Image
                source={require('../../assets/icons/chat.png')}
                style={styles.featureIcon}
              /> */}
            </View>
            <Text style={styles.featureTitle}>Group Communication</Text>
            <Text style={styles.featureDescription}>
              Secure announcements and messaging for your recovery community.
            </Text>
          </Card>

          <Card variant="elevated" style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              {/* <Image
                source={require('../../assets/icons/money.png')}
                style={styles.featureIcon}
              /> */}
            </View>
            <Text style={styles.featureTitle}>Treasury Management</Text>
            <Text style={styles.featureDescription}>
              Track 7th Tradition contributions and expenses with easy handoff
              between treasurers.
            </Text>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Recovery Connect</Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
          <Text style={styles.footerLink}>Terms of Service</Text>
          <Text style={styles.footerLink}>About</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.grey200,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  logoText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.primary.main,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
  content: {
    padding: theme.spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  heroTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.neutral.grey900,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral.grey600,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  actionButtons: {
    flexDirection: 'column',
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  privacyCard: {
    padding: theme.spacing.lg,
    width: '100%',
  },
  privacyNoteText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.grey700,
  },
  privacyNoteBold: {
    fontWeight: 'bold',
  },
  featuresSection: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  featureCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  featureIcon: {
    width: 24,
    height: 24,
    tintColor: theme.colors.primary.main,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral.grey900,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral.grey600,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral.grey200,
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral.grey500,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLink: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary.main,
    marginHorizontal: theme.spacing.sm,
  },
});

export default LandingScreen;
