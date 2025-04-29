import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {GroupModel} from '../../models/GroupModel';
import {HomeGroup} from '../../types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AdminRequestCardProps {
  group: HomeGroup;
  onRequestSubmitted?: () => void;
}

const AdminRequestCard: React.FC<AdminRequestCardProps> = ({
  group,
  onRequestSubmitted,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has already submitted a request
  const hasSubmittedRequest = () => {
    if (!group.pendingAdminRequests) return false;

    // Check if current user's ID is in the pending requests
    const currentUserId = GroupModel.getCurrentUserId();
    return group.pendingAdminRequests.some(
      request => request.uid === currentUserId,
    );
  };

  const handleRequestAdmin = async () => {
    try {
      setIsSubmitting(true);
      await GroupModel.requestAdminAccess(group.id, message);
      Alert.alert(
        'Request Submitted',
        'Your request to become an admin for this group has been submitted for review.',
      );
      setIsExpanded(false);
      setMessage('');
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit admin request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the group is already claimed, don't show the card
  if (group.isClaimed) {
    return null;
  }

  // If user has already submitted a request, show pending status
  if (hasSubmittedRequest()) {
    return (
      <View style={styles.container}>
        <View style={styles.pendingContainer}>
          <Icon name="clock-outline" size={24} color="#FFA000" />
          <Text style={styles.pendingText}>
            Your admin request for this group is pending review.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Icon name="account-key" size={28} color="#1976D2" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>This group needs an admin</Text>
          <Text style={styles.description}>
            Are you a leader or regular attendee of this group? Help keep the
            information up to date by becoming an admin.
          </Text>
        </View>
      </View>

      {isExpanded ? (
        <View style={styles.expandedContent}>
          <Text style={styles.label}>
            Tell us your connection to this group:
          </Text>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="e.g., I'm the group secretary, I attend every week, etc."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsExpanded(false);
                setMessage('');
              }}
              disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRequestAdmin}
              disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => setIsExpanded(true)}>
          <Text style={styles.requestButtonText}>Request Admin Access</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: '#1976D2',
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  expandedContent: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#F5F5F5',
    fontSize: 14,
    color: '#212121',
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  cancelButtonText: {
    color: '#757575',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 4,
  },
  pendingText: {
    marginLeft: 8,
    color: '#5D4037',
    fontSize: 14,
    flex: 1,
  },
});

export default AdminRequestCard;
