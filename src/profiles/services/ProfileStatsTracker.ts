import ProfileManager from './ProfileManager';
import { PreyType, EnvironmentId } from '../../types';

export class ProfileStatsTracker {
  private static instance: ProfileStatsTracker;
  private sessionStartTime: number = 0;
  private lastPlayDate: string = '';

  private constructor() {}

  static getInstance(): ProfileStatsTracker {
    if (!ProfileStatsTracker.instance) {
      ProfileStatsTracker.instance = new ProfileStatsTracker();
    }
    return ProfileStatsTracker.instance;
  }

  async startSession(): Promise<void> {
    this.sessionStartTime = Date.now();
    const today = new Date().toISOString().split('T')[0];

    const profile = await ProfileManager.getActiveProfile();
    if (!profile) return;

    const lastPlayedDate = new Date(profile.lastPlayed).toISOString().split('T')[0];

    if (lastPlayedDate !== today) {
      if (this.isConsecutiveDay(lastPlayedDate, today)) {
        await this.incrementStreak();
      } else {
        await this.resetStreak();
      }
    }

    this.lastPlayDate = today;
  }

  async endSession(): Promise<void> {
    if (this.sessionStartTime === 0) return;

    const duration = Date.now() - this.sessionStartTime;
    await this.recordPlaytime(duration);

    this.sessionStartTime = 0;
  }

  async recordCatch(preyType: PreyType): Promise<void> {
    const profile = await ProfileManager.getActiveProfile();
    if (!profile) return;

    profile.stats.totalCatches++;
    profile.stats.catchesByPreyType[preyType]++;

    await this.updateFavoritePreyType(profile.stats.catchesByPreyType);

    await ProfileManager.updateProfile(profile.id, {
      stats: profile.stats,
      lastPlayed: Date.now(),
    });
  }

  async recordPlaytime(duration: number): Promise<void> {
    const profile = await ProfileManager.getActiveProfile();
    if (!profile) return;

    profile.stats.totalPlaytime += duration;

    await ProfileManager.updateProfile(profile.id, {
      stats: profile.stats,
      lastPlayed: Date.now(),
    });
  }

  async recordEnvironmentTime(environmentId: EnvironmentId, duration: number): Promise<void> {
    const profile = await ProfileManager.getActiveProfile();
    if (!profile) return;

    await this.updateFavoriteEnvironment(environmentId);

    await ProfileManager.updateProfile(profile.id, {
      stats: profile.stats,
      lastPlayed: Date.now(),
    });
  }

  async recordBossAttempt(defeated: boolean): Promise<void> {
    const profile = await ProfileManager.getActiveProfile();
    if (!profile) return;

    profile.stats.bossAttempts++;
    if (defeated) {
      profile.stats.bossDefeats++;
    }

    await ProfileManager.updateProfile(profile.id, {
      stats: profile.stats,
      lastPlayed: Date.now(),
    });
  }

  async recordMiniGame(type: string, score: number): Promise<void> {
    const profile = await ProfileManager.getActiveProfile();
    if (!profile) return;

    profile.stats.miniGamesPlayed++;

    await ProfileManager.updateProfile(profile.id, {
      stats: profile.stats,
      lastPlayed: Date.now(),
    });
  }

  private async updateFavoritePreyType(catches: Record<PreyType, number>): Promise<void> {
    const profile = await ProfileManager.getActiveProfile();
    if (!profile) return;

    let maxCatches = 0;
    let favoriteType: PreyType | undefined;

    for (const [type, count] of Object.entries(catches)) {
      if (count > maxCatches) {
        maxCatches = count;
        favoriteType = type as PreyType;
      }
    }

    if (favoriteType && profile.stats.favoritePreyType !== favoriteType) {
      profile.stats.favoritePreyType = favoriteType;
    }
  }

  private async updateFavoriteEnvironment(environmentId: EnvironmentId): Promise<void> {
    const profile = await ProfileManager.getActiveProfile();
    if (!profile) return;

    profile.stats.favoriteEnvironment = environmentId;
  }

  private async incrementStreak(): Promise<void> {
    const profile = await ProfileManager.getActiveProfile();
    if (!profile) return;

    profile.stats.playStreak++;

    await ProfileManager.updateProfile(profile.id, {
      stats: profile.stats,
    });
  }

  private async resetStreak(): Promise<void> {
    const profile = await ProfileManager.getActiveProfile();
    if (!profile) return;

    profile.stats.playStreak = 1;

    await ProfileManager.updateProfile(profile.id, {
      stats: profile.stats,
    });
  }

  private isConsecutiveDay(lastDate: string, currentDate: string): boolean {
    const last = new Date(lastDate);
    const current = new Date(currentDate);

    const diffTime = current.getTime() - last.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === 1;
  }

  async getStats() {
    const profile = await ProfileManager.getActiveProfile();
    if (!profile) return null;

    return {
      totalPlaytime: profile.stats.totalPlaytime,
      totalCatches: profile.stats.totalCatches,
      catchesByPreyType: profile.stats.catchesByPreyType,
      favoritePreyType: profile.stats.favoritePreyType,
      favoriteEnvironment: profile.stats.favoriteEnvironment,
      bossAttempts: profile.stats.bossAttempts,
      bossDefeats: profile.stats.bossDefeats,
      miniGamesPlayed: profile.stats.miniGamesPlayed,
      playStreak: profile.stats.playStreak,
    };
  }
}

export default ProfileStatsTracker.getInstance();
