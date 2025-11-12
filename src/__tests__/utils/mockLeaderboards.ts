import { Leaderboard, LeaderboardEntry, LeaderboardCategory } from '../../types';

export const createMockLeaderboardEntry = (overrides?: Partial<LeaderboardEntry>): LeaderboardEntry => {
  return {
    id: `entry_${Date.now()}_test`,
    userId: 'test-user',
    username: 'TestUser',
    catName: 'Test Cat',
    catPhotoUrl: 'file://test-photo.jpg',
    score: 1000,
    timestamp: Date.now(),
    rank: 1,
    ...overrides,
  };
};

export const createMockLeaderboard = (
  category: LeaderboardCategory,
  entryCount: number = 10
): Leaderboard => {
  const entries = Array.from({ length: entryCount }, (_, i) =>
    createMockLeaderboardEntry({
      id: `entry_${i}_test`,
      userId: `user_${i}`,
      username: `User${i + 1}`,
      score: 1000 - i * 10,
      rank: i + 1,
    })
  );

  return {
    category,
    timeframe: 'all-time',
    entries,
    lastUpdated: Date.now(),
  };
};

export const createHighScoreEntry = (score: number, rank: number): LeaderboardEntry => {
  return createMockLeaderboardEntry({ score, rank });
};
