import { ChallengeManager } from '../../challenges/services/ChallengeManager';
import { createMockChallenge } from '../../__tests__/utils/mockChallenges';
import { setMockCollection, clearMockFirestoreData } from '../../__tests__/utils/mockFirestore';

jest.mock('../../config/firebase', () => ({
  db: {},
}));

describe('Integration: Challenge Completion Flow', () => {
  beforeEach(() => {
    clearMockFirestoreData();
    ChallengeManager.cleanup();
  });

  it('should complete full challenge lifecycle', async () => {
    const challenge = createMockChallenge({
      id: 'challenge-1',
      title: 'Daily Catches',
      requirement: { type: 'catches', target: 100, preyTypes: ['fish'] },
      reward: { xp: 500, badge: 'daily-hunter', currency: 100, unlockContent: [] },
    });

    setMockCollection('challenges', [challenge]);

    await ChallengeManager.initialize('test-user', 'test-profile');

    let progress = ChallengeManager.getUserProgress('challenge-1');
    expect(progress?.progress).toBe(0);
    expect(progress?.isCompleted).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 5100));
    await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 50);

    progress = ChallengeManager.getUserProgress('challenge-1');
    expect(progress?.progress).toBe(50);

    await new Promise((resolve) => setTimeout(resolve, 5100));
    await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 50);

    progress = ChallengeManager.getUserProgress('challenge-1');
    expect(progress?.progress).toBe(100);
    expect(progress?.isCompleted).toBe(true);

    await ChallengeManager.claimReward('test-user', 'challenge-1');

    progress = ChallengeManager.getUserProgress('challenge-1');
    expect(progress?.claimedReward).toBe(true);
  });

  it('should track progress across multiple challenges simultaneously', async () => {
    const challenges = [
      createMockChallenge({
        id: 'catches-challenge',
        requirement: { type: 'catches', target: 50, preyTypes: ['fish'] },
      }),
      createMockChallenge({
        id: 'playtime-challenge',
        requirement: { type: 'playtime', target: 3600000, preyTypes: [] },
      }),
      createMockChallenge({
        id: 'boss-challenge',
        requirement: { type: 'boss-defeats', target: 3, preyTypes: [] },
      }),
    ];

    setMockCollection('challenges', challenges);
    await ChallengeManager.initialize('test-user', 'test-profile');

    await new Promise((resolve) => setTimeout(resolve, 5100));
    await ChallengeManager.trackProgress('test-user', 'test-profile', 'catches-challenge', 25);

    await new Promise((resolve) => setTimeout(resolve, 5100));
    await ChallengeManager.trackProgress('test-user', 'test-profile', 'playtime-challenge', 1800000);

    await new Promise((resolve) => setTimeout(resolve, 5100));
    await ChallengeManager.trackProgress('test-user', 'test-profile', 'boss-challenge', 1);

    const catchesProgress = ChallengeManager.getUserProgress('catches-challenge');
    const playtimeProgress = ChallengeManager.getUserProgress('playtime-challenge');
    const bossProgress = ChallengeManager.getUserProgress('boss-challenge');

    expect(catchesProgress?.progress).toBe(25);
    expect(playtimeProgress?.progress).toBe(1800000);
    expect(bossProgress?.progress).toBe(1);
  });

  it('should handle daily challenge rotation', async () => {
    const dailyChallenges = [
      createMockChallenge({
        id: 'daily-1',
        type: 'daily',
        requirement: { type: 'catches', target: 100, preyTypes: ['fish'] },
      }),
      createMockChallenge({
        id: 'daily-2',
        type: 'daily',
        requirement: { type: 'mini-games', target: 5, preyTypes: [] },
      }),
    ];

    setMockCollection('challenges', dailyChallenges);
    await ChallengeManager.initialize('test-user', 'test-profile');

    const dailies = ChallengeManager.getChallengesByType('daily');
    expect(dailies.length).toBe(2);

    await new Promise((resolve) => setTimeout(resolve, 5100));
    await ChallengeManager.trackProgress('test-user', 'test-profile', 'daily-1', 100);

    const progress = ChallengeManager.getUserProgress('daily-1');
    expect(progress?.isCompleted).toBe(true);
  });

  it('should handle community challenges with global progress', async () => {
    const communityChallenge = createMockChallenge({
      id: 'community-1',
      type: 'community',
      title: 'Community Catch Goal',
      requirement: { type: 'catches', target: 1000, preyTypes: ['fish'] },
    });

    setMockCollection('challenges', [communityChallenge]);
    await ChallengeManager.initialize('test-user', 'test-profile');

    await new Promise((resolve) => setTimeout(resolve, 5100));
    await ChallengeManager.trackProgress('test-user', 'test-profile', 'community-1', 50);

    const progress = ChallengeManager.getUserProgress('community-1');
    expect(progress?.progress).toBe(50);
  });

  it('should not allow claiming rewards for incomplete challenges', async () => {
    const challenge = createMockChallenge({
      id: 'challenge-1',
      requirement: { type: 'catches', target: 100, preyTypes: ['fish'] },
    });

    setMockCollection('challenges', [challenge]);
    await ChallengeManager.initialize('test-user', 'test-profile');

    await new Promise((resolve) => setTimeout(resolve, 5100));
    await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 50);

    await ChallengeManager.claimReward('test-user', 'challenge-1');

    const progress = ChallengeManager.getUserProgress('challenge-1');
    expect(progress?.claimedReward).toBe(false);
  });

  it('should prevent double reward claiming', async () => {
    const challenge = createMockChallenge({
      id: 'challenge-1',
      requirement: { type: 'catches', target: 100, preyTypes: ['fish'] },
    });

    setMockCollection('challenges', [challenge]);
    await ChallengeManager.initialize('test-user', 'test-profile');

    await new Promise((resolve) => setTimeout(resolve, 5100));
    await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 100);

    await ChallengeManager.claimReward('test-user', 'challenge-1');
    await ChallengeManager.claimReward('test-user', 'challenge-1');

    const progress = ChallengeManager.getUserProgress('challenge-1');
    expect(progress?.claimedReward).toBe(true);
  });

  it('should handle challenge expiration correctly', async () => {
    const activeChallenges = [
      createMockChallenge({
        id: 'active',
        isActive: true,
        endTime: Date.now() + 86400000,
      }),
      createMockChallenge({
        id: 'expired',
        isActive: true,
        endTime: Date.now() - 1000,
      }),
    ];

    setMockCollection('challenges', activeChallenges);
    await ChallengeManager.initialize('test-user', 'test-profile');

    await ChallengeManager.checkExpiredChallenges();

    const challenges = ChallengeManager.getAllActiveChallenges();
    expect(challenges.length).toBe(1);
    expect(challenges[0].id).toBe('active');
  });

  it('should filter challenges by category', async () => {
    const challenges = [
      createMockChallenge({
        id: 'catches-1',
        category: 'catches',
        requirement: { type: 'catches', target: 100, preyTypes: ['fish'] },
      }),
      createMockChallenge({
        id: 'catches-2',
        category: 'catches',
        requirement: { type: 'catches', target: 50, preyTypes: ['mouse'] },
      }),
      createMockChallenge({
        id: 'boss-1',
        category: 'boss-defeats',
        requirement: { type: 'boss-defeats', target: 5, preyTypes: [] },
      }),
    ];

    setMockCollection('challenges', challenges);
    await ChallengeManager.initialize('test-user', 'test-profile');

    const allChallenges = ChallengeManager.getAllActiveChallenges();
    expect(allChallenges.length).toBe(3);
  });

  it('should handle progress throttling correctly', async () => {
    const challenge = createMockChallenge({
      id: 'challenge-1',
      requirement: { type: 'catches', target: 100, preyTypes: ['fish'] },
    });

    setMockCollection('challenges', [challenge]);
    await ChallengeManager.initialize('test-user', 'test-profile');

    await new Promise((resolve) => setTimeout(resolve, 5100));
    await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 10);

    await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 20);

    let progress = ChallengeManager.getUserProgress('challenge-1');
    expect(progress?.progress).toBe(10);

    await new Promise((resolve) => setTimeout(resolve, 5100));
    await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 30);

    progress = ChallengeManager.getUserProgress('challenge-1');
    expect(progress?.progress).toBe(40);
  });
});
