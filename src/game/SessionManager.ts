import type { FishSpecies, GameMode, SessionRecord, SessionData } from '../types';
import { StatsManager } from '../analytics/StatsManager';
import { ChallengeManager } from '../challenges/ChallengeManager';
import { StreakTracker } from '../challenges/StreakTracker';
import { AchievementManager } from '../achievements/AchievementManager';
import AsyncStorageAdapter from '../storage/AsyncStorageAdapter';

export interface SessionState {
  startTime: number;
  duration: number;
  isActive: boolean;
  isPaused: boolean;
  touchCount: number;
  lastTouchTime: number;
  fishCaughtBySpecies: Record<FishSpecies, number>;
  mode: GameMode;
  modesPlayed: GameMode[];
  consecutiveCatches: number;
  maxConsecutiveCatches: number;
  missedCatches: number;
}

export interface SessionStats {
  playTime: number;
  touchCount: number;
  catchRate: number;
  fishCaughtBySpecies: Record<FishSpecies, number>;
}

const INACTIVITY_THRESHOLD = 30000;
const EXTENDED_INACTIVITY_THRESHOLD = 120000;

export class SessionManager {
  static create(duration: number, mode: GameMode = 'free-swim'): SessionState {
    return {
      startTime: Date.now(),
      duration,
      isActive: true,
      isPaused: false,
      touchCount: 0,
      lastTouchTime: Date.now(),
      mode,
      modesPlayed: [mode],
      consecutiveCatches: 0,
      maxConsecutiveCatches: 0,
      missedCatches: 0,
      fishCaughtBySpecies: {
        goldfish: 0,
        clownfish: 0,
        angelfish: 0,
        betta: 0,
        guppy: 0,
        'neon-tetra': 0,
        koi: 0,
        molly: 0,
      },
    };
  }

  static update(
    session: SessionState,
    deltaTime: number,
    touched: boolean
  ): SessionState {
    const now = Date.now();

    if (touched) {
      return {
        ...session,
        touchCount: session.touchCount + 1,
        lastTouchTime: now,
      };
    }

    return session;
  }

  static shouldAutoPause(session: SessionState, currentTime: number): boolean {
    if (session.isPaused || !session.isActive) return false;

    const timeSinceLastTouch = currentTime - session.lastTouchTime;
    return timeSinceLastTouch >= INACTIVITY_THRESHOLD;
  }

  static shouldComplete(session: SessionState): boolean {
    const now = Date.now();
    const elapsed = now - session.startTime;

    if (session.duration > 0 && elapsed >= session.duration * 1000) {
      return true;
    }

    const timeSinceLastTouch = now - session.lastTouchTime;
    if (timeSinceLastTouch >= EXTENDED_INACTIVITY_THRESHOLD) {
      return true;
    }

    return false;
  }

  static getStats(session: SessionState): SessionStats {
    const now = Date.now();
    const playTime = (now - session.startTime) / 1000;
    const catchRate = playTime > 0 ? (session.touchCount / playTime) * 60 : 0;

    return {
      playTime,
      touchCount: session.touchCount,
      catchRate,
      fishCaughtBySpecies: session.fishCaughtBySpecies,
    };
  }

  static pause(session: SessionState): SessionState {
    return {
      ...session,
      isPaused: true,
    };
  }

  static resume(session: SessionState): SessionState {
    return {
      ...session,
      isPaused: false,
      lastTouchTime: Date.now(),
    };
  }

  static end(session: SessionState): SessionState {
    return {
      ...session,
      isActive: false,
      isPaused: true,
    };
  }

  static recordCatch(
    session: SessionState,
    species: FishSpecies
  ): SessionState {
    const consecutiveCatches = session.consecutiveCatches + 1;
    return {
      ...session,
      fishCaughtBySpecies: {
        ...session.fishCaughtBySpecies,
        [species]: session.fishCaughtBySpecies[species] + 1,
      },
      consecutiveCatches,
      maxConsecutiveCatches: Math.max(session.maxConsecutiveCatches, consecutiveCatches),
    };
  }

  static recordMiss(session: SessionState): SessionState {
    return {
      ...session,
      consecutiveCatches: 0,
      missedCatches: session.missedCatches + 1,
    };
  }

  static changeMode(session: SessionState, mode: GameMode): SessionState {
    if (!session.modesPlayed.includes(mode)) {
      return {
        ...session,
        mode,
        modesPlayed: [...session.modesPlayed, mode],
      };
    }
    return {
      ...session,
      mode,
    };
  }

  static async completeSession(
    session: SessionState,
    profileId: string
  ): Promise<void> {
    const endTime = Date.now();
    const duration = (endTime - session.startTime) / 1000;

    const sessionRecord: SessionRecord = {
      id: `session-${endTime}-${Math.random().toString(36).substr(2, 9)}`,
      profileId,
      startTime: session.startTime,
      endTime,
      duration,
      mode: session.mode,
      touchCount: session.touchCount,
      catchesBySpecies: session.fishCaughtBySpecies,
      fishCount: Object.values(session.fishCaughtBySpecies).reduce(
        (sum, count) => sum + count,
        0
      ),
    };

    await StatsManager.recordSession(sessionRecord);

    await StreakTracker.updateAndSaveStreak(profileId);

    const today = StreakTracker.getTodayDate();
    const challenges = await ChallengeManager.loadChallenges(profileId, today);

    if (challenges) {
      const sessionData: SessionData = {
        catchCount: Object.values(session.fishCaughtBySpecies).reduce(
          (sum, count) => sum + count,
          0
        ),
        playTime: Math.floor(duration),
        modesPlayed: session.modesPlayed,
        speciesCaught: Object.entries(session.fishCaughtBySpecies)
          .filter(([_, count]) => count > 0)
          .map(([species]) => species as FishSpecies),
        perfectCatches: session.maxConsecutiveCatches,
      };

      const updatedChallenges = ChallengeManager.updateChallenges(
        challenges,
        sessionData
      );

      await ChallengeManager.saveChallenges(profileId, today, updatedChallenges);

      for (const challenge of updatedChallenges) {
        if (challenge.completed && !challenges.find(c => c.id === challenge.id)?.completed) {
          await ChallengeManager.grantReward(challenge.reward, profileId);
        }
      }
    }

    const stats = await StatsManager.getStats(profileId);
    const streakData = await StreakTracker.loadStreak(profileId);
    const screenshots = await AsyncStorageAdapter.get<any[]>(`screenshots:${profileId}`) || [];

    const challengesCompleted = challenges?.filter(c => c.completed).length || 0;

    const newAchievements = await AchievementManager.checkAchievements(
      profileId,
      {
        totalCatches: stats.totalCatches,
        sessionTime: Math.floor(duration),
        modesPlayed: new Set(session.modesPlayed),
        speciesCaught: new Set(
          Object.entries(session.fishCaughtBySpecies)
            .filter(([_, count]) => count > 0)
            .map(([species]) => species as FishSpecies)
        ),
        currentStreak: streakData.currentStreak,
        challengesCompleted,
        perfectCatchStreak: session.maxConsecutiveCatches,
        timeOfDay: new Date().getHours(),
        screenshotsShared: screenshots.length,
      }
    );

    if (newAchievements.length > 0) {
      await AsyncStorageAdapter.set(
        `newAchievements:${profileId}`,
        newAchievements
      );
    }
  }
}
