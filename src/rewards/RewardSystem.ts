import AsyncStorage from '@react-native-async-storage/async-storage';
import { UnlockState } from '../types';
import { ThemeManager } from '../themes/ThemeManager';

export class RewardSystem {
  static async loadUnlocks(profileId: string): Promise<UnlockState> {
    try {
      const key = `unlocks:${profileId}`;
      const data = await AsyncStorage.getItem(key);

      if (data) {
        return JSON.parse(data);
      }

      return {
        preyTypes: [],
        themes: ['ocean', 'aquarium'],
        achievements: [],
        points: 0,
      };
    } catch (error) {
      console.error('Failed to load unlocks:', error);
      return {
        preyTypes: [],
        themes: ['ocean', 'aquarium'],
        achievements: [],
        points: 0,
      };
    }
  }

  static async saveUnlocks(profileId: string, state: UnlockState): Promise<void> {
    try {
      const key = `unlocks:${profileId}`;
      await AsyncStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save unlocks:', error);
    }
  }

  static async grantUnlock(
    profileId: string,
    type: 'prey' | 'theme' | 'achievement' | 'points',
    value: string | number
  ): Promise<UnlockState> {
    const currentState = await this.loadUnlocks(profileId);
    const updatedState = { ...currentState };

    switch (type) {
      case 'prey':
        if (!updatedState.preyTypes.includes(value as string)) {
          updatedState.preyTypes = [...updatedState.preyTypes, value as string];
        }
        break;
      case 'theme':
        if (!updatedState.themes.includes(value as string)) {
          updatedState.themes = [...updatedState.themes, value as string];
        }
        break;
      case 'achievement':
        if (!updatedState.achievements.includes(value as string)) {
          updatedState.achievements = [...updatedState.achievements, value as string];
        }
        break;
      case 'points':
        updatedState.points += value as number;
        break;
    }

    await this.saveUnlocks(profileId, updatedState);
    return updatedState;
  }

  static isUnlocked(state: UnlockState, type: 'prey' | 'theme' | 'achievement', value: string): boolean {
    switch (type) {
      case 'prey':
        return state.preyTypes.includes(value);
      case 'theme':
        return state.themes.includes(value);
      case 'achievement':
        return state.achievements.includes(value);
      default:
        return false;
    }
  }

  static async grantStreakReward(profileId: string, streak: number): Promise<UnlockState | null> {
    const rewards: Record<number, { type: 'prey' | 'theme' | 'achievement'; value: string }> = {
      3: { type: 'prey', value: 'mouse' },
      7: { type: 'theme', value: 'pond' },
      14: { type: 'achievement', value: 'streak-master' },
      30: { type: 'achievement', value: 'dedication' },
    };

    const reward = rewards[streak];
    if (!reward) return null;

    return await this.grantUnlock(profileId, reward.type, reward.value);
  }

  static async unlockTheme(profileId: string, themeId: string): Promise<void> {
    try {
      await ThemeManager.unlockTheme(profileId, themeId);
    } catch (error) {
      console.error('Failed to unlock theme:', error);
      throw error;
    }
  }

  static async grantChallengeReward(
    profileId: string,
    challengesCompleted: number
  ): Promise<UnlockState | null> {
    if (challengesCompleted === 10) {
      return await this.grantUnlock(profileId, 'theme', 'koi');
    }
    return null;
  }
}
