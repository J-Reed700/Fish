import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { ShareContent, ShareOptions, ShareResult, Achievement, CatProfile, BossStats, MiniGameType } from '../../types';
import { ImageGenerator } from './ImageGenerator';
import { MessageTemplates } from '../utils/MessageTemplates';
import { LinkGenerator } from '../utils/LinkGenerator';
import { ShareAnalytics } from '../utils/ShareAnalytics';

export class ShareService {
  private static imageGenerator = new ImageGenerator();
  private static linkGenerator = new LinkGenerator();

  static async shareAchievement(
    achievement: Achievement,
    totalAchievements: number,
    options?: Partial<ShareOptions>
  ): Promise<ShareResult> {
    const shareOptions: ShareOptions = {
      includeImage: true,
      includeLink: true,
      saveToGallery: false,
      dialogTitle: 'Share Achievement',
      ...options,
    };

    try {
      const link = this.linkGenerator.generateAchievementLink(achievement.id);
      const message = MessageTemplates.achievement(achievement, totalAchievements, link);

      let imageUri: string | undefined;
      if (shareOptions.includeImage) {
        imageUri = await this.imageGenerator.generateAchievementCard(
          achievement,
          totalAchievements
        );
      }

      const content: ShareContent = {
        type: 'achievement',
        title: `Achievement Unlocked: ${achievement.title}`,
        message,
        imageUri,
        url: shareOptions.includeLink ? link : undefined,
        metadata: {
          achievementId: achievement.id,
          tier: achievement.tier,
          category: achievement.category,
        },
      };

      const result = await this.share(content, shareOptions);

      if (result.success) {
        ShareAnalytics.trackShare('achievement', achievement.id, result.action);
      }

      return result;
    } catch (error) {
      console.error('Failed to share achievement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async shareHighScore(
    category: string,
    score: number,
    rank: number,
    previousBest?: number,
    options?: Partial<ShareOptions>
  ): Promise<ShareResult> {
    const shareOptions: ShareOptions = {
      includeImage: true,
      includeLink: true,
      saveToGallery: false,
      dialogTitle: 'Share High Score',
      ...options,
    };

    try {
      const link = this.linkGenerator.generateLeaderboardLink(category);
      const message = MessageTemplates.highScore(category, score, rank, link);

      let imageUri: string | undefined;
      if (shareOptions.includeImage) {
        imageUri = await this.imageGenerator.generateHighScoreCard(
          category,
          score,
          rank,
          previousBest
        );
      }

      const content: ShareContent = {
        type: 'high-score',
        title: `New High Score in ${category}!`,
        message,
        imageUri,
        url: shareOptions.includeLink ? link : undefined,
        metadata: { category, score, rank, previousBest },
      };

      const result = await this.share(content, shareOptions);

      if (result.success) {
        ShareAnalytics.trackShare('high-score', category, result.action);
      }

      return result;
    } catch (error) {
      console.error('Failed to share high score:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async shareBossVictory(
    bossType: string,
    completionTime: number,
    difficulty: 'normal' | 'hard' | 'extreme',
    options?: Partial<ShareOptions>
  ): Promise<ShareResult> {
    const shareOptions: ShareOptions = {
      includeImage: true,
      includeLink: true,
      saveToGallery: false,
      dialogTitle: 'Share Boss Victory',
      ...options,
    };

    try {
      const link = this.linkGenerator.generateBossLink(bossType);
      const message = MessageTemplates.bossVictory(bossType, completionTime, difficulty, link);

      let imageUri: string | undefined;
      if (shareOptions.includeImage) {
        imageUri = await this.imageGenerator.generateBossVictoryCard(
          bossType,
          completionTime,
          difficulty
        );
      }

      const content: ShareContent = {
        type: 'boss-victory',
        title: `Defeated ${bossType}!`,
        message,
        imageUri,
        url: shareOptions.includeLink ? link : undefined,
        metadata: { bossType, completionTime, difficulty },
      };

      const result = await this.share(content, shareOptions);

      if (result.success) {
        ShareAnalytics.trackShare('boss-victory', bossType, result.action);
      }

      return result;
    } catch (error) {
      console.error('Failed to share boss victory:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async shareProfile(
    profile: CatProfile,
    options?: Partial<ShareOptions>
  ): Promise<ShareResult> {
    const shareOptions: ShareOptions = {
      includeImage: true,
      includeLink: true,
      saveToGallery: false,
      dialogTitle: 'Share Cat Profile',
      ...options,
    };

    try {
      const link = this.linkGenerator.generateProfileLink(profile.id);
      const message = MessageTemplates.profile(profile, link);

      let imageUri: string | undefined;
      if (shareOptions.includeImage) {
        imageUri = await this.imageGenerator.generateProfileCard(profile);
      }

      const content: ShareContent = {
        type: 'profile',
        title: `Meet ${profile.name}!`,
        message,
        imageUri,
        url: shareOptions.includeLink ? link : undefined,
        metadata: {
          profileId: profile.id,
          catName: profile.name,
          breed: profile.breed,
        },
      };

      const result = await this.share(content, shareOptions);

      if (result.success) {
        ShareAnalytics.trackShare('profile', profile.id, result.action);
      }

      return result;
    } catch (error) {
      console.error('Failed to share profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async shareStreak(
    days: number,
    calendarData: { date: string; played: boolean }[],
    options?: Partial<ShareOptions>
  ): Promise<ShareResult> {
    const shareOptions: ShareOptions = {
      includeImage: true,
      includeLink: true,
      saveToGallery: false,
      dialogTitle: 'Share Play Streak',
      ...options,
    };

    try {
      const link = this.linkGenerator.generateStreakLink();
      const message = MessageTemplates.streak(days, link);

      let imageUri: string | undefined;
      if (shareOptions.includeImage) {
        imageUri = await this.imageGenerator.generateStreakCard(days, calendarData);
      }

      const content: ShareContent = {
        type: 'streak',
        title: `${days} Day Play Streak!`,
        message,
        imageUri,
        url: shareOptions.includeLink ? link : undefined,
        metadata: { days, streakData: calendarData },
      };

      const result = await this.share(content, shareOptions);

      if (result.success) {
        ShareAnalytics.trackShare('streak', days.toString(), result.action);
      }

      return result;
    } catch (error) {
      console.error('Failed to share streak:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async shareMiniGame(
    gameType: MiniGameType,
    score: number,
    rank?: number,
    percentile?: number,
    options?: Partial<ShareOptions>
  ): Promise<ShareResult> {
    const shareOptions: ShareOptions = {
      includeImage: true,
      includeLink: true,
      saveToGallery: false,
      dialogTitle: 'Share Mini-Game Score',
      ...options,
    };

    try {
      const link = this.linkGenerator.generateMiniGameLink(gameType);
      const message = MessageTemplates.miniGame(gameType, score, link, rank, percentile);

      let imageUri: string | undefined;
      if (shareOptions.includeImage) {
        imageUri = await this.imageGenerator.generateMiniGameCard(
          gameType,
          score,
          rank,
          percentile
        );
      }

      const content: ShareContent = {
        type: 'mini-game',
        title: `New High Score in ${gameType}!`,
        message,
        imageUri,
        url: shareOptions.includeLink ? link : undefined,
        metadata: { gameType, score, rank, percentile },
      };

      const result = await this.share(content, shareOptions);

      if (result.success) {
        ShareAnalytics.trackShare('mini-game', gameType, result.action);
      }

      return result;
    } catch (error) {
      console.error('Failed to share mini-game score:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async share(
    content: ShareContent,
    options: ShareOptions
  ): Promise<ShareResult> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        console.warn('Sharing is not available on this device');
        return {
          success: false,
          error: 'Sharing not available on this device',
        };
      }

      if (options.saveToGallery && content.imageUri) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(content.imageUri);
          return {
            success: true,
            action: 'saved',
          };
        }
      }

      if (content.imageUri) {
        await Sharing.shareAsync(content.imageUri, {
          dialogTitle: options.dialogTitle || 'Share',
          mimeType: 'image/png',
          UTI: 'public.png',
        });
      } else {
        console.warn('Text-only sharing not directly supported via expo-sharing');
        return {
          success: false,
          error: 'Image required for sharing',
        };
      }

      return {
        success: true,
        action: 'shared',
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('cancelled')) {
        return {
          success: false,
          action: 'dismissed',
        };
      }

      console.error('Share error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async canSaveToGallery(): Promise<boolean> {
    const { status } = await MediaLibrary.getPermissionsAsync();
    return status === 'granted';
  }

  static async requestGalleryPermission(): Promise<boolean> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }
}
