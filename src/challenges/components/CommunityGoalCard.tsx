import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from '../../config/firebase';
import type { CommunityChallenge, CommunityChallengeProgress } from '../../types';
import { RewardManager } from '../services/RewardManager';

interface CommunityGoalCardProps {
  challenge: CommunityChallenge;
  onJoin: (challengeId: string) => void;
}

export const CommunityGoalCard: React.FC<CommunityGoalCardProps> = ({
  challenge,
  onJoin,
}) => {
  const [progress, setProgress] = useState<CommunityChallengeProgress | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!db) {
      return;
    }
  }, [challenge.id]);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = challenge.endTime - now;

      if (remaining <= 0) {
        setTimeRemaining('Completed');
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h remaining`);
      } else {
        setTimeRemaining(`${hours}h remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [challenge.endTime]);

  const globalProgress = progress?.globalProgress || 0;
  const globalTarget = progress?.globalTarget || challenge.requirement.target;
  const progressPercent = Math.min((globalProgress / globalTarget) * 100, 100);
  const contributorCount = progress?.contributorCount || 0;
  const isCompleted = progress?.isCompleted || false;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const rewardText = RewardManager.formatRewardText(challenge.reward);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.communityBadge}>
          <Text style={styles.communityBadgeText}>COMMUNITY GOAL</Text>
        </View>
        <Text style={styles.timer}>{timeRemaining}</Text>
      </View>

      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.description}>{challenge.description}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: isCompleted ? '#4CAF50' : '#2196F3',
              },
            ]}
          />
        </View>
        <View style={styles.progressStats}>
          <Text style={styles.progressText}>
            {formatNumber(globalProgress)} / {formatNumber(globalTarget)}
          </Text>
          <Text style={styles.percentText}>{progressPercent.toFixed(1)}%</Text>
        </View>
      </View>

      <View style={styles.contributorsContainer}>
        <Text style={styles.contributorsText}>
          {formatNumber(contributorCount)} players contributing
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardLabel}>Community Reward:</Text>
          <Text style={styles.rewardText}>{rewardText}</Text>
        </View>

        {!isCompleted && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => onJoin(challenge.id)}
          >
            <Text style={styles.joinButtonText}>Join the effort!</Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Completed!</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  communityBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  communityBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  percentText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  contributorsContainer: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  contributorsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  rewardText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  completedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
