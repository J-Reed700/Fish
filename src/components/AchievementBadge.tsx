import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Achievement } from '../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  onPress,
  size = 'medium',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 50, height: 50 },
          icon: { fontSize: 24 },
        };
      case 'large':
        return {
          container: { width: 80, height: 80 },
          icon: { fontSize: 40 },
        };
      default:
        return {
          container: { width: 64, height: 64 },
          icon: { fontSize: 32 },
        };
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'special':
        return '#9370DB';
      default:
        return '#888';
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        sizeStyles.container,
        { borderColor: getTierColor(achievement.tier) },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, sizeStyles.icon]}>{achievement.icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    borderWidth: 3,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    textAlign: 'center',
  },
});

interface AchievementBadgeGridProps {
  achievements: Achievement[];
  maxDisplay?: number;
  onBadgePress?: (achievement: Achievement) => void;
  onViewAllPress?: () => void;
}

export const AchievementBadgeGrid: React.FC<AchievementBadgeGridProps> = ({
  achievements,
  maxDisplay = 3,
  onBadgePress,
  onViewAllPress,
}) => {
  const displayAchievements = achievements.slice(0, maxDisplay);
  const remainingCount = achievements.length - maxDisplay;

  return (
    <View style={gridStyles.container}>
      {displayAchievements.map(achievement => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          onPress={onBadgePress ? () => onBadgePress(achievement) : undefined}
          size="small"
        />
      ))}

      {remainingCount > 0 && (
        <TouchableOpacity
          style={gridStyles.moreButton}
          onPress={onViewAllPress}
          activeOpacity={0.7}
        >
          <Text style={gridStyles.moreText}>+{remainingCount}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const gridStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moreButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  moreText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
