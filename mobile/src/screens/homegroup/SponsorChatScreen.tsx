import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  fetchSponsorChatMessages,
  sendSponsorChatMessage,
} from '../../store/slices/sponsorshipSlice';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import {SponsorChatMessage} from '../../types/sponsorship';
import {GroupStackParamList} from '../../types/navigation';

type SponsorChatScreenRouteProp = RouteProp<GroupStackParamList, 'SponsorChat'>;

const SponsorChatScreen: React.FC = () => {
  const route = useRoute<SponsorChatScreenRouteProp>();
  const {groupId, sponsorId, sponseeId, sponsorName, sponseeName} =
    route.params;
  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList>(null);
  const [newMessage, setNewMessage] = React.useState('');

  const chatId = [sponsorId, sponseeId].sort().join('_');
  const messages = useAppSelector(
    state => state.sponsorship.chatMessages[chatId] || [],
  );
  const loading = useAppSelector(state => state.sponsorship.loading);
  const currentUser = auth().currentUser;

  useEffect(() => {
    dispatch(fetchSponsorChatMessages({groupId, sponsorId, sponseeId}));
  }, [dispatch, groupId, sponsorId, sponseeId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser) return;

    dispatch(
      sendSponsorChatMessage({
        groupId,
        sponsorId,
        sponseeId,
        message: newMessage.trim(),
        senderId: currentUser.uid,
      }),
    );
    setNewMessage('');
  };

  const renderMessage = ({item}: {item: SponsorChatMessage}) => {
    const isCurrentUser = item.senderId === currentUser?.uid;
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.sentMessage : styles.receivedMessage,
        ]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {currentUser?.uid === sponsorId ? sponseeName : sponsorName}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        style={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}>
          <Icon
            name="send"
            size={24}
            color={newMessage.trim() ? '#2196F3' : '#BDBDBD'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2196F3',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
});

export default SponsorChatScreen;
