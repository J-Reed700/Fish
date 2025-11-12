import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OverlayConfig } from '../types';

interface ScreenshotOverlayProps {
  config: OverlayConfig;
}

export const ScreenshotOverlay: React.FC<ScreenshotOverlayProps> = ({
  config,
}) => {
  const playTimeMinutes = Math.floor(config.playTime / 60);
  const playTimeSeconds = config.playTime % 60;

  return (
    <View style={styles.overlay}>
      <View style={styles.topBar}>
        <Text style={styles.catEmoji}>🐱</Text>
        <Text style={styles.catName}>{config.catName}</Text>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statText}>
          {config.catches} catches | {playTimeMinutes}m {playTimeSeconds}s played
        </Text>
        <Text style={styles.modeText}>Mode: {config.mode}</Text>
      </View>

      <Text style={styles.hashtag}>#FishCatGame</Text>

      {config.showWatermark && (
        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>Made with Fish Cat Game 🐟</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  catEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  catName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  stats: {
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  modeText: {
    fontSize: 12,
    color: '#ccc',
  },
  hashtag: {
    fontSize: 14,
    color: '#4a9eff',
    fontWeight: '600',
    marginBottom: 8,
  },
  watermark: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  watermarkText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
});
