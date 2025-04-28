import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  Keyboard,
  Pressable,
  SafeAreaView,
  StatusBar,
  Linking,
  Modal,
  Dimensions,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {GroupStackParamList} from '../../types/navigation';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import {ChatModel, ChatMessage} from '../../models/ChatModel';
import {GroupModel} from '../../models/GroupModel';
import {showMessage} from 'react-native-flash-message';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  initializeGroupChat,
  fetchRecentMessages,
  fetchEarlierMessages,
  sendMessage,
  markMessageAsRead,
  addReaction,
  deleteMessage,
  setMessages,
  selectMessagesByGroup,
  selectChatStatus,
  selectChatError,
} from '../../store/slices/chatSlice';

type GroupChatScreenRouteProp = RouteProp<GroupStackParamList, 'GroupChat'>;
type GroupChatScreenNavigationProp = StackNavigationProp<GroupStackParamList>;

// Available reactions
const REACTIONS = [
  {emoji: '👍', name: 'thumbsup'},
  {emoji: '❤️', name: 'heart'},
  {emoji: '😂', name: 'laugh'},
  {emoji: '😮', name: 'wow'},
  {emoji: '😢', name: 'sad'},
  {emoji: '😡', name: 'angry'},
];

const GroupChatScreen: React.FC = () => {
  const route = useRoute<GroupChatScreenRouteProp>();
  const navigation = useNavigation<GroupChatScreenNavigationProp>();
  const {groupId, groupName} = route.params;
  const flatListRef = useRef<FlatList>(null);
  const messageInputRef = useRef<TextInput>(null);

  // Redux
  const dispatch = useAppDispatch();
  const messages = useAppSelector(state =>
    selectMessagesByGroup(state, groupId),
  );
  const status = useAppSelector(selectChatStatus);
  const error = useAppSelector(selectChatError);

  // Local states
  const [messageText, setMessageText] = useState('');
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Animation values
  const inputHeight = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Effect to initialize chat and load initial messages
  useEffect(() => {
    const initChat = async () => {
      try {
        await dispatch(initializeGroupChat(groupId)).unwrap();
        await dispatch(fetchRecentMessages(groupId)).unwrap();

        // Check if current user is admin
        const currentUser = auth().currentUser;
        if (currentUser) {
          const isAdminUser = await GroupModel.isGroupAdmin(
            groupId,
            currentUser.uid,
          );
          setIsAdmin(isAdminUser);
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        Alert.alert('Error', 'Failed to load chat. Please try again.');
      }
    };

    initChat();
  }, [groupId, dispatch]);

  // Set up real-time listener for new messages
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (status !== 'loading') {
      unsubscribe = ChatModel.listenForMessages(groupId, updatedMessages => {
        // Update the Redux store with the latest messages
        dispatch(setMessages({groupId, messages: updatedMessages}));

        // Mark new messages as read
        markNewMessagesAsRead(updatedMessages);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [groupId, status, dispatch]);

  // Handle navigation options
  useEffect(() => {
    navigation.setOptions({
      title: groupName,
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleHeaderRightPress}>
          <Icon name="information-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, groupName]);

  // Mark new messages from others as read
  const markNewMessagesAsRead = useCallback(
    async (messagesToMark: ChatMessage[]) => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const unreadMessages = messagesToMark.filter(
        msg =>
          msg.senderId !== currentUser.uid &&
          (!msg.readBy || !msg.readBy[currentUser.uid]),
      );

      for (const msg of unreadMessages) {
        try {
          dispatch(markMessageAsRead({groupId, messageId: msg.id}));
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
    },
    [groupId, dispatch],
  );

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to send messages');
      return;
    }

    try {
      const replyToId = replyingTo ? replyingTo.id : null;
      await dispatch(
        sendMessage({
          groupId,
          text: messageText.trim(),
          replyToMessageId: replyToId,
        }),
      ).unwrap();

      setMessageText('');
      setReplyingTo(null);

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // Load earlier messages
  const loadEarlierMessages = async () => {
    if (loadingEarlier || messages.length === 0) return;

    try {
      setLoadingEarlier(true);
      const oldestMessage = messages[0];

      await dispatch(
        fetchEarlierMessages({
          groupId,
          beforeMessageId: oldestMessage.id,
        }),
      ).unwrap();
    } catch (error) {
      console.error('Error loading earlier messages:', error);
    } finally {
      setLoadingEarlier(false);
    }
  };

  // Handle message long press to show options
  const handleMessageLongPress = (messageId: string) => {
    setSelectedMessage(messageId);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Handle adding a reaction to a message
  const handleAddReaction = async (messageId: string, reaction: string) => {
    try {
      await dispatch(
        addReaction({
          groupId,
          messageId,
          reactionType: reaction,
        }),
      ).unwrap();

      setSelectedMessage(null);
      fadeAnim.setValue(0);
    } catch (error) {
      console.error('Error adding reaction:', error);
      Alert.alert('Error', 'Failed to add reaction. Please try again.');
    }
  };

  // Handle message delete
  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setSelectedMessage(null);
            fadeAnim.setValue(0);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(
                deleteMessage({
                  groupId,
                  messageId,
                }),
              ).unwrap();

              setSelectedMessage(null);
              fadeAnim.setValue(0);
              showMessage({
                message: 'Message deleted',
                type: 'info',
                duration: 3000,
              });
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert(
                'Error',
                'Failed to delete message. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  // Handle reply to message
  const handleReplyToMessage = (message: ChatMessage) => {
    setReplyingTo(message);
    setSelectedMessage(null);
    fadeAnim.setValue(0);
    messageInputRef.current?.focus();
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Handle header right button press
  const handleHeaderRightPress = () => {
    navigation.navigate('GroupChatInfo', {
      groupId,
      groupName,
    });
  };

  // Handle image press to view in full screen
  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // Close full screen image viewer
  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  // Handle message input focus
  const handleInputFocus = () => {
    Animated.timing(inputHeight, {
      toValue: 60,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setIsTyping(true);
  };

  // Handle message input blur
  const handleInputBlur = () => {
    if (!messageText) {
      Animated.timing(inputHeight, {
        toValue: 50,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    setIsTyping(false);
  };

  // Render message bubble
  const renderMessageBubble = ({item}: {item: ChatMessage}) => {
    const isCurrentUser = item.senderId === auth().currentUser?.uid;
    const isSystem = item.senderId === 'system';

    // Format timestamp
    const formattedTime = item.sentAt
      ? new Date(item.sentAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    // Get total reaction count
    const totalReactions = item.reactions
      ? Object.values(item.reactions).reduce(
          (sum, users) => sum + users.length,
          0,
        )
      : 0;

    // Function to render attachments
    const renderAttachments = () => {
      if (!item.attachments || item.attachments.length === 0) return null;

      return (
        <View style={styles.attachmentsContainer}>
          {item.attachments.map((attachment, index) => {
            // Image attachments
            if (attachment.type === 'image') {
              return (
                <TouchableOpacity
                  key={`${item.id}-attachment-${index}`}
                  onPress={() => handleImagePress(attachment.url)}
                  style={styles.imageAttachmentContainer}>
                  <FastImage
                    source={{uri: attachment.url}}
                    style={styles.imageAttachment}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <View style={styles.imageOverlay}>
                    <Icon
                      name="magnify-plus-outline"
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                </TouchableOpacity>
              );
            }

            // File attachments
            if (attachment.type === 'file') {
              return (
                <TouchableOpacity
                  key={`${item.id}-attachment-${index}`}
                  onPress={() => Linking.openURL(attachment.url)}
                  style={styles.fileAttachmentContainer}>
                  <Icon
                    name="file-document-outline"
                    size={24}
                    color="#2196F3"
                  />
                  <View style={styles.fileAttachmentDetails}>
                    <Text style={styles.fileAttachmentName} numberOfLines={1}>
                      {attachment.name || 'Document'}
                    </Text>
                    {attachment.size && (
                      <Text style={styles.fileAttachmentSize}>
                        {formatFileSize(attachment.size)}
                      </Text>
                    )}
                  </View>
                  <Icon name="download" size={20} color="#757575" />
                </TouchableOpacity>
              );
            }

            // Voice attachments
            if (attachment.type === 'voice') {
              return (
                <View
                  key={`${item.id}-attachment-${index}`}
                  style={styles.voiceAttachmentContainer}>
                  <TouchableOpacity
                    style={styles.voicePlayButton}
                    onPress={() => Linking.openURL(attachment.url)}>
                    <Icon name="play" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.voiceWaveform}>
                    <View style={styles.voiceWaveformBar} />
                    <View style={[styles.voiceWaveformBar, {height: 15}]} />
                    <View style={[styles.voiceWaveformBar, {height: 18}]} />
                    <View style={[styles.voiceWaveformBar, {height: 12}]} />
                    <View style={[styles.voiceWaveformBar, {height: 16}]} />
                    <View style={[styles.voiceWaveformBar, {height: 10}]} />
                    <View style={[styles.voiceWaveformBar, {height: 14}]} />
                  </View>
                  {attachment.duration && (
                    <Text style={styles.voiceDuration}>
                      {formatDuration(attachment.duration)}
                    </Text>
                  )}
                </View>
              );
            }

            // Default fallback
            return (
              <TouchableOpacity
                key={`${item.id}-attachment-${index}`}
                onPress={() => Linking.openURL(attachment.url)}
                style={styles.genericAttachmentContainer}>
                <Text style={styles.genericAttachmentText}>
                  View Attachment
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    };

    // Helper function to format file size
    const formatFileSize = (sizeInBytes: number) => {
      if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`;
      } else if (sizeInBytes < 1024 * 1024) {
        return `${(sizeInBytes / 1024).toFixed(1)} KB`;
      } else {
        return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
      }
    };

    // Helper function to format duration
    const formatDuration = (durationInSeconds: number) => {
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = Math.floor(durationInSeconds % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
      <Pressable
        onLongPress={() => !isSystem && handleMessageLongPress(item.id)}
        style={[
          styles.messageBubbleContainer,
          isCurrentUser
            ? styles.userMessageContainer
            : styles.otherMessageContainer,
          isSystem && styles.systemMessageContainer,
        ]}>
        {!isCurrentUser && !isSystem && (
          <View style={styles.avatarContainer}>
            {item.senderPhotoURL ? (
              <FastImage
                source={{uri: item.senderPhotoURL}}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <Text style={styles.avatarText}>
                  {item.senderName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.userBubble : styles.otherBubble,
            isSystem && styles.systemBubble,
            selectedMessage === item.id && styles.selectedBubble,
          ]}>
          {!isCurrentUser && !isSystem && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}

          {item.replyTo && (
            <View style={styles.replyContainer}>
              <View style={styles.replyLine} />
              <View style={styles.replyContent}>
                <Text style={styles.replyName}>{item.replyTo.senderName}</Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {item.replyTo.text}
                </Text>
              </View>
            </View>
          )}

          {/* Text message */}
          {item.text && (
            <Text
              style={[
                styles.messageText,
                isSystem && styles.systemMessageText,
              ]}>
              {item.text}
            </Text>
          )}

          {/* Attachments */}
          {renderAttachments()}

          <Text
            style={[
              styles.timestamp,
              isCurrentUser ? styles.userTimestamp : styles.otherTimestamp,
              isSystem && styles.systemTimestamp,
            ]}>
            {formattedTime}
          </Text>

          {/* Reactions display */}
          {totalReactions > 0 && (
            <View style={styles.reactionsContainer}>
              {item.reactions &&
                Object.entries(item.reactions).map(([reaction, users]) => {
                  if (users.length === 0) return null;
                  const emojiObj = REACTIONS.find(r => r.name === reaction);
                  return (
                    <View key={reaction} style={styles.reactionBubble}>
                      <Text style={styles.reactionEmoji}>
                        {emojiObj?.emoji || '👍'}
                      </Text>
                      <Text style={styles.reactionCount}>{users.length}</Text>
                    </View>
                  );
                })}
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  // Render the reaction picker modal
  const renderReactionPicker = () => {
    if (!selectedMessage) return null;

    return (
      <Animated.View
        style={[
          styles.reactionPickerContainer,
          {
            opacity: fadeAnim,
          },
        ]}>
        <View style={styles.reactionOptions}>
          {REACTIONS.map(reaction => (
            <TouchableOpacity
              key={reaction.name}
              style={styles.reactionOption}
              onPress={() => handleAddReaction(selectedMessage, reaction.name)}>
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.messageOptions}>
          <TouchableOpacity
            style={styles.messageOption}
            onPress={() => {
              const message = messages.find(m => m.id === selectedMessage);
              if (message) {
                handleReplyToMessage(message);
              }
            }}>
            <Icon name="reply" size={24} color="#424242" />
            <Text style={styles.messageOptionText}>Reply</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.messageOption, styles.deleteOption]}
            onPress={() =>
              selectedMessage && handleDeleteMessage(selectedMessage)
            }>
            <Icon name="delete" size={24} color="#F44336" />
            <Text style={styles.deleteOptionText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backdropOverlay}
          activeOpacity={1}
          onPress={() => {
            setSelectedMessage(null);
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }}
        />
      </Animated.View>
    );
  };

  // Image Viewer Modal
  const renderImageViewer = () => {
    if (!selectedImage) return null;

    return (
      <Modal
        transparent={true}
        visible={!!selectedImage}
        onRequestClose={closeImageViewer}>
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.imageViewerCloseButton}
            onPress={closeImageViewer}>
            <Icon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={1}
            style={styles.imageViewerImageContainer}
            onPress={closeImageViewer}>
            <FastImage
              source={{uri: selectedImage}}
              style={styles.imageViewerImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.imageViewerDownloadButton}
            onPress={() => Linking.openURL(selectedImage)}>
            <Icon name="download" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  // Main render
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        {status === 'loading' && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageBubble}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            onEndReached={() =>
              flatListRef.current?.scrollToEnd({animated: false})
            }
            onEndReachedThreshold={0.1}
            inverted={false}
            ListHeaderComponent={
              loadingEarlier ? (
                <View style={styles.loadingEarlierContainer}>
                  <ActivityIndicator size="small" color="#2196F3" />
                  <Text style={styles.loadingEarlierText}>
                    Loading earlier messages...
                  </Text>
                </View>
              ) : messages.length >= 20 ? (
                <TouchableOpacity
                  style={styles.loadEarlierButton}
                  onPress={loadEarlierMessages}>
                  <Text style={styles.loadEarlierText}>
                    Load earlier messages
                  </Text>
                </TouchableOpacity>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to say something!
                </Text>
              </View>
            }
          />
        )}

        {/* Input area */}
        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyInputContainer}>
              <View style={styles.replyInputContent}>
                <Text style={styles.replyInputLabel}>
                  Replying to {replyingTo.senderName}
                </Text>
                <Text style={styles.replyInputText} numberOfLines={1}>
                  {replyingTo.text}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cancelReplyButton}
                onPress={handleCancelReply}>
                <Icon name="close" size={16} color="#9E9E9E" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={() =>
                navigation.navigate('GroupChatMediaPicker', {groupId})
              }>
              <Icon name="plus" size={24} color="#2196F3" />
            </TouchableOpacity>

            <Animated.View
              style={[styles.textInputContainer, {height: inputHeight}]}>
              <TextInput
                ref={messageInputRef}
                style={styles.textInput}
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </Animated.View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}>
              <Icon
                name="send"
                size={24}
                color={messageText.trim() ? '#2196F3' : '#BDBDBD'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Reaction Picker */}
      {renderReactionPicker()}

      {/* Image Viewer */}
      {renderImageViewer()}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#757575',
  },
  messagesList: {
    padding: 12,
    paddingBottom: 16,
  },
  messageBubbleContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  systemMessageContainer: {
    alignSelf: 'center',
    marginVertical: 16,
    maxWidth: '90%',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  defaultAvatar: {
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: '#E3F2FD',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  systemBubble: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  selectedBubble: {
    backgroundColor: '#E8F5E9',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#212121',
    lineHeight: 22,
  },
  systemMessageText: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: '#78909C',
  },
  otherTimestamp: {
    color: '#9E9E9E',
  },
  systemTimestamp: {
    display: 'none',
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    marginLeft: 2,
    color: '#616161',
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  replyLine: {
    width: 2,
    backgroundColor: '#2196F3',
    marginRight: 8,
    borderRadius: 1,
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: '#757575',
  },
  loadingEarlierContainer: {
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingEarlierText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
  },
  loadEarlierButton: {
    padding: 12,
    alignItems: 'center',
  },
  loadEarlierText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 8,
  },
  replyInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  replyInputContent: {
    flex: 1,
  },
  replyInputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  replyInputText: {
    fontSize: 12,
    color: '#757575',
  },
  cancelReplyButton: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    maxHeight: 100,
    color: '#212121',
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  reactionPickerContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  reactionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  reactionOption: {
    padding: 8,
  },
  messageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingBottom: 24,
  },
  messageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  messageOptionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#424242',
  },
  deleteOption: {
    marginLeft: 16,
  },
  deleteOptionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#F44336',
  },
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  // Attachment styles
  attachmentsContainer: {
    marginTop: 8,
    marginBottom: 4,
    maxWidth: 280,
    alignSelf: 'center',
  },
  imageAttachmentContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    width: '100%',
    aspectRatio: 1.5, // Default aspect ratio, will be adjusted by the image's natural ratio
    maxHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageAttachment: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    maxWidth: 280,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  fileAttachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
  },
  fileAttachmentDetails: {
    flex: 1,
    marginHorizontal: 10,
  },
  fileAttachmentName: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  fileAttachmentSize: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  voiceAttachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 16,
    padding: 8,
    marginBottom: 4,
  },
  voicePlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 30,
    marginHorizontal: 12,
  },
  voiceWaveformBar: {
    width: 3,
    height: 12,
    backgroundColor: '#2196F3',
    borderRadius: 1.5,
  },
  voiceDuration: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  genericAttachmentContainer: {
    padding: 10,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  genericAttachmentText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  // Image viewer styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  imageViewerCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  imageViewerDownloadButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // Error display
  errorContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default GroupChatScreen;
