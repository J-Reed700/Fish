import { MessageTemplates } from '../utils/MessageTemplates';
import { createMockProfile } from '../../__tests__/utils/mockProfiles';

describe('MessageTemplates', () => {
  describe('Achievement Messages', () => {
    it('should generate achievement message', () => {
      const achievement = {
        id: 'achievement-1',
        title: 'Master Hunter',
        description: 'Catch 1000 prey',
        tier: 'gold' as const,
        category: 'catches' as const,
        icon: '🏆',
        unlockedAt: Date.now(),
      };

      const message = MessageTemplates.achievement(achievement, 50, 'https://link.com');

      expect(message).toContain('Master Hunter');
      expect(message).toContain('50');
      expect(message).toBeDefined();
    });

    it('should handle missing link', () => {
      const achievement = {
        id: 'achievement-1',
        title: 'Master Hunter',
        description: 'Catch 1000 prey',
        tier: 'gold' as const,
        category: 'catches' as const,
        icon: '🏆',
        unlockedAt: Date.now(),
      };

      const message = MessageTemplates.achievement(achievement, 50);

      expect(message).toContain('Master Hunter');
      expect(message).toBeDefined();
    });
  });

  describe('High Score Messages', () => {
    it('should generate high score message', () => {
      const message = MessageTemplates.highScore('whack-a-mole', 5000, 12, 'https://link.com');

      expect(message).toContain('5000');
      expect(message).toContain('12');
      expect(message).toBeDefined();
    });

    it('should format category name', () => {
      const message = MessageTemplates.highScore('whack-a-mole', 5000, 12);

      expect(message.toLowerCase()).toContain('whack');
    });
  });

  describe('Boss Victory Messages', () => {
    it('should generate boss victory message', () => {
      const message = MessageTemplates.bossVictory('Giant Fish', 45000, 'hard', 'https://link.com');

      expect(message).toContain('Giant Fish');
      expect(message).toContain('hard');
      expect(message).toBeDefined();
    });

    it('should format completion time', () => {
      const message = MessageTemplates.bossVictory('Giant Fish', 65000, 'normal');

      expect(message).toBeDefined();
    });
  });

  describe('Profile Messages', () => {
    it('should generate profile message', () => {
      const profile = createMockProfile({ name: 'Fluffy', breed: 'Siamese' });
      const message = MessageTemplates.profile(profile, 'https://link.com');

      expect(message).toContain('Fluffy');
      expect(message).toBeDefined();
    });

    it('should include stats', () => {
      const profile = createMockProfile({
        name: 'Fluffy',
        stats: {
          totalPlaytime: 3600000,
          totalCatches: 1500,
          catchesByPreyType: {} as any,
          bossAttempts: 10,
          bossDefeats: 5,
          miniGamesPlayed: 25,
          playStreak: 7,
        },
      });

      const message = MessageTemplates.profile(profile);

      expect(message).toContain('1500');
    });
  });

  describe('Streak Messages', () => {
    it('should generate streak message', () => {
      const message = MessageTemplates.streak(7, 'https://link.com');

      expect(message).toContain('7');
      expect(message).toBeDefined();
    });

    it('should handle milestone streaks', () => {
      const message = MessageTemplates.streak(100);

      expect(message).toContain('100');
      expect(message).toBeDefined();
    });
  });

  describe('Mini-Game Messages', () => {
    it('should generate mini-game message', () => {
      const message = MessageTemplates.miniGame('whack-a-mole', 8500, 'https://link.com');

      expect(message).toContain('8500');
      expect(message).toBeDefined();
    });

    it('should include rank if provided', () => {
      const message = MessageTemplates.miniGame('whack-a-mole', 8500, 'https://link.com', 5);

      expect(message).toContain('5');
    });

    it('should include percentile if provided', () => {
      const message = MessageTemplates.miniGame('whack-a-mole', 8500, 'https://link.com', 5, 95);

      expect(message).toContain('95');
    });
  });

  describe('Message Length Limits', () => {
    it('should keep messages under 280 characters', () => {
      const achievement = {
        id: 'achievement-1',
        title: 'A Very Long Achievement Title That Goes On And On',
        description: 'This is an extremely long description that should be truncated',
        tier: 'gold' as const,
        category: 'catches' as const,
        icon: '🏆',
        unlockedAt: Date.now(),
      };

      const message = MessageTemplates.achievement(achievement, 50, 'https://very-long-link.com/path/to/achievement/123456789');

      expect(message.length).toBeLessThanOrEqual(280);
    });
  });
});
