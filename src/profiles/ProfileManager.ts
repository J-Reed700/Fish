import { Profile, ProfileState } from '../types';
import { ProfileStorage } from './ProfileStorage';

export class ProfileManager {
  static async loadProfiles(): Promise<ProfileState> {
    const state = await ProfileStorage.load();
    if (!state) {
      return await ProfileStorage.initialize(1);
    }
    return state;
  }

  static async saveProfiles(state: ProfileState): Promise<void> {
    await ProfileStorage.save(state);
  }

  static async createProfile(
    profile: Omit<Profile, 'id' | 'createdAt' | 'lastPlayedAt'>,
    currentState: ProfileState
  ): Promise<ProfileState> {
    if (!this.canAddProfile(currentState)) {
      throw new Error(`Profile limit reached (${currentState.tierLimit})`);
    }

    const newProfile: Profile = {
      ...profile,
      id: `profile-${Date.now()}`,
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
    };

    const newState: ProfileState = {
      ...currentState,
      profiles: [...currentState.profiles, newProfile],
    };

    await this.saveProfiles(newState);
    return newState;
  }

  static async updateProfile(
    profileId: string,
    updates: Partial<Profile>,
    currentState: ProfileState
  ): Promise<ProfileState> {
    const profileIndex = currentState.profiles.findIndex((p) => p.id === profileId);
    if (profileIndex === -1) {
      throw new Error('Profile not found');
    }

    const updatedProfiles = [...currentState.profiles];
    updatedProfiles[profileIndex] = {
      ...updatedProfiles[profileIndex],
      ...updates,
      id: profileId,
    };

    const newState: ProfileState = {
      ...currentState,
      profiles: updatedProfiles,
    };

    await this.saveProfiles(newState);
    return newState;
  }

  static async deleteProfile(
    profileId: string,
    currentState: ProfileState
  ): Promise<ProfileState> {
    if (currentState.profiles.length <= 1) {
      throw new Error('Cannot delete last profile');
    }

    if (currentState.activeProfileId === profileId) {
      throw new Error('Cannot delete active profile. Switch to another profile first.');
    }

    const newState: ProfileState = {
      ...currentState,
      profiles: currentState.profiles.filter((p) => p.id !== profileId),
    };

    await this.saveProfiles(newState);
    return newState;
  }

  static async setActiveProfile(
    profileId: string,
    currentState: ProfileState
  ): Promise<ProfileState> {
    const profile = currentState.profiles.find((p) => p.id === profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const updatedProfiles = currentState.profiles.map((p) =>
      p.id === profileId
        ? { ...p, lastPlayedAt: Date.now() }
        : p
    );

    const newState: ProfileState = {
      ...currentState,
      activeProfileId: profileId,
      profiles: updatedProfiles,
    };

    await this.saveProfiles(newState);
    return newState;
  }

  static canAddProfile(currentState: ProfileState): boolean {
    return currentState.profiles.length < currentState.tierLimit;
  }

  static getActiveProfile(state: ProfileState): Profile | null {
    return state.profiles.find((p) => p.id === state.activeProfileId) || null;
  }

  static async updateLastPlayed(
    profileId: string,
    currentState: ProfileState
  ): Promise<ProfileState> {
    return this.updateProfile(
      profileId,
      { lastPlayedAt: Date.now() },
      currentState
    );
  }

  static async updateTierLimit(
    tierLimit: number,
    currentState: ProfileState
  ): Promise<ProfileState> {
    const newState: ProfileState = {
      ...currentState,
      tierLimit,
    };

    await this.saveProfiles(newState);
    return newState;
  }

  static createDefaultProfileState(): ProfileState {
    const defaultProfile: Profile = {
      id: `profile-${Date.now()}`,
      name: 'Default Cat',
      preferences: {},
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
    };

    return {
      activeProfileId: defaultProfile.id,
      profiles: [defaultProfile],
      tierLimit: 1,
    };
  }
}
