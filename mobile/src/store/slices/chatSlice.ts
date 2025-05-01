import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';
import {RootState} from '../types';
import {ChatModel, GroupChat, ChatMessage} from '../../models/ChatModel';

// Define types
export interface ChatState {
  messages: Record<string, Record<string, ChatMessage>>;
  chats: Record<string, GroupChat>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: Record<string, number>;
}

// Initial state
const initialState: ChatState = {
  messages: {},
  chats: {},
  status: 'idle',
  error: null,
  lastFetched: {},
};

// Constants
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache TTL

// Helper function to check if data is stale
const isDataStale = (lastFetched: number | undefined): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_TTL;
};

// Async thunks
export const initializeGroupChat = createAsyncThunk(
  'chat/initializeGroupChat',
  async (groupId: string, {rejectWithValue}) => {
    try {
      const chatId = await ChatModel.initializeGroupChat(groupId);
      return chatId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize chat');
    }
  },
);

export const fetchRecentMessages = createAsyncThunk(
  'chat/fetchRecentMessages',
  async (groupId: string, {getState, rejectWithValue}) => {
    try {
      const messages = await ChatModel.getRecentMessages(groupId);
      return {groupId, messages};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  },
  {
    condition: (groupId, {getState}) => {
      const state = getState() as RootState;
      const lastFetchTime = state.chat.lastFetched[groupId];

      // If already loading, don't fetch again
      if (state.chat.status === 'loading') return false;

      return isDataStale(lastFetchTime);
    },
  },
);

export const fetchEarlierMessages = createAsyncThunk(
  'chat/fetchEarlierMessages',
  async (
    {groupId, beforeMessageId}: {groupId: string; beforeMessageId: string},
    {rejectWithValue},
  ) => {
    try {
      const messages = await ChatModel.getMessagesBefore(
        groupId,
        beforeMessageId,
      );
      return {groupId, messages};
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch earlier messages',
      );
    }
  },
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    {
      groupId,
      text,
      replyToMessageId = null,
      isSystemMessage = false,
      attachments,
      mentionedUserIds,
    }: {
      groupId: string;
      text: string;
      replyToMessageId?: string | null;
      isSystemMessage?: boolean;
      attachments?: {
        type: 'image' | 'file' | 'voice';
        url: string;
        name?: string;
        size?: number;
        duration?: number;
      }[];
      mentionedUserIds?: string[];
    },
    {rejectWithValue},
  ) => {
    try {
      const message = await ChatModel.sendMessage(
        groupId,
        text,
        attachments,
        replyToMessageId
          ? {
              messageId: replyToMessageId,
              senderName: 'System',
              text: 'This is a system message',
            }
          : null,
        isSystemMessage,
        mentionedUserIds,
      );
      return {groupId, message};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  },
);

export const addReaction = createAsyncThunk(
  'chat/addReaction',
  async (
    {
      groupId,
      messageId,
      reactionType,
    }: {
      groupId: string;
      messageId: string;
      reactionType: string;
    },
    {rejectWithValue},
  ) => {
    try {
      await ChatModel.addReaction(groupId, messageId, reactionType);
      return {groupId, messageId, reactionType};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add reaction');
    }
  },
);

export const markMessageAsRead = createAsyncThunk(
  'chat/markMessageAsRead',
  async (
    {
      groupId,
      messageId,
    }: {
      groupId: string;
      messageId: string;
    },
    {rejectWithValue},
  ) => {
    try {
      await ChatModel.markMessageAsRead(groupId, messageId);
      return {groupId, messageId};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark message as read');
    }
  },
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (
    {
      groupId,
      messageId,
    }: {
      groupId: string;
      messageId: string;
    },
    {rejectWithValue},
  ) => {
    try {
      await ChatModel.deleteMessage(groupId, messageId);
      return {groupId, messageId};
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete message');
    }
  },
);

// Create the slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChatError: state => {
      state.error = null;
    },
    setMessages: (
      state,
      action: PayloadAction<{groupId: string; messages: ChatMessage[]}>,
    ) => {
      const {groupId, messages} = action.payload;

      // Initialize the messages object for this group if it doesn't exist
      if (!state.messages[groupId]) {
        state.messages[groupId] = {};
      }

      // Update messages
      messages.forEach(message => {
        state.messages[groupId][message.id] = message;
      });

      // Update last fetched timestamp
      state.lastFetched[groupId] = Date.now();
    },
  },
  extraReducers: builder => {
    builder
      // Initialize group chat
      .addCase(initializeGroupChat.pending, state => {
        state.status = 'loading';
      })
      .addCase(initializeGroupChat.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(initializeGroupChat.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to initialize chat';
      })

      // Fetch recent messages
      .addCase(fetchRecentMessages.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchRecentMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, messages} = action.payload;

        // Initialize the messages object for this group if it doesn't exist
        if (!state.messages[groupId]) {
          state.messages[groupId] = {};
        }

        // Add messages to state
        messages.forEach(message => {
          state.messages[groupId][message.id] = message;
        });

        // Update last fetched timestamp
        state.lastFetched[groupId] = Date.now();

        state.error = null;
      })
      .addCase(fetchRecentMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch messages';
      })

      // Fetch earlier messages
      .addCase(fetchEarlierMessages.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchEarlierMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, messages} = action.payload;

        // Initialize the messages object for this group if it doesn't exist
        if (!state.messages[groupId]) {
          state.messages[groupId] = {};
        }

        // Add messages to state
        messages.forEach(message => {
          state.messages[groupId][message.id] = message;
        });

        state.error = null;
      })
      .addCase(fetchEarlierMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to fetch earlier messages';
      })

      // Send message
      .addCase(sendMessage.pending, state => {
        state.status = 'loading';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const {groupId, message} = action.payload;

        // Initialize the messages object for this group if it doesn't exist
        if (!state.messages[groupId]) {
          state.messages[groupId] = {};
        }

        // Add the new message
        state.messages[groupId][message.id] = message;

        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to send message';
      })

      // Add reaction
      .addCase(addReaction.fulfilled, (state, action) => {
        // We'll let the real-time listener update the state
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(addReaction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to add reaction';
      })

      // Mark message as read
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const {groupId, messageId} = action.payload;

        // Update the message's readBy property if it exists in state
        if (state.messages[groupId] && state.messages[groupId][messageId]) {
          const currentUser = auth().currentUser;
          if (currentUser) {
            const message = state.messages[groupId][messageId];
            if (!message.readBy) {
              message.readBy = {};
            }
            message.readBy[currentUser.uid] = true;
          }
        }

        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(markMessageAsRead.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || 'Failed to mark message as read';
      })

      // Delete message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const {groupId, messageId} = action.payload;

        // Remove the message from state if it exists
        if (state.messages[groupId] && state.messages[groupId][messageId]) {
          delete state.messages[groupId][messageId];
        }

        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to delete message';
      });
  },
});

// Export actions and reducer
export const {clearChatError, setMessages} = chatSlice.actions;

// Selectors
export const selectChatStatus = (state: RootState) => state.chat.status;
export const selectChatError = (state: RootState) => state.chat.error;

export const selectMessagesByGroup = (state: RootState, groupId: string) => {
  const messagesObj = state.chat.messages[groupId] || {};
  // Convert to array and sort by sentAt (oldest first)
  return Object.values(messagesObj).sort((a, b) => {
    const dateA =
      (a.sentAt as any) instanceof Date ? a.sentAt : new Date(a.sentAt!);
    const dateB =
      (b.sentAt as any) instanceof Date ? b.sentAt : new Date(b.sentAt!);
    return (dateA as Date).getTime() - (dateB as Date).getTime();
  });
};

export default chatSlice.reducer;
