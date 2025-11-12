import AsyncStorage from '@react-native-async-storage/async-storage';
import { CatProfile, ProfileStats, ProfilePreferences, PreyType } from '../../types';

const PROFILES_STORAGE_KEY = '@fish_profiles';
const ACTIVE_PROFILE_KEY = '@fish_active_profile';

export class ProfileManager {
  private static instance: ProfileManager;

  private constructor() {}

  static getInstance(): ProfileManager {
    if (!ProfileManager.instance) {
      ProfileManager.instance = new ProfileManager();
    }
    return ProfileManager.instance;
  }

  async createProfile(
    name: string,
    photoUri?: string,
    tierLimit: number = 1
  ): Promise<{ success: boolean; profile?: CatProfile; error?: string }> {
    try {
      if (!this.validateName(name)) {
        return {
          success: false,
          error: 'Name must be 2-30 characters and contain only letters, numbers, spaces, hyphens, and apostrophes',
        };
      }

      const profiles = await this.getAllProfiles();

      if (profiles.length >= tierLimit) {
        return {
          success: false,
          error: `Profile limit reached. Upgrade to Premium for unlimited profiles.`,
        };
      }

      const existingNames = profiles.map(p => p.name.toLowerCase());
      if (existingNames.includes(name.toLowerCase())) {
        return {
          success: false,
          error: 'A profile with this name already exists',
        };
      }

      const now = Date.now();
      const profile: CatProfile = {
        id: `profile_${now}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        photoUri,
        weightUnit: 'lbs',
        personalityTags: [],
        stats: this.createDefaultStats(),
        preferences: this.createDefaultPreferences(),
        createdAt: now,
        lastPlayed: now,
        isActive: profiles.length === 0,
      };

      profiles.push(profile);
      await this.saveProfiles(profiles);

      if (profile.isActive) {
        await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
      }

      return { success: true, profile };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async updateProfile(
    id: string,
    updates: Partial<CatProfile>
  ): Promise<{ success: boolean; profile?: CatProfile; error?: string }> {
    try {
      const profiles = await this.getAllProfiles();
      const index = profiles.findIndex(p => p.id === id);

      if (index === -1) {
        return { success: false, error: 'Profile not found' };
      }

      if (updates.name && !this.validateName(updates.name)) {
        return {
          success: false,
          error: 'Invalid name format',
        };
      }

      if (updates.name) {
        const existingNames = profiles
          .filter(p => p.id !== id)
          .map(p => p.name.toLowerCase());
        if (existingNames.includes(updates.name.toLowerCase())) {
          return {
            success: false,
            error: 'A profile with this name already exists',
          };
        }
      }

      const updatedProfile = {
        ...profiles[index],
        ...updates,
        id: profiles[index].id,
        createdAt: profiles[index].createdAt,
      };

      profiles[index] = updatedProfile;
      await this.saveProfiles(profiles);

      return { success: true, profile: updatedProfile };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async deleteProfile(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const profiles = await this.getAllProfiles();
      const index = profiles.findIndex(p => p.id === id);

      if (index === -1) {
        return { success: false, error: 'Profile not found' };
      }

      if (profiles.length === 1) {
        return { success: false, error: 'Cannot delete the last profile' };
      }

      const wasActive = profiles[index].isActive;
      profiles.splice(index, 1);

      if (wasActive && profiles.length > 0) {
        profiles[0].isActive = true;
        await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profiles[0].id);
      }

      await this.saveProfiles(profiles);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async switchProfile(id: string): Promise<{ success: boolean; profile?: CatProfile; error?: string }> {
    try {
      const profiles = await this.getAllProfiles();
      const targetIndex = profiles.findIndex(p => p.id === id);

      if (targetIndex === -1) {
        return { success: false, error: 'Profile not found' };
      }

      profiles.forEach(p => {
        p.isActive = p.id === id;
      });

      profiles[targetIndex].lastPlayed = Date.now();

      await this.saveProfiles(profiles);
      await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, id);

      return { success: true, profile: profiles[targetIndex] };
    } catch (error) {
      return {
        success: false,
        error: `Failed to switch profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async getProfile(id: string): Promise<CatProfile | null> {
    try {
      const profiles = await this.getAllProfiles();
      return profiles.find(p => p.id === id) || null;
    } catch {
      return null;
    }
  }

  async getActiveProfile(): Promise<CatProfile | null> {
    try {
      const profiles = await this.getAllProfiles();
      const activeProfile = profiles.find(p => p.isActive);

      if (activeProfile) {
        return activeProfile;
      }

      if (profiles.length > 0) {
        profiles[0].isActive = true;
        await this.saveProfiles(profiles);
        return profiles[0];
      }

      return null;
    } catch {
      return null;
    }
  }

  async getAllProfiles(): Promise<CatProfile[]> {
    try {
      const data = await AsyncStorage.getItem(PROFILES_STORAGE_KEY);
      if (!data) return [];

      const profiles = JSON.parse(data) as CatProfile[];
      return profiles.sort((a, b) => b.lastPlayed - a.lastPlayed);
    } catch {
      return [];
    }
  }

  async exportProfile(id: string): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const profile = await this.getProfile(id);
      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }

      const exportData = {
        version: '1.0.0',
        exportedAt: Date.now(),
        profile: {
          ...profile,
          photoUri: undefined,
          photoUrl: undefined,
        },
      };

      return {
        success: true,
        data: JSON.stringify(exportData, null, 2),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to export profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async importProfile(
    jsonData: string,
    tierLimit: number
  ): Promise<{ success: boolean; profile?: CatProfile; error?: string }> {
    try {
      const importData = JSON.parse(jsonData);

      if (!importData.profile || !importData.version) {
        return { success: false, error: 'Invalid import data' };
      }

      const profiles = await this.getAllProfiles();
      if (profiles.length >= tierLimit) {
        return {
          success: false,
          error: 'Profile limit reached',
        };
      }

      const importedProfile = importData.profile as CatProfile;
      const now = Date.now();

      const newProfile: CatProfile = {
        ...importedProfile,
        id: `profile_${now}_${Math.random().toString(36).substr(2, 9)}`,
        name: this.getUniqueName(importedProfile.name, profiles),
        photoUri: undefined,
        photoUrl: undefined,
        createdAt: now,
        lastPlayed: now,
        isActive: false,
      };

      profiles.push(newProfile);
      await this.saveProfiles(profiles);

      return { success: true, profile: newProfile };
    } catch (error) {
      return {
        success: false,
        error: `Failed to import profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async cloneProfile(
    id: string,
    tierLimit: number
  ): Promise<{ success: boolean; profile?: CatProfile; error?: string }> {
    try {
      const sourceProfile = await this.getProfile(id);
      if (!sourceProfile) {
        return { success: false, error: 'Profile not found' };
      }

      const profiles = await this.getAllProfiles();
      if (profiles.length >= tierLimit) {
        return {
          success: false,
          error: 'Profile limit reached',
        };
      }

      const now = Date.now();
      const clonedProfile: CatProfile = {
        ...sourceProfile,
        id: `profile_${now}_${Math.random().toString(36).substr(2, 9)}`,
        name: this.getUniqueName(`${sourceProfile.name} (Copy)`, profiles),
        photoUri: sourceProfile.photoUri,
        photoUrl: undefined,
        createdAt: now,
        lastPlayed: now,
        isActive: false,
      };

      profiles.push(clonedProfile);
      await this.saveProfiles(profiles);

      return { success: true, profile: clonedProfile };
    } catch (error) {
      return {
        success: false,
        error: `Failed to clone profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async saveProfiles(profiles: CatProfile[]): Promise<void> {
    await AsyncStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  }

  private validateName(name: string): boolean {
    if (name.length < 2 || name.length > 30) return false;
    const regex = /^[a-zA-Z0-9\s\-']+$/;
    return regex.test(name);
  }

  private getUniqueName(baseName: string, existingProfiles: CatProfile[]): string {
    const existingNames = existingProfiles.map(p => p.name.toLowerCase());
    let name = baseName;
    let counter = 1;

    while (existingNames.includes(name.toLowerCase())) {
      name = `${baseName} ${counter}`;
      counter++;
    }

    return name;
  }

  private createDefaultStats(): ProfileStats {
    return {
      totalPlaytime: 0,
      totalCatches: 0,
      catchesByPreyType: {
        fish: 0,
        mouse: 0,
        butterfly: 0,
        cockroach: 0,
        ladybug: 0,
        laser: 0,
        frog: 0,
        spider: 0,
      },
      bossAttempts: 0,
      bossDefeats: 0,
      miniGamesPlayed: 0,
      playStreak: 0,
    };
  }

  private createDefaultPreferences(): ProfilePreferences {
    return {
      defaultGameMode: 'normal',
      difficulty: 'medium',
      soundVolume: 80,
      vibrationIntensity: 50,
      autoRotate: true,
    };
  }
}

export default ProfileManager.getInstance();
