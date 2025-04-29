import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  COLLECTION_PATHS,
  GroupChatDocument,
  FirestoreDocument,
} from '../types/schema';
import {GroupModel} from './GroupModel';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

// Define Chat Attachment type
export interface ChatAttachment {
  type: 'image' | 'file' | 'voice';
  url: string;
  name?: string;
  size?: number;
  duration?: number;
  thumbnailUrl?: string;
}

// Define Chat Message structure (App Representation)
export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  text?: string;
  attachments?: ChatAttachment[];
  sentAt: number; // Use number (timestamp) consistently
  reactions?: Record<string, string[]>;
  readBy?: Record<string, boolean>;
  replyTo?: {
    // Keep only necessary fields for display
    messageId: string;
    senderName: string;
    text: string; // Snippet of the original message
  } | null;
  isSystemMessage?: boolean;
  mentionedUserIds?: string[];
}

export interface GroupChat {
  id: string;
  groupId: string;
  lastMessage: {
    text: string;
    senderId: string;
    senderName: string;
    sentAt: Date;
  };
  participantCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chat model for managing group chats and messages
 */
export class ChatModel {
  /**
   * Convert a Firestore chat message document to a ChatMessage object
   */
  static messageFromFirestore(doc: FirestoreDocument<any>): ChatMessage {
    const data = doc.data();
    return {
      id: doc.id,
      groupId: data.groupId,
      senderId: data.senderId,
      senderName: data.senderName,
      senderPhotoURL: data.senderPhotoURL,
      text: data.text,
      sentAt: data.sentAt ? data.sentAt.toDate().getTime() : undefined,
      readBy: data.readBy || {},
      attachments: data.attachments,
      reactions: data.reactions,
      replyTo: data.replyTo,
      isSystemMessage: data.isSystemMessage,
      mentionedUserIds: data.mentionedUserIds,
    };
  }

  /**
   * Convert a Firestore group chat document to a GroupChat object
   */
  static chatFromFirestore(
    doc: FirestoreDocument<GroupChatDocument>,
  ): GroupChat {
    const data = doc.data();
    return {
      id: doc.id,
      groupId: data.groupId,
      lastMessage: {
        text: data.lastMessage.text,
        senderId: data.lastMessage.senderId,
        senderName: data.lastMessage.senderName,
        sentAt: data.lastMessage.sentAt.toDate(),
      },
      participantCount: data.participantCount,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  /**
   * Initialize a chat for a group if it doesn't exist
   */
  static async initializeGroupChat(groupId: string): Promise<string> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Check if a chat already exists for this group
      const chatRef = firestore()
        .collection(COLLECTION_PATHS.GROUP_CHATS)
        .doc(groupId);
      const chatDoc = await chatRef.get();

      if (chatDoc.exists) {
        return groupId; // Chat already exists, return the ID (same as groupId)
      }

      // Get group details
      const group = await GroupModel.getById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Get member count
      const members = await GroupModel.getMembers(groupId);
      const memberCount = members.length;

      // Create a new chat document
      const timestamp = firestore.FieldValue.serverTimestamp();
      await chatRef.set({
        groupId,
        lastMessage: {
          text: 'Chat created',
          senderId: currentUser.uid,
          senderName: currentUser.displayName || 'User',
          timestamp,
        },
        participantCount: memberCount,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      // Create welcome message
      await this.sendMessage(groupId, 'Welcome to the group chat!', null, true);

      return groupId;
    } catch (error) {
      console.error('Error initializing group chat:', error);
      throw error;
    }
  }

  /**
   * Send a message in a group chat
   */
  static async sendMessage(
    groupId: string,
    text: string,
    attachments?: ChatAttachment[],
    replyTo?: {messageId: string; senderName: string; text: string} | null,
    isSystemMessage: boolean = false,
    mentionedUserIds: string[] = [],
  ): Promise<ChatMessage> {
    const currentUser = auth().currentUser;
    if (!currentUser && !isSystemMessage) {
      throw new Error('User not authenticated for non-system message');
    }
    const now = new Date();
    const messageRef = firestore()
      .collection('groups')
      .doc(groupId)
      .collection('messages')
      .doc();
    const senderId = isSystemMessage ? 'system' : currentUser!.uid;
    const senderName = isSystemMessage
      ? 'System'
      : currentUser!.displayName || 'Anonymous';
    const senderPhotoURL = isSystemMessage
      ? undefined
      : currentUser!.photoURL || undefined;

    // Create the data object directly for Firestore
    const messageData = {
      groupId,
      senderId,
      senderName,
      senderPhotoURL: senderPhotoURL || undefined,
      text,
      sentAt: firestore.Timestamp.fromDate(now),
      attachments:
        attachments && attachments.length > 0 ? attachments : undefined,
      reactions: {},
      readBy: isSystemMessage ? {} : {[senderId]: true},
      replyTo: replyTo || undefined,
      isSystemMessage,
      mentionedUserIds:
        mentionedUserIds && mentionedUserIds.length > 0
          ? mentionedUserIds
          : undefined,
    };

    // Remove undefined fields before sending (Good practice, though often optional)
    Object.keys(messageData).forEach(
      key =>
        (messageData as any)[key] === undefined &&
        delete (messageData as any)[key],
    );

    await messageRef.set(messageData);

    // Return the ChatMessage (App representation)
    return {
      id: messageRef.id,
      groupId: messageData.groupId,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderPhotoURL: messageData.senderPhotoURL,
      text: messageData.text,
      sentAt: now.getTime(),
      readBy: messageData.readBy,
      replyTo: messageData.replyTo,
      attachments: messageData.attachments ?? [],
      isSystemMessage: messageData.isSystemMessage,
      mentionedUserIds: messageData.mentionedUserIds ?? [],
      reactions: messageData.reactions,
    };
  }

  /**
   * Get recent messages for a group chat
   */
  static async getRecentMessages(
    groupId: string,
    limit: number = 20,
  ): Promise<ChatMessage[]> {
    try {
      // First check if chat exists, if not initialize it
      const chatRef = firestore()
        .collection(COLLECTION_PATHS.GROUP_CHATS)
        .doc(groupId);
      const chatDoc = await chatRef.get();

      if (!chatDoc.exists) {
        await this.initializeGroupChat(groupId);
      }

      // Get messages
      const messagesRef = firestore().collection(
        COLLECTION_PATHS.CHAT_MESSAGES(groupId),
      );
      const messagesSnapshot = await messagesRef
        .orderBy('sentAt', 'desc')
        .limit(limit)
        .get();

      // Convert and return in chronological order (oldest first)
      return messagesSnapshot.docs
        .map(doc =>
          this.messageFromFirestore({
            id: doc.id,
            data: () => doc.data() as any,
          }),
        )
        .reverse();
    } catch (error) {
      console.error('Error getting recent messages:', error);
      throw error;
    }
  }

  /**
   * Get messages before a certain message (for pagination)
   */
  static async getMessagesBefore(
    groupId: string,
    beforeMessageId: string,
    limit: number = 20,
  ): Promise<ChatMessage[]> {
    try {
      // Get the timestamp of the "before" message
      const beforeMessageRef = firestore()
        .collection(COLLECTION_PATHS.CHAT_MESSAGES(groupId))
        .doc(beforeMessageId);

      const beforeMessageDoc = await beforeMessageRef.get();
      if (!beforeMessageDoc.exists) {
        throw new Error('Reference message not found');
      }

      const beforeData = beforeMessageDoc.data() as any;
      const beforeSentAt = beforeData.sentAt;

      // Get messages before that timestamp
      const messagesRef = firestore().collection(
        COLLECTION_PATHS.CHAT_MESSAGES(groupId),
      );
      const messagesSnapshot = await messagesRef
        .orderBy('sentAt', 'desc')
        .where('sentAt', '<', beforeSentAt)
        .limit(limit)
        .get();

      // Convert and return in chronological order (oldest first)
      return messagesSnapshot.docs
        .map(doc =>
          this.messageFromFirestore({
            id: doc.id,
            data: () => doc.data() as any,
          }),
        )
        .reverse();
    } catch (error) {
      console.error('Error getting messages before:', error);
      throw error;
    }
  }

  /**
   * Mark a message as read by the current user
   */
  static async markMessageAsRead(
    groupId: string,
    messageId: string,
  ): Promise<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const messageRef = firestore()
        .collection(COLLECTION_PATHS.CHAT_MESSAGES(groupId))
        .doc(messageId);

      // Use a field update rather than overwriting the entire readBy object
      await messageRef.update({
        [`readBy.${currentUser.uid}`]: true,
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  /**
   * Add a reaction to a message
   */
  static async addReaction(
    groupId: string,
    messageId: string,
    reactionType: string,
  ): Promise<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const messageRef = firestore()
        .collection(COLLECTION_PATHS.CHAT_MESSAGES(groupId))
        .doc(messageId);

      // Update the reactions array for this reaction type
      await messageRef.update({
        [`reactions.${reactionType}`]: firestore.FieldValue.arrayUnion(
          currentUser.uid,
        ),
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Remove a reaction from a message
   */
  static async removeReaction(
    groupId: string,
    messageId: string,
    reactionType: string,
  ): Promise<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const messageRef = firestore()
        .collection(COLLECTION_PATHS.CHAT_MESSAGES(groupId))
        .doc(messageId);

      // Remove the user's ID from this reaction type
      await messageRef.update({
        [`reactions.${reactionType}`]: firestore.FieldValue.arrayRemove(
          currentUser.uid,
        ),
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  /**
   * Listen for new messages in real-time
   * @returns An unsubscribe function
   */
  static listenForMessages(
    groupId: string,
    callback: (messages: ChatMessage[]) => void,
  ): () => void {
    const messagesRef = firestore().collection(
      COLLECTION_PATHS.CHAT_MESSAGES(groupId),
    );

    // Set up real-time listener
    const unsubscribe = messagesRef
      .orderBy('sentAt', 'desc')
      .limit(30) // Limit to prevent excessive data transfer
      .onSnapshot(
        snapshot => {
          const messages = snapshot.docs
            .map(doc =>
              this.messageFromFirestore({
                id: doc.id,
                data: () => doc.data() as any,
              }),
            )
            .reverse(); // Oldest first

          callback(messages);
        },
        error => {
          console.error('Error listening for messages:', error);
        },
      );

    // Return the unsubscribe function
    return unsubscribe;
  }

  /**
   * Delete a message
   * Note: In a real app, you might want to restrict this to admins or message creators
   */
  static async deleteMessage(
    groupId: string,
    messageId: string,
  ): Promise<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Check if user is authorized (admin or message sender)
      const messageRef = firestore()
        .collection(COLLECTION_PATHS.CHAT_MESSAGES(groupId))
        .doc(messageId);

      const messageDoc = await messageRef.get();
      if (!messageDoc.exists) {
        throw new Error('Message not found');
      }

      const messageData = messageDoc.data() as any;
      const isAdmin = await GroupModel.isGroupAdmin(groupId, currentUser.uid);
      const isMessageSender = messageData.senderId === currentUser.uid;

      if (!isAdmin && !isMessageSender) {
        throw new Error('Not authorized to delete this message');
      }

      // Delete the message
      await messageRef.delete();

      // If this was the last message, update the chat's lastMessage
      const chatRef = firestore()
        .collection(COLLECTION_PATHS.GROUP_CHATS)
        .doc(groupId);
      const chatDoc = await chatRef.get();

      if (chatDoc.exists) {
        const chatData = chatDoc.data() as GroupChatDocument;

        // Check if the deleted message was the last message
        if (
          chatData.lastMessage?.text === messageData.text &&
          chatData.lastMessage?.sentAt.isEqual(messageData.sentAt)
        ) {
          // Get the new last message
          const newLastMessageSnapshot = await firestore()
            .collection(COLLECTION_PATHS.CHAT_MESSAGES(groupId))
            .orderBy('sentAt', 'desc')
            .limit(1)
            .get();

          if (!newLastMessageSnapshot.empty) {
            const newLastMessage = newLastMessageSnapshot.docs[0].data() as any;
            await chatRef.update({
              lastMessage: {
                text: newLastMessage.text,
                senderId: newLastMessage.senderId,
                senderName: newLastMessage.senderName,
                sentAt: newLastMessage.sentAt,
              },
            });
          } else {
            // No messages left
            await chatRef.update({
              lastMessage: {
                text: 'No messages',
                senderId: 'system',
                senderName: 'System',
                sentAt: firestore.FieldValue.serverTimestamp(),
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Convert Firestore Document to ChatMessage (App Representation)
  static fromFirestore(
    doc: FirebaseFirestoreTypes.DocumentSnapshot,
  ): ChatMessage {
    const data = doc.data() as any; // Use 'any' for Firestore data for simplicity now
    if (!data) {
      throw new Error('Document data missing!');
    }
    // Construct ChatMessage, providing defaults for potentially missing fields
    return {
      id: doc.id,
      groupId: data.groupId ?? '',
      senderId: data.senderId ?? 'system',
      senderName: data.senderName ?? 'Unknown',
      senderPhotoURL: data.senderPhotoURL,
      text: data.text,
      sentAt: data.sentAt?.toDate?.().getTime?.() ?? Date.now(), // Safest chaining
      readBy: data.readBy ?? {},
      attachments: data.attachments ?? [],
      reactions: data.reactions ?? {},
      replyTo: data.replyTo
        ? {
            messageId: data.replyTo.messageId,
            senderName: data.replyTo.senderName,
            text: data.replyTo.text,
          }
        : null,
      isSystemMessage: data.isSystemMessage ?? false,
      mentionedUserIds: data.mentionedUserIds ?? [],
    };
  }
}
