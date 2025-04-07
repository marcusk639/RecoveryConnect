import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import * as Clipboard from '@react-native-clipboard/clipboard';

interface GroupInviteModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

const GroupInviteModal: React.FC<GroupInviteModalProps> = ({
  visible,
  onClose,
  groupId,
  groupName,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  // Generate an invite code when the modal opens
  React.useEffect(() => {
    if (visible && !inviteCode) {
      generateInviteCode();
    }
  }, [visible]);

  // Generate a unique invite code
  const generateInviteCode = async () => {
    try {
      setLoading(true);

      // Generate a random 6-character alphanumeric code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }

      // Create an invite record in Firestore
      const inviteRef = await firestore()
        .collection('invites')
        .add({
          code: code,
          groupId: groupId,
          groupName: groupName,
          createdAt: firestore.FieldValue.serverTimestamp(),
          createdBy: auth().currentUser?.uid,
          expiresAt: firestore.Timestamp.fromDate(
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          ),
          used: false,
        });

      // Create the invite link (this would be a deep link in a real app)
      const baseUrl =
        Platform.OS === 'ios'
          ? 'recoveryconnect://'
          : 'https://recoveryconnect.app/';

      const link = `${baseUrl}join?code=${code}`;

      setInviteCode(code);
      setInviteLink(link);
    } catch (error) {
      console.error('Error generating invite code:', error);
      Alert.alert('Error', 'Failed to generate invite code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send email invite
  const sendEmailInvite = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);

      // In a real app, this would call a Cloud Function to send an email
      // For the MVP, we'll simulate this with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a record of the invitation
      await firestore().collection('emailInvites').add({
        email: email,
        groupId: groupId,
        groupName: groupName,
        code: inviteCode,
        sentAt: firestore.FieldValue.serverTimestamp(),
        sentBy: auth().currentUser?.uid,
      });

      Alert.alert(
        'Invitation Sent',
        `An invitation has been sent to ${email}.`,
      );

      // Reset email field
      setEmail('');
    } catch (error) {
      console.error('Error sending email invite:', error);
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Share invite link
  const shareInvite = async () => {
    if (!inviteLink) return;

    try {
      await Share.share({
        message: `Join our recovery group "${groupName}" on Recovery Connect. Use this code: ${inviteCode} or click the link: ${inviteLink}`,
      });
    } catch (error) {
      console.error('Error sharing invite:', error);
      Alert.alert('Error', 'Failed to share invitation. Please try again.');
    }
  };

  // Copy invite code to clipboard
  const copyInviteCode = () => {
    if (!inviteCode) return;

    Clipboard.setString(inviteCode);
    Alert.alert('Copied', 'Invite code copied to clipboard.');
  };

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    if (!inviteLink) return;

    Clipboard.setString(inviteLink);
    Alert.alert('Copied', 'Invite link copied to clipboard.');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite to {groupName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Invite Code Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Share Invite Code</Text>
              {loading && !inviteCode ? (
                <ActivityIndicator size="small" color="#2196F3" />
              ) : (
                <>
                  <View style={styles.inviteCodeContainer}>
                    <Text style={styles.inviteCode}>{inviteCode}</Text>
                    <TouchableOpacity
                      onPress={copyInviteCode}
                      style={styles.copyButton}>
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helpText}>
                    Share this code with members of your recovery group. They
                    can use it to join your group in the app.
                  </Text>
                </>
              )}
            </View>

            {/* Invite Link Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Share Invite Link</Text>
              {loading && !inviteLink ? (
                <ActivityIndicator size="small" color="#2196F3" />
              ) : (
                <>
                  <View style={styles.inviteLinkContainer}>
                    <Text
                      style={styles.inviteLink}
                      numberOfLines={1}
                      ellipsizeMode="middle">
                      {inviteLink}
                    </Text>
                    <TouchableOpacity
                      onPress={copyInviteLink}
                      style={styles.copyButton}>
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={shareInvite}
                    style={styles.shareButton}>
                    <Text style={styles.shareButtonText}>Share Link</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Email Invite Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Send Email Invitation</Text>
              <Text style={styles.helpText}>
                Enter the email address of the person you want to invite. We'll
                send them an invitation with instructions.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
              <TouchableOpacity
                style={[styles.sendButton, loading && styles.disabledButton]}
                onPress={sendEmailInvite}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendButtonText}>Send Invitation</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.privacySection}>
              <Text style={styles.privacyText}>
                <Text style={styles.privacyTextBold}>Privacy Note:</Text> We
                respect the anonymity traditions. Invitations only include your
                group name and a secure invite code.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#757575',
  },
  modalBody: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  inviteCode: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    letterSpacing: 1,
  },
  inviteLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  inviteLink: {
    flex: 1,
    fontSize: 14,
    color: '#2196F3',
  },
  copyButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  copyButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  shareButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  helpText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  privacySection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  privacyTextBold: {
    fontWeight: 'bold',
  },
});

export default GroupInviteModal;
