import AsyncStorageAdapter from '../storage/AsyncStorageAdapter';
import {
  Achievement,
  GameMode,
  FishSpecies,
} from '../types';

const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first-catch',
    category: 'progress',
    tier: 'bronze',
    title: 'First Catch',
    description: 'Catch your first fish',
    icon: '🎣',
    requirement: { type: 'total-catches', target: 1 },
    reward: { points: 10, badge: 'beginner' },
  },
  {
    id: 'century-club',
    category: 'progress',
    tier: 'silver',
    title: 'Century Club',
    description: 'Catch 100 fish',
    icon: '💯',
    requirement: { type: 'total-catches', target: 100 },
    reward: { points: 50, badge: 'centurion' },
  },
  {
    id: 'marathon-session',
    category: 'progress',
    tier: 'silver',
    title: 'Marathon Session',
    description: 'Play for 30 minutes in one session',
    icon: '⏱️',
    requirement: { type: 'session-time', target: 1800 },
    reward: { points: 30 },
  },
  {
    id: 'mode-master',
    category: 'progress',
    tier: 'silver',
    title: 'Mode Master',
    description: 'Try all game modes',
    icon: '🎮',
    requirement: {
      type: 'modes-played',
      target: ['free-swim', 'hunt', 'bubbles', 'frenzy', 'mouse', 'laser', 'insect'],
    },
    reward: { points: 40 },
  },
  {
    id: 'species-collector',
    category: 'progress',
    tier: 'gold',
    title: 'Species Collector',
    description: 'Catch all 8 fish species',
    icon: '🐠',
    requirement: {
      type: 'species-caught',
      target: ['goldfish', 'clownfish', 'angelfish', 'betta', 'guppy', 'neon-tetra', 'koi', 'molly'],
    },
    reward: { points: 100, badge: 'collector' },
  },
  {
    id: 'week-warrior',
    category: 'skill',
    tier: 'gold',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    requirement: { type: 'streak', target: 7 },
    reward: { points: 75, badge: 'dedicated' },
  },
  {
    id: 'challenge-champion',
    category: 'skill',
    tier: 'gold',
    title: 'Challenge Champion',
    description: 'Complete 25 daily challenges',
    icon: '🏆',
    requirement: { type: 'challenges', target: 25 },
    reward: { points: 150, badge: 'champion' },
  },
  {
    id: 'perfect-hunter',
    category: 'skill',
    tier: 'gold',
    title: 'Perfect Hunter',
    description: '20 catches without missing',
    icon: '🎯',
    requirement: { type: 'perfect-catches', target: 20 },
    reward: { points: 200, badge: 'perfectionist' },
  },
  {
    id: 'night-owl',
    category: 'fun',
    tier: 'special',
    title: 'Night Owl',
    description: 'Play between midnight and 4 AM',
    icon: '🦉',
    requirement: { type: 'time-of-day', target: ['0', '1', '2', '3'] },
    reward: { points: 25, badge: 'night-owl' },
  },
  {
    id: 'social-butterfly',
    category: 'social',
    tier: 'silver',
    title: 'Social Butterfly',
    description: 'Share 5 screenshots',
    icon: '📸',
    requirement: { type: 'screenshots', target: 5 },
    reward: { points: 30, badge: 'social' },
  },
];

export interface AchievementSessionData {
  totalCatches: number;
  sessionTime: number;
  modesPlayed: Set<GameMode>;
  speciesCaught: Set<FishSpecies>;
  currentStreak: number;
  challengesCompleted: number;
  perfectCatchStreak: number;
  timeOfDay: number;
  screenshotsShared: number;
}

export class AchievementManager {
  static getAllAchievements(): Achievement[] {
    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: false,
      progress: 0,
    }));
  }

  static async loadAchievements(profileId: string): Promise<Achievement[]> {
    const stored = await AsyncStorageAdapter.get<Achievement[]>(`achievements:${profileId}`);

    if (!stored) {
      const defaults = this.getAllAchievements();
      await AsyncStorageAdapter.set(`achievements:${profileId}`, defaults);
      return defaults;
    }

    const allAchievements = this.getAllAchievements();
    const storedMap = new Map(stored.map((a: Achievement) => [a.id, a]));

    return allAchievements.map((achievement): Achievement => {
      const storedAchievement = storedMap.get(achievement.id);
      return storedAchievement || achievement;
    });
  }

  static async checkAchievements(
    profileId: string,
    sessionData: AchievementSessionData
  ): Promise<Achievement[]> {
    const achievements = await this.loadAchievements(profileId);
    const newlyUnlocked: Achievement[] = [];

    achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let isUnlocked = false;
      let progress = 0;

      switch (achievement.requirement.type) {
        case 'total-catches':
          progress = sessionData.totalCatches;
          isUnlocked = progress >= (achievement.requirement.target as number);
          break;

        case 'session-time':
          progress = sessionData.sessionTime;
          isUnlocked = progress >= (achievement.requirement.target as number);
          break;

        case 'modes-played':
          const targetModes = achievement.requirement.target as string[];
          progress = Array.from(sessionData.modesPlayed).filter(m =>
            targetModes.includes(m)
          ).length;
          isUnlocked = progress >= targetModes.length;
          break;

        case 'species-caught':
          const targetSpecies = achievement.requirement.target as string[];
          progress = Array.from(sessionData.speciesCaught).filter(s =>
            targetSpecies.includes(s)
          ).length;
          isUnlocked = progress >= targetSpecies.length;
          break;

        case 'streak':
          progress = sessionData.currentStreak;
          isUnlocked = progress >= (achievement.requirement.target as number);
          break;

        case 'challenges':
          progress = sessionData.challengesCompleted;
          isUnlocked = progress >= (achievement.requirement.target as number);
          break;

        case 'perfect-catches':
          progress = sessionData.perfectCatchStreak;
          isUnlocked = progress >= (achievement.requirement.target as number);
          break;

        case 'time-of-day':
          const targetHours = achievement.requirement.target as string[];
          isUnlocked = targetHours.includes(sessionData.timeOfDay.toString());
          progress = isUnlocked ? 1 : 0;
          break;

        case 'screenshots':
          progress = sessionData.screenshotsShared;
          isUnlocked = progress >= (achievement.requirement.target as number);
          break;
      }

      achievement.progress = progress;

      if (isUnlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        newlyUnlocked.push(achievement);
      }
    });

    await AsyncStorageAdapter.set(`achievements:${profileId}`, achievements);

    return newlyUnlocked;
  }

  static async unlockAchievement(
    profileId: string,
    achievementId: string
  ): Promise<void> {
    const achievements = await this.loadAchievements(profileId);
    const achievement = achievements.find(a => a.id === achievementId);

    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
      await AsyncStorageAdapter.set(`achievements:${profileId}`, achievements);
    }
  }

  static getProgress(achievement: Achievement, currentValue: number): number {
    const target = achievement.requirement.target;
    if (typeof target === 'number') {
      return Math.min(100, (currentValue / target) * 100);
    }
    return Math.min(100, (currentValue / target.length) * 100);
  }

  static async getTotalPoints(profileId: string): Promise<number> {
    const achievements = await this.loadAchievements(profileId);
    return achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.reward.points, 0);
  }

  static async getUnlockedCount(profileId: string): Promise<number> {
    const achievements = await this.loadAchievements(profileId);
    return achievements.filter(a => a.unlocked).length;
  }
}
