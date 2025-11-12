import { db } from '../../config/firebase';
import { LevelManager } from './LevelManager';
import type { ChallengeReward } from '../../types';

export interface RewardResult {
  success: boolean;
  xpGained: number;
  badgesUnlocked: string[];
  currencyGained: number;
  contentUnlocked: string[];
  leveledUp: boolean;
  newLevel?: number;
}

class RewardManagerClass {
  async grantReward(userId: string, reward: ChallengeReward): Promise<RewardResult> {
    const result: RewardResult = {
      success: false,
      xpGained: 0,
      badgesUnlocked: [],
      currencyGained: 0,
      contentUnlocked: [],
      leveledUp: false,
    };

    try {
      if (reward.xp > 0) {
        const xpResult = await this.grantXP(userId, reward.xp);
        result.xpGained = reward.xp;
        result.leveledUp = xpResult.leveledUp;
        result.newLevel = xpResult.newLevel;
      }

      if (reward.badges && reward.badges.length > 0) {
        await this.unlockBadges(userId, reward.badges);
        result.badgesUnlocked = reward.badges;
      }

      if (reward.premiumCurrency && reward.premiumCurrency > 0) {
        await this.grantPremiumCurrency(userId, reward.premiumCurrency);
        result.currencyGained = reward.premiumCurrency;
      }

      if (reward.unlocks && reward.unlocks.length > 0) {
        await this.unlockContent(userId, reward.unlocks);
        result.contentUnlocked = reward.unlocks;
      }

      result.success = true;
      return result;
    } catch (error) {
      console.error('Failed to grant reward:', error);
      return result;
    }
  }

  async grantXP(userId: string, xpAmount: number): Promise<{ leveledUp: boolean; newLevel?: number }> {
    return await LevelManager.addXP(userId, xpAmount);
  }

  calculateXP(difficulty: 'beginner' | 'intermediate' | 'expert', baseXP: number): number {
    const multipliers = {
      beginner: 1.0,
      intermediate: 1.5,
      expert: 2.0,
    };

    return Math.floor(baseXP * multipliers[difficulty]);
  }

  async unlockBadge(userId: string, badgeId: string): Promise<void> {
    try {
      if (!db) return;
    } catch (error) {
      console.error('Failed to unlock badge:', error);
    }
  }

  async unlockBadges(userId: string, badges: string[]): Promise<void> {
    for (const badge of badges) {
      await this.unlockBadge(userId, badge);
    }
  }

  async grantPremiumCurrency(userId: string, amount: number): Promise<void> {
    try {
      if (!db) return;
    } catch (error) {
      console.error('Failed to grant premium currency:', error);
    }
  }

  async unlockContent(userId: string, contentIds: string[]): Promise<void> {
    try {
      if (!db) return;
    } catch (error) {
      console.error('Failed to unlock content:', error);
    }
  }

  async applyLeaderboardBoost(userId: string, boostMultiplier: number, duration: number): Promise<void> {
    try {
      if (!db) return;
    } catch (error) {
      console.error('Failed to apply leaderboard boost:', error);
    }
  }

  formatRewardText(reward: ChallengeReward): string {
    const parts: string[] = [];

    if (reward.xp > 0) {
      parts.push(`${reward.xp} XP`);
    }

    if (reward.badges && reward.badges.length > 0) {
      parts.push(`${reward.badges.length} Badge${reward.badges.length > 1 ? 's' : ''}`);
    }

    if (reward.premiumCurrency && reward.premiumCurrency > 0) {
      parts.push(`${reward.premiumCurrency} Fish Coins`);
    }

    if (reward.unlocks && reward.unlocks.length > 0) {
      parts.push(`${reward.unlocks.length} Unlock${reward.unlocks.length > 1 ? 's' : ''}`);
    }

    if (reward.leaderboardBoost) {
      parts.push(`${reward.leaderboardBoost}x Leaderboard Boost`);
    }

    return parts.join(', ');
  }
}

export const RewardManager = new RewardManagerClass();
