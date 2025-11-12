import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { StreakData } from '../types';

export class StreakTracker {
  static getTodayDate(): string {
    return format(startOfDay(new Date()), 'yyyy-MM-dd');
  }

  static hasPlayedToday(data: StreakData): boolean {
    return data.lastPlayDate === this.getTodayDate();
  }

  static updateStreak(currentData: StreakData): StreakData {
    const today = this.getTodayDate();

    if (currentData.lastPlayDate === today) {
      return currentData;
    }

    const lastDate = currentData.lastPlayDate ? parseISO(currentData.lastPlayDate) : null;
    const daysSinceLastPlay = lastDate ? differenceInDays(startOfDay(new Date()), lastDate) : Infinity;

    let newStreak = currentData.currentStreak;

    if (daysSinceLastPlay === 1) {
      newStreak = currentData.currentStreak + 1;
    } else if (daysSinceLastPlay > 1) {
      newStreak = 1;
    }

    const longestStreak = Math.max(currentData.longestStreak, newStreak);

    return {
      currentStreak: newStreak,
      longestStreak,
      lastPlayDate: today,
      streakHistory: [
        ...currentData.streakHistory,
        { date: today, played: true },
      ].slice(-90),
    };
  }

  static calculateCurrentStreak(history: { date: string; played: boolean }[]): number {
    if (history.length === 0) return 0;

    const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;

    for (let i = 0; i < sortedHistory.length; i++) {
      if (!sortedHistory[i].played) break;

      const currentDate = parseISO(sortedHistory[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (differenceInDays(startOfDay(expectedDate), currentDate) === 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  static async loadStreak(profileId: string): Promise<StreakData> {
    try {
      const key = `streak:${profileId}`;
      const data = await AsyncStorage.getItem(key);

      if (data) {
        return JSON.parse(data);
      }

      return {
        currentStreak: 0,
        longestStreak: 0,
        lastPlayDate: '',
        streakHistory: [],
      };
    } catch (error) {
      console.error('Failed to load streak:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastPlayDate: '',
        streakHistory: [],
      };
    }
  }

  static async saveStreak(profileId: string, data: StreakData): Promise<void> {
    try {
      const key = `streak:${profileId}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save streak:', error);
    }
  }

  static async updateAndSaveStreak(profileId: string): Promise<StreakData> {
    const currentStreak = await this.loadStreak(profileId);
    const updatedStreak = this.updateStreak(currentStreak);
    await this.saveStreak(profileId, updatedStreak);
    return updatedStreak;
  }

  static getStreakMilestones(): { streak: number; reward: string }[] {
    return [
      { streak: 3, reward: 'Unlock 1 new prey type' },
      { streak: 7, reward: 'Unlock 1 background theme' },
      { streak: 14, reward: 'Unlock special achievement' },
      { streak: 30, reward: 'Unlock exclusive cosmetic' },
    ];
  }

  static getNextMilestone(currentStreak: number): { streak: number; reward: string } | null {
    const milestones = this.getStreakMilestones();
    return milestones.find(m => m.streak > currentStreak) || null;
  }
}
