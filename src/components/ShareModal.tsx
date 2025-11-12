import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Screenshot } from '../types';
import { ScreenshotManager } from '../media/ScreenshotManager';

interface ShareModalProps {
  screenshot: Screenshot;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  screenshot,
  onClose,
}) => {
  const [message, setMessage] = useState(
    `Look at my cat ${screenshot.sessionData.catName} playing Fish Cat Game! 🐱🐟\n${screenshot.sessionData.catches} catches in ${Math.floor(screenshot.sessionData.playTime / 60)} minutes!\n\n#FishCatGame #CatGame`
  );
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await ScreenshotManager.share(screenshot, message);
      onClose();
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share screenshot');
    } finally {
      setIsSharing(false);
    }
  };

  const handleSaveToPhotos = async () => {
    try {
      await ScreenshotManager.saveToPhotoLibrary(screenshot);
      Alert.alert('Success', 'Screenshot saved to your photo library!');
      onClose();
    } catch (error: any) {
      console.error('Save error:', error);
      if (error.message.includes('Permission')) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library in Settings to save screenshots.'
        );
      } else {
        Alert.alert('Error', 'Failed to save screenshot');
      }
    }
  };

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Share</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Image
              source={{ uri: screenshot.filePath }}
              style={styles.preview}
              resizeMode="cover"
            />

            <Text style={styles.label}>Share to:</Text>
            <View style={styles.shareOptions}>
              <TouchableOpacity
                style={styles.shareOption}
                onPress={handleShare}
                disabled={isSharing}
              >
                <Text style={styles.shareIcon}>📱</Text>
                <Text style={styles.shareLabel}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={handleSaveToPhotos}
              >
                <Text style={styles.shareIcon}>📷</Text>
                <Text style={styles.shareLabel}>Save</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Message:</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
            onPress={handleShare}
            disabled={isSharing}
          >
            <Text style={styles.shareButtonText}>
              {isSharing ? 'Sharing...' : 'Share Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  shareOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  shareOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
  },
  shareIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  shareLabel: {
    fontSize: 14,
    color: '#fff',
  },
  messageInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    minHeight: 120,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#4a9eff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonDisabled: {
    backgroundColor: '#666',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
