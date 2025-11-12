import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Achievement } from '../types';

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onPress,
}) => {
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

  const getProgressPercentage = () => {
    const target = achievement.requirement.target;
    const progress = achievement.progress || 0;

    if (typeof target === 'number') {
      return Math.min(100, (progress / target) * 100);
    }
    return Math.min(100, (progress / target.length) * 100);
  };

  const getProgressText = () => {
    const target = achievement.requirement.target;
    const progress = achievement.progress || 0;

    if (typeof target === 'number') {
      return `${progress}/${target}`;
    }
    return `${progress}/${target.length}`;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        achievement.unlocked && styles.cardUnlocked,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{achievement.icon}</Text>
          {achievement.unlocked && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
          {!achievement.unlocked && (
            <View style={styles.lock}>
              <Text style={styles.lockText}>🔒</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{achievement.title}</Text>
            <View style={[styles.tierBadge, { backgroundColor: getTierColor(achievement.tier) }]}>
              <Text style={styles.tierText}>{achievement.tier}</Text>
            </View>
          </View>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>
      </View>

      {!achievement.unlocked && progressPercentage > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{getProgressText()}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.points}>+{achievement.reward.points} points</Text>
        {achievement.reward.badge && (
          <Text style={styles.badge}>🏅 {achievement.reward.badge}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  cardUnlocked: {
    borderColor: '#4CAF50',
    backgroundColor: '#2a3a2a',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  icon: {
    fontSize: 48,
  },
  checkmark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  lock: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#666',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: {
    fontSize: 12,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  tierText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: '#ccc',
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  points: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  badge: {
    fontSize: 12,
    color: '#aaa',
  },
});
