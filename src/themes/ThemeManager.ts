import { Theme } from '../types';
import { AsyncStorageAdapter } from '../storage/AsyncStorageAdapter';
import { UnlockState } from '../types';

const THEMES: Record<string, Theme> = {
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blue waters',
    colors: {
      background: '#003366',
      backgroundBottom: '#0077BE',
      ambient: '#4DABFF',
    },
    particles: [
      { type: 'bubbles', count: 15, color: '#FFFFFF', size: 8 },
    ],
    isDefault: true,
    isPremium: false,
  },

  aquarium: {
    id: 'aquarium',
    name: 'Aquarium',
    description: 'Bright, clear water',
    colors: {
      background: '#00BFFF',
      backgroundBottom: '#4DDBFF',
      ambient: '#FFFFFF',
    },
    particles: [
      { type: 'bubbles', count: 20, color: '#FFFFFF', size: 6 },
    ],
    decorations: [
      {
        type: 'plant',
        positions: [
          { x: 50, y: 500 },
          { x: 150, y: 520 },
          { x: 300, y: 510 },
        ],
        color: '#32CD32',
      },
    ],
    isDefault: false,
    isPremium: false,
  },

  pond: {
    id: 'pond',
    name: 'Pond',
    description: 'Murky green waters',
    colors: {
      background: '#2E7D32',
      backgroundBottom: '#3CB371',
      ambient: '#90EE90',
    },
    particles: [
      { type: 'leaves', count: 10, color: '#7FFF00', size: 12 },
      { type: 'bubbles', count: 5, color: '#FFFFFF', size: 8 },
    ],
    isDefault: false,
    isPremium: false,
  },

  koi: {
    id: 'koi',
    name: 'Koi Pond',
    description: 'Zen garden aesthetic',
    colors: {
      background: '#7FDBDA',
      backgroundBottom: '#B0E0E6',
      ambient: '#FFFFFF',
    },
    particles: [
      { type: 'sparkles', count: 25, color: '#FFD700', size: 4 },
    ],
    decorations: [
      {
        type: 'rock',
        positions: [
          { x: 100, y: 600 },
          { x: 250, y: 620 },
        ],
        color: '#808080',
      },
    ],
    isDefault: false,
    isPremium: false,
  },

  night: {
    id: 'night',
    name: 'Night Ocean',
    description: 'Dark waters with bioluminescence',
    colors: {
      background: '#001a33',
      backgroundBottom: '#003366',
      ambient: '#00FFFF',
    },
    particles: [
      { type: 'sparkles', count: 30, color: '#00FFFF', size: 3 },
      { type: 'bubbles', count: 8, color: '#00FFFF', size: 6 },
    ],
    isDefault: false,
    isPremium: true,
  },
};

export class ThemeManager {
  static getAllThemes(): Theme[] {
    return Object.values(THEMES);
  }

  static getThemeById(themeId: string): Theme | undefined {
    return THEMES[themeId];
  }

  static async getUnlockedThemes(profileId: string): Promise<string[]> {
    try {
      const unlocks = await AsyncStorageAdapter.get<UnlockState>(`unlocks:${profileId}`);
      return unlocks?.themes || ['ocean', 'aquarium'];
    } catch (error) {
      console.error('Failed to get unlocked themes:', error);
      return ['ocean', 'aquarium'];
    }
  }

  static async unlockTheme(profileId: string, themeId: string): Promise<void> {
    try {
      const unlocks = await AsyncStorageAdapter.get<UnlockState>(`unlocks:${profileId}`) || {
        preyTypes: [],
        themes: ['ocean', 'aquarium'],
        achievements: [],
        points: 0,
      };

      if (!unlocks.themes.includes(themeId)) {
        unlocks.themes.push(themeId);
        await AsyncStorageAdapter.set(`unlocks:${profileId}`, unlocks);
      }
    } catch (error) {
      console.error('Failed to unlock theme:', error);
      throw error;
    }
  }

  static async isUnlocked(profileId: string, themeId: string): Promise<boolean> {
    const unlockedThemes = await this.getUnlockedThemes(profileId);
    return unlockedThemes.includes(themeId);
  }

  static async getCurrentTheme(profileId: string): Promise<Theme> {
    try {
      const themeId = await AsyncStorageAdapter.get<string>(`currentTheme:${profileId}`);
      const theme = themeId ? THEMES[themeId] : null;

      if (theme && await this.isUnlocked(profileId, themeId!)) {
        return theme;
      }

      return THEMES.ocean;
    } catch (error) {
      console.error('Failed to get current theme:', error);
      return THEMES.ocean;
    }
  }

  static async setCurrentTheme(profileId: string, themeId: string): Promise<void> {
    try {
      const isUnlocked = await this.isUnlocked(profileId, themeId);
      if (!isUnlocked) {
        throw new Error(`Theme ${themeId} is not unlocked`);
      }

      await AsyncStorageAdapter.set(`currentTheme:${profileId}`, themeId);
    } catch (error) {
      console.error('Failed to set current theme:', error);
      throw error;
    }
  }

  static getUnlockRequirement(themeId: string): string {
    switch (themeId) {
      case 'ocean':
      case 'aquarium':
        return 'Unlocked by default';
      case 'pond':
        return 'Complete a 7-day streak';
      case 'koi':
        return 'Complete 10 challenges';
      case 'night':
        return 'Premium subscription';
      default:
        return 'Unknown requirement';
    }
  }

  static getDefaultTheme(): Theme {
    return THEMES.ocean;
  }
}

export { THEMES };
