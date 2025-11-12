import { ChallengeManager } from '../services/ChallengeManager';
import { createMockChallenge, createMockUserProgress } from '../../__tests__/utils/mockChallenges';
import { setMockCollection, clearMockFirestoreData } from '../../__tests__/utils/mockFirestore';

jest.mock('../../config/firebase', () => ({
  db: {},
}));

describe('ChallengeManager', () => {
  beforeEach(() => {
    clearMockFirestoreData();
    ChallengeManager.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize and load active challenges', async () => {
      const mockChallenges = [
        createMockChallenge({ id: 'challenge-1', title: 'Daily Challenge 1' }),
        createMockChallenge({ id: 'challenge-2', title: 'Daily Challenge 2' }),
      ];

      setMockCollection('challenges', mockChallenges);

      await ChallengeManager.initialize('test-user', 'test-profile');

      const challenges = ChallengeManager.getAllActiveChallenges();
      expect(challenges.length).toBe(2);
    });

    it('should load user progress for active challenges', async () => {
      const mockChallenge = createMockChallenge({ id: 'challenge-1' });
      setMockCollection('challenges', [mockChallenge]);

      await ChallengeManager.initialize('test-user', 'test-profile');

      const progress = ChallengeManager.getUserProgress('challenge-1');
      expect(progress).toBeDefined();
      expect(progress?.userId).toBe('test-user');
    });

    it('should create progress entries for new challenges', async () => {
      const mockChallenge = createMockChallenge({
        id: 'challenge-1',
        requirement: { type: 'catches', target: 100, preyTypes: ['fish'] },
      });
      setMockCollection('challenges', [mockChallenge]);

      await ChallengeManager.initialize('test-user', 'test-profile');

      const progress = ChallengeManager.getUserProgress('challenge-1');
      expect(progress?.progress).toBe(0);
      expect(progress?.target).toBe(100);
    });
  });

  describe('Challenge Loading', () => {
    it('should only load active challenges', async () => {
      const activeChallenges = [
        createMockChallenge({ id: 'active-1', isActive: true }),
        createMockChallenge({ id: 'active-2', isActive: true }),
      ];

      setMockCollection('challenges', activeChallenges);

      const challenges = await ChallengeManager.loadActiveChallenges();
      expect(challenges.length).toBe(2);
    });

    it('should filter expired challenges', async () => {
      const expiredChallenge = createMockChallenge({
        id: 'expired',
        endTime: Date.now() - 86400000,
      });

      setMockCollection('challenges', [expiredChallenge]);

      const challenges = await ChallengeManager.loadActiveChallenges();
      expect(challenges.length).toBe(0);
    });
  });

  describe('Progress Tracking', () => {
    beforeEach(async () => {
      const mockChallenge = createMockChallenge({
        id: 'challenge-1',
        requirement: { type: 'catches', target: 100, preyTypes: ['fish'] },
      });
      setMockCollection('challenges', [mockChallenge]);
      await ChallengeManager.initialize('test-user', 'test-profile');
    });

    it('should track progress increment', async () => {
      await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 10);

      const progress = ChallengeManager.getUserProgress('challenge-1');
      expect(progress?.progress).toBe(10);
    });

    it('should mark challenge as completed when target reached', async () => {
      await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 100);

      const progress = ChallengeManager.getUserProgress('challenge-1');
      expect(progress?.isCompleted).toBe(true);
      expect(progress?.completedAt).toBeDefined();
    });

    it('should not exceed target progress', async () => {
      await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 150);

      const progress = ChallengeManager.getUserProgress('challenge-1');
      expect(progress?.progress).toBe(100);
    });

    it('should not track progress for completed challenges', async () => {
      await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 100);
      await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 10);

      const progress = ChallengeManager.getUserProgress('challenge-1');
      expect(progress?.progress).toBe(100);
    });

    it('should throttle progress updates', async () => {
      await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 10);
      await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 20);

      const progress = ChallengeManager.getUserProgress('challenge-1');
      expect(progress?.progress).toBe(10);
    });
  });

  describe('Community Challenges', () => {
    beforeEach(async () => {
      const communityChallenge = createMockChallenge({
        id: 'community-1',
        type: 'community',
        requirement: { type: 'catches', target: 1000, preyTypes: ['fish'] },
      });
      setMockCollection('challenges', [communityChallenge]);
      await ChallengeManager.initialize('test-user', 'test-profile');
    });

    it('should update community progress for community challenges', async () => {
      await new Promise((resolve) => setTimeout(resolve, 5100));
      await ChallengeManager.trackProgress('test-user', 'test-profile', 'community-1', 50);

      const progress = ChallengeManager.getUserProgress('community-1');
      expect(progress?.progress).toBe(50);
    });
  });

  describe('Reward Claiming', () => {
    beforeEach(async () => {
      const mockChallenge = createMockChallenge({
        id: 'challenge-1',
        requirement: { type: 'catches', target: 100, preyTypes: ['fish'] },
      });
      setMockCollection('challenges', [mockChallenge]);
      await ChallengeManager.initialize('test-user', 'test-profile');
    });

    it('should claim reward for completed challenge', async () => {
      await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 100);
      await ChallengeManager.claimReward('test-user', 'challenge-1');

      const progress = ChallengeManager.getUserProgress('challenge-1');
      expect(progress?.claimedReward).toBe(true);
    });

    it('should not claim reward for incomplete challenge', async () => {
      await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 50);
      await ChallengeManager.claimReward('test-user', 'challenge-1');

      const progress = ChallengeManager.getUserProgress('challenge-1');
      expect(progress?.claimedReward).toBe(false);
    });

    it('should not claim reward twice', async () => {
      await ChallengeManager.trackProgress('test-user', 'test-profile', 'challenge-1', 100);
      await ChallengeManager.claimReward('test-user', 'challenge-1');
      await ChallengeManager.claimReward('test-user', 'challenge-1');

      const progress = ChallengeManager.getUserProgress('challenge-1');
      expect(progress?.claimedReward).toBe(true);
    });
  });

  describe('Challenge Filtering', () => {
    beforeEach(async () => {
      const challenges = [
        createMockChallenge({ id: 'daily-1', type: 'daily' }),
        createMockChallenge({ id: 'daily-2', type: 'daily' }),
        createMockChallenge({ id: 'weekly-1', type: 'weekly' }),
        createMockChallenge({ id: 'community-1', type: 'community' }),
      ];
      setMockCollection('challenges', challenges);
      await ChallengeManager.initialize('test-user', 'test-profile');
    });

    it('should filter challenges by type', () => {
      const dailyChallenges = ChallengeManager.getChallengesByType('daily');
      expect(dailyChallenges.length).toBe(2);

      const weeklyChallenges = ChallengeManager.getChallengesByType('weekly');
      expect(weeklyChallenges.length).toBe(1);

      const communityChallenges = ChallengeManager.getChallengesByType('community');
      expect(communityChallenges.length).toBe(1);
    });
  });

  describe('Challenge Expiration', () => {
    it('should check and deactivate expired challenges', async () => {
      const expiredChallenge = createMockChallenge({
        id: 'expired-1',
        isActive: true,
        endTime: Date.now() - 1000,
      });

      const activeChallenge = createMockChallenge({
        id: 'active-1',
        isActive: true,
        endTime: Date.now() + 86400000,
      });

      setMockCollection('challenges', [expiredChallenge, activeChallenge]);
      await ChallengeManager.initialize('test-user', 'test-profile');

      await ChallengeManager.checkExpiredChallenges();

      const challenges = ChallengeManager.getAllActiveChallenges();
      expect(challenges.length).toBe(1);
      expect(challenges[0].id).toBe('active-1');
    });
  });

  describe('Real-time Updates', () => {
    it('should subscribe to challenge updates', async () => {
      const mockChallenge = createMockChallenge({ id: 'challenge-1' });
      setMockCollection('challenges', [mockChallenge]);

      await ChallengeManager.initialize('test-user', 'test-profile');

      const challenges = ChallengeManager.getAllActiveChallenges();
      expect(challenges.length).toBe(1);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup all resources', async () => {
      const mockChallenge = createMockChallenge({ id: 'challenge-1' });
      setMockCollection('challenges', [mockChallenge]);

      await ChallengeManager.initialize('test-user', 'test-profile');
      ChallengeManager.cleanup();

      const challenges = ChallengeManager.getAllActiveChallenges();
      expect(challenges.length).toBe(0);
    });
  });
});
