import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../store';
import {fetchSponsorshipAnalytics} from '../../store/slices/sponsorshipSlice';
import {GroupStackParamList} from '../../types/navigation';

type SponsorshipAnalyticsScreenRouteProp = RouteProp<
  GroupStackParamList,
  'SponsorshipAnalytics'
>;

const SponsorshipAnalyticsScreen: React.FC = () => {
  const route = useRoute<SponsorshipAnalyticsScreenRouteProp>();
  const {groupId} = route.params;
  const dispatch = useAppDispatch();
  const {analytics, loading, error} = useAppSelector(
    state => state.sponsorship,
  );

  useEffect(() => {
    dispatch(fetchSponsorshipAnalytics(groupId));
  }, [dispatch, groupId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error || !analytics) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {error || 'Failed to load analytics data'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Success Rate</Text>
        <Text style={styles.metricValue}>
          {analytics.successRate.toFixed(1)}%
        </Text>
        <Text style={styles.metricDescription}>
          of sponsorships are successfully completed
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Average Duration</Text>
        <Text style={styles.metricValue}>
          {Math.round(analytics.averageDuration)} days
        </Text>
        <Text style={styles.metricDescription}>
          average length of a sponsorship
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Challenges</Text>
        {analytics.commonChallenges.map(({challenge, count}, index) => (
          <View key={index} style={styles.challengeItem}>
            <Text style={styles.challengeText}>{challenge}</Text>
            <Text style={styles.challengeCount}>{count} occurrences</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Effective Solutions</Text>
        {analytics.solutions.map(({solution, successRate}, index) => (
          <View key={index} style={styles.solutionItem}>
            <Text style={styles.solutionText}>{solution}</Text>
            <Text style={styles.successRate}>
              {successRate.toFixed(1)}% success rate
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 14,
    color: '#757575',
  },
  challengeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  challengeText: {
    fontSize: 16,
    color: '#212121',
    flex: 1,
  },
  challengeCount: {
    fontSize: 14,
    color: '#757575',
  },
  solutionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  solutionText: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 4,
  },
  successRate: {
    fontSize: 14,
    color: '#4CAF50',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    margin: 16,
  },
});

export default SponsorshipAnalyticsScreen;
