import { LeaderboardService } from '../../leaderboards/services/LeaderboardService';
import { ProfileManager } from '../../profiles/services/ProfileManager';
import { clearAsyncStorageMock } from '../../__mocks__/@react-native-async-storage/async-storage';

jest.mock('../../leaderboards/utils/ScoreValidator', () => ({
  ScoreValidator: {
    validateScore: jest.fn(async () => ({ isValid: true })),
  },
}));

jest.mock('../../leaderboards/config/firebase', () => ({
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

describe('Integration: Leaderboard Submission Flow', () => {
  let profileManager: ProfileManager;

  beforeEach(() => {
    clearAsyncStorageMock();
    LeaderboardService.invalidateCache();
    profileManager = ProfileManager.getInstance();
  });

  it('should submit score and view leaderboard ranking', async () => {
    const profileResult = await profileManager.createProfile('Hunter Cat', undefined, 10);
    const profile = profileResult.profile!;

    const submitResult = await LeaderboardService.submitScore('whack-a-mole', 5000, profile);
    expect(submitResult.success).toBe(true);

    const leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');
    expect(leaderboard.entries.length).toBe(1);
    expect(leaderboard.entries[0].catName).toBe('Hunter Cat');
    expect(leaderboard.entries[0].score).toBe(5000);
    expect(leaderboard.entries[0].rank).toBe(1);

    const rankInfo = await LeaderboardService.getUserRank('test-user-id', 'whack-a-mole');
    expect(rankInfo.rank).toBe(1);
    expect(rankInfo.percentile).toBe(100);
  });

  it('should handle multiple players and rank correctly', async () => {
    const profile1 = await profileManager.createProfile('Cat1', undefined, 10);
    const profile2 = await profileManager.createProfile('Cat2', undefined, 10);
    const profile3 = await profileManager.createProfile('Cat3', undefined, 10);

    await LeaderboardService.submitScore('whack-a-mole', 3000, profile1.profile!);
    await LeaderboardService.submitScore('whack-a-mole', 5000, profile2.profile!);
    await LeaderboardService.submitScore('whack-a-mole', 4000, profile3.profile!);

    const leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');

    expect(leaderboard.entries.length).toBe(3);
    expect(leaderboard.entries[0].score).toBe(5000);
    expect(leaderboard.entries[0].rank).toBe(1);
    expect(leaderboard.entries[1].score).toBe(4000);
    expect(leaderboard.entries[1].rank).toBe(2);
    expect(leaderboard.entries[2].score).toBe(3000);
    expect(leaderboard.entries[2].rank).toBe(3);
  });

  it('should update rank when score improves', async () => {
    const profile = await profileManager.createProfile('Improving Cat', undefined, 10);

    await LeaderboardService.submitScore('whack-a-mole', 3000, profile.profile!);
    let leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');
    expect(leaderboard.entries[0].score).toBe(3000);

    await LeaderboardService.submitScore('whack-a-mole', 6000, profile.profile!);
    leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');
    expect(leaderboard.entries[0].score).toBe(6000);
  });

  it('should handle boss time leaderboards (lower is better)', async () => {
    const profile1 = await profileManager.createProfile('Cat1', undefined, 10);
    const profile2 = await profileManager.createProfile('Cat2', undefined, 10);
    const profile3 = await profileManager.createProfile('Cat3', undefined, 10);

    await LeaderboardService.submitScore('boss-giant-fish', 45000, profile1.profile!);
    await LeaderboardService.submitScore('boss-giant-fish', 30000, profile2.profile!);
    await LeaderboardService.submitScore('boss-giant-fish', 60000, profile3.profile!);

    const leaderboard = await LeaderboardService.getLeaderboard('boss-giant-fish', 'all-time');

    expect(leaderboard.entries[0].score).toBe(30000);
    expect(leaderboard.entries[0].rank).toBe(1);
    expect(leaderboard.entries[1].score).toBe(45000);
    expect(leaderboard.entries[2].score).toBe(60000);
  });

  it('should submit scores across multiple categories', async () => {
    const profile = await profileManager.createProfile('Multi-Game Cat', undefined, 10);

    await LeaderboardService.submitScore('whack-a-mole', 5000, profile.profile!);
    await LeaderboardService.submitScore('bubble-pop', 8000, profile.profile!);
    await LeaderboardService.submitScore('memory-match', 15, profile.profile!);

    const whackLeaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');
    const bubbleLeaderboard = await LeaderboardService.getLeaderboard('bubble-pop', 'all-time');
    const memoryLeaderboard = await LeaderboardService.getLeaderboard('memory-match', 'all-time');

    expect(whackLeaderboard.entries[0].score).toBe(5000);
    expect(bubbleLeaderboard.entries[0].score).toBe(8000);
    expect(memoryLeaderboard.entries[0].score).toBe(15);
  });

  it('should track user rank across different timeframes', async () => {
    const profile = await profileManager.createProfile('Tracker Cat', undefined, 10);

    await LeaderboardService.submitScore('whack-a-mole', 5000, profile.profile!, {
      timestamp: Date.now(),
    });

    const dailyLeaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'daily');
    const weeklyLeaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'weekly');
    const monthlyLeaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'monthly');
    const allTimeLeaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');

    expect(dailyLeaderboard.entries.length).toBe(1);
    expect(weeklyLeaderboard.entries.length).toBe(1);
    expect(monthlyLeaderboard.entries.length).toBe(1);
    expect(allTimeLeaderboard.entries.length).toBe(1);
  });

  it('should handle profile switching and maintain separate scores', async () => {
    const profile1 = await profileManager.createProfile('Cat1', undefined, 10);
    const profile2 = await profileManager.createProfile('Cat2', undefined, 10);

    await LeaderboardService.submitScore('whack-a-mole', 3000, profile1.profile!);

    await profileManager.switchProfile(profile2.profile!.id);
    await LeaderboardService.submitScore('whack-a-mole', 7000, profile2.profile!);

    const leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');

    expect(leaderboard.entries.length).toBe(2);
    expect(leaderboard.entries[0].catName).toBe('Cat2');
    expect(leaderboard.entries[0].score).toBe(7000);
    expect(leaderboard.entries[1].catName).toBe('Cat1');
    expect(leaderboard.entries[1].score).toBe(3000);
  });

  it('should preserve leaderboard state across cache invalidation', async () => {
    const profile = await profileManager.createProfile('Persistent Cat', undefined, 10);

    await LeaderboardService.submitScore('whack-a-mole', 5000, profile.profile!);
    await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');

    LeaderboardService.invalidateCache();

    const leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');
    expect(leaderboard.entries.length).toBe(1);
    expect(leaderboard.entries[0].score).toBe(5000);
  });

  it('should calculate percentiles correctly with many entries', async () => {
    for (let i = 0; i < 20; i++) {
      const profile = await profileManager.createProfile(`Cat${i}`, undefined, 100);
      await LeaderboardService.submitScore('whack-a-mole', 1000 + i * 100, profile.profile!);
    }

    const rankInfo = await LeaderboardService.getUserRank('test-user-id', 'whack-a-mole');

    expect(rankInfo.rank).toBeGreaterThan(0);
    expect(rankInfo.rank).toBeLessThanOrEqual(20);
    expect(rankInfo.percentile).toBeGreaterThan(0);
    expect(rankInfo.percentile).toBeLessThanOrEqual(100);
  });

  it('should handle offline queue and local storage', async () => {
    const profile = await profileManager.createProfile('Offline Cat', undefined, 10);

    const result = await LeaderboardService.submitScore('whack-a-mole', 5000, profile.profile!);
    expect(result.success).toBe(true);

    const leaderboard = await LeaderboardService.getLeaderboard('whack-a-mole', 'all-time');
    expect(leaderboard.entries.length).toBe(1);
    expect(leaderboard.entries[0].score).toBe(5000);
  });
});
