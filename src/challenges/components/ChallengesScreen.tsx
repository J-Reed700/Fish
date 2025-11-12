import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ChallengeManager } from '../services/ChallengeManager';
import { RewardManager } from '../services/RewardManager';
import { ChallengeCard } from './ChallengeCard';
import { CommunityGoalCard } from './CommunityGoalCard';
import { RewardModal } from './RewardModal';
import { LevelBadge } from './LevelBadge';
import { LevelManager } from '../services/LevelManager';
import type { CommunityChallenge, PlayerLevel, CommunityChallengeType } from '../../types';
import type { RewardResult } from '../services/RewardManager';

interface ChallengesScreenProps {
  userId: string;
  profileId: string;
  onNavigateToLevelProgress?: () => void;
}

export const ChallengesScreen: React.FC<ChallengesScreenProps> = ({
  userId,
  profileId,
  onNavigateToLevelProgress,
}) => {
  const [activeTab, setActiveTab] = useState<CommunityChallengeType>('daily');
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [playerLevel, setPlayerLevel] = useState<PlayerLevel | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);

  useEffect(() => {
    initializeChallenges();
    loadPlayerLevel();
  }, []);

  const initializeChallenges = async () => {
    setLoading(true);
    try {
      await ChallengeManager.initialize(userId, profileId);
      const activeChallenges = ChallengeManager.getAllActiveChallenges();
      setChallenges(activeChallenges);
    } catch (error) {
      console.error('Failed to initialize challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlayerLevel = async () => {
    try {
      const level = await LevelManager.getUserLevel(userId);
      setPlayerLevel(level);
    } catch (error) {
      console.error('Failed to load player level:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeChallenges();
    await loadPlayerLevel();
    setRefreshing(false);
  };

  const handleClaimReward = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    try {
      const result = await RewardManager.grantReward(userId, challenge.reward);
      await ChallengeManager.claimReward(userId, challengeId);

      setRewardResult(result);
      setShowRewardModal(true);

      await loadPlayerLevel();
      await onRefresh();
    } catch (error) {
      console.error('Failed to claim reward:', error);
    }
  };

  const handleJoinCommunityGoal = (challengeId: string) => {
    console.log('Joining community goal:', challengeId);
  };

  const filteredChallenges = challenges.filter(c => c.type === activeTab);

  const tabs: { key: CommunityChallengeType; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'community', label: 'Community' },
    { key: 'special', label: 'Special' },
  ];

  const renderChallenge = ({ item }: { item: CommunityChallenge }) => {
    if (item.type === 'community') {
      return (
        <CommunityGoalCard
          challenge={item}
          onJoin={handleJoinCommunityGoal}
        />
      );
    }

    const progress = ChallengeManager.getUserProgress(item.id);
    return (
      <ChallengeCard
        challenge={item}
        progress={progress}
        onClaim={handleClaimReward}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Challenges</Text>
        {playerLevel && (
          <LevelBadge
            level={playerLevel}
            size="small"
            onPress={onNavigateToLevelProgress}
          />
        )}
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredChallenges}
        renderItem={renderChallenge}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} challenges available</Text>
            <Text style={styles.emptySubtext}>Check back later for new challenges!</Text>
          </View>
        }
      />

      <RewardModal
        visible={showRewardModal}
        reward={rewardResult}
        onClose={() => {
          setShowRewardModal(false);
          setRewardResult(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
