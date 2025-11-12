import { ProfileManager } from '../services/ProfileManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAsyncStorageMock } from '../../__mocks__/@react-native-async-storage/async-storage';
import { createMockProfile } from '../../__tests__/utils/mockProfiles';

describe('ProfileManager', () => {
  let profileManager: ProfileManager;

  beforeEach(() => {
    clearAsyncStorageMock();
    profileManager = ProfileManager.getInstance();
  });

  describe('Profile Creation', () => {
    it('should create a new profile successfully', async () => {
      const result = await profileManager.createProfile('Fluffy', undefined, 10);

      expect(result.success).toBe(true);
      expect(result.profile).toBeDefined();
      expect(result.profile?.name).toBe('Fluffy');
      expect(result.profile?.isActive).toBe(true);
    });

    it('should reject names shorter than 2 characters', async () => {
      const result = await profileManager.createProfile('A', undefined, 10);

      expect(result.success).toBe(false);
      expect(result.error).toContain('2-30 characters');
    });

    it('should reject names longer than 30 characters', async () => {
      const longName = 'A'.repeat(31);
      const result = await profileManager.createProfile(longName, undefined, 10);

      expect(result.success).toBe(false);
      expect(result.error).toContain('2-30 characters');
    });

    it('should reject names with invalid characters', async () => {
      const result = await profileManager.createProfile('Test@Cat!', undefined, 10);

      expect(result.success).toBe(false);
      expect(result.error).toContain('letters, numbers, spaces, hyphens, and apostrophes');
    });

    it('should accept names with valid special characters', async () => {
      const result = await profileManager.createProfile("Mr. Whiskers-O'Malley", undefined, 10);

      expect(result.success).toBe(true);
      expect(result.profile?.name).toBe("Mr. Whiskers-O'Malley");
    });

    it('should enforce tier limits (free tier: 1 profile)', async () => {
      await profileManager.createProfile('Cat1', undefined, 1);
      const result = await profileManager.createProfile('Cat2', undefined, 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Profile limit reached');
    });

    it('should allow multiple profiles for premium tier', async () => {
      const result1 = await profileManager.createProfile('Cat1', undefined, 999);
      const result2 = await profileManager.createProfile('Cat2', undefined, 999);
      const result3 = await profileManager.createProfile('Cat3', undefined, 999);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });

    it('should reject duplicate names (case insensitive)', async () => {
      await profileManager.createProfile('Fluffy', undefined, 10);
      const result = await profileManager.createProfile('fluffy', undefined, 10);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should initialize default stats and preferences', async () => {
      const result = await profileManager.createProfile('Fluffy', undefined, 10);

      expect(result.profile?.stats).toBeDefined();
      expect(result.profile?.stats.totalCatches).toBe(0);
      expect(result.profile?.preferences).toBeDefined();
      expect(result.profile?.preferences.soundVolume).toBe(80);
    });

    it('should set first profile as active', async () => {
      const result1 = await profileManager.createProfile('Cat1', undefined, 10);
      const result2 = await profileManager.createProfile('Cat2', undefined, 10);

      expect(result1.profile?.isActive).toBe(true);
      expect(result2.profile?.isActive).toBe(false);
    });

    it('should store profile in AsyncStorage', async () => {
      await profileManager.createProfile('Fluffy', 'file://photo.jpg', 10);

      const stored = await AsyncStorage.getItem('@fish_profiles');
      expect(stored).toBeTruthy();

      const profiles = JSON.parse(stored!);
      expect(profiles.length).toBe(1);
      expect(profiles[0].name).toBe('Fluffy');
      expect(profiles[0].photoUri).toBe('file://photo.jpg');
    });
  });

  describe('Profile Updates', () => {
    it('should update profile name', async () => {
      const created = await profileManager.createProfile('Fluffy', undefined, 10);
      const result = await profileManager.updateProfile(created.profile!.id, {
        name: 'Mr. Whiskers',
      });

      expect(result.success).toBe(true);
      expect(result.profile?.name).toBe('Mr. Whiskers');
    });

    it('should update profile photo', async () => {
      const created = await profileManager.createProfile('Fluffy', undefined, 10);
      const result = await profileManager.updateProfile(created.profile!.id, {
        photoUri: 'file://new-photo.jpg',
      });

      expect(result.success).toBe(true);
      expect(result.profile?.photoUri).toBe('file://new-photo.jpg');
    });

    it('should reject invalid name updates', async () => {
      const created = await profileManager.createProfile('Fluffy', undefined, 10);
      const result = await profileManager.updateProfile(created.profile!.id, {
        name: 'A',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid name format');
    });

    it('should reject duplicate name updates', async () => {
      await profileManager.createProfile('Fluffy', undefined, 10);
      const created2 = await profileManager.createProfile('Whiskers', undefined, 10);

      const result = await profileManager.updateProfile(created2.profile!.id, {
        name: 'Fluffy',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should not modify immutable fields', async () => {
      const created = await profileManager.createProfile('Fluffy', undefined, 10);
      const originalId = created.profile!.id;
      const originalCreatedAt = created.profile!.createdAt;

      await profileManager.updateProfile(created.profile!.id, {
        id: 'new-id',
        createdAt: Date.now() + 10000,
      } as any);

      const updated = await profileManager.getProfile(originalId);
      expect(updated?.id).toBe(originalId);
      expect(updated?.createdAt).toBe(originalCreatedAt);
    });

    it('should return error for non-existent profile', async () => {
      const result = await profileManager.updateProfile('nonexistent-id', {
        name: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Profile not found');
    });
  });

  describe('Profile Deletion', () => {
    it('should delete a profile', async () => {
      const created1 = await profileManager.createProfile('Cat1', undefined, 10);
      const created2 = await profileManager.createProfile('Cat2', undefined, 10);

      const result = await profileManager.deleteProfile(created2.profile!.id);

      expect(result.success).toBe(true);

      const profiles = await profileManager.getAllProfiles();
      expect(profiles.length).toBe(1);
      expect(profiles[0].name).toBe('Cat1');
    });

    it('should not allow deleting the last profile', async () => {
      const created = await profileManager.createProfile('OnlyCat', undefined, 10);
      const result = await profileManager.deleteProfile(created.profile!.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot delete the last profile');
    });

    it('should activate another profile if active profile is deleted', async () => {
      const created1 = await profileManager.createProfile('Cat1', undefined, 10);
      const created2 = await profileManager.createProfile('Cat2', undefined, 10);

      await profileManager.switchProfile(created2.profile!.id);
      await profileManager.deleteProfile(created2.profile!.id);

      const activeProfile = await profileManager.getActiveProfile();
      expect(activeProfile?.id).toBe(created1.profile!.id);
      expect(activeProfile?.isActive).toBe(true);
    });

    it('should return error for non-existent profile', async () => {
      await profileManager.createProfile('Cat1', undefined, 10);
      const result = await profileManager.deleteProfile('nonexistent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Profile not found');
    });
  });

  describe('Profile Switching', () => {
    it('should switch active profile', async () => {
      const created1 = await profileManager.createProfile('Cat1', undefined, 10);
      const created2 = await profileManager.createProfile('Cat2', undefined, 10);

      const result = await profileManager.switchProfile(created2.profile!.id);

      expect(result.success).toBe(true);
      expect(result.profile?.id).toBe(created2.profile!.id);
      expect(result.profile?.isActive).toBe(true);

      const profile1 = await profileManager.getProfile(created1.profile!.id);
      expect(profile1?.isActive).toBe(false);
    });

    it('should update lastPlayed timestamp on switch', async () => {
      const created1 = await profileManager.createProfile('Cat1', undefined, 10);
      const created2 = await profileManager.createProfile('Cat2', undefined, 10);

      const originalLastPlayed = created2.profile!.lastPlayed;
      await new Promise((resolve) => setTimeout(resolve, 10));

      await profileManager.switchProfile(created2.profile!.id);
      const updated = await profileManager.getProfile(created2.profile!.id);

      expect(updated!.lastPlayed).toBeGreaterThan(originalLastPlayed);
    });

    it('should return error for non-existent profile', async () => {
      await profileManager.createProfile('Cat1', undefined, 10);
      const result = await profileManager.switchProfile('nonexistent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Profile not found');
    });
  });

  describe('Profile Retrieval', () => {
    it('should get profile by ID', async () => {
      const created = await profileManager.createProfile('Fluffy', undefined, 10);
      const profile = await profileManager.getProfile(created.profile!.id);

      expect(profile).toBeDefined();
      expect(profile?.name).toBe('Fluffy');
    });

    it('should return null for non-existent profile', async () => {
      const profile = await profileManager.getProfile('nonexistent-id');
      expect(profile).toBeNull();
    });

    it('should get active profile', async () => {
      const created = await profileManager.createProfile('ActiveCat', undefined, 10);
      const activeProfile = await profileManager.getActiveProfile();

      expect(activeProfile).toBeDefined();
      expect(activeProfile?.id).toBe(created.profile!.id);
      expect(activeProfile?.isActive).toBe(true);
    });

    it('should return null when no profiles exist', async () => {
      const activeProfile = await profileManager.getActiveProfile();
      expect(activeProfile).toBeNull();
    });

    it('should get all profiles sorted by lastPlayed', async () => {
      await profileManager.createProfile('Cat1', undefined, 10);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await profileManager.createProfile('Cat2', undefined, 10);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await profileManager.createProfile('Cat3', undefined, 10);

      const profiles = await profileManager.getAllProfiles();

      expect(profiles.length).toBe(3);
      expect(profiles[0].name).toBe('Cat3');
      expect(profiles[2].name).toBe('Cat1');
    });
  });

  describe('Profile Import/Export', () => {
    it('should export profile to JSON', async () => {
      const created = await profileManager.createProfile('Fluffy', 'file://photo.jpg', 10);
      const result = await profileManager.exportProfile(created.profile!.id);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const exportData = JSON.parse(result.data!);
      expect(exportData.version).toBe('1.0.0');
      expect(exportData.profile.name).toBe('Fluffy');
      expect(exportData.profile.photoUri).toBeUndefined();
    });

    it('should import profile from JSON', async () => {
      const mockProfile = createMockProfile({ name: 'ImportedCat' });
      const exportData = {
        version: '1.0.0',
        exportedAt: Date.now(),
        profile: mockProfile,
      };

      const result = await profileManager.importProfile(JSON.stringify(exportData), 10);

      expect(result.success).toBe(true);
      expect(result.profile?.name).toBe('ImportedCat');
      expect(result.profile?.id).not.toBe(mockProfile.id);
    });

    it('should handle duplicate names on import', async () => {
      await profileManager.createProfile('Fluffy', undefined, 10);

      const mockProfile = createMockProfile({ name: 'Fluffy' });
      const exportData = {
        version: '1.0.0',
        exportedAt: Date.now(),
        profile: mockProfile,
      };

      const result = await profileManager.importProfile(JSON.stringify(exportData), 10);

      expect(result.success).toBe(true);
      expect(result.profile?.name).toContain('Fluffy');
      expect(result.profile?.name).not.toBe('Fluffy');
    });

    it('should reject invalid import data', async () => {
      const result = await profileManager.importProfile('invalid json', 10);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should enforce tier limit on import', async () => {
      await profileManager.createProfile('Cat1', undefined, 1);

      const mockProfile = createMockProfile({ name: 'ImportedCat' });
      const exportData = {
        version: '1.0.0',
        exportedAt: Date.now(),
        profile: mockProfile,
      };

      const result = await profileManager.importProfile(JSON.stringify(exportData), 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Profile limit reached');
    });
  });

  describe('Profile Cloning', () => {
    it('should clone a profile', async () => {
      const created = await profileManager.createProfile('Original', 'file://photo.jpg', 10);
      const result = await profileManager.cloneProfile(created.profile!.id, 10);

      expect(result.success).toBe(true);
      expect(result.profile?.name).toContain('Original (Copy)');
      expect(result.profile?.id).not.toBe(created.profile!.id);
      expect(result.profile?.photoUri).toBe('file://photo.jpg');
    });

    it('should enforce tier limit on clone', async () => {
      const created = await profileManager.createProfile('Cat1', undefined, 1);
      const result = await profileManager.cloneProfile(created.profile!.id, 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Profile limit reached');
    });

    it('should return error for non-existent profile', async () => {
      const result = await profileManager.cloneProfile('nonexistent-id', 10);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Profile not found');
    });
  });
});
