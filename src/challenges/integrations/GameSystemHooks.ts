import { ProgressTracker } from '../services/ProgressTracker';
import type { PreyType, EnvironmentId, MiniGameType } from '../../types';

export class GameSystemHooks {
  static onGameCatch(preyType: PreyType): void {
    ProgressTracker.onCatch(preyType).catch(error => {
      console.error('Failed to track catch:', error);
    });
  }

  static onBossDefeat(bossType: string, defeatTime: number): void {
    ProgressTracker.onBossDefeat(bossType).catch(error => {
      console.error('Failed to track boss defeat:', error);
    });
  }

  static onMiniGameComplete(gameType: MiniGameType, score: number): void {
    ProgressTracker.onMiniGameComplete(gameType).catch(error => {
      console.error('Failed to track mini-game completion:', error);
    });
  }

  static onEnvironmentChange(envId: EnvironmentId): void {
    ProgressTracker.onEnvironmentChange(envId).catch(error => {
      console.error('Failed to track environment change:', error);
    });
  }

  static onPlaytimeIncrement(duration: number): void {
    ProgressTracker.onPlaytimeIncrement(duration).catch(error => {
      console.error('Failed to track playtime:', error);
    });
  }

  static onStreakUpdate(streakDays: number): void {
    ProgressTracker.onStreakUpdate(streakDays).catch(error => {
      console.error('Failed to track streak:', error);
    });
  }

  static onLeaderboardRankAchieved(rank: number, category: string): void {
    ProgressTracker.onLeaderboardRankAchieved(rank, category).catch(error => {
      console.error('Failed to track leaderboard rank:', error);
    });
  }

  static onSocialShare(): void {
    ProgressTracker.onSocialShare().catch(error => {
      console.error('Failed to track social share:', error);
    });
  }

  static getComboCount(): number {
    return ProgressTracker.getComboCount();
  }

  static resetCombo(): void {
    ProgressTracker.resetCombo();
  }
}
