import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { CommunityChallenge, UserChallengeProgress } from '../../types';
import { RewardManager } from '../services/RewardManager';

interface ChallengeCardProps {
  challenge: CommunityChallenge;
  progress: UserChallengeProgress | undefined;
  onClaim: (challengeId: string) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  progress,
  onClaim,
}) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = challenge.endTime - now;

      if (remaining <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [challenge.endTime]);

  const progressValue = progress ? progress.progress : 0;
  const target = challenge.requirement.target;
  const progressPercent = Math.min((progressValue / target) * 100, 100);
  const isCompleted = progress?.isCompleted || false;
  const isExpired = Date.now() > challenge.endTime;
  const canClaim = isCompleted && !progress?.claimedReward;

  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'expert':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusColor = () => {
    if (isExpired) return '#999';
    if (isCompleted) return '#4CAF50';
    return '#2196F3';
  };

  const rewardText = RewardManager.formatRewardText(challenge.reward);

  return (
    <View style={[styles.card, isExpired && styles.cardExpired]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{challenge.title}</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor() },
            ]}
          >
            <Text style={styles.difficultyText}>
              {challenge.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={[styles.timer, isExpired && styles.expired]}>
          {timeRemaining}
        </Text>
      </View>

      <Text style={styles.description}>{challenge.description}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progressValue} / {target}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardLabel}>Reward:</Text>
          <Text style={styles.rewardText}>{rewardText}</Text>
        </View>

        {canClaim && (
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => onClaim(challenge.id)}
          >
            <Text style={styles.claimButtonText}>Claim</Text>
          </TouchableOpacity>
        )}

        {isCompleted && !canClaim && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Claimed</Text>
          </View>
        )}

        {!isCompleted && !isExpired && (
          <View style={styles.inProgressBadge}>
            <Text style={styles.inProgressText}>In Progress</Text>
          </View>
        )}

        {isExpired && !isCompleted && (
          <View style={styles.expiredBadge}>
            <Text style={styles.expiredText}>Expired</Text>
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardExpired: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  timer: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  expired: {
    color: '#F44336',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
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
  claimButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  claimButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inProgressBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inProgressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expiredBadge: {
    backgroundColor: '#999',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  expiredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
