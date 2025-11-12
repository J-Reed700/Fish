import { useState, useEffect, useCallback } from 'react';
import type { LeaderboardCategory, LeaderboardEntry } from '../../types';
import { LeaderboardService } from '../services/LeaderboardService';
import { getCurrentUserId } from '../config/firebase';

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all-time';

interface UseUserRankResult {
  rank: number;
  percentile: number;
  entry?: LeaderboardEntry;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useUserRank = (
  category: LeaderboardCategory,
  timeframe: Timeframe = 'all-time'
): UseUserRankResult => {
  const [rank, setRank] = useState(-1);
  const [percentile, setPercentile] = useState(0);
  const [entry, setEntry] = useState<LeaderboardEntry | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRank = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = await getCurrentUserId();
      const result = await LeaderboardService.getUserRank(userId, category, timeframe);

      setRank(result.rank);
      setPercentile(result.percentile);
      setEntry(result.entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user rank');
      console.error('Error in useUserRank:', err);
    } finally {
      setLoading(false);
    }
  }, [category, timeframe]);

  const refresh = useCallback(async () => {
    await fetchRank();
  }, [fetchRank]);

  useEffect(() => {
    fetchRank();
  }, [fetchRank]);

  return { rank, percentile, entry, loading, error, refresh };
};
