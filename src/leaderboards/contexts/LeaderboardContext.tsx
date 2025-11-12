import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Leaderboard, LeaderboardCategory } from '../../types';
import { LeaderboardService } from '../services/LeaderboardService';

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all-time';

interface LeaderboardContextValue {
  leaderboards: Map<string, Leaderboard>;
  loading: boolean;
  error: string | null;
  fetchLeaderboard: (category: LeaderboardCategory, timeframe: Timeframe) => Promise<void>;
  refreshLeaderboard: (category: LeaderboardCategory, timeframe: Timeframe) => Promise<void>;
  subscribeToCategory: (
    category: LeaderboardCategory,
    timeframe: Timeframe,
    callback: (data: Leaderboard) => void
  ) => () => void;
}

const LeaderboardContext = createContext<LeaderboardContextValue | undefined>(undefined);

export const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaderboards, setLeaderboards] = useState<Map<string, Leaderboard>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(
    async (category: LeaderboardCategory, timeframe: Timeframe) => {
      setLoading(true);
      setError(null);

      try {
        const data = await LeaderboardService.getLeaderboard(category, timeframe);
        const key = `${category}_${timeframe}`;

        setLeaderboards((prev) => {
          const newMap = new Map(prev);
          newMap.set(key, data);
          return newMap;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshLeaderboard = useCallback(
    async (category: LeaderboardCategory, timeframe: Timeframe) => {
      LeaderboardService.invalidateCache(category);
      await fetchLeaderboard(category, timeframe);
    },
    [fetchLeaderboard]
  );

  const subscribeToCategory = useCallback(
    (
      category: LeaderboardCategory,
      timeframe: Timeframe,
      callback: (data: Leaderboard) => void
    ) => {
      return LeaderboardService.subscribeToLeaderboard(category, timeframe, callback);
    },
    []
  );

  const value: LeaderboardContextValue = {
    leaderboards,
    loading,
    error,
    fetchLeaderboard,
    refreshLeaderboard,
    subscribeToCategory,
  };

  return <LeaderboardContext.Provider value={value}>{children}</LeaderboardContext.Provider>;
};

export const useLeaderboardContext = (): LeaderboardContextValue => {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboardContext must be used within LeaderboardProvider');
  }
  return context;
};
