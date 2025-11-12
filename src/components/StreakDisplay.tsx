import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StreakTracker } from '../challenges/StreakTracker';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  compact?: boolean;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  longestStreak,
  compact = false,
}) => {
  const milestones = StreakTracker.getStreakMilestones();
  const nextMilestone = StreakTracker.getNextMilestone(currentStreak);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>{currentStreak} days</Text>
        <Text style={styles.fireEmoji}>🔥</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.streakHeader}>
        <Text style={styles.streakLabel}>Current Streak</Text>
        <View style={styles.streakValue}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.fireEmoji}>🔥</Text>
        </View>
      </View>

      {longestStreak > currentStreak && (
        <Text style={styles.longestStreak}>Longest: {longestStreak} days</Text>
      )}

      <View style={styles.milestonesContainer}>
        <Text style={styles.milestonesTitle}>Streak Rewards</Text>
        {milestones.map((milestone, index) => {
          const isCompleted = currentStreak >= milestone.streak;
          const isCurrent = nextMilestone?.streak === milestone.streak;

          return (
            <View
              key={index}
              style={[
                styles.milestoneItem,
                isCompleted && styles.milestoneCompleted,
                isCurrent && styles.milestoneCurrent,
              ]}
            >
              <View style={styles.milestoneLeft}>
                <Text style={styles.milestoneCheckmark}>
                  {isCompleted ? '✓' : isCurrent ? '→' : '○'}
                </Text>
                <Text style={styles.milestoneDays}>{milestone.streak} days</Text>
              </View>
              <Text
                style={[
                  styles.milestoneReward,
                  isCompleted && styles.milestoneRewardCompleted,
                ]}
              >
                {milestone.reward}
              </Text>
            </View>
          );
        })}
      </View>

      {nextMilestone && (
        <View style={styles.nextMilestoneContainer}>
          <Text style={styles.nextMilestoneText}>
            {nextMilestone.streak - currentStreak} more day
            {nextMilestone.streak - currentStreak !== 1 ? 's' : ''} to next reward!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#334155',
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  streakValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fbbf24',
  },
  fireEmoji: {
    fontSize: 24,
  },
  longestStreak: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  milestonesContainer: {
    marginTop: 16,
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  milestoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#0f172a',
  },
  milestoneCompleted: {
    backgroundColor: '#1e3a2e',
  },
  milestoneCurrent: {
    backgroundColor: '#1e2a3a',
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneCheckmark: {
    fontSize: 16,
    color: '#94a3b8',
    width: 20,
  },
  milestoneDays: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  milestoneReward: {
    fontSize: 13,
    color: '#94a3b8',
    flex: 1,
    textAlign: 'right',
  },
  milestoneRewardCompleted: {
    color: '#4ade80',
  },
  nextMilestoneContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1e2a3a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  nextMilestoneText: {
    fontSize: 13,
    color: '#60a5fa',
    fontWeight: '600',
    textAlign: 'center',
  },
});
