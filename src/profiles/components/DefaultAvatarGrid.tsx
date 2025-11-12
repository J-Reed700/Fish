import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Dimensions } from 'react-native';

interface DefaultAvatarGridProps {
  visible: boolean;
  onClose: () => void;
  onSelectAvatar: (avatarId: string) => void;
}

const AVATARS = [
  { id: 'tabby', name: 'Tabby', emoji: '🐈' },
  { id: 'siamese', name: 'Siamese', emoji: '🐱' },
  { id: 'persian', name: 'Persian', emoji: '😺' },
  { id: 'mainecoon', name: 'Maine Coon', emoji: '😸' },
  { id: 'calico', name: 'Calico', emoji: '😹' },
  { id: 'black', name: 'Black Cat', emoji: '🐈‍⬛' },
  { id: 'white', name: 'White Cat', emoji: '😻' },
  { id: 'orange', name: 'Orange Cat', emoji: '😽' },
  { id: 'gray', name: 'Gray Cat', emoji: '😼' },
  { id: 'tuxedo', name: 'Tuxedo', emoji: '😾' },
  { id: 'bengal', name: 'Bengal', emoji: '😿' },
  { id: 'ragdoll', name: 'Ragdoll', emoji: '🙀' },
  { id: 'sphynx', name: 'Sphynx', emoji: '😺' },
  { id: 'scottishfold', name: 'Scottish Fold', emoji: '😸' },
  { id: 'russian', name: 'Russian Blue', emoji: '😹' },
  { id: 'abyssinian', name: 'Abyssinian', emoji: '😻' },
  { id: 'british', name: 'British Shorthair', emoji: '😽' },
  { id: 'exotic', name: 'Exotic', emoji: '😼' },
  { id: 'birman', name: 'Birman', emoji: '😾' },
  { id: 'burmese', name: 'Burmese', emoji: '😿' },
];

export const DefaultAvatarGrid: React.FC<DefaultAvatarGridProps> = ({ visible, onClose, onSelectAvatar }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Default Avatar</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {AVATARS.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={styles.avatarCard}
                  onPress={() => {
                    onSelectAvatar(avatar.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                  <Text style={styles.avatarName} numberOfLines={1}>
                    {avatar.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');
const cardSize = (width - 80) / 3;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#757575',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  avatarCard: {
    width: cardSize,
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  avatarEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  avatarName: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
});
