import {
  CommunityChallenge,
  UserChallengeProgress,
  CommunityChallengeProgress,
  ChallengeReward,
} from '../../types';

export const createMockChallenge = (overrides?: Partial<CommunityChallenge>): CommunityChallenge => {
  return {
    id: `challenge_${Date.now()}_test`,
    title: 'Test Challenge',
    description: 'This is a test challenge',
    type: 'daily',
    category: 'catches',
    requirement: {
      type: 'catches',
      target: 100,
      preyTypes: ['fish'],
    },
    reward: createMockReward(),
    startTime: Date.now() - 86400000,
    endTime: Date.now() + 86400000,
    isActive: true,
    difficulty: 'medium',
    icon: '🐟',
    ...overrides,
  };
};

export const createMockReward = (overrides?: Partial<ChallengeReward>): ChallengeReward => {
  return {
    xp: 100,
    badge: 'test-badge',
    currency: 50,
    unlockContent: [],
    ...overrides,
  };
};

export const createMockUserProgress = (
  challengeId: string,
  overrides?: Partial<UserChallengeProgress>
): UserChallengeProgress => {
  return {
    challengeId,
    userId: 'test-user',
    profileId: 'test-profile',
    progress: 0,
    target: 100,
    isCompleted: false,
    claimedReward: false,
    ...overrides,
  };
};

export const createMockCommunityProgress = (
  challengeId: string,
  overrides?: Partial<CommunityChallengeProgress>
): CommunityChallengeProgress => {
  return {
    challengeId,
    globalProgress: 0,
    globalTarget: 10000,
    contributions: {},
    contributorCount: 0,
    isCompleted: false,
    ...overrides,
  };
};

export const createMultipleMockChallenges = (count: number): CommunityChallenge[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockChallenge({
      id: `challenge_${i}_test`,
      title: `Test Challenge ${i + 1}`,
    })
  );
};
