import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Screenshot } from '../types';
import { ShareModal } from './ShareModal';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface FullScreenImageProps {
  screenshot: Screenshot;
  screenshots: Screenshot[];
  onClose: () => void;
  onDelete: (screenshot: Screenshot) => void;
  onNavigate: (screenshot: Screenshot) => void;
}

export const FullScreenImage: React.FC<FullScreenImageProps> = ({
  screenshot,
  screenshots,
  onClose,
  onDelete,
  onNavigate,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (scale.value <= 1) {
        if (Math.abs(e.translationX) > 100) {
          const currentIndex = screenshots.findIndex((s) => s.id === screenshot.id);
          if (e.translationX > 0 && currentIndex > 0) {
            onNavigate(screenshots[currentIndex - 1]);
          } else if (e.translationX < 0 && currentIndex < screenshots.length - 1) {
            onNavigate(screenshots[currentIndex + 1]);
          }
        }
      }
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handleDelete = () => {
    Alert.alert(
      'Delete Screenshot',
      'Are you sure you want to delete this screenshot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(screenshot);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={true} animationType="fade" transparent={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setShowShareModal(true)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>📤</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.button}>
              <Text style={styles.buttonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <GestureDetector gesture={composed}>
          <Animated.Image
            source={{ uri: screenshot.filePath }}
            style={[styles.image, animatedStyle]}
            resizeMode="contain"
          />
        </GestureDetector>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            🐱 {screenshot.sessionData.catName}
          </Text>
          <Text style={styles.infoText}>
            {screenshot.sessionData.catches} catches | {Math.floor(screenshot.sessionData.playTime / 60)}m played
          </Text>
          <Text style={styles.infoSubtext}>
            {new Date(screenshot.timestamp).toLocaleDateString()}
          </Text>
        </View>

        {showShareModal && (
          <ShareModal
            screenshot={screenshot}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 20,
  },
  image: {
    flex: 1,
    width: '100%',
  },
  info: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  infoSubtext: {
    color: '#999',
    fontSize: 14,
  },
});
