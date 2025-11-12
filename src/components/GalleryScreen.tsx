import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { Screenshot } from '../types';
import { GalleryManager } from '../media/GalleryManager';
import { FullScreenImage } from './FullScreenImage';

interface GalleryScreenProps {
  profileId: string;
  onClose: () => void;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({
  profileId,
  onClose,
}) => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [storageSize, setStorageSize] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, [profileId]);

  const loadGallery = async () => {
    setIsLoading(true);
    try {
      const shots = await GalleryManager.loadGallery(profileId);
      setScreenshots(shots);

      const size = await GalleryManager.getStorageSize(profileId);
      setStorageSize(size);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (screenshot: Screenshot) => {
    Alert.alert(
      'Delete Screenshot',
      'Are you sure you want to delete this screenshot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await GalleryManager.removeFromGallery(screenshot.id, profileId);
              await loadGallery();
            } catch (error) {
              console.error('Error deleting screenshot:', error);
              Alert.alert('Error', 'Failed to delete screenshot');
            }
          },
        },
      ]
    );
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderItem = ({ item }: { item: Screenshot }) => (
    <TouchableOpacity
      style={styles.thumbnailContainer}
      onPress={() => setSelectedScreenshot(item)}
      onLongPress={() => handleDelete(item)}
    >
      <Image
        source={{ uri: item.filePath }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.thumbnailOverlay}>
        <Text style={styles.thumbnailText}>
          {item.sessionData.catches} 🐟
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gallery ({screenshots.length})</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : screenshots.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No screenshots yet</Text>
            <Text style={styles.emptySubtext}>
              Capture your cat's gameplay moments!
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={screenshots}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
              <Text style={styles.storageText}>
                Storage: {formatStorageSize(storageSize)} / 5 MB
              </Text>
            </View>
          </>
        )}

        {selectedScreenshot && (
          <FullScreenImage
            screenshot={selectedScreenshot}
            screenshots={screenshots}
            onClose={() => setSelectedScreenshot(null)}
            onDelete={handleDelete}
            onNavigate={(newScreenshot) => setSelectedScreenshot(newScreenshot)}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
  grid: {
    padding: 8,
  },
  thumbnailContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 4,
  },
  thumbnail: {
    flex: 1,
    borderRadius: 8,
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 4,
    borderRadius: 4,
  },
  thumbnailText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  storageText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});
