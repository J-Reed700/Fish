import { db } from '../../config/firebase';
import type { PlayerLevel } from '../../types';

const LEVEL_TITLES: Record<number, string> = {
  1: 'Kitten Keeper',
  6: 'Cat Companion',
  11: 'Feline Friend',
  21: 'Cat Whisperer',
  31: 'Master of Meows',
  51: 'Purrfect Player',
  76: 'Legendary Cat Lord',
  100: 'Supreme Feline Master',
};

const XP_BASE = 100;
const XP_EXPONENT = 1.5;

class LevelManagerClass {
  private userLevel: Map<string, PlayerLevel> = new Map();

  async getUserLevel(userId: string): Promise<PlayerLevel> {
    const cached = this.userLevel.get(userId);
    if (cached) {
      return cached;
    }

    try {
      if (!db) {
        const initialLevel: PlayerLevel = {
          level: 1,
          currentXP: 0,
          xpToNextLevel: this.calculateXPForLevel(2),
          totalXP: 0,
          title: LEVEL_TITLES[1],
        };
        this.userLevel.set(userId, initialLevel);
        return initialLevel;
      }

      const initialLevel: PlayerLevel = {
        level: 1,
        currentXP: 0,
        xpToNextLevel: this.calculateXPForLevel(2),
        totalXP: 0,
        title: LEVEL_TITLES[1],
      };
      this.userLevel.set(userId, initialLevel);
      return initialLevel;
    } catch (error) {
      console.error('Failed to get user level:', error);
      return {
        level: 1,
        currentXP: 0,
        xpToNextLevel: this.calculateXPForLevel(2),
        totalXP: 0,
        title: LEVEL_TITLES[1],
      };
    }
  }

  calculateXPForLevel(level: number): number {
    return Math.floor(XP_BASE * Math.pow(level, XP_EXPONENT));
  }

  calculateLevel(totalXP: number): number {
    let level = 1;
    let xpRequired = 0;

    while (xpRequired <= totalXP) {
      level++;
      xpRequired += this.calculateXPForLevel(level);
    }

    return level - 1;
  }

  getXPToNextLevel(currentLevel: number): number {
    return this.calculateXPForLevel(currentLevel + 1);
  }

  getLevelTitle(level: number): string {
    const titleLevels = Object.keys(LEVEL_TITLES)
      .map(Number)
      .sort((a, b) => b - a);

    for (const titleLevel of titleLevels) {
      if (level >= titleLevel) {
        return LEVEL_TITLES[titleLevel];
      }
    }

    return LEVEL_TITLES[1];
  }

  async addXP(userId: string, xpAmount: number): Promise<{ leveledUp: boolean; newLevel?: number }> {
    try {
      const currentLevel = await this.getUserLevel(userId);
      const newTotalXP = currentLevel.totalXP + xpAmount;
      const newCurrentXP = currentLevel.currentXP + xpAmount;

      let leveledUp = false;
      let newLevel = currentLevel.level;
      let remainingXP = newCurrentXP;

      while (remainingXP >= this.getXPToNextLevel(newLevel)) {
        remainingXP -= this.getXPToNextLevel(newLevel);
        newLevel++;
        leveledUp = true;
      }

      const updatedLevel: PlayerLevel = {
        level: newLevel,
        currentXP: remainingXP,
        xpToNextLevel: this.getXPToNextLevel(newLevel),
        totalXP: newTotalXP,
        title: this.getLevelTitle(newLevel),
      };

      if (db) {
        // Firebase update would go here
      }

      this.userLevel.set(userId, updatedLevel);

      return {
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
      };
    } catch (error) {
      console.error('Failed to add XP:', error);
      return { leveledUp: false };
    }
  }

  async levelUp(userId: string): Promise<void> {
    console.log(`User ${userId} leveled up!`);
  }

  getLevelProgress(currentXP: number, xpToNextLevel: number): number {
    return (currentXP / xpToNextLevel) * 100;
  }

  clearCache(userId: string): void {
    this.userLevel.delete(userId);
  }
}

export const LevelManager = new LevelManagerClass();
