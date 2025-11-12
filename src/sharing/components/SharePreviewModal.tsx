import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { ShareContent, ShareOptions } from '../../types';

interface SharePreviewModalProps {
  visible: boolean;
  content: ShareContent | null;
  onClose: () => void;
  onShare: (options: ShareOptions) => Promise<void>;
  showImageToggle?: boolean;
}

export const SharePreviewModal: React.FC<SharePreviewModalProps> = ({
  visible,
  content,
  onClose,
  onShare,
  showImageToggle = true,
}) => {
  const [includeImage, setIncludeImage] = useState(true);
  const [includeLink, setIncludeLink] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!content || isSharing) return;

    try {
      setIsSharing(true);

      const options: ShareOptions = {
        includeImage,
        includeLink,
        saveToGallery: false,
        dialogTitle: `Share ${content.title}`,
      };

      await onShare(options);
      onClose();
    } catch (error) {
      console.error('Share preview error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!content) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Share Preview</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {content.imageUri && includeImage && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: content.imageUri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Message:</Text>
              <Text style={styles.messageText}>{content.message}</Text>
            </View>

            {content.url && (
              <View style={styles.urlContainer}>
                <Text style={styles.urlLabel}>Link:</Text>
                <Text style={styles.urlText} numberOfLines={2}>
                  {content.url}
                </Text>
              </View>
            )}

            {showImageToggle && content.imageUri && (
              <View style={styles.optionsContainer}>
                <View style={styles.option}>
                  <Text style={styles.optionLabel}>Include Image</Text>
                  <Switch
                    value={includeImage}
                    onValueChange={setIncludeImage}
                    trackColor={{ false: '#CCCCCC', true: '#4A90E2' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.option}>
                  <Text style={styles.optionLabel}>Include Link</Text>
                  <Switch
                    value={includeLink}
                    onValueChange={setIncludeLink}
                    trackColor={{ false: '#CCCCCC', true: '#4A90E2' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSharing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.shareButtonText}>Share</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666666',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  previewImage: {
    width: width - 40,
    height: (width - 40) * (1920 / 1080),
    maxHeight: 500,
  },
  messageContainer: {
    marginVertical: 12,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  urlContainer: {
    marginVertical: 12,
  },
  urlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  urlText: {
    fontSize: 14,
    color: '#4A90E2',
    lineHeight: 20,
  },
  optionsContainer: {
    marginVertical: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#CCCCCC',
  },
  shareButton: {
    backgroundColor: '#4A90E2',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
