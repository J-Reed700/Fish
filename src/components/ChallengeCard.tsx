import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const progressPercentage = (challenge.progress / challenge.target) * 100;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'easy':
        return '#4ade80';
      case 'medium':
        return '#fb923c';
      case 'hard':
        return '#f87171';
      default:
        return '#94a3b8';
    }
  };

  const getTierLabel = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const formatProgress = () => {
    if (challenge.type === 'play-time') {
      const progressMinutes = Math.floor(challenge.progress / 60);
      const targetMinutes = Math.floor(challenge.target / 60);
      return `${progressMinutes}/${targetMinutes} min`;
    }
    return `${challenge.progress}/${challenge.target}`;
  };

  return (
    <View style={[styles.container, challenge.completed && styles.completedContainer]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{challenge.title}</Text>
          {challenge.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={[styles.tierBadge, { backgroundColor: getTierColor(challenge.tier) }]}>
          <Text style={styles.tierText}>{getTierLabel(challenge.tier)}</Text>
        </View>
      </View>

      <Text style={styles.description}>{challenge.description}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(progressPercentage, 100)}%`,
                backgroundColor: challenge.completed ? '#4ade80' : '#60a5fa',
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{formatProgress()}</Text>
      </View>

      <View style={styles.rewardContainer}>
        <Text style={styles.rewardLabel}>Reward: </Text>
        <Text style={styles.rewardValue}>{challenge.reward.displayName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#334155',
  },
  completedContainer: {
    borderColor: '#4ade80',
    backgroundColor: '#1e3a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginRight: 8,
  },
  checkmark: {
    fontSize: 18,
    color: '#4ade80',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  rewardValue: {
    fontSize: 13,
    color: '#fbbf24',
    fontWeight: '600',
  },
});
