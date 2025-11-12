import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useUserRank } from '../hooks/useUserRank';
import type { LeaderboardCategory } from '../../types';
import { LeaderboardEntryComponent } from './LeaderboardEntry';
import { UserRankCard } from './UserRankCard';

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all-time';

const CATEGORY_GROUPS = {
  'Boss Battles': [
    { id: 'boss-giant-fish', label: 'Giant Fish' },
    { id: 'boss-speed-demon', label: 'Speed Demon' },
    { id: 'boss-swarm-leader', label: 'Swarm Leader' },
    { id: 'boss-mega-cockroach', label: 'Mega Roach' },
    { id: 'boss-total-defeats', label: 'Total Defeats' },
  ],
  'Mini-Games': [
    { id: 'whack-a-mole', label: 'Whack-a-Mole' },
    { id: 'memory-match', label: 'Memory Match' },
    { id: 'follow-leader', label: 'Follow Leader' },
    { id: 'bubble-pop', label: 'Bubble Pop' },
    { id: 'speed-run', label: 'Speed Run' },
  ],
  'Global Stats': [
    { id: 'total-catches', label: 'Total Catches' },
    { id: 'play-streak', label: 'Play Streak' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'playtime', label: 'Playtime' },
  ],
} as const;

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'all-time', label: 'All-Time' },
];

export const LeaderboardScreen: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<keyof typeof CATEGORY_GROUPS>('Boss Battles');
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('boss-giant-fish');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('all-time');

  const { leaderboard, loading, error, refresh } = useLeaderboard(
    selectedCategory,
    selectedTimeframe
  );
  const { rank, percentile } = useUserRank(selectedCategory, selectedTimeframe);

  const handleGroupChange = (group: keyof typeof CATEGORY_GROUPS) => {
    setSelectedGroup(group);
    const firstCategory = CATEGORY_GROUPS[group][0].id;
    setSelectedCategory(firstCategory as LeaderboardCategory);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboards</Text>
      </View>

      <ScrollView horizontal style={styles.groupTabs} showsHorizontalScrollIndicator={false}>
        {Object.keys(CATEGORY_GROUPS).map((group) => (
          <TouchableOpacity
            key={group}
            style={[styles.groupTab, selectedGroup === group && styles.groupTabActive]}
            onPress={() => handleGroupChange(group as keyof typeof CATEGORY_GROUPS)}
          >
            <Text
              style={[styles.groupTabText, selectedGroup === group && styles.groupTabTextActive]}
            >
              {group}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal style={styles.categoryTabs} showsHorizontalScrollIndicator={false}>
        {CATEGORY_GROUPS[selectedGroup].map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category.id as LeaderboardCategory)}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.categoryTabTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal style={styles.timeframeTabs} showsHorizontalScrollIndicator={false}>
        {TIMEFRAMES.map((timeframe) => (
          <TouchableOpacity
            key={timeframe.id}
            style={[
              styles.timeframeTab,
              selectedTimeframe === timeframe.id && styles.timeframeTabActive,
            ]}
            onPress={() => setSelectedTimeframe(timeframe.id)}
          >
            <Text
              style={[
                styles.timeframeTabText,
                selectedTimeframe === timeframe.id && styles.timeframeTabTextActive,
              ]}
            >
              {timeframe.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {rank > 0 && (
        <UserRankCard
          rank={rank}
          percentile={percentile}
          category={selectedCategory}
          timeframe={selectedTimeframe}
        />
      )}

      {loading && !leaderboard ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.entriesList}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        >
          {leaderboard && leaderboard.entries.length > 0 ? (
            leaderboard.entries.map((entry) => (
              <LeaderboardEntryComponent
                key={entry.id}
                entry={entry}
                category={selectedCategory}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No entries yet. Be the first!</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  groupTabs: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    maxHeight: 50,
  },
  groupTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  groupTabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#4A90E2',
  },
  groupTabText: {
    fontSize: 16,
    color: '#666666',
  },
  groupTabTextActive: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  categoryTabs: {
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    maxHeight: 45,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 8,
  },
  categoryTabActive: {
    backgroundColor: '#4A90E2',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666666',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeframeTabs: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 8,
    maxHeight: 50,
  },
  timeframeTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  timeframeTabActive: {
    backgroundColor: '#34C759',
  },
  timeframeTabText: {
    fontSize: 13,
    color: '#666666',
  },
  timeframeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  entriesList: {
    flex: 1,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});
