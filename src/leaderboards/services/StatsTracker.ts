import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserLeaderboardStats, CatProfile, MiniGameType } from '../../types';
import { LeaderboardService } from './LeaderboardService';
import { getCurrentUserId } from '../../config/firebase';
import { globalWriteBatcher } from '../../firebase/WriteBatcher';
import { performanceMonitor } from '../../firebase/PerformanceMonitor';

const STATS_KEY = 'user_leaderboard_stats';
const SYNC_THRESHOLD = {
  catches: 10,
  playtime: 60000,
  bossDefeat: 1,
  miniGame: 1,
};
const BATCH_WRITE_THRESHOLD = 5;

export class StatsTracker {
  private static stats: UserLeaderboardStats | null = null;
  private static lastSyncTime: number = 0;
  private static syncInterval: number = 300000;
  private static pendingUpdates: Partial<UserLeaderboardStats> = {};
  private static writeCounter: number = 0;

  static async initialize(userId?: string): Promise<void> {
    try {
      const actualUserId = userId || (await getCurrentUserId());
      const stored = await AsyncStorage.getItem(`${STATS_KEY}_${actualUserId}`);

      if (stored) {
        this.stats = JSON.parse(stored);
      } else {
        this.stats = {
          userId: actualUserId,
          totalCatches: 0,
          bossDefeats: {},
          miniGameHighScores: {},
          playStreak: 0,
          totalPlaytime: 0,
          lastPlayed: Date.now(),
        };
        await this.saveStats();
      }

      this.lastSyncTime = Date.now();
    } catch (error) {
      console.error('Failed to initialize StatsTracker:', error);
      throw error;
    }
  }

  static async recordCatch(): Promise<void> {
    if (!this.stats) await this.initialize();

    this.stats!.totalCatches += 1;
    this.stats!.lastPlayed = Date.now();

    this.pendingUpdates.totalCatches = this.stats!.totalCatches;
    this.writeCounter++;

    await this.saveStats();

    if (
      this.stats!.totalCatches % SYNC_THRESHOLD.catches === 0 ||
      this.writeCounter >= BATCH_WRITE_THRESHOLD
    ) {
      await this.syncToLeaderboard();
      this.writeCounter = 0;
    }
  }

  static async recordBossDefeat(
    bossType: string,
    defeatTime: number,
    profile: CatProfile
  ): Promise<void> {
    if (!this.stats) await this.initialize();

    if (!this.stats!.bossDefeats[bossType]) {
      this.stats!.bossDefeats[bossType] = 0;
    }

    this.stats!.bossDefeats[bossType] += 1;
    this.stats!.lastPlayed = Date.now();

    const totalDefeats = Object.values(this.stats!.bossDefeats).reduce(
      (sum, count) => sum + count,
      0
    );

    await this.saveStats();

    const categoryMap: Record<string, string> = {
      'giant-fish': 'boss-giant-fish',
      'speed-demon': 'boss-speed-demon',
      'swarm-leader': 'boss-swarm-leader',
      'mega-cockroach': 'boss-mega-cockroach',
    };

    const category = categoryMap[bossType];
    if (category) {
      await LeaderboardService.submitScore(
        category as any,
        defeatTime,
        profile,
        { bossType, difficulty: 'normal' }
      );
    }

    await LeaderboardService.submitScore(
      'boss-total-defeats',
      totalDefeats,
      profile,
      { bossType }
    );
  }

  static async recordMiniGameScore(
    gameType: MiniGameType,
    score: number,
    profile: CatProfile
  ): Promise<void> {
    if (!this.stats) await this.initialize();

    const currentHighScore = this.stats!.miniGameHighScores[gameType] || 0;

    const shouldUpdate = this.shouldUpdateMiniGameScore(gameType, score, currentHighScore);

    if (shouldUpdate) {
      this.stats!.miniGameHighScores[gameType] = score;
      this.stats!.lastPlayed = Date.now();

      await this.saveStats();

      const categoryMap: Record<MiniGameType, string> = {
        'whack-a-mole': 'whack-a-mole',
        'memory-match': 'memory-match',
        'follow-leader': 'follow-leader',
        'bubble-pop': 'bubble-pop',
        'speed-run': 'speed-run',
      };

      const category = categoryMap[gameType];
      if (category) {
        await LeaderboardService.submitScore(category as any, score, profile, {
          gameMode: gameType,
        });
      }
    }
  }

  static async recordPlaytime(milliseconds: number): Promise<void> {
    if (!this.stats) await this.initialize();

    this.stats!.totalPlaytime += milliseconds;
    this.stats!.lastPlayed = Date.now();

    this.pendingUpdates.totalPlaytime = this.stats!.totalPlaytime;

    await this.saveStats();

    if (Date.now() - this.lastSyncTime > this.syncInterval) {
      await this.syncToLeaderboard();
    }
  }

  static async updatePlayStreak(): Promise<void> {
    if (!this.stats) await this.initialize();

    const today = new Date().toDateString();
    const lastPlayed = new Date(this.stats!.lastPlayed).toDateString();

    if (today === lastPlayed) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastPlayed === yesterdayStr) {
      this.stats!.playStreak += 1;
    } else {
      this.stats!.playStreak = 1;
    }

    this.stats!.lastPlayed = Date.now();
    this.pendingUpdates.playStreak = this.stats!.playStreak;

    await this.saveStats();
  }

  static async getStats(): Promise<UserLeaderboardStats> {
    if (!this.stats) {
      await this.initialize();
    }
    return this.stats!;
  }

  static async syncToLeaderboard(): Promise<void> {
    if (!this.stats) return;

    const trace = performanceMonitor.startTrace('stats_sync');

    try {
      const profile = await this.getActiveProfile();
      if (!profile) return;

      const updates = [
        {
          category: 'total-catches' as const,
          score: this.stats.totalCatches,
        },
        {
          category: 'playtime' as const,
          score: this.stats.totalPlaytime,
        },
        {
          category: 'play-streak' as const,
          score: this.stats.playStreak,
        },
      ];

      for (const update of updates) {
        if (this.pendingUpdates[update.category as keyof UserLeaderboardStats] !== undefined) {
          await LeaderboardService.submitScore(update.category, update.score, profile);
        }
      }

      await globalWriteBatcher.flush();

      this.pendingUpdates = {};
      this.lastSyncTime = Date.now();
      this.writeCounter = 0;

      trace.stop();
    } catch (error) {
      trace.stop();
      console.error('Stats sync failed:', error);
    }
  }

  private static shouldUpdateMiniGameScore(
    gameType: MiniGameType,
    newScore: number,
    currentScore: number
  ): boolean {
    if (currentScore === 0) return true;

    if (gameType === 'memory-match') {
      return newScore < currentScore;
    }

    return newScore > currentScore;
  }

  private static async saveStats(): Promise<void> {
    if (!this.stats) return;

    try {
      await AsyncStorage.setItem(
        `${STATS_KEY}_${this.stats.userId}`,
        JSON.stringify(this.stats)
      );
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  private static async getActiveProfile(): Promise<CatProfile | null> {
    try {
      const profilesData = await AsyncStorage.getItem('cat_profiles');
      if (!profilesData) return null;

      const profiles: CatProfile[] = JSON.parse(profilesData);
      const activeProfile = profiles.find((p) => p.isActive);

      return activeProfile || profiles[0] || null;
    } catch (error) {
      console.error('Failed to get active profile:', error);
      return null;
    }
  }

  static async resetStats(): Promise<void> {
    if (!this.stats) return;

    const userId = this.stats.userId;

    this.stats = {
      userId,
      totalCatches: 0,
      bossDefeats: {},
      miniGameHighScores: {},
      playStreak: 0,
      totalPlaytime: 0,
      lastPlayed: Date.now(),
    };

    this.pendingUpdates = {};
    await this.saveStats();
  }

  static async exportStats(): Promise<UserLeaderboardStats | null> {
    if (!this.stats) {
      try {
        await this.initialize();
      } catch {
        return null;
      }
    }
    return this.stats;
  }
}
