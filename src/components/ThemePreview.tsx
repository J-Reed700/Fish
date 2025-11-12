import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../types';

interface ThemePreviewProps {
  theme: Theme;
  isSelected: boolean;
  isLocked: boolean;
  onPress: () => void;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  isSelected,
  isLocked,
  onPress,
}) => {
  const gradientColor = theme.colors.backgroundBottom || theme.colors.background;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selected,
        isLocked && styles.locked,
      ]}
      onPress={onPress}
      disabled={isLocked}
    >
      <View
        style={[
          styles.preview,
          {
            backgroundColor: theme.colors.background,
            borderColor: gradientColor,
          },
        ]}
      >
        <View style={styles.gradientOverlay}>
          {theme.particles.slice(0, 3).map((particle, i) => (
            <View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: particle.color,
                  width: particle.size,
                  height: particle.size,
                  left: `${20 + i * 30}%`,
                  top: `${30 + i * 20}%`,
                },
              ]}
            />
          ))}
        </View>

        {isLocked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}

        {isSelected && !isLocked && (
          <View style={styles.checkOverlay}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        )}
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {theme.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    margin: 8,
    alignItems: 'center',
  },
  selected: {
    opacity: 1,
  },
  locked: {
    opacity: 0.6,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientOverlay: {
    flex: 1,
    position: 'relative',
  },
  particle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.4,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 32,
  },
  checkOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  name: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
