import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { PlayerLevel } from '../../types';

interface LevelBadgeProps {
  level: PlayerLevel;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  onPress,
  size = 'medium',
}) => {
  const progressPercent = (level.currentXP / level.xpToNextLevel) * 100;
  const circumference = 2 * Math.PI * 35;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  const sizeStyles = {
    small: { container: 60, level: 18, title: 10 },
    medium: { container: 80, level: 24, title: 12 },
    large: { container: 100, level: 30, title: 14 },
  };

  const dimensions = sizeStyles[size];

  const BadgeContent = (
    <View style={[styles.container, { width: dimensions.container, height: dimensions.container }]}>
      <svg width={dimensions.container} height={dimensions.container} style={styles.svg}>
        <circle
          cx={dimensions.container / 2}
          cy={dimensions.container / 2}
          r="35"
          stroke="#E0E0E0"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx={dimensions.container / 2}
          cy={dimensions.container / 2}
          r="35"
          stroke="#4CAF50"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${dimensions.container / 2} ${dimensions.container / 2})`}
        />
      </svg>

      <View style={styles.content}>
        <View style={styles.levelCircle}>
          <Text style={[styles.levelText, { fontSize: dimensions.level }]}>
            {level.level}
          </Text>
        </View>
        <Text style={[styles.titleText, { fontSize: dimensions.title }]} numberOfLines={1}>
          {level.title}
        </Text>
        {size !== 'small' && (
          <Text style={styles.xpText}>
            {level.currentXP} / {level.xpToNextLevel} XP
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {BadgeContent}
      </TouchableOpacity>
    );
  }

  return BadgeContent;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelCircle: {
    backgroundColor: '#fff',
    borderRadius: 100,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelText: {
    fontWeight: 'bold',
    color: '#333',
  },
  titleText: {
    marginTop: 4,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  xpText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});
