import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';

interface PhotoPickerProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  onSelectDefaultAvatar: () => void;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  visible,
  onClose,
  onTakePhoto,
  onPickFromGallery,
  onSelectDefaultAvatar,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Choose Photo Source</Text>

          <TouchableOpacity style={styles.option} onPress={onTakePhoto} activeOpacity={0.7}>
            <Text style={styles.optionIcon}>📷</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Take Photo</Text>
              <Text style={styles.optionDescription}>Capture a new photo with your camera</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onPickFromGallery} activeOpacity={0.7}>
            <Text style={styles.optionIcon}>🖼️</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Choose from Gallery</Text>
              <Text style={styles.optionDescription}>Select an existing photo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onSelectDefaultAvatar} activeOpacity={0.7}>
            <Text style={styles.optionIcon}>🐱</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Default Avatar</Text>
              <Text style={styles.optionDescription}>Choose from preset cat illustrations</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#757575',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
});
