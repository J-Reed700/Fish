import * as FileSystem from 'expo-file-system';
import {
  Skia,
  Canvas,
  useCanvasRef,
  Image as SkiaImage,
  rect,
  rrect,
  Paragraph,
  FontStyle,
  TextAlign,
} from '@shopify/react-native-skia';
import { Achievement, CatProfile, MiniGameType } from '../../types';
import { GAME_CONFIG } from '../../config/GameConfig';

export class ImageGenerator {
  private readonly width = GAME_CONFIG.SHARING_CONFIG.imageSize.width;
  private readonly height = GAME_CONFIG.SHARING_CONFIG.imageSize.height;
  private readonly format = GAME_CONFIG.SHARING_CONFIG.imageFormat;
  private readonly quality = GAME_CONFIG.SHARING_CONFIG.imageQuality;

  async generateAchievementCard(
    achievement: Achievement,
    totalAchievements: number
  ): Promise<string> {
    try {
      const surface = Skia.Surface.MakeOffscreen(this.width, this.height);
      if (!surface) throw new Error('Failed to create surface');

      const canvas = surface.getCanvas();

      const template = GAME_CONFIG.SHARING_CONFIG.templates.achievement;
      this.drawGradientBackground(canvas, template.backgroundColor);

      this.drawText(canvas, 'ACHIEVEMENT UNLOCKED', 100, 300, {
        fontSize: 48,
        color: template.subtitleColor,
        align: 'center',
      });

      this.drawText(canvas, achievement.title, 100, 800, {
        fontSize: 72,
        color: template.titleColor,
        align: 'center',
        maxWidth: this.width - 200,
      });

      this.drawText(canvas, achievement.description, 100, 950, {
        fontSize: 42,
        color: template.subtitleColor,
        align: 'center',
        maxWidth: this.width - 200,
      });

      const progressText = `${achievement.unlocked ? 1 : 0} of ${totalAchievements} achievements unlocked`;
      this.drawText(canvas, progressText, 100, 1200, {
        fontSize: 36,
        color: template.subtitleColor,
        align: 'center',
      });

      this.drawBranding(canvas);

      const image = surface.makeImageSnapshot();
      const data = image.encodeToBytes();

      const path = `${FileSystem.cacheDirectory ?? ''}share_achievement_${Date.now()}.png`;
      const base64 = this.bytesToBase64(data);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: 'base64' as any,
      });

      return path;
    } catch (error) {
      console.error('Failed to generate achievement card:', error);
      throw error;
    }
  }

  async generateHighScoreCard(
    category: string,
    score: number,
    rank: number,
    previousBest?: number
  ): Promise<string> {
    try {
      const surface = Skia.Surface.MakeOffscreen(this.width, this.height);
      if (!surface) throw new Error('Failed to create surface');

      const canvas = surface.getCanvas();

      const template = GAME_CONFIG.SHARING_CONFIG.templates.highScore;
      this.drawGradientBackground(canvas, template.backgroundColor);

      this.drawText(canvas, 'NEW HIGH SCORE!', 100, 300, {
        fontSize: 64,
        color: template.titleColor,
        align: 'center',
      });

      this.drawText(canvas, category.toUpperCase(), 100, 500, {
        fontSize: 48,
        color: template.subtitleColor,
        align: 'center',
      });

      this.drawText(canvas, score.toLocaleString(), 100, 900, {
        fontSize: 120,
        color: template.titleColor,
        align: 'center',
      });

      this.drawText(canvas, `RANK #${rank}`, 100, 1100, {
        fontSize: 56,
        color: template.subtitleColor,
        align: 'center',
      });

      if (previousBest !== undefined && previousBest > 0) {
        const improvement = score - previousBest;
        const improvementText = `+${improvement.toLocaleString()} from previous best`;
        this.drawText(canvas, improvementText, 100, 1250, {
          fontSize: 36,
          color: template.subtitleColor,
          align: 'center',
        });
      }

      this.drawBranding(canvas);

      const image = surface.makeImageSnapshot();
      const data = image.encodeToBytes();

      const path = `${FileSystem.cacheDirectory ?? ''}share_highscore_${Date.now()}.png`;
      const base64 = this.bytesToBase64(data);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: 'base64' as any,
      });

      return path;
    } catch (error) {
      console.error('Failed to generate high score card:', error);
      throw error;
    }
  }

  async generateBossVictoryCard(
    bossType: string,
    completionTime: number,
    difficulty: 'normal' | 'hard' | 'extreme'
  ): Promise<string> {
    try {
      const surface = Skia.Surface.MakeOffscreen(this.width, this.height);
      if (!surface) throw new Error('Failed to create surface');

      const canvas = surface.getCanvas();

      const template = GAME_CONFIG.SHARING_CONFIG.templates.bossVictory;
      this.drawGradientBackground(canvas, template.backgroundColor);

      this.drawText(canvas, 'VICTORY!', 100, 300, {
        fontSize: 96,
        color: template.titleColor,
        align: 'center',
      });

      const bossName = this.formatBossName(bossType);
      this.drawText(canvas, `Defeated ${bossName}`, 100, 700, {
        fontSize: 64,
        color: template.titleColor,
        align: 'center',
        maxWidth: this.width - 200,
      });

      const timeText = `in ${completionTime.toFixed(1)}s`;
      this.drawText(canvas, timeText, 100, 900, {
        fontSize: 72,
        color: template.subtitleColor,
        align: 'center',
      });

      const difficultyColor = this.getDifficultyColor(difficulty);
      this.drawText(canvas, difficulty.toUpperCase(), 100, 1100, {
        fontSize: 48,
        color: difficultyColor,
        align: 'center',
      });

      this.drawBranding(canvas);

      const image = surface.makeImageSnapshot();
      const data = image.encodeToBytes();

      const path = `${FileSystem.cacheDirectory ?? ''}share_boss_${Date.now()}.png`;
      const base64 = this.bytesToBase64(data);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: 'base64' as any,
      });

      return path;
    } catch (error) {
      console.error('Failed to generate boss victory card:', error);
      throw error;
    }
  }

  async generateProfileCard(profile: CatProfile): Promise<string> {
    try {
      const surface = Skia.Surface.MakeOffscreen(this.width, this.height);
      if (!surface) throw new Error('Failed to create surface');

      const canvas = surface.getCanvas();

      const template = GAME_CONFIG.SHARING_CONFIG.templates.profile;
      this.drawGradientBackground(canvas, template.backgroundColor);

      this.drawText(canvas, `Meet ${profile.name}!`, 100, 300, {
        fontSize: 72,
        color: template.titleColor,
        align: 'center',
      });

      if (profile.breed) {
        this.drawText(canvas, profile.breed, 100, 450, {
          fontSize: 42,
          color: template.subtitleColor,
          align: 'center',
        });
      }

      const statsY = 800;
      const lineHeight = 100;

      this.drawText(
        canvas,
        `Total Catches: ${profile.stats.totalCatches.toLocaleString()}`,
        100,
        statsY,
        {
          fontSize: 48,
          color: template.titleColor,
          align: 'center',
        }
      );

      const playtimeHours = Math.floor(profile.stats.totalPlaytime / 3600);
      this.drawText(canvas, `Playtime: ${playtimeHours} hours`, 100, statsY + lineHeight, {
        fontSize: 48,
        color: template.titleColor,
        align: 'center',
      });

      if (profile.stats.favoritePreyType) {
        this.drawText(
          canvas,
          `Favorite Prey: ${profile.stats.favoritePreyType}`,
          100,
          statsY + lineHeight * 2,
          {
            fontSize: 48,
            color: template.titleColor,
            align: 'center',
          }
        );
      }

      this.drawBranding(canvas);

      const image = surface.makeImageSnapshot();
      const data = image.encodeToBytes();

      const path = `${FileSystem.cacheDirectory ?? ''}share_profile_${Date.now()}.png`;
      const base64 = this.bytesToBase64(data);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: 'base64' as any,
      });

      return path;
    } catch (error) {
      console.error('Failed to generate profile card:', error);
      throw error;
    }
  }

  async generateStreakCard(
    days: number,
    calendarData: { date: string; played: boolean }[]
  ): Promise<string> {
    try {
      const surface = Skia.Surface.MakeOffscreen(this.width, this.height);
      if (!surface) throw new Error('Failed to create surface');

      const canvas = surface.getCanvas();

      const template = GAME_CONFIG.SHARING_CONFIG.templates.streak;
      this.drawGradientBackground(canvas, template.backgroundColor);

      this.drawText(canvas, '🔥', 100, 400, {
        fontSize: 150,
        color: '#FFFFFF',
        align: 'center',
      });

      this.drawText(canvas, `${days} DAY STREAK!`, 100, 700, {
        fontSize: 80,
        color: template.titleColor,
        align: 'center',
      });

      this.drawText(
        canvas,
        'Kept my cat entertained',
        100,
        900,
        {
          fontSize: 48,
          color: template.subtitleColor,
          align: 'center',
        }
      );

      this.drawText(canvas, `${days} days straight!`, 100, 1000, {
        fontSize: 48,
        color: template.subtitleColor,
        align: 'center',
      });

      this.drawBranding(canvas);

      const image = surface.makeImageSnapshot();
      const data = image.encodeToBytes();

      const path = `${FileSystem.cacheDirectory ?? ''}share_streak_${Date.now()}.png`;
      const base64 = this.bytesToBase64(data);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: 'base64' as any,
      });

      return path;
    } catch (error) {
      console.error('Failed to generate streak card:', error);
      throw error;
    }
  }

  async generateMiniGameCard(
    gameType: MiniGameType,
    score: number,
    rank?: number,
    percentile?: number
  ): Promise<string> {
    try {
      const surface = Skia.Surface.MakeOffscreen(this.width, this.height);
      if (!surface) throw new Error('Failed to create surface');

      const canvas = surface.getCanvas();

      const template = GAME_CONFIG.SHARING_CONFIG.templates.miniGame;
      this.drawGradientBackground(canvas, template.backgroundColor);

      const gameName = this.formatGameName(gameType);
      this.drawText(canvas, gameName, 100, 300, {
        fontSize: 64,
        color: template.titleColor,
        align: 'center',
        maxWidth: this.width - 200,
      });

      this.drawText(canvas, 'NEW HIGH SCORE', 100, 500, {
        fontSize: 48,
        color: template.subtitleColor,
        align: 'center',
      });

      this.drawText(canvas, score.toLocaleString(), 100, 900, {
        fontSize: 120,
        color: template.titleColor,
        align: 'center',
      });

      if (rank !== undefined) {
        this.drawText(canvas, `Rank #${rank}`, 100, 1100, {
          fontSize: 56,
          color: template.subtitleColor,
          align: 'center',
        });
      }

      if (percentile !== undefined) {
        this.drawText(canvas, `Top ${percentile}%`, 100, 1200, {
          fontSize: 42,
          color: template.subtitleColor,
          align: 'center',
        });
      }

      this.drawBranding(canvas);

      const image = surface.makeImageSnapshot();
      const data = image.encodeToBytes();

      const path = `${FileSystem.cacheDirectory ?? ''}share_minigame_${Date.now()}.png`;
      const base64 = this.bytesToBase64(data);
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: 'base64' as any,
      });

      return path;
    } catch (error) {
      console.error('Failed to generate mini-game card:', error);
      throw error;
    }
  }

  private drawGradientBackground(canvas: any, colors: string[]) {
    const paint = Skia.Paint();
    const shader = Skia.Shader.MakeLinearGradient(
      Skia.Point(0, 0),
      Skia.Point(0, this.height),
      colors.map((c) => Skia.Color(c)),
      null,
      0
    );
    paint.setShader(shader);
    canvas.drawRect(rect(0, 0, this.width, this.height), paint);
  }

  private drawText(
    canvas: any,
    text: string,
    x: number,
    y: number,
    options: {
      fontSize: number;
      color: string;
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
    }
  ) {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(options.color));
    paint.setAntiAlias(true);

    const font = Skia.Font(undefined, options.fontSize);

    let finalX = x;
    if (options.align === 'center') {
      const textWidth = font.measureText(text).width;
      finalX = (this.width - textWidth) / 2;
    } else if (options.align === 'right') {
      const textWidth = font.measureText(text).width;
      finalX = this.width - x - textWidth;
    }

    canvas.drawText(text, finalX, y, paint, font);
  }

  private drawBranding(canvas: any) {
    const brandingY = this.height - 200;

    this.drawText(canvas, 'Cat Entertainment App', 100, brandingY, {
      fontSize: 32,
      color: '#FFFFFF',
      align: 'center',
    });

    this.drawText(
      canvas,
      GAME_CONFIG.SHARING_CONFIG.appDownloadUrl,
      100,
      brandingY + 60,
      {
        fontSize: 28,
        color: '#E0E0E0',
        align: 'center',
      }
    );
  }

  private formatBossName(bossType: string): string {
    return bossType
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private formatGameName(gameType: MiniGameType): string {
    return gameType
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getDifficultyColor(difficulty: 'normal' | 'hard' | 'extreme'): string {
    switch (difficulty) {
      case 'normal':
        return '#4CAF50';
      case 'hard':
        return '#FF9800';
      case 'extreme':
        return '#F44336';
      default:
        return '#FFFFFF';
    }
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
