import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { CatProfile, PreyType } from '../../types';

interface ProfileStatsScreenProps {
  profile: CatProfile;
  onExport: () => void;
  onClose: () => void;
}

export const ProfileStatsScreen: React.FC<ProfileStatsScreenProps> = ({ profile, onExport, onClose }) => {
  const formatPlaytime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPreyEmoji = (preyType: PreyType): string => {
    const emojis: Record<PreyType, string> = {
      fish: '🐟',
      mouse: '🐭',
      butterfly: '🦋',
      cockroach: '🪳',
      ladybug: '🐞',
      laser: '🔴',
      frog: '🐸',
      spider: '🕷️',
    };
    return emojis[preyType] || '❓';
  };

  const getSortedCatches = () => {
    return Object.entries(profile.stats.catchesByPreyType)
      .sort(([, a], [, b]) => b - a)
      .filter(([, count]) => count > 0);
  };

  const handleShare = async () => {
    try {
      const message = `🐱 ${profile.name}'s Stats\n\n` +
        `📊 Total Catches: ${profile.stats.totalCatches}\n` +
        `⏱️ Playtime: ${formatPlaytime(profile.stats.totalPlaytime)}\n` +
        `🎯 Favorite Prey: ${profile.stats.favoritePreyType || 'None yet'}\n` +
        `🔥 Streak: ${profile.stats.playStreak} days\n` +
        `👾 Boss Defeats: ${profile.stats.bossDefeats}/${profile.stats.bossAttempts}`;

      await Share.share({ message });
    } catch (error) {
      console.error('Failed to share stats:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.name}'s Stats</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{profile.stats.totalCatches}</Text>
            <Text style={styles.summaryLabel}>Total Catches</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{formatPlaytime(profile.stats.totalPlaytime)}</Text>
            <Text style={styles.summaryLabel}>Playtime</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{profile.stats.playStreak}</Text>
            <Text style={styles.summaryLabel}>Day Streak</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catches by Prey Type</Text>
          {getSortedCatches().length > 0 ? (
            getSortedCatches().map(([preyType, count]) => {
              const percentage = profile.stats.totalCatches > 0
                ? (count / profile.stats.totalCatches) * 100
                : 0;

              return (
                <View key={preyType} style={styles.statItem}>
                  <View style={styles.statHeader}>
                    <View style={styles.statLabelContainer}>
                      <Text style={styles.statEmoji}>{getPreyEmoji(preyType as PreyType)}</Text>
                      <Text style={styles.statLabel}>
                        {preyType.charAt(0).toUpperCase() + preyType.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.statValue}>{count}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No catches yet! Start playing to see stats.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Stats</Text>
          <View style={styles.favoriteCard}>
            <Text style={styles.favoriteLabel}>Favorite Prey</Text>
            <Text style={styles.favoriteValue}>
              {profile.stats.favoritePreyType
                ? `${getPreyEmoji(profile.stats.favoritePreyType)} ${profile.stats.favoritePreyType}`
                : 'None yet'}
            </Text>
          </View>
          <View style={styles.favoriteCard}>
            <Text style={styles.favoriteLabel}>Favorite Environment</Text>
            <Text style={styles.favoriteValue}>
              {profile.stats.favoriteEnvironment || 'None yet'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Boss Battles</Text>
          <View style={styles.bossStats}>
            <View style={styles.bossStatItem}>
              <Text style={styles.bossStatValue}>{profile.stats.bossAttempts}</Text>
              <Text style={styles.bossStatLabel}>Attempts</Text>
            </View>
            <View style={styles.bossStatItem}>
              <Text style={styles.bossStatValue}>{profile.stats.bossDefeats}</Text>
              <Text style={styles.bossStatLabel}>Victories</Text>
            </View>
            <View style={styles.bossStatItem}>
              <Text style={styles.bossStatValue}>
                {profile.stats.bossAttempts > 0
                  ? `${((profile.stats.bossDefeats / profile.stats.bossAttempts) * 100).toFixed(0)}%`
                  : '0%'}
              </Text>
              <Text style={styles.bossStatLabel}>Win Rate</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mini-Games</Text>
          <Text style={styles.miniGameValue}>{profile.stats.miniGamesPlayed} games played</Text>
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={onExport} activeOpacity={0.7}>
          <Text style={styles.exportButtonText}>📥 Export Profile Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  summarySection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  statItem: {
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#212121',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
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
    backgroundColor: '#4CAF50',
  },
  percentage: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  favoriteCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  favoriteLabel: {
    fontSize: 14,
    color: '#757575',
  },
  favoriteValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  bossStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bossStatItem: {
    alignItems: 'center',
  },
  bossStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 4,
  },
  bossStatLabel: {
    fontSize: 12,
    color: '#757575',
  },
  miniGameValue: {
    fontSize: 16,
    color: '#212121',
  },
  exportButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
