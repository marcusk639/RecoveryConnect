import React, {useState, useEffect, useRef} from 'react';
import {ScrollView} from 'react-native';
import firestore from '@firebase/firestore';
import {SponsorModel} from '../../models/SponsorModel';

interface SponsorChatScreenProps {
  route: {
    params: {
      groupId: string;
      groupName: string;
      sponsorId: string;
      sponseeId: string;
      sponsorName: string;
      sponseeName: string;
    };
  };
  navigation: any;
}

const SponsorChatScreen: React.FC<SponsorChatScreenProps> = ({
  route,
  navigation,
}) => {
  const {groupId, groupName, sponsorId, sponseeId, sponsorName, sponseeName} =
    route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const sponsorModel = new SponsorModel();

  useEffect(() => {
    loadMessages();
    const unsubscribe = subscribeToMessages();
    return () => unsubscribe();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const fetchedMessages = await sponsorModel.getSponsorChatMessages(
        groupId,
        sponsorId,
        sponseeId,
      );
      setMessages(fetchedMessages);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const chatId = [sponsorId, sponseeId].sort().join('_');
    return firestore()
      .collection('sponsorChats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        }));
        setMessages(newMessages);
      });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sponsorModel.sendSponsorChatMessage(
        groupId,
        sponsorId,
        sponseeId,
        newMessage,
        sponseeId, // Assuming the current user is the sponsee
      );
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  // ... rest of existing code ...
};

export default SponsorChatScreen;
