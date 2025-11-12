import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { ChallengeCard } from './ChallengeCard';
import { StreakDisplay } from './StreakDisplay';
import { RewardUnlockModal } from './RewardUnlockModal';
import { ChallengeManager } from '../challenges/ChallengeManager';
import { StreakTracker } from '../challenges/StreakTracker';
import { Challenge, Reward, StreakData } from '../types';

interface DailyChallengeScreenProps {
  profileId: string;
  onClose: () => void;
}

export const DailyChallengeScreen: React.FC<DailyChallengeScreenProps> = ({
  profileId,
  onClose,
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: '',
    streakHistory: [],
  });
  const [loading, setLoading] = useState(true);
  const [unlockedReward, setUnlockedReward] = useState<Reward | null>(null);
  const [tier] = useState<'free' | 'premium'>('free');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const today = StreakTracker.getTodayDate();

      const [loadedChallenges, loadedStreak] = await Promise.all([
        ChallengeManager.getOrCreateChallenges(profileId, today, tier),
        StreakTracker.loadStreak(profileId),
      ]);

      setChallenges(loadedChallenges);
      setStreakData(loadedStreak);
    } catch (error) {
      console.error('Failed to load challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedChallenges = challenges.filter(c => c.completed);
  const incompleteChallenges = challenges.filter(c => !c.completed);

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Challenges</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#60a5fa" />
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <StreakDisplay
              currentStreak={streakData.currentStreak}
              longestStreak={streakData.longestStreak}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Challenges</Text>
              <Text style={styles.sectionSubtitle}>
                {completedChallenges.length}/{challenges.length} completed today
              </Text>

              {challenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}

              {tier === 'free' && (
                <View style={styles.premiumPromo}>
                  <Text style={styles.premiumIcon}>🔒</Text>
                  <Text style={styles.premiumTitle}>Premium Challenges</Text>
                  <Text style={styles.premiumDescription}>
                    Upgrade for 3 more challenges and exclusive rewards!
                  </Text>
                  <TouchableOpacity style={styles.upgradeButton}>
                    <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        )}

        <RewardUnlockModal
          visible={!!unlockedReward}
          reward={unlockedReward}
          onClose={() => setUnlockedReward(null)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: '#f1f5f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  premiumPromo: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
    marginTop: 16,
  },
  premiumIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  bottomPadding: {
    height: 40,
  },
});
