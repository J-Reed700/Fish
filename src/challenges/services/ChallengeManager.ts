import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  increment as firestoreIncrement,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type {
  CommunityChallenge,
  UserChallengeProgress,
  CommunityChallengeProgress,
  CommunityChallengeType
} from '../../types';
import { cacheManager } from '../../firebase/CacheManager';
import { performanceMonitor } from '../../firebase/PerformanceMonitor';

class ChallengeManagerClass {
  private activeChallenges: CommunityChallenge[] = [];
  private userProgress: Map<string, UserChallengeProgress> = new Map();
  private communityProgress: Map<string, CommunityChallengeProgress> = new Map();
  private unsubscribers: Unsubscribe[] = [];
  private lastUpdateTime: number = 0;
  private updateThrottle: number = 5000;
  private progressBuffer: Map<string, number> = new Map();
  private bufferFlushInterval: NodeJS.Timeout | null = null;

  async initialize(userId: string, profileId: string): Promise<void> {
    await this.loadActiveChallenges();
    await this.loadUserProgress(userId, profileId);
    this.subscribeToUpdates(userId, profileId);
    this.startBufferFlush();
  }

  async loadActiveChallenges(): Promise<CommunityChallenge[]> {
    const cacheKey = 'challenges:active';

    return cacheManager.getOrFetch(
      cacheKey,
      async () => {
        const trace = performanceMonitor.startTrace('challenges_load');

        try {
          if (!db) {
            console.warn('Firebase not configured - using empty challenges');
            return [];
          }

          const now = Date.now();
          const challengesRef = collection(db, 'challenges');
          const q = query(
            challengesRef,
            where('isActive', '==', true),
            where('endTime', '>', now)
          );

          const snapshot = await getDocs(q);
          this.activeChallenges = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as CommunityChallenge));

          trace.stop();
          return this.activeChallenges;
        } catch (error) {
          console.error('Failed to load active challenges:', error);
          trace.stop();
          return [];
        }
      },
      { backgroundRefresh: true }
    );
  }

  async loadUserProgress(userId: string, profileId: string): Promise<void> {
    try {
      if (!db) {
        return;
      }
      for (const challenge of this.activeChallenges) {
        const newProgress: UserChallengeProgress = {
          challengeId: challenge.id,
          userId,
          profileId,
          progress: 0,
          target: challenge.requirement.target,
          isCompleted: false,
          claimedReward: false,
        };
        this.userProgress.set(challenge.id, newProgress);
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  }

  subscribeToUpdates(userId: string, profileId: string): void {
    if (!db) {
      return;
    }
  }

  async trackProgress(
    userId: string,
    profileId: string,
    challengeId: string,
    increment: number
  ): Promise<void> {
    try {
      const progress = this.userProgress.get(challengeId);
      if (!progress || progress.isCompleted) {
        return;
      }

      const bufferedProgress = this.progressBuffer.get(challengeId) || 0;
      const totalProgress = bufferedProgress + increment;
      this.progressBuffer.set(challengeId, totalProgress);

      const newProgress = Math.min(progress.progress + totalProgress, progress.target);
      const isCompleted = newProgress >= progress.target;

      const updatedProgress: UserChallengeProgress = {
        ...progress,
        progress: newProgress,
        isCompleted,
        completedAt: isCompleted ? Date.now() : undefined,
      };

      this.userProgress.set(challengeId, updatedProgress);

      if (isCompleted) {
        console.log(`Challenge ${challengeId} completed!`);
        await this.flushProgressBuffer(userId);
      }
    } catch (error) {
      console.error('Failed to track progress:', error);
    }
  }

  private startBufferFlush(): void {
    if (this.bufferFlushInterval) {
      return;
    }

    this.bufferFlushInterval = setInterval(() => {
      this.flushProgressBuffer();
    }, this.updateThrottle);
  }

  private async flushProgressBuffer(userId?: string): Promise<void> {
    if (!db || this.progressBuffer.size === 0) {
      return;
    }

    const trace = performanceMonitor.startTrace('challenge_progress_flush');
    trace.putAttribute('buffer_size', String(this.progressBuffer.size));

    try {
      const batch = writeBatch(db);
      const currentUserId = userId || (await this.getCurrentUserId());

      for (const [challengeId, increment] of this.progressBuffer.entries()) {
        const progressRef = doc(
          db,
          'user_challenge_progress',
          currentUserId,
          'challenges',
          challengeId
        );

        batch.update(progressRef, {
          progress: firestoreIncrement(increment),
        });

        const challenge = this.activeChallenges.find(c => c.id === challengeId);
        if (challenge?.type === 'community') {
          const communityRef = doc(db, 'community_challenge_progress', challengeId);
          batch.update(communityRef, {
            globalProgress: firestoreIncrement(increment),
            [`contributions.${currentUserId}`]: firestoreIncrement(increment),
          });
        }
      }

      await batch.commit();
      this.progressBuffer.clear();
      this.lastUpdateTime = Date.now();

      trace.stop();
    } catch (error) {
      console.error('Failed to flush progress buffer:', error);
      trace.stop();
    }
  }

  private async getCurrentUserId(): Promise<string> {
    return 'user_default';
  }

  private async updateCommunityProgress(
    challengeId: string,
    userId: string,
    increment: number
  ): Promise<void> {
    try {
      if (!db) {
        return;
      }
    } catch (error) {
      console.error('Failed to update community progress:', error);
    }
  }

  async completeChallenge(challengeId: string): Promise<void> {
    const progress = this.userProgress.get(challengeId);
    if (!progress || !progress.isCompleted || progress.claimedReward) {
      return;
    }

    progress.claimedReward = true;
    this.userProgress.set(challengeId, progress);
  }

  async claimReward(userId: string, challengeId: string): Promise<void> {
    try {
      const progress = this.userProgress.get(challengeId);
      if (!progress || !progress.isCompleted || progress.claimedReward) {
        return;
      }

      if (db) {
        // Firebase update would go here
      }

      progress.claimedReward = true;
      this.userProgress.set(challengeId, progress);
    } catch (error) {
      console.error('Failed to claim reward:', error);
    }
  }

  getChallengesByType(type: CommunityChallengeType): CommunityChallenge[] {
    return this.activeChallenges.filter(c => c.type === type);
  }

  getUserProgress(challengeId: string): UserChallengeProgress | undefined {
    return this.userProgress.get(challengeId);
  }

  getAllActiveChallenges(): CommunityChallenge[] {
    return this.activeChallenges;
  }

  async checkExpiredChallenges(): Promise<void> {
    const now = Date.now();
    const expired = this.activeChallenges.filter(c => c.endTime < now);

    for (const challenge of expired) {
      try {
        if (db) {
          // Firebase update would go here
        }
      } catch (error) {
        console.error(`Failed to deactivate expired challenge ${challenge.id}:`, error);
      }
    }

    this.activeChallenges = this.activeChallenges.filter(c => c.endTime >= now);
  }

  async cleanup(): Promise<void> {
    if (this.bufferFlushInterval) {
      clearInterval(this.bufferFlushInterval);
      this.bufferFlushInterval = null;
    }

    await this.flushProgressBuffer();

    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.activeChallenges = [];
    this.userProgress.clear();
    this.communityProgress.clear();
  }
}

export const ChallengeManager = new ChallengeManagerClass();
