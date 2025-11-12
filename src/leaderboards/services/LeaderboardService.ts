import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  setDoc,
  Timestamp,
  getDoc,
  startAfter,
  QueryConstraint,
} from 'firebase/firestore';
import type { LeaderboardCategory, Leaderboard, LeaderboardEntry, CatProfile } from '../../types';
import { LEADERBOARD_CONFIG } from '../../config/GameConfig';
import { ScoreValidator } from '../utils/ScoreValidator';
import { getCurrentUserId, isFirebaseAvailable, db } from '../../config/firebase';
import { cacheManager } from '../../firebase/CacheManager';
import { performanceMonitor } from '../../firebase/PerformanceMonitor';
import { globalWriteBatcher } from '../../firebase/WriteBatcher';

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all-time';

export class LeaderboardService {
  private static pendingSubmissions: Map<string, any> = new Map();
  private static listeners: Map<string, Set<(data: Leaderboard) => void>> = new Map();
  private static cursorCache: Map<string, any> = new Map();

  static async submitScore(
    category: LeaderboardCategory,
    score: number,
    profile: CatProfile,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = await getCurrentUserId();
      const previousScore = await this.getPreviousScore(category, userId);

      const validation = await ScoreValidator.validateScore(
        category,
        score,
        previousScore
      );

      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      const entry: Omit<LeaderboardEntry, 'rank'> = {
        id: `${userId}_${category}_${Date.now()}`,
        userId,
        username: profile.name || 'Anonymous Cat',
        catName: profile.name,
        catPhotoUrl: profile.photoUri || profile.photoUrl,
        score,
        timestamp: Date.now(),
        metadata,
      };

      if (isFirebaseAvailable()) {
        await this.submitToFirebase(category, entry);
      } else {
        await this.queueSubmission(category, entry);
      }

      await this.updateLocalScore(category, entry);

      this.invalidateCache(category);

      return { success: true };
    } catch (error) {
      console.error('Failed to submit score:', error);
      return { success: false, error: 'Submission failed' };
    }
  }

  static async getLeaderboard(
    category: LeaderboardCategory,
    timeframe: Timeframe,
    limit: number = 100
  ): Promise<Leaderboard> {
    const cacheKey = `leaderboard:${category}_${timeframe}`;

    return cacheManager.getOrFetch(
      cacheKey,
      async () => {
        const trace = performanceMonitor.startTrace('leaderboard_fetch');
        trace.putAttribute('category', category);
        trace.putAttribute('timeframe', timeframe);

        try {
          let leaderboard: Leaderboard;

          if (isFirebaseAvailable()) {
            leaderboard = await this.fetchFromFirebase(category, timeframe, limit);
          } else {
            leaderboard = await this.fetchFromLocal(category, timeframe, limit);
          }

          trace.stop();
          return leaderboard;
        } catch (error) {
          console.error('Failed to fetch leaderboard:', error);
          trace.stop();
          return await this.fetchFromLocal(category, timeframe, limit);
        }
      },
      { backgroundRefresh: true }
    );
  }

  static async getUserRank(
    userId: string,
    category: LeaderboardCategory,
    timeframe: Timeframe = 'all-time'
  ): Promise<{ rank: number; percentile: number; entry?: LeaderboardEntry }> {
    try {
      const leaderboard = await this.getLeaderboard(
        category,
        timeframe,
        LEADERBOARD_CONFIG.maxEntriesPerCategory
      );

      const userEntry = leaderboard.entries.find((e) => e.userId === userId);

      if (!userEntry) {
        return { rank: -1, percentile: 0 };
      }

      const totalEntries = leaderboard.entries.length;
      const percentile = ((totalEntries - userEntry.rank + 1) / totalEntries) * 100;

      return {
        rank: userEntry.rank,
        percentile: Math.round(percentile),
        entry: userEntry,
      };
    } catch (error) {
      console.error('Failed to get user rank:', error);
      return { rank: -1, percentile: 0 };
    }
  }

  static subscribeToLeaderboard(
    category: LeaderboardCategory,
    timeframe: Timeframe,
    callback: (data: Leaderboard) => void
  ): () => void {
    const key = `${category}_${timeframe}`;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(callback);

    this.getLeaderboard(category, timeframe).then(callback);

    const interval = setInterval(async () => {
      const data = await this.getLeaderboard(category, timeframe);
      callback(data);
    }, LEADERBOARD_CONFIG.refreshInterval);

    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
      clearInterval(interval);
    };
  }

  private static async submitToFirebase(
    category: LeaderboardCategory,
    entry: Omit<LeaderboardEntry, 'rank'>
  ): Promise<void> {
    const trace = performanceMonitor.startTrace('score_submission');
    trace.putAttribute('category', category);

    try {
      const docRef = doc(db, 'leaderboard_entries', entry.id);
      await setDoc(docRef, {
        ...entry,
        category,
        timestamp: Timestamp.fromMillis(entry.timestamp),
      });

      globalWriteBatcher.enqueue('user_scores', entry.userId, {
        [`${category}_score`]: entry.score,
        [`${category}_timestamp`]: Timestamp.fromMillis(entry.timestamp),
      });

      trace.stop();
    } catch (error) {
      trace.stop();
      throw error;
    }
  }

  private static async fetchFromFirebase(
    category: LeaderboardCategory,
    timeframe: Timeframe,
    limitCount: number
  ): Promise<Leaderboard> {
    try {
      const userId = await getCurrentUserId();
      const constraints: QueryConstraint[] = [
        where('category', '==', category),
        orderBy('score', this.getScoreOrder(category)),
        firestoreLimit(limitCount),
      ];

      if (timeframe !== 'all-time') {
        const cutoff = Date.now() - this.getTimeframeCutoff(timeframe);
        constraints.push(where('timestamp', '>', Timestamp.fromMillis(cutoff)));
      }

      const q = query(collection(db, 'leaderboard_entries'), ...constraints);
      const snapshot = await getDocs(q);

      const entries: LeaderboardEntry[] = snapshot.docs.map((docSnap, index) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          username: data.username,
          catName: data.catName,
          catPhotoUrl: data.catPhotoUrl,
          score: data.score,
          rank: index + 1,
          timestamp: data.timestamp?.toMillis() || Date.now(),
          metadata: data.metadata,
        };
      });

      const userEntry = entries.find(e => e.userId === userId);
      if (!userEntry) {
        const userRankEntry = await this.fetchUserRankFromFirebase(category, timeframe, userId);
        if (userRankEntry) {
          entries.push(userRankEntry);
        }
      }

      return {
        category,
        timeframe,
        entries,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Firebase fetch error:', error);
      return this.fetchFromLocal(category, timeframe, limitCount);
    }
  }

  private static async fetchUserRankFromFirebase(
    category: LeaderboardCategory,
    timeframe: Timeframe,
    userId: string
  ): Promise<LeaderboardEntry | null> {
    try {
      const constraints: QueryConstraint[] = [
        where('category', '==', category),
        where('userId', '==', userId),
      ];

      if (timeframe !== 'all-time') {
        const cutoff = Date.now() - this.getTimeframeCutoff(timeframe);
        constraints.push(where('timestamp', '>', Timestamp.fromMillis(cutoff)));
      }

      const q = query(collection(db, 'leaderboard_entries'), ...constraints);
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        userId: data.userId,
        username: data.username,
        catName: data.catName,
        catPhotoUrl: data.catPhotoUrl,
        score: data.score,
        rank: -1,
        timestamp: data.timestamp?.toMillis() || Date.now(),
        metadata: data.metadata,
      };
    } catch (error) {
      console.error('User rank fetch error:', error);
      return null;
    }
  }

  private static getScoreOrder(category: LeaderboardCategory): 'desc' | 'asc' {
    if (category.startsWith('boss-') && !category.includes('total')) {
      return 'asc';
    }
    if (category === 'memory-match') {
      return 'asc';
    }
    return 'desc';
  }

  private static async fetchFromLocal(
    category: LeaderboardCategory,
    timeframe: Timeframe,
    limit: number
  ): Promise<Leaderboard> {
    try {
      const key = `leaderboard_${category}_${timeframe}`;
      const stored = await AsyncStorage.getItem(key);

      if (!stored) {
        return {
          category,
          timeframe,
          entries: [],
          lastUpdated: Date.now(),
        };
      }

      const data: Leaderboard = JSON.parse(stored);

      const filteredEntries = this.filterByTimeframe(data.entries, timeframe);
      const rankedEntries = this.rankEntries(filteredEntries, category);
      const limitedEntries = rankedEntries.slice(0, limit);

      return {
        category,
        timeframe,
        entries: limitedEntries,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Failed to fetch from local storage:', error);
      return {
        category,
        timeframe,
        entries: [],
        lastUpdated: Date.now(),
      };
    }
  }

  private static async updateLocalScore(
    category: LeaderboardCategory,
    entry: Omit<LeaderboardEntry, 'rank'>
  ): Promise<void> {
    const timeframes: Timeframe[] = ['daily', 'weekly', 'monthly', 'all-time'];

    for (const timeframe of timeframes) {
      const key = `leaderboard_${category}_${timeframe}`;
      const stored = await AsyncStorage.getItem(key);

      let leaderboard: Leaderboard;

      if (stored) {
        leaderboard = JSON.parse(stored);
      } else {
        leaderboard = {
          category,
          timeframe,
          entries: [],
          lastUpdated: Date.now(),
        };
      }

      const existingIndex = leaderboard.entries.findIndex((e) => e.userId === entry.userId);

      if (existingIndex >= 0) {
        const shouldUpdate = this.shouldUpdateScore(
          category,
          entry.score,
          leaderboard.entries[existingIndex].score
        );

        if (shouldUpdate) {
          leaderboard.entries[existingIndex] = { ...entry, rank: 0 };
        }
      } else {
        leaderboard.entries.push({ ...entry, rank: 0 });
      }

      leaderboard.entries = this.rankEntries(leaderboard.entries, category);
      leaderboard.lastUpdated = Date.now();

      await AsyncStorage.setItem(key, JSON.stringify(leaderboard));
    }
  }

  private static shouldUpdateScore(
    category: LeaderboardCategory,
    newScore: number,
    oldScore: number
  ): boolean {
    if (category.startsWith('boss-') && !category.includes('total')) {
      return newScore < oldScore;
    }

    if (category === 'memory-match') {
      return newScore < oldScore;
    }

    return newScore > oldScore;
  }

  private static rankEntries(
    entries: LeaderboardEntry[],
    category: LeaderboardCategory
  ): LeaderboardEntry[] {
    const sortedEntries = [...entries];

    if (category.startsWith('boss-') && !category.includes('total')) {
      sortedEntries.sort((a, b) => a.score - b.score);
    } else if (category === 'memory-match') {
      sortedEntries.sort((a, b) => a.score - b.score);
    } else {
      sortedEntries.sort((a, b) => b.score - a.score);
    }

    return sortedEntries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  private static filterByTimeframe(
    entries: LeaderboardEntry[],
    timeframe: Timeframe
  ): LeaderboardEntry[] {
    if (timeframe === 'all-time') {
      return entries;
    }

    const now = Date.now();
    const cutoff = this.getTimeframeCutoff(timeframe);

    return entries.filter((entry) => now - entry.timestamp < cutoff);
  }

  private static getTimeframeCutoff(timeframe: Timeframe): number {
    switch (timeframe) {
      case 'daily':
        return 24 * 60 * 60 * 1000;
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return Infinity;
    }
  }

  private static async getPreviousScore(
    category: LeaderboardCategory,
    userId: string
  ): Promise<number | undefined> {
    try {
      const key = `leaderboard_${category}_all-time`;
      const stored = await AsyncStorage.getItem(key);

      if (!stored) return undefined;

      const leaderboard: Leaderboard = JSON.parse(stored);
      const userEntry = leaderboard.entries.find((e) => e.userId === userId);

      return userEntry?.score;
    } catch (error) {
      return undefined;
    }
  }

  private static async queueSubmission(
    category: LeaderboardCategory,
    entry: Omit<LeaderboardEntry, 'rank'>
  ): Promise<void> {
    const key = `pending_${category}_${Date.now()}`;
    this.pendingSubmissions.set(key, entry);

    try {
      const queue = await AsyncStorage.getItem('submission_queue');
      const queueData = queue ? JSON.parse(queue) : [];
      queueData.push({ key, category, entry });
      await AsyncStorage.setItem('submission_queue', JSON.stringify(queueData));
    } catch (error) {
      console.error('Failed to queue submission:', error);
    }
  }

  static async invalidateCache(category?: LeaderboardCategory): Promise<void> {
    if (category) {
      await cacheManager.invalidate(`leaderboard:${category}`);
    } else {
      await cacheManager.invalidate('leaderboard:');
    }
  }

  static async syncPendingSubmissions(): Promise<void> {
    if (!isFirebaseAvailable()) return;

    try {
      const queue = await AsyncStorage.getItem('submission_queue');
      if (!queue) return;

      const queueData = JSON.parse(queue);

      for (const item of queueData) {
        await this.submitToFirebase(item.category, item.entry);
        this.pendingSubmissions.delete(item.key);
      }

      await AsyncStorage.removeItem('submission_queue');
    } catch (error) {
      console.error('Failed to sync pending submissions:', error);
    }
  }
}
