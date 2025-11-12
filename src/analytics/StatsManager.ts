import {
  startOfDay,
  differenceInDays,
  format,
  parseISO,
  subDays,
  eachDayOfInterval,
} from 'date-fns';
import type {
  SessionRecord,
  StatsAggregate,
  DailyData,
  GameMode,
  FishSpecies,
} from '../types';
import { AsyncStorageAdapter } from '../storage/AsyncStorageAdapter';

export class StatsManager {
  static async recordSession(session: SessionRecord): Promise<void> {
    await AsyncStorageAdapter.appendSession(session.profileId, session);
  }

  static async getStats(profileId: string): Promise<StatsAggregate> {
    const sessions = await AsyncStorageAdapter.loadSessions(profileId);

    if (sessions.length === 0) {
      return this.getEmptyStats();
    }

    const totalPlayTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalCatches = sessions.reduce((sum, s) => sum + s.fishCount, 0);

    const catchesBySpecies: Record<FishSpecies, number> = {
      goldfish: 0,
      clownfish: 0,
      angelfish: 0,
      betta: 0,
      guppy: 0,
      'neon-tetra': 0,
      koi: 0,
      molly: 0,
    };

    const playTimeByMode: Record<GameMode, number> = {
      'free-swim': 0,
      hunt: 0,
      bubbles: 0,
      frenzy: 0,
      mouse: 0,
      laser: 0,
      insect: 0,
      variety: 0,
    };

    for (const session of sessions) {
      for (const species in session.catchesBySpecies) {
        catchesBySpecies[species as FishSpecies] +=
          session.catchesBySpecies[species as FishSpecies];
      }

      playTimeByMode[session.mode] += session.duration;
    }

    const averageSessionDuration = totalPlayTime / sessions.length;
    const longestSession = Math.max(...sessions.map(s => s.duration));

    const currentStreak = await this.calculateStreak(profileId);

    const lastSession = sessions[sessions.length - 1];
    const lastPlayDate = format(lastSession.endTime, 'yyyy-MM-dd');

    const bestDay = this.calculateBestDay(sessions);

    return {
      totalPlayTime,
      totalCatches,
      catchesBySpecies,
      playTimeByMode,
      totalSessions: sessions.length,
      averageSessionDuration,
      longestSession,
      currentStreak,
      lastPlayDate,
      bestDay,
    };
  }

  static async getDailyPlayTime(profileId: string, days: number): Promise<DailyData[]> {
    const sessions = await AsyncStorageAdapter.loadSessions(profileId);
    const now = new Date();
    const startDate = subDays(now, days - 1);

    const dailyMap = new Map<string, number>();

    const dateRange = eachDayOfInterval({ start: startDate, end: now });
    for (const date of dateRange) {
      dailyMap.set(format(date, 'yyyy-MM-dd'), 0);
    }

    for (const session of sessions) {
      const sessionDate = format(session.endTime, 'yyyy-MM-dd');
      if (dailyMap.has(sessionDate)) {
        dailyMap.set(sessionDate, (dailyMap.get(sessionDate) || 0) + session.duration);
      }
    }

    return Array.from(dailyMap.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  static async getDailyCatches(profileId: string, days: number): Promise<DailyData[]> {
    const sessions = await AsyncStorageAdapter.loadSessions(profileId);
    const now = new Date();
    const startDate = subDays(now, days - 1);

    const dailyMap = new Map<string, number>();

    const dateRange = eachDayOfInterval({ start: startDate, end: now });
    for (const date of dateRange) {
      dailyMap.set(format(date, 'yyyy-MM-dd'), 0);
    }

    for (const session of sessions) {
      const sessionDate = format(session.endTime, 'yyyy-MM-dd');
      if (dailyMap.has(sessionDate)) {
        dailyMap.set(sessionDate, (dailyMap.get(sessionDate) || 0) + session.fishCount);
      }
    }

    return Array.from(dailyMap.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  static async getFavoriteMode(profileId: string): Promise<GameMode> {
    const sessions = await AsyncStorageAdapter.loadSessions(profileId);

    if (sessions.length === 0) {
      return 'free-swim';
    }

    const playTimeByMode: Record<GameMode, number> = {
      'free-swim': 0,
      hunt: 0,
      bubbles: 0,
      frenzy: 0,
      mouse: 0,
      laser: 0,
      insect: 0,
      variety: 0,
    };

    for (const session of sessions) {
      playTimeByMode[session.mode] += session.duration;
    }

    let maxMode: GameMode = 'free-swim';
    let maxTime = 0;

    for (const mode in playTimeByMode) {
      if (playTimeByMode[mode as GameMode] > maxTime) {
        maxTime = playTimeByMode[mode as GameMode];
        maxMode = mode as GameMode;
      }
    }

    return maxMode;
  }

  static async calculateStreak(profileId: string): Promise<number> {
    const sessions = await AsyncStorageAdapter.loadSessions(profileId);

    if (sessions.length === 0) {
      return 0;
    }

    const sortedSessions = sessions.sort((a, b) => b.endTime - a.endTime);

    const uniqueDays = new Set<string>();
    for (const session of sortedSessions) {
      const day = format(session.endTime, 'yyyy-MM-dd');
      uniqueDays.add(day);
    }

    const sortedDays = Array.from(uniqueDays).sort((a, b) => b.localeCompare(a));

    if (sortedDays.length === 0) {
      return 0;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const mostRecentDay = sortedDays[0];

    const daysSinceLastPlay = differenceInDays(
      parseISO(today),
      parseISO(mostRecentDay)
    );

    if (daysSinceLastPlay > 1) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const currentDay = parseISO(sortedDays[i - 1]);
      const previousDay = parseISO(sortedDays[i]);
      const dayDiff = differenceInDays(currentDay, previousDay);

      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  static async cleanupOldData(profileId: string): Promise<void> {
    await AsyncStorageAdapter.removeOldSessions(profileId, 90);
  }

  private static getEmptyStats(): StatsAggregate {
    return {
      totalPlayTime: 0,
      totalCatches: 0,
      catchesBySpecies: {
        goldfish: 0,
        clownfish: 0,
        angelfish: 0,
        betta: 0,
        guppy: 0,
        'neon-tetra': 0,
        koi: 0,
        molly: 0,
      },
      playTimeByMode: {
        'free-swim': 0,
        hunt: 0,
        bubbles: 0,
        frenzy: 0,
        mouse: 0,
        laser: 0,
        insect: 0,
        variety: 0,
      },
      totalSessions: 0,
      averageSessionDuration: 0,
      longestSession: 0,
      currentStreak: 0,
      lastPlayDate: '',
      bestDay: {
        date: '',
        catches: 0,
      },
    };
  }

  private static calculateBestDay(sessions: SessionRecord[]): { date: string; catches: number } {
    const dailyCatches = new Map<string, number>();

    for (const session of sessions) {
      const date = format(session.endTime, 'yyyy-MM-dd');
      dailyCatches.set(date, (dailyCatches.get(date) || 0) + session.fishCount);
    }

    let bestDate = '';
    let bestCatches = 0;

    for (const [date, catches] of dailyCatches.entries()) {
      if (catches > bestCatches) {
        bestDate = date;
        bestCatches = catches;
      }
    }

    return {
      date: bestDate,
      catches: bestCatches,
    };
  }
}
