import { useState, useEffect, useCallback } from 'react';
import type { Leaderboard, LeaderboardCategory } from '../../types';
import { LeaderboardService } from '../services/LeaderboardService';

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all-time';

interface UseLeaderboardResult {
  leaderboard: Leaderboard | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useLeaderboard = (
  category: LeaderboardCategory,
  timeframe: Timeframe,
  autoRefresh: boolean = true
): UseLeaderboardResult => {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await LeaderboardService.getLeaderboard(category, timeframe);
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      console.error('Error in useLeaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [category, timeframe]);

  const refresh = useCallback(async () => {
    LeaderboardService.invalidateCache(category);
    await fetchData();
  }, [category, fetchData]);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const unsubscribe = LeaderboardService.subscribeToLeaderboard(
        category,
        timeframe,
        (data) => {
          setLeaderboard(data);
        }
      );

      return unsubscribe;
    }
  }, [category, timeframe, autoRefresh, fetchData]);

  return { leaderboard, loading, error, refresh };
};
