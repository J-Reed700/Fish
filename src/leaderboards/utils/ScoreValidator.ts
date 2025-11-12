import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LeaderboardCategory } from '../../types';
import { LEADERBOARD_CONFIG } from '../../config/GameConfig';

interface ScoreSubmission {
  category: LeaderboardCategory;
  score: number;
  timestamp: number;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const RATE_LIMIT_KEY = 'score_submission_history';
const RATE_LIMIT_WINDOW = 60000;

export class ScoreValidator {
  private static submissionHistory: ScoreSubmission[] = [];
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const history = await AsyncStorage.getItem(RATE_LIMIT_KEY);
      if (history) {
        this.submissionHistory = JSON.parse(history);
        this.cleanOldSubmissions();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize ScoreValidator:', error);
      this.submissionHistory = [];
      this.initialized = true;
    }
  }

  static async validateScore(
    category: LeaderboardCategory,
    score: number,
    previousScore?: number
  ): Promise<ValidationResult> {
    await this.initialize();

    const rangeValidation = this.validateScoreRange(category, score);
    if (!rangeValidation.isValid) {
      return rangeValidation;
    }

    const rateLimitValidation = await this.validateRateLimit();
    if (!rateLimitValidation.isValid) {
      return rateLimitValidation;
    }

    if (previousScore !== undefined) {
      const deltaValidation = this.validateScoreDelta(category, score, previousScore);
      if (!deltaValidation.isValid) {
        return deltaValidation;
      }
    }

    await this.recordSubmission(category, score);

    return { isValid: true };
  }

  private static validateScoreRange(
    category: LeaderboardCategory,
    score: number
  ): ValidationResult {
    if (typeof score !== 'number' || !isFinite(score) || isNaN(score)) {
      return { isValid: false, error: 'Invalid score format' };
    }

    const validationRules = this.getValidationRules(category);
    if (!validationRules) {
      return { isValid: true };
    }

    if (score < validationRules.min || score > validationRules.max) {
      return {
        isValid: false,
        error: `Score out of valid range (${validationRules.min}-${validationRules.max})`,
      };
    }

    return { isValid: true };
  }

  private static async validateRateLimit(): Promise<ValidationResult> {
    this.cleanOldSubmissions();

    const recentSubmissions = this.submissionHistory.filter(
      (s) => Date.now() - s.timestamp < RATE_LIMIT_WINDOW
    );

    if (recentSubmissions.length >= LEADERBOARD_CONFIG.submitRateLimit) {
      return {
        isValid: false,
        error: `Rate limit exceeded. Max ${LEADERBOARD_CONFIG.submitRateLimit} submissions per minute`,
      };
    }

    return { isValid: true };
  }

  private static validateScoreDelta(
    category: LeaderboardCategory,
    newScore: number,
    previousScore: number
  ): ValidationResult {
    const maxAllowedIncrease = this.getMaxScoreIncrease(category);

    if (maxAllowedIncrease === Infinity) {
      return { isValid: true };
    }

    const delta = Math.abs(newScore - previousScore);

    if (delta > maxAllowedIncrease) {
      return {
        isValid: false,
        error: 'Suspicious score increase detected',
      };
    }

    return { isValid: true };
  }

  private static async recordSubmission(
    category: LeaderboardCategory,
    score: number
  ): Promise<void> {
    const submission: ScoreSubmission = {
      category,
      score,
      timestamp: Date.now(),
    };

    this.submissionHistory.push(submission);
    this.cleanOldSubmissions();

    try {
      await AsyncStorage.setItem(
        RATE_LIMIT_KEY,
        JSON.stringify(this.submissionHistory)
      );
    } catch (error) {
      console.error('Failed to save submission history:', error);
    }
  }

  private static cleanOldSubmissions(): void {
    const cutoff = Date.now() - RATE_LIMIT_WINDOW;
    this.submissionHistory = this.submissionHistory.filter(
      (s) => s.timestamp > cutoff
    );
  }

  private static getValidationRules(
    category: LeaderboardCategory
  ): { min: number; max: number } | null {
    const { scoreValidation } = LEADERBOARD_CONFIG;

    switch (category) {
      case 'boss-giant-fish':
      case 'boss-speed-demon':
      case 'boss-swarm-leader':
      case 'boss-mega-cockroach':
        return scoreValidation.bossDefeatTime;

      case 'whack-a-mole':
        return scoreValidation.whackAMole;

      case 'memory-match':
        return scoreValidation.memoryMatch;

      case 'follow-leader':
        return scoreValidation.followLeader;

      case 'bubble-pop':
        return scoreValidation.bubblePop;

      case 'speed-run':
        return scoreValidation.speedRun;

      case 'total-catches':
        return scoreValidation.totalCatches;

      case 'play-streak':
        return scoreValidation.playStreak;

      case 'achievements':
        return scoreValidation.achievements;

      case 'playtime':
        return scoreValidation.playtime;

      default:
        return null;
    }
  }

  private static getMaxScoreIncrease(category: LeaderboardCategory): number {
    switch (category) {
      case 'whack-a-mole':
      case 'follow-leader':
      case 'bubble-pop':
      case 'speed-run':
        return 1000;

      case 'memory-match':
        return 20;

      case 'total-catches':
        return 500;

      case 'play-streak':
        return 2;

      case 'achievements':
        return 10;

      case 'playtime':
        return 3600000;

      case 'boss-total-defeats':
        return 10;

      default:
        return Infinity;
    }
  }

  static async clearHistory(): Promise<void> {
    this.submissionHistory = [];
    try {
      await AsyncStorage.removeItem(RATE_LIMIT_KEY);
    } catch (error) {
      console.error('Failed to clear submission history:', error);
    }
  }
}
