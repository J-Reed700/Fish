import { Profile, ProfileState } from '../types';
import { AsyncStorageAdapter } from '../storage/AsyncStorageAdapter';

const STORAGE_KEY = 'profileState';

export class ProfileStorage {
  static async load(): Promise<ProfileState | null> {
    const defaultState: ProfileState = {
      activeProfileId: '',
      profiles: [],
      tierLimit: 1,
    };

    const state = await AsyncStorageAdapter.getWithRecovery<ProfileState>(
      STORAGE_KEY,
      defaultState
    );

    if (state.profiles.length === 0) {
      return null;
    }

    return state;
  }

  static async save(state: ProfileState): Promise<void> {
    await AsyncStorageAdapter.saveWithLock(STORAGE_KEY, state);
  }

  static async initialize(tierLimit: number = 1): Promise<ProfileState> {
    const defaultProfileId = `profile-${Date.now()}`;
    const defaultState: ProfileState = {
      activeProfileId: defaultProfileId,
      profiles: [
        {
          id: defaultProfileId,
          name: 'My Cat',
          preferences: {},
          createdAt: Date.now(),
          lastPlayedAt: Date.now(),
        },
      ],
      tierLimit,
    };
    await this.save(defaultState);
    return defaultState;
  }

  static async migrate(): Promise<void> {
    try {
      const versionedData = await AsyncStorageAdapter.getVersioned<ProfileState>(STORAGE_KEY);
      if (!versionedData) {
        return;
      }

      const state = versionedData.data;
      const currentVersion = versionedData.version;

      let needsMigration = false;
      state.profiles = state.profiles.map((profile: Profile) => {
        const migratedProfile = { ...profile };

        if (!migratedProfile.createdAt) {
          migratedProfile.createdAt = Date.now();
          needsMigration = true;
        }

        if (!migratedProfile.lastPlayedAt) {
          migratedProfile.lastPlayedAt = Date.now();
          needsMigration = true;
        }

        if (!migratedProfile.preferences) {
          migratedProfile.preferences = {};
          needsMigration = true;
        }

        return migratedProfile;
      });

      if (needsMigration) {
        await AsyncStorageAdapter.saveWithLock(STORAGE_KEY, state, currentVersion);
      }
    } catch (error) {
      console.error('Failed to migrate profile data:', error);
    }
  }
}
