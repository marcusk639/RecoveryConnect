import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {GroupStackParamList} from '../../types/navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import {ChatModel} from '../../models/ChatModel';
import auth from '@react-native-firebase/auth';

type GroupChatMediaPickerRouteProp = RouteProp<
  GroupStackParamList,
  'GroupChatMediaPicker'
>;
type GroupChatMediaPickerNavigationProp =
  StackNavigationProp<GroupStackParamList>;

interface MediaOption {
  icon: string;
  label: string;
  action: () => void;
  color: string;
}

const GroupChatMediaPickerScreen: React.FC = () => {
  const route = useRoute<GroupChatMediaPickerRouteProp>();
  const navigation = useNavigation<GroupChatMediaPickerNavigationProp>();
  const {groupId} = route.params;

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Handle navigation options
  React.useEffect(() => {
    navigation.setOptions({
      title: 'Add to Chat',
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleClose}
          disabled={loading}>
          <Icon name="close" size={24} color="#757575" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, loading]);

  const handleClose = () => {
    navigation.goBack();
  };

  const takePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Something went wrong');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          setSelectedImage(asset.uri);
          uploadAndSendImage(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: false,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Something went wrong');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          setSelectedImage(asset.uri);
          uploadAndSendImage(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });

      // DocumentPicker returns an array in newer versions
      const file = Array.isArray(result) ? result[0] : result;

      if (file.uri) {
        uploadAndSendFile(file.uri, file.name || 'file', file.type || '');
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        // User cancelled the picker
        return;
      }
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const uploadAndSendImage = async (uri: string) => {
    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to send images');
        setLoading(false);
        return;
      }

      // Generate a unique file name
      const fileName = `${currentUser.uid}_${Date.now()}.jpg`;
      const reference = storage().ref(`chat_media/${groupId}/${fileName}`);

      // Upload the file
      await reference.putFile(uri);

      // Get the download URL
      const downloadURL = await reference.getDownloadURL();

      // Create attachment data
      const attachment = {
        type: 'image' as const,
        url: downloadURL,
        name: fileName,
      };

      // Send a message with the image attachment
      await sendMessageWithAttachment('📷 Image', [attachment]);

      // Navigate back to chat
      navigation.goBack();
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadAndSendFile = async (uri: string, name: string, type: string) => {
    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to send files');
        setLoading(false);
        return;
      }

      // Generate a unique file name while preserving the extension
      const extension = name.split('.').pop() || '';
      const fileName = `${currentUser.uid}_${Date.now()}.${extension}`;
      const reference = storage().ref(`chat_media/${groupId}/${fileName}`);

      // Upload the file
      await reference.putFile(uri);

      // Get the download URL
      const downloadURL = await reference.getDownloadURL();

      // Create attachment data
      const attachment = {
        type: 'file' as const,
        url: downloadURL,
        name: name,
        size: 0, // We don't have file size info here
      };

      // Send a message with the file attachment
      await sendMessageWithAttachment(`📎 File: ${name}`, [attachment]);

      // Navigate back to chat
      navigation.goBack();
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessageWithAttachment = async (
    text: string,
    attachments: any[],
  ) => {
    try {
      // We need to extend the ChatModel to support attachments
      // For now, we'll assume the method exists
      await ChatModel.sendMessage(groupId, text, null, false, attachments);
    } catch (error) {
      console.error('Error sending message with attachment:', error);
      throw error;
    }
  };

  // Media options
  const mediaOptions: MediaOption[] = [
    {
      icon: 'camera',
      label: 'Take Photo',
      action: takePhoto,
      color: '#4CAF50',
    },
    {
      icon: 'image',
      label: 'Photo Library',
      action: pickImage,
      color: '#2196F3',
    },
    {
      icon: 'file-document',
      label: 'Document',
      action: pickDocument,
      color: '#FF9800',
    },
    // Add more options as needed, such as voice recording, location, etc.
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Uploading media...</Text>
          </View>
        ) : (
          <>
            {selectedImage ? (
              <View style={styles.previewContainer}>
                <Image
                  source={{uri: selectedImage}}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.optionsContainer}>
                <Text style={styles.sectionTitle}>Share</Text>
                <View style={styles.optionsGrid}>
                  {mediaOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.optionItem}
                      onPress={option.action}>
                      <View
                        style={[
                          styles.optionIcon,
                          {backgroundColor: option.color},
                        ]}>
                        <Icon name={option.icon} size={24} color="#FFFFFF" />
                      </View>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </>
        )}
      </View>
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
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  optionsContainer: {
    padding: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  optionItem: {
    width: '33%',
    alignItems: 'center',
    marginBottom: 24,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: '#424242',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

export default GroupChatMediaPickerScreen;
