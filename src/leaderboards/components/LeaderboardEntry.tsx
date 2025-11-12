import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { LeaderboardEntry, LeaderboardCategory } from '../../types';

interface LeaderboardEntryProps {
  entry: LeaderboardEntry;
  category: LeaderboardCategory;
  onPress?: () => void;
}

export const LeaderboardEntryComponent: React.FC<LeaderboardEntryProps> = ({
  entry,
  category,
  onPress,
}) => {
  const getRankBadge = (rank: number): { color: string; emoji: string } => {
    switch (rank) {
      case 1:
        return { color: '#FFD700', emoji: '🥇' };
      case 2:
        return { color: '#C0C0C0', emoji: '🥈' };
      case 3:
        return { color: '#CD7F32', emoji: '🥉' };
      default:
        return { color: '#E0E0E0', emoji: '' };
    }
  };

  const formatScore = (score: number, category: LeaderboardCategory): string => {
    if (
      category.startsWith('boss-') &&
      !category.includes('total')
    ) {
      const seconds = Math.floor(score / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    if (category === 'playtime') {
      const hours = Math.floor(score / 3600000);
      const minutes = Math.floor((score % 3600000) / 60000);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }

    if (category === 'memory-match') {
      return `${score} moves`;
    }

    if (category === 'play-streak') {
      return `${score} days`;
    }

    if (category === 'achievements') {
      return `${score} unlocked`;
    }

    return score.toLocaleString();
  };

  const getScoreUnit = (category: LeaderboardCategory): string => {
    if (category === 'memory-match') return '';
    if (category === 'play-streak') return '';
    if (category === 'achievements') return '';
    if (category === 'playtime') return '';
    if (category.startsWith('boss-') && !category.includes('total')) return '';
    if (category === 'boss-total-defeats') return 'defeats';
    if (category === 'total-catches') return 'catches';
    return 'pts';
  };

  const badge = getRankBadge(entry.rank);

  return (
    <TouchableOpacity
      style={[styles.container, entry.rank <= 3 && styles.topThreeContainer]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.rankContainer}>
        {entry.rank <= 3 ? (
          <Text style={styles.rankEmoji}>{badge.emoji}</Text>
        ) : (
          <View style={[styles.rankBadge, { backgroundColor: badge.color }]}>
            <Text style={styles.rankText}>#{entry.rank}</Text>
          </View>
        )}
      </View>

      <View style={styles.profileContainer}>
        {entry.catPhotoUrl ? (
          <Image source={{ uri: entry.catPhotoUrl }} style={styles.catPhoto} />
        ) : (
          <View style={styles.catPhotoPlaceholder}>
            <Text style={styles.catPhotoPlaceholderText}>🐱</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.catName} numberOfLines={1}>
          {entry.catName}
        </Text>
        <Text style={styles.username} numberOfLines={1}>
          {entry.username}
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{formatScore(entry.score, category)}</Text>
        {getScoreUnit(category) && (
          <Text style={styles.scoreUnit}>{getScoreUnit(category)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topThreeContainer: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankEmoji: {
    fontSize: 32,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  profileContainer: {
    marginRight: 12,
  },
  catPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  catPhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catPhotoPlaceholderText: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  catName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
    color: '#999999',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  scoreUnit: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
});
