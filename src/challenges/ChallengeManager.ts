import AsyncStorage from '@react-native-async-storage/async-storage';
import { Challenge, ChallengeType, ChallengeTier, Reward, SessionData, GameMode, FishSpecies } from '../types';
import { RewardSystem } from '../rewards/RewardSystem';

interface ChallengeTemplate {
  target: number;
  title: string;
  description: string;
  reward: Reward;
}

const CHALLENGE_TEMPLATES: Record<ChallengeType, Record<ChallengeTier, ChallengeTemplate>> = {
  'catch-count': {
    easy: {
      target: 10,
      title: 'Catch 10 Fish',
      description: 'Catch 10 fish today to complete this challenge',
      reward: { type: 'points', value: 10, displayName: '10 Points' },
    },
    medium: {
      target: 30,
      title: 'Catch 30 Fish',
      description: 'Catch 30 fish today to complete this challenge',
      reward: { type: 'points', value: 30, displayName: '30 Points' },
    },
    hard: {
      target: 50,
      title: 'Catch 50 Fish',
      description: 'Catch 50 fish today to complete this challenge',
      reward: { type: 'prey-unlock', value: 'laser', displayName: 'Laser Prey Type' },
    },
  },
  'play-time': {
    easy: {
      target: 180,
      title: 'Play for 3 Minutes',
      description: 'Play for at least 3 minutes today',
      reward: { type: 'points', value: 10, displayName: '10 Points' },
    },
    medium: {
      target: 600,
      title: 'Play for 10 Minutes',
      description: 'Play for at least 10 minutes today',
      reward: { type: 'points', value: 30, displayName: '30 Points' },
    },
    hard: {
      target: 1800,
      title: 'Play for 30 Minutes',
      description: 'Play for at least 30 minutes today',
      reward: { type: 'theme-unlock', value: 'ocean', displayName: 'Ocean Theme' },
    },
  },
  'mode-variety': {
    easy: {
      target: 2,
      title: 'Try 2 Game Modes',
      description: 'Play at least 2 different game modes today',
      reward: { type: 'points', value: 15, displayName: '15 Points' },
    },
    medium: {
      target: 4,
      title: 'Try 4 Game Modes',
      description: 'Play at least 4 different game modes today',
      reward: { type: 'points', value: 35, displayName: '35 Points' },
    },
    hard: {
      target: 5,
      title: 'Try All Game Modes',
      description: 'Play all 5 game modes today',
      reward: { type: 'achievement', value: 'mode-master', displayName: 'Mode Master Achievement' },
    },
  },
  'species-diversity': {
    easy: {
      target: 3,
      title: 'Catch 3 Different Species',
      description: 'Catch fish of 3 different species today',
      reward: { type: 'points', value: 15, displayName: '15 Points' },
    },
    medium: {
      target: 5,
      title: 'Catch 5 Different Species',
      description: 'Catch fish of 5 different species today',
      reward: { type: 'points', value: 35, displayName: '35 Points' },
    },
    hard: {
      target: 8,
      title: 'Catch 8 Different Species',
      description: 'Catch fish of all 8 species today',
      reward: { type: 'prey-unlock', value: 'insect', displayName: 'Insect Prey Type' },
    },
  },
  'perfect-catches': {
    easy: {
      target: 5,
      title: '5 Perfect Catches',
      description: 'Catch 5 fish without missing',
      reward: { type: 'points', value: 20, displayName: '20 Points' },
    },
    medium: {
      target: 10,
      title: '10 Perfect Catches',
      description: 'Catch 10 fish without missing',
      reward: { type: 'points', value: 40, displayName: '40 Points' },
    },
    hard: {
      target: 20,
      title: '20 Perfect Catches',
      description: 'Catch 20 fish without missing',
      reward: { type: 'achievement', value: 'perfect-hunter', displayName: 'Perfect Hunter Achievement' },
    },
  },
};

export class ChallengeManager {
  static generateDailyChallenges(tier: 'free' | 'premium', date: string): Challenge[] {
    const count = tier === 'free' ? 2 : 5;
    const difficulties: ChallengeTier[] = tier === 'free'
      ? ['easy', 'easy']
      : ['easy', 'easy', 'medium', 'medium', 'hard'];

    const challenges: Challenge[] = [];
    const types: ChallengeType[] = ['catch-count', 'play-time', 'mode-variety', 'species-diversity', 'perfect-catches'];

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const challengeTier = difficulties[i];
      const template = CHALLENGE_TEMPLATES[type][challengeTier];

      challenges.push({
        id: `${date}-${type}-${i}`,
        type,
        tier: challengeTier,
        title: template.title,
        description: template.description,
        target: template.target,
        progress: 0,
        completed: false,
        reward: template.reward,
      });
    }

    return challenges;
  }

  static updateChallenges(challenges: Challenge[], sessionData: SessionData): Challenge[] {
    return challenges.map(challenge => {
      let newProgress = challenge.progress;

      switch (challenge.type) {
        case 'catch-count':
          newProgress = sessionData.catchCount;
          break;
        case 'play-time':
          newProgress = sessionData.playTime;
          break;
        case 'mode-variety':
          newProgress = new Set(sessionData.modesPlayed).size;
          break;
        case 'species-diversity':
          newProgress = new Set(sessionData.speciesCaught).size;
          break;
        case 'perfect-catches':
          newProgress = sessionData.perfectCatches;
          break;
      }

      return {
        ...challenge,
        progress: Math.min(newProgress, challenge.target),
        completed: newProgress >= challenge.target,
      };
    });
  }

  static isComplete(challenge: Challenge): boolean {
    return challenge.completed;
  }

  static async grantReward(reward: Reward, profileId: string): Promise<void> {
    switch (reward.type) {
      case 'prey-unlock':
        await RewardSystem.grantUnlock(profileId, 'prey', reward.value as string);
        break;
      case 'theme-unlock':
        await RewardSystem.grantUnlock(profileId, 'theme', reward.value as string);
        break;
      case 'achievement':
        await RewardSystem.grantUnlock(profileId, 'achievement', reward.value as string);
        break;
      case 'points':
        await RewardSystem.grantUnlock(profileId, 'points', reward.value as number);
        break;
    }
  }

  static async loadChallenges(profileId: string, date: string): Promise<Challenge[] | null> {
    try {
      const key = `challenges:${profileId}:${date}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load challenges:', error);
      return null;
    }
  }

  static async saveChallenges(profileId: string, date: string, challenges: Challenge[]): Promise<void> {
    try {
      const key = `challenges:${profileId}:${date}`;
      await AsyncStorage.setItem(key, JSON.stringify(challenges));
    } catch (error) {
      console.error('Failed to save challenges:', error);
    }
  }

  static async getOrCreateChallenges(
    profileId: string,
    date: string,
    tier: 'free' | 'premium'
  ): Promise<Challenge[]> {
    const existing = await this.loadChallenges(profileId, date);
    if (existing) {
      return existing;
    }

    const newChallenges = this.generateDailyChallenges(tier, date);
    await this.saveChallenges(profileId, date, newChallenges);
    return newChallenges;
  }
}
