import { LeaderboardService } from '../services/LeaderboardService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMockProfile, createMockLeaderboard } from '../../__tests__/utils/mockProfiles';
import { clearAsyncStorageMock } from '../../__mocks__/@react-native-async-storage/async-storage';

jest.mock('../utils/ScoreValidator', () => ({
  ScoreValidator: {
    validateScore: jest.fn(async () => ({ isValid: true })),
  },
}));

jest.mock('../config/firebase', () => ({
  getCurrentUserId: jest.fn(async () => 'test-user-id'),
  isFirebaseAvailable: jest.fn(() => false),
}));

jest.mock('../../config/GameConfig', () => ({
  LEADERBOARD_CONFIG: {
    cacheDuration: 300000,
    refreshInterval: 30000,
    maxEntriesPerCategory: 100,
    submitRateLimit: 5,
    scoreValidation: {},
  },
}));

describe('LeaderboardService', () => {
  beforeEach(() => {
    clearAsyncStorageMock();
    LeaderboardService.invalidateCache();
  });

  describe('Score Submission', () => {
    it('should submit a valid score successfully', async () => {
      const profile = createMockProfile();
      const result = await LeaderboardService.submitScore('whack-a-mole', 5000, profile);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should store submitted score locally', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile);

      const stored = await AsyncStorage.getItem('leaderboard_whack-a-mole_all-time');
      expect(stored).toBeTruthy();

      const leaderboard = JSON.parse(stored!);
      expect(leaderboard.entries.length).toBe(1);
      expect(leaderboard.entries[0].score).toBe(5000);
    });

    it('should update score across all timeframes', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile);

      const dailyStored = await AsyncStorage.getItem('leaderboard_whack-a-mole_daily');
      const weeklyStored = await AsyncStorage.getItem('leaderboard_whack-a-mole_weekly');
      const monthlyStored = await AsyncStorage.getItem('leaderboard_whack-a-mole_monthly');
      const allTimeStored = await AsyncStorage.getItem('leaderboard_whack-a-mole_all-time');

      expect(dailyStored).toBeTruthy();
      expect(weeklyStored).toBeTruthy();
      expect(monthlyStored).toBeTruthy();
      expect(allTimeStored).toBeTruthy();
    });

    it('should only update if new score is better (higher score categories)', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile);
      await LeaderboardService.submitScore('whack-a-mole', 3000, profile);

      const stored = await AsyncStorage.getItem('leaderboard_whack-a-mole_all-time');
      const leaderboard = JSON.parse(stored!);

      expect(leaderboard.entries[0].score).toBe(5000);
    });

    it('should update if new score is better (lower score categories)', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('boss-giant-fish', 30000, profile);
      await LeaderboardService.submitScore('boss-giant-fish', 25000, profile);

      const stored = await AsyncStorage.getItem('leaderboard_boss-giant-fish_all-time');
      const leaderboard = JSON.parse(stored!);

      expect(leaderboard.entries[0].score).toBe(25000);
    });

    it('should include profile metadata in entry', async () => {
      const profile = createMockProfile({ name: 'Fluffy' });
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile, { extra: 'data' });

      const stored = await AsyncStorage.getItem('leaderboard_whack-a-mole_all-time');
      const leaderboard = JSON.parse(stored!);

      expect(leaderboard.entries[0].catName).toBe('Fluffy');
      expect(leaderboard.entries[0].metadata).toEqual({ extra: 'data' });
    });

    it('should invalidate cache after submission', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile);

      await LeaderboardService.submitScore('whack-a-mole', 6000, profile);
      const leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');

      expect(leaderboard.entries[0].score).toBe(6000);
    });
  });

  describe('Leaderboard Fetching', () => {
    it('should fetch empty leaderboard when no data exists', async () => {
      const leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');

      expect(leaderboard.category).toBe('whack-a-mole');
      expect(leaderboard.timeframe).toBe('all-time');
      expect(leaderboard.entries).toEqual([]);
    });

    it('should fetch stored leaderboard data', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile);

      const leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');

      expect(leaderboard.entries.length).toBe(1);
      expect(leaderboard.entries[0].score).toBe(5000);
    });

    it('should rank entries correctly (descending for most categories)', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile);

      const profile2 = createMockProfile({ id: 'profile2' });
      await LeaderboardService.submitScore('whack-a-mole', 7000, profile2);

      const leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');

      expect(leaderboard.entries[0].score).toBe(7000);
      expect(leaderboard.entries[0].rank).toBe(1);
      expect(leaderboard.entries[1].score).toBe(5000);
      expect(leaderboard.entries[1].rank).toBe(2);
    });

    it('should rank boss times correctly (ascending)', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('boss-giant-fish', 30000, profile);

      const profile2 = createMockProfile({ id: 'profile2' });
      await LeaderboardService.submitScore('boss-giant-fish', 25000, profile2);

      const leaderboard = await LeaderboardService.getLeaderboard('boss-giant-fish', 'all-time');

      expect(leaderboard.entries[0].score).toBe(25000);
      expect(leaderboard.entries[0].rank).toBe(1);
      expect(leaderboard.entries[1].score).toBe(30000);
      expect(leaderboard.entries[1].rank).toBe(2);
    });

    it('should cache leaderboard results', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile);

      await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');

      jest.spyOn(AsyncStorage, 'getItem');
      await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');

      expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    });

    it('should limit number of entries returned', async () => {
      const profile = createMockProfile();
      for (let i = 0; i < 150; i++) {
        const testProfile = createMockProfile({ id: `profile${i}` });
        await LeaderboardService.submitScore('whack-a-mole', 1000 + i, testProfile);
      }

      const leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time', 50);

      expect(leaderboard.entries.length).toBe(50);
    });
  });

  describe('User Rank Calculation', () => {
    it('should calculate user rank correctly', async () => {
      const profile1 = createMockProfile({ id: 'user1' });
      const profile2 = createMockProfile({ id: 'user2' });
      const profile3 = createMockProfile({ id: 'user3' });

      await LeaderboardService.submitScore('whack-a-mole', 8000, profile1);
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile2);
      await LeaderboardService.submitScore('whack-a-mole', 9000, profile3);

      const rankInfo = await LeaderboardService.getUserRank('user2', 'whack-a-mole');

      expect(rankInfo.rank).toBe(3);
      expect(rankInfo.entry).toBeDefined();
      expect(rankInfo.entry?.score).toBe(5000);
    });

    it('should calculate percentile correctly', async () => {
      for (let i = 0; i < 10; i++) {
        const profile = createMockProfile({ id: `user${i}` });
        await LeaderboardService.submitScore('whack-a-mole', 1000 + i * 100, profile);
      }

      const rankInfo = await LeaderboardService.getUserRank('user5', 'whack-a-mole');

      expect(rankInfo.percentile).toBeGreaterThan(0);
      expect(rankInfo.percentile).toBeLessThanOrEqual(100);
    });

    it('should return -1 rank if user not found', async () => {
      const rankInfo = await LeaderboardService.getUserRank('nonexistent-user', 'whack-a-mole');

      expect(rankInfo.rank).toBe(-1);
      expect(rankInfo.percentile).toBe(0);
      expect(rankInfo.entry).toBeUndefined();
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should subscribe to leaderboard updates', (done) => {
      const profile = createMockProfile();
      LeaderboardService.submitScore('whack-a-mole', 5000, profile);

      const unsubscribe = LeaderboardService.subscribeToLeaderboard(
        'whack-a-mole',
        'all-time',
        (data) => {
          expect(data.entries.length).toBeGreaterThan(0);
          unsubscribe();
          done();
        }
      );
    });

    it('should provide unsubscribe function', () => {
      const unsubscribe = LeaderboardService.subscribeToLeaderboard(
        'whack-a-mole',
        'all-time',
        jest.fn()
      );

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });

  describe('Offline Queue', () => {
    it('should queue submissions when offline', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile);

      const queue = await AsyncStorage.getItem('submission_queue');
      expect(queue).toBeTruthy();
    });
  });

  describe('Cache Management', () => {
    it('should invalidate cache for specific category', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile);
      await LeaderboardService.submitScore('bubble-pop', 3000, profile);

      await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');
      await LeaderboardService.getLeaderboard('bubble-pop', 'all-time');

      LeaderboardService.invalidateCache('whack-a-mole');

      jest.spyOn(AsyncStorage, 'getItem');
      await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    it('should invalidate all caches', async () => {
      const profile = createMockProfile();
      await LeaderboardService.submitScore('whack-a-mole', 5000, profile);
      await LeaderboardService.submitScore('bubble-pop', 3000, profile);

      await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');
      await LeaderboardService.getLeaderboard('bubble-pop', 'all-time');

      LeaderboardService.invalidateCache();

      jest.spyOn(AsyncStorage, 'getItem');
      await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });
});
