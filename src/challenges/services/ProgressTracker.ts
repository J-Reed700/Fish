import { ChallengeManager } from './ChallengeManager';
import type { PreyType, EnvironmentId, MiniGameType, CommunityChallenge } from '../../types';

class ProgressTrackerClass {
  private userId: string = '';
  private profileId: string = '';
  private sessionCatches: Map<PreyType, number> = new Map();
  private sessionPlaytime: number = 0;
  private comboCount: number = 0;
  private lastCatchTime: number = 0;
  private comboWindow: number = 2000;
  private environmentVisits: Set<EnvironmentId> = new Set();
  private miniGamesCompleted: Set<MiniGameType> = new Set();

  initialize(userId: string, profileId: string): void {
    this.userId = userId;
    this.profileId = profileId;
    this.resetSession();
  }

  private resetSession(): void {
    this.sessionCatches.clear();
    this.sessionPlaytime = 0;
    this.comboCount = 0;
    this.lastCatchTime = 0;
    this.environmentVisits.clear();
    this.miniGamesCompleted.clear();
  }

  async onCatch(preyType: PreyType): Promise<void> {
    if (!this.userId || !this.profileId) return;

    const currentTime = Date.now();
    const timeSinceLastCatch = currentTime - this.lastCatchTime;

    if (timeSinceLastCatch <= this.comboWindow) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }

    this.lastCatchTime = currentTime;

    const currentCount = this.sessionCatches.get(preyType) || 0;
    this.sessionCatches.set(preyType, currentCount + 1);

    await this.checkCatchChallenges(preyType);
    await this.checkComboChallenges();
    await this.checkVarietyChallenges();
  }

  private async checkCatchChallenges(preyType: PreyType): Promise<void> {
    const challenges = ChallengeManager.getAllActiveChallenges();

    for (const challenge of challenges) {
      if (challenge.category === 'catch') {
        const criteria = challenge.requirement.criteria;

        if (!criteria?.preyType || criteria.preyType === preyType) {
          await ChallengeManager.trackProgress(
            this.userId,
            this.profileId,
            challenge.id,
            1
          );
        }
      }
    }
  }

  private async checkComboChallenges(): Promise<void> {
    const challenges = ChallengeManager.getAllActiveChallenges();

    for (const challenge of challenges) {
      if (challenge.category === 'combo') {
        const progress = ChallengeManager.getUserProgress(challenge.id);
        if (progress && this.comboCount > progress.progress) {
          await ChallengeManager.trackProgress(
            this.userId,
            this.profileId,
            challenge.id,
            this.comboCount - progress.progress
          );
        }
      }
    }
  }

  private async checkVarietyChallenges(): Promise<void> {
    const challenges = ChallengeManager.getAllActiveChallenges();
    const uniquePreyTypes = this.sessionCatches.size;

    for (const challenge of challenges) {
      if (challenge.category === 'variety') {
        const progress = ChallengeManager.getUserProgress(challenge.id);
        if (progress && uniquePreyTypes > progress.progress) {
          await ChallengeManager.trackProgress(
            this.userId,
            this.profileId,
            challenge.id,
            uniquePreyTypes - progress.progress
          );
        }
      }
    }
  }

  async onBossDefeat(bossType: string): Promise<void> {
    if (!this.userId || !this.profileId) return;

    const challenges = ChallengeManager.getAllActiveChallenges();

    for (const challenge of challenges) {
      if (challenge.category === 'boss') {
        const criteria = challenge.requirement.criteria;

        if (!criteria?.bossType || criteria.bossType === bossType) {
          await ChallengeManager.trackProgress(
            this.userId,
            this.profileId,
            challenge.id,
            1
          );
        }
      }
    }
  }

  async onMiniGameComplete(gameType: MiniGameType): Promise<void> {
    if (!this.userId || !this.profileId) return;

    this.miniGamesCompleted.add(gameType);

    const challenges = ChallengeManager.getAllActiveChallenges();

    for (const challenge of challenges) {
      if (challenge.category === 'mini-game') {
        const criteria = challenge.requirement.criteria;

        if (criteria?.requireAll) {
          const completedCount = this.miniGamesCompleted.size;
          const progress = ChallengeManager.getUserProgress(challenge.id);
          if (progress && completedCount > progress.progress) {
            await ChallengeManager.trackProgress(
              this.userId,
              this.profileId,
              challenge.id,
              completedCount - progress.progress
            );
          }
        } else if (!criteria?.gameType || criteria.gameType === gameType) {
          await ChallengeManager.trackProgress(
            this.userId,
            this.profileId,
            challenge.id,
            1
          );
        }
      }
    }
  }

  async onEnvironmentChange(envId: EnvironmentId): Promise<void> {
    if (!this.userId || !this.profileId) return;

    this.environmentVisits.add(envId);

    const challenges = ChallengeManager.getAllActiveChallenges();

    for (const challenge of challenges) {
      if (challenge.category === 'environment') {
        const criteria = challenge.requirement.criteria;

        if (!criteria?.environmentId || criteria.environmentId === envId) {
          await ChallengeManager.trackProgress(
            this.userId,
            this.profileId,
            challenge.id,
            1
          );
        }
      }
    }
  }

  async onPlaytimeIncrement(duration: number): Promise<void> {
    if (!this.userId || !this.profileId) return;

    this.sessionPlaytime += duration;

    const challenges = ChallengeManager.getAllActiveChallenges();

    for (const challenge of challenges) {
      if (challenge.category === 'time') {
        await ChallengeManager.trackProgress(
          this.userId,
          this.profileId,
          challenge.id,
          duration
        );
      }
    }
  }

  async onStreakUpdate(streakDays: number): Promise<void> {
    if (!this.userId || !this.profileId) return;

    const challenges = ChallengeManager.getAllActiveChallenges();

    for (const challenge of challenges) {
      if (challenge.category === 'streak') {
        const progress = ChallengeManager.getUserProgress(challenge.id);
        if (progress && streakDays > progress.progress) {
          await ChallengeManager.trackProgress(
            this.userId,
            this.profileId,
            challenge.id,
            streakDays - progress.progress
          );
        }
      }
    }
  }

  async onLeaderboardRankAchieved(rank: number, category: string): Promise<void> {
    if (!this.userId || !this.profileId) return;

    const challenges = ChallengeManager.getAllActiveChallenges();

    for (const challenge of challenges) {
      if (challenge.category === 'leaderboard') {
        const criteria = challenge.requirement.criteria;
        const targetRank = criteria?.rank || 100;

        if (rank <= targetRank && (!criteria?.category || criteria.category === category)) {
          await ChallengeManager.trackProgress(
            this.userId,
            this.profileId,
            challenge.id,
            1
          );
        }
      }
    }
  }

  async onSocialShare(): Promise<void> {
    if (!this.userId || !this.profileId) return;

    const challenges = ChallengeManager.getAllActiveChallenges();

    for (const challenge of challenges) {
      if (challenge.category === 'social') {
        await ChallengeManager.trackProgress(
          this.userId,
          this.profileId,
          challenge.id,
          1
        );
      }
    }
  }

  getComboCount(): number {
    return this.comboCount;
  }

  resetCombo(): void {
    this.comboCount = 0;
    this.lastCatchTime = 0;
  }

  getSessionStats() {
    return {
      catches: this.sessionCatches,
      playtime: this.sessionPlaytime,
      comboCount: this.comboCount,
      environmentsVisited: this.environmentVisits.size,
      miniGamesCompleted: this.miniGamesCompleted.size,
    };
  }
}

export const ProgressTracker = new ProgressTrackerClass();
