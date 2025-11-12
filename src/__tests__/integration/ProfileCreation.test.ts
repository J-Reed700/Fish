import { ProfileManager } from '../../profiles/services/ProfileManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAsyncStorageMock } from '../../__mocks__/@react-native-async-storage/async-storage';

describe('Integration: Profile Creation Flow', () => {
  let profileManager: ProfileManager;

  beforeEach(() => {
    clearAsyncStorageMock();
    profileManager = ProfileManager.getInstance();
  });

  it('should complete full profile creation and retrieval flow', async () => {
    const result = await profileManager.createProfile('Fluffy', 'file://photo.jpg', 10);

    expect(result.success).toBe(true);
    expect(result.profile).toBeDefined();

    const profileId = result.profile!.id;
    const retrieved = await profileManager.getProfile(profileId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Fluffy');
    expect(retrieved?.photoUri).toBe('file://photo.jpg');

    const allProfiles = await profileManager.getAllProfiles();
    expect(allProfiles.length).toBe(1);
    expect(allProfiles[0].id).toBe(profileId);
  });

  it('should handle multi-profile workflow', async () => {
    const profile1 = await profileManager.createProfile('Cat1', undefined, 10);
    const profile2 = await profileManager.createProfile('Cat2', undefined, 10);
    const profile3 = await profileManager.createProfile('Cat3', undefined, 10);

    expect(profile1.success).toBe(true);
    expect(profile2.success).toBe(true);
    expect(profile3.success).toBe(true);

    let activeProfile = await profileManager.getActiveProfile();
    expect(activeProfile?.name).toBe('Cat1');

    await profileManager.switchProfile(profile2.profile!.id);
    activeProfile = await profileManager.getActiveProfile();
    expect(activeProfile?.name).toBe('Cat2');

    const allProfiles = await profileManager.getAllProfiles();
    expect(allProfiles.length).toBe(3);
  });

  it('should update profile and verify changes persist', async () => {
    const created = await profileManager.createProfile('Original Name', undefined, 10);
    const profileId = created.profile!.id;

    const updated = await profileManager.updateProfile(profileId, {
      name: 'Updated Name',
      photoUri: 'file://new-photo.jpg',
      breed: 'Siamese',
      age: 3,
    });

    expect(updated.success).toBe(true);
    expect(updated.profile?.name).toBe('Updated Name');

    const retrieved = await profileManager.getProfile(profileId);
    expect(retrieved?.name).toBe('Updated Name');
    expect(retrieved?.photoUri).toBe('file://new-photo.jpg');
    expect(retrieved?.breed).toBe('Siamese');
    expect(retrieved?.age).toBe(3);
  });

  it('should export and import profile maintaining data integrity', async () => {
    const original = await profileManager.createProfile('ExportTest', 'file://photo.jpg', 10);
    const originalId = original.profile!.id;

    await profileManager.updateProfile(originalId, {
      breed: 'Persian',
      age: 5,
      weight: 12,
    });

    const exportResult = await profileManager.exportProfile(originalId);
    expect(exportResult.success).toBe(true);

    await profileManager.deleteProfile(originalId);
    const allProfiles = await profileManager.getAllProfiles();
    expect(allProfiles.length).toBe(0);

    const importResult = await profileManager.importProfile(exportResult.data!, 10);
    expect(importResult.success).toBe(true);

    const imported = importResult.profile!;
    expect(imported.name).toContain('ExportTest');
    expect(imported.breed).toBe('Persian');
    expect(imported.age).toBe(5);
    expect(imported.weight).toBe(12);
  });

  it('should clone profile with stats', async () => {
    const original = await profileManager.createProfile('Original', undefined, 10);
    const originalId = original.profile!.id;

    await profileManager.updateProfile(originalId, {
      stats: {
        totalPlaytime: 3600000,
        totalCatches: 500,
        catchesByPreyType: {
          fish: 200,
          mouse: 100,
          butterfly: 50,
          cockroach: 50,
          ladybug: 30,
          laser: 50,
          frog: 20,
          spider: 0,
        },
        bossAttempts: 10,
        bossDefeats: 5,
        miniGamesPlayed: 20,
        playStreak: 5,
      },
    });

    const cloneResult = await profileManager.cloneProfile(originalId, 10);
    expect(cloneResult.success).toBe(true);

    const cloned = cloneResult.profile!;
    expect(cloned.name).toContain('Original (Copy)');
    expect(cloned.stats.totalCatches).toBe(500);
    expect(cloned.stats.bossDefeats).toBe(5);
    expect(cloned.id).not.toBe(originalId);
  });

  it('should handle profile deletion with active profile switching', async () => {
    const profile1 = await profileManager.createProfile('Cat1', undefined, 10);
    const profile2 = await profileManager.createProfile('Cat2', undefined, 10);
    const profile3 = await profileManager.createProfile('Cat3', undefined, 10);

    await profileManager.switchProfile(profile2.profile!.id);

    const deleteResult = await profileManager.deleteProfile(profile2.profile!.id);
    expect(deleteResult.success).toBe(true);

    const activeProfile = await profileManager.getActiveProfile();
    expect(activeProfile).toBeDefined();
    expect(activeProfile?.id).not.toBe(profile2.profile!.id);

    const allProfiles = await profileManager.getAllProfiles();
    expect(allProfiles.length).toBe(2);
  });

  it('should enforce tier limits correctly', async () => {
    const profile1 = await profileManager.createProfile('Cat1', undefined, 2);
    expect(profile1.success).toBe(true);

    const profile2 = await profileManager.createProfile('Cat2', undefined, 2);
    expect(profile2.success).toBe(true);

    const profile3 = await profileManager.createProfile('Cat3', undefined, 2);
    expect(profile3.success).toBe(false);
    expect(profile3.error).toContain('Profile limit reached');

    const allProfiles = await profileManager.getAllProfiles();
    expect(allProfiles.length).toBe(2);
  });

  it('should validate names consistently across operations', async () => {
    const created = await profileManager.createProfile('Test Cat', undefined, 10);
    expect(created.success).toBe(true);

    const duplicateCreate = await profileManager.createProfile('test cat', undefined, 10);
    expect(duplicateCreate.success).toBe(false);

    const profile2 = await profileManager.createProfile('Another Cat', undefined, 10);
    expect(profile2.success).toBe(true);

    const duplicateUpdate = await profileManager.updateProfile(profile2.profile!.id, {
      name: 'TEST CAT',
    });
    expect(duplicateUpdate.success).toBe(false);
  });

  it('should persist data across multiple operations', async () => {
    await profileManager.createProfile('Cat1', 'file://photo1.jpg', 10);
    await profileManager.createProfile('Cat2', 'file://photo2.jpg', 10);
    await profileManager.createProfile('Cat3', 'file://photo3.jpg', 10);

    const stored = await AsyncStorage.getItem('@fish_profiles');
    expect(stored).toBeTruthy();

    const profiles = JSON.parse(stored!);
    expect(profiles.length).toBe(3);
    expect(profiles[0].photoUri).toBe('file://photo1.jpg');
    expect(profiles[1].photoUri).toBe('file://photo2.jpg');
    expect(profiles[2].photoUri).toBe('file://photo3.jpg');
  });
});
