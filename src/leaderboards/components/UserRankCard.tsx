import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { LeaderboardCategory } from '../../types';

interface UserRankCardProps {
  rank: number;
  percentile: number;
  category: LeaderboardCategory;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time';
  onImprovePress?: () => void;
}

export const UserRankCard: React.FC<UserRankCardProps> = ({
  rank,
  percentile,
  category,
  timeframe,
  onImprovePress,
}) => {
  const getRankBadgeColor = (): string => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    if (rank <= 10) return '#4A90E2';
    if (percentile >= 90) return '#34C759';
    if (percentile >= 75) return '#FF9500';
    return '#8E8E93';
  };

  const getRankMessage = (): string => {
    if (rank === 1) return 'You are #1!';
    if (rank <= 3) return `Top 3 - Amazing!`;
    if (rank <= 10) return `Top 10 - Great job!`;
    if (percentile >= 90) return `Top ${100 - percentile}% - Excellent!`;
    if (percentile >= 75) return `Top ${100 - percentile}% - Keep going!`;
    if (percentile >= 50) return `Top ${100 - percentile}% - Good effort!`;
    return 'Keep playing to improve!';
  };

  const getTimeframeLabel = (): string => {
    switch (timeframe) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      case 'all-time':
        return 'All-Time';
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getRankBadgeColor() }]}>
      <View style={styles.header}>
        <Text style={styles.label}>Your Rank</Text>
        <Text style={styles.timeframe}>{getTimeframeLabel()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.rankSection}>
          <View style={[styles.rankBadge, { backgroundColor: getRankBadgeColor() }]}>
            <Text style={styles.rankNumber}>#{rank}</Text>
          </View>
          <View style={styles.rankInfo}>
            <Text style={styles.rankMessage}>{getRankMessage()}</Text>
            {percentile > 0 && (
              <Text style={styles.percentileText}>Top {100 - percentile}%</Text>
            )}
          </View>
        </View>

        {onImprovePress && rank > 1 && (
          <TouchableOpacity style={styles.improveButton} onPress={onImprovePress}>
            <Text style={styles.improveButtonText}>Improve Rank</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 8,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeframe: {
    fontSize: 12,
    color: '#999999',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rankInfo: {
    flex: 1,
  },
  rankMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  percentileText: {
    fontSize: 14,
    color: '#666666',
  },
  improveButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  improveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
