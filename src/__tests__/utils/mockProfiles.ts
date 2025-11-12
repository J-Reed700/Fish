import { CatProfile, ProfileStats, ProfilePreferences } from '../../types';

export const createMockProfile = (overrides?: Partial<CatProfile>): CatProfile => {
  const now = Date.now();
  return {
    id: `profile_${now}_test`,
    name: 'Test Cat',
    photoUri: 'file://test-photo.jpg',
    weightUnit: 'lbs',
    personalityTags: ['playful', 'curious'],
    stats: createMockStats(),
    preferences: createMockPreferences(),
    createdAt: now,
    lastPlayed: now,
    isActive: true,
    ...overrides,
  };
};

export const createMockStats = (overrides?: Partial<ProfileStats>): ProfileStats => {
  return {
    totalPlaytime: 3600000,
    totalCatches: 150,
    catchesByPreyType: {
      fish: 50,
      mouse: 30,
      butterfly: 20,
      cockroach: 15,
      ladybug: 10,
      laser: 20,
      frog: 5,
      spider: 0,
    },
    bossAttempts: 10,
    bossDefeats: 5,
    miniGamesPlayed: 25,
    playStreak: 7,
    ...overrides,
  };
};

export const createMockPreferences = (overrides?: Partial<ProfilePreferences>): ProfilePreferences => {
  return {
    defaultGameMode: 'normal',
    difficulty: 'medium',
    soundVolume: 80,
    vibrationIntensity: 50,
    autoRotate: true,
    ...overrides,
  };
};

export const createMultipleMockProfiles = (count: number): CatProfile[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockProfile({
      id: `profile_${i}_test`,
      name: `Test Cat ${i + 1}`,
      isActive: i === 0,
    })
  );
};
