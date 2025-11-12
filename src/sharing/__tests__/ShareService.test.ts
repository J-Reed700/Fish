import { ShareService } from '../services/ShareService';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { createMockProfile } from '../../__tests__/utils/mockProfiles';

jest.mock('../services/ImageGenerator', () => ({
  ImageGenerator: jest.fn().mockImplementation(() => ({
    generateAchievementCard: jest.fn(async () => 'file://achievement.png'),
    generateHighScoreCard: jest.fn(async () => 'file://highscore.png'),
    generateBossVictoryCard: jest.fn(async () => 'file://boss.png'),
    generateProfileCard: jest.fn(async () => 'file://profile.png'),
    generateStreakCard: jest.fn(async () => 'file://streak.png'),
    generateMiniGameCard: jest.fn(async () => 'file://minigame.png'),
  })),
}));

jest.mock('../utils/MessageTemplates', () => ({
  MessageTemplates: {
    achievement: jest.fn(() => 'Achievement unlocked message'),
    highScore: jest.fn(() => 'High score message'),
    bossVictory: jest.fn(() => 'Boss victory message'),
    profile: jest.fn(() => 'Profile message'),
    streak: jest.fn(() => 'Streak message'),
    miniGame: jest.fn(() => 'Mini-game message'),
  },
}));

jest.mock('../utils/LinkGenerator', () => ({
  LinkGenerator: jest.fn().mockImplementation(() => ({
    generateAchievementLink: jest.fn(() => 'https://app.link/achievement/123'),
    generateLeaderboardLink: jest.fn(() => 'https://app.link/leaderboard/whack-a-mole'),
    generateBossLink: jest.fn(() => 'https://app.link/boss/giant-fish'),
    generateProfileLink: jest.fn(() => 'https://app.link/profile/123'),
    generateStreakLink: jest.fn(() => 'https://app.link/streak'),
    generateMiniGameLink: jest.fn(() => 'https://app.link/minigame/whack-a-mole'),
  })),
}));

jest.mock('../utils/ShareAnalytics', () => ({
  ShareAnalytics: {
    trackShare: jest.fn(),
  },
}));

describe('ShareService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Share Achievement', () => {
    const mockAchievement = {
      id: 'achievement-1',
      title: 'Master Hunter',
      description: 'Catch 1000 prey',
      tier: 'gold' as const,
      category: 'catches' as const,
      icon: '🏆',
      unlockedAt: Date.now(),
    };

    it('should share achievement with image and link', async () => {
      const result = await ShareService.shareAchievement(mockAchievement, 50);

      expect(result.success).toBe(true);
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        'file://achievement.png',
        expect.objectContaining({
          dialogTitle: 'Share Achievement',
          mimeType: 'image/png',
        })
      );
    });

    it('should generate correct content structure', async () => {
      await ShareService.shareAchievement(mockAchievement, 50);

      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    it('should respect includeImage option', async () => {
      const result = await ShareService.shareAchievement(mockAchievement, 50, {
        includeImage: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Image required');
    });

    it('should save to gallery if requested', async () => {
      const result = await ShareService.shareAchievement(mockAchievement, 50, {
        saveToGallery: true,
      });

      expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalled();
      expect(MediaLibrary.saveToLibraryAsync).toHaveBeenCalledWith('file://achievement.png');
      expect(result.action).toBe('saved');
    });

    it('should handle permission denial for gallery save', async () => {
      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const result = await ShareService.shareAchievement(mockAchievement, 50, {
        saveToGallery: true,
      });

      expect(MediaLibrary.saveToLibraryAsync).not.toHaveBeenCalled();
    });

    it('should handle user cancellation', async () => {
      (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(new Error('cancelled'));

      const result = await ShareService.shareAchievement(mockAchievement, 50);

      expect(result.success).toBe(false);
      expect(result.action).toBe('dismissed');
    });
  });

  describe('Share High Score', () => {
    it('should share high score with rank', async () => {
      const result = await ShareService.shareHighScore('whack-a-mole', 5000, 12);

      expect(result.success).toBe(true);
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        'file://highscore.png',
        expect.any(Object)
      );
    });

    it('should include previous best if provided', async () => {
      await ShareService.shareHighScore('whack-a-mole', 5000, 12, 4000);

      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    it('should use custom dialog title', async () => {
      await ShareService.shareHighScore('whack-a-mole', 5000, 12, undefined, {
        dialogTitle: 'Custom Title',
      });

      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          dialogTitle: 'Custom Title',
        })
      );
    });
  });

  describe('Share Boss Victory', () => {
    it('should share boss victory with completion time', async () => {
      const result = await ShareService.shareBossVictory('Giant Fish', 45000, 'hard');

      expect(result.success).toBe(true);
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    it('should handle all difficulty levels', async () => {
      const normal = await ShareService.shareBossVictory('Giant Fish', 45000, 'normal');
      const hard = await ShareService.shareBossVictory('Giant Fish', 45000, 'hard');
      const extreme = await ShareService.shareBossVictory('Giant Fish', 45000, 'extreme');

      expect(normal.success).toBe(true);
      expect(hard.success).toBe(true);
      expect(extreme.success).toBe(true);
    });
  });

  describe('Share Profile', () => {
    it('should share cat profile', async () => {
      const profile = createMockProfile({ name: 'Fluffy' });
      const result = await ShareService.shareProfile(profile);

      expect(result.success).toBe(true);
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        'file://profile.png',
        expect.any(Object)
      );
    });

    it('should include profile metadata', async () => {
      const profile = createMockProfile({
        name: 'Fluffy',
        breed: 'Siamese',
      });
      await ShareService.shareProfile(profile);

      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });

  describe('Share Streak', () => {
    it('should share play streak with calendar data', async () => {
      const calendarData = [
        { date: '2024-01-01', played: true },
        { date: '2024-01-02', played: true },
        { date: '2024-01-03', played: false },
      ];

      const result = await ShareService.shareStreak(7, calendarData);

      expect(result.success).toBe(true);
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });

  describe('Share Mini-Game', () => {
    it('should share mini-game score', async () => {
      const result = await ShareService.shareMiniGame('whack-a-mole', 8500);

      expect(result.success).toBe(true);
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    it('should include rank and percentile if provided', async () => {
      const result = await ShareService.shareMiniGame('whack-a-mole', 8500, 5, 95);

      expect(result.success).toBe(true);
    });
  });

  describe('Gallery Permissions', () => {
    it('should check if can save to gallery', async () => {
      const canSave = await ShareService.canSaveToGallery();
      expect(canSave).toBe(true);
    });

    it('should request gallery permission', async () => {
      const granted = await ShareService.requestGalleryPermission();
      expect(granted).toBe(true);
      expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should handle permission denial', async () => {
      (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const granted = await ShareService.requestGalleryPermission();
      expect(granted).toBe(false);
    });
  });

  describe('Sharing Availability', () => {
    it('should handle sharing not available', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

      const mockAchievement = {
        id: 'achievement-1',
        title: 'Test',
        description: 'Test',
        tier: 'bronze' as const,
        category: 'catches' as const,
        icon: '🏆',
        unlockedAt: Date.now(),
      };

      const result = await ShareService.shareAchievement(mockAchievement, 50);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });
  });

  describe('Error Handling', () => {
    it('should handle image generation failure', async () => {
      const ImageGenerator = require('../services/ImageGenerator').ImageGenerator;
      ImageGenerator.mockImplementationOnce(() => ({
        generateAchievementCard: jest.fn(async () => {
          throw new Error('Image generation failed');
        }),
      }));

      const mockAchievement = {
        id: 'achievement-1',
        title: 'Test',
        description: 'Test',
        tier: 'bronze' as const,
        category: 'catches' as const,
        icon: '🏆',
        unlockedAt: Date.now(),
      };

      const result = await ShareService.shareAchievement(mockAchievement, 50);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle unexpected errors gracefully', async () => {
      (Sharing.shareAsync as jest.Mock).mockRejectedValueOnce(new Error('Unexpected error'));

      const profile = createMockProfile();
      const result = await ShareService.shareProfile(profile);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
