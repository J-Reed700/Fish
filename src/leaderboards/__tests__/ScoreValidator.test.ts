import { ScoreValidator } from '../utils/ScoreValidator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAsyncStorageMock } from '../../__mocks__/@react-native-async-storage/async-storage';

jest.mock('../../config/GameConfig', () => ({
  LEADERBOARD_CONFIG: {
    submitRateLimit: 5,
    scoreValidation: {
      bossDefeatTime: { min: 1000, max: 600000 },
      whackAMole: { min: 0, max: 10000 },
      memoryMatch: { min: 0, max: 100 },
      followLeader: { min: 0, max: 5000 },
      bubblePop: { min: 0, max: 8000 },
      speedRun: { min: 0, max: 10000 },
      totalCatches: { min: 0, max: 1000000 },
      playStreak: { min: 0, max: 365 },
      achievements: { min: 0, max: 100 },
      playtime: { min: 0, max: 100000000 },
    },
  },
}));

describe('ScoreValidator', () => {
  beforeEach(async () => {
    clearAsyncStorageMock();
    await ScoreValidator.clearHistory();
  });

  describe('Score Range Validation', () => {
    it('should accept valid score within range', async () => {
      const result = await ScoreValidator.validateScore('whack-a-mole', 5000);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject score below minimum', async () => {
      const result = await ScoreValidator.validateScore('whack-a-mole', -100);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('out of valid range');
    });

    it('should reject score above maximum', async () => {
      const result = await ScoreValidator.validateScore('whack-a-mole', 50000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('out of valid range');
    });

    it('should reject NaN scores', async () => {
      const result = await ScoreValidator.validateScore('whack-a-mole', NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid score format');
    });

    it('should reject Infinity scores', async () => {
      const result = await ScoreValidator.validateScore('whack-a-mole', Infinity);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid score format');
    });

    it('should validate boss defeat times correctly', async () => {
      const validResult = await ScoreValidator.validateScore('boss-giant-fish', 30000);
      expect(validResult.isValid).toBe(true);

      const tooFastResult = await ScoreValidator.validateScore('boss-giant-fish', 500);
      expect(tooFastResult.isValid).toBe(false);
    });

    it('should validate memory match scores', async () => {
      const validResult = await ScoreValidator.validateScore('memory-match', 15);
      expect(validResult.isValid).toBe(true);

      const tooHighResult = await ScoreValidator.validateScore('memory-match', 150);
      expect(tooHighResult.isValid).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow submissions under rate limit', async () => {
      for (let i = 0; i < 4; i++) {
        const result = await ScoreValidator.validateScore('whack-a-mole', 100 * i);
        expect(result.isValid).toBe(true);
      }
    });

    it('should reject submissions exceeding rate limit', async () => {
      for (let i = 0; i < 5; i++) {
        await ScoreValidator.validateScore('whack-a-mole', 100 * i);
      }

      const result = await ScoreValidator.validateScore('whack-a-mole', 600);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should persist submission history to AsyncStorage', async () => {
      await ScoreValidator.validateScore('whack-a-mole', 1000);

      const stored = await AsyncStorage.getItem('score_submission_history');
      expect(stored).toBeTruthy();

      const history = JSON.parse(stored!);
      expect(history.length).toBe(1);
      expect(history[0].score).toBe(1000);
    });
  });

  describe('Score Delta Validation', () => {
    it('should accept reasonable score improvements', async () => {
      const result = await ScoreValidator.validateScore('whack-a-mole', 5500, 5000);
      expect(result.isValid).toBe(true);
    });

    it('should reject suspicious large score increases', async () => {
      const result = await ScoreValidator.validateScore('whack-a-mole', 8000, 100);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Suspicious score increase detected');
    });

    it('should validate play streak increments properly', async () => {
      const validResult = await ScoreValidator.validateScore('play-streak', 8, 7);
      expect(validResult.isValid).toBe(true);

      const invalidResult = await ScoreValidator.validateScore('play-streak', 12, 7);
      expect(invalidResult.isValid).toBe(false);
    });

    it('should validate achievement increments', async () => {
      const validResult = await ScoreValidator.validateScore('achievements', 15, 10);
      expect(validResult.isValid).toBe(true);

      const invalidResult = await ScoreValidator.validateScore('achievements', 30, 10);
      expect(invalidResult.isValid).toBe(false);
    });

    it('should allow any delta for categories without limits', async () => {
      const result = await ScoreValidator.validateScore('boss-giant-fish', 5000, 50000);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle first-time score submission', async () => {
      const result = await ScoreValidator.validateScore('whack-a-mole', 5000, undefined);
      expect(result.isValid).toBe(true);
    });

    it('should handle zero scores', async () => {
      const result = await ScoreValidator.validateScore('whack-a-mole', 0);
      expect(result.isValid).toBe(true);
    });

    it('should clear submission history', async () => {
      await ScoreValidator.validateScore('whack-a-mole', 1000);
      await ScoreValidator.clearHistory();

      for (let i = 0; i < 5; i++) {
        const result = await ScoreValidator.validateScore('whack-a-mole', 100 * i);
        expect(result.isValid).toBe(true);
      }
    });
  });
});
