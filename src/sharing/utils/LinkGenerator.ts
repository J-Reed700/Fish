import QRCode from 'qrcode';
import { GAME_CONFIG } from '../../config/GameConfig';
import { MiniGameType } from '../../types';

export class LinkGenerator {
  private readonly baseUrl = GAME_CONFIG.SHARING_CONFIG.deepLinkBaseUrl;
  private readonly downloadUrl = GAME_CONFIG.SHARING_CONFIG.appDownloadUrl;

  generateAchievementLink(achievementId: string): string {
    return `${this.baseUrl}?type=achievement&id=${achievementId}`;
  }

  generateLeaderboardLink(category: string): string {
    return `${this.baseUrl}?type=leaderboard&category=${encodeURIComponent(category)}`;
  }

  generateBossLink(bossType: string): string {
    return `${this.baseUrl}?type=boss&boss=${encodeURIComponent(bossType)}`;
  }

  generateProfileLink(profileId: string): string {
    return `${this.baseUrl}?type=profile&id=${profileId}`;
  }

  generateStreakLink(): string {
    return `${this.baseUrl}?type=streak`;
  }

  generateMiniGameLink(gameType: MiniGameType): string {
    return `${this.baseUrl}?type=minigame&game=${encodeURIComponent(gameType)}`;
  }

  getDownloadUrl(): string {
    return this.downloadUrl;
  }

  async generateQRCode(url: string, size: number = 200): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });
      return qrDataUrl;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  parseShareLink(url: string): { type: string; params: Record<string, string> } | null {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};

      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const type = params.type;
      if (!type) return null;

      return { type, params };
    } catch (error) {
      console.error('Failed to parse share link:', error);
      return null;
    }
  }

  buildDeepLink(params: Record<string, string>): string {
    const queryParams = new URLSearchParams(params).toString();
    return `${this.baseUrl}?${queryParams}`;
  }

  shortenUrl(longUrl: string): Promise<string> {
    return Promise.resolve(longUrl);
  }
}
