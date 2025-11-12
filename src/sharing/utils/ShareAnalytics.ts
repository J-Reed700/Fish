import { ShareContentType } from '../../types';
import { GAME_CONFIG } from '../../config/GameConfig';

interface ShareEvent {
  type: ShareContentType;
  contentId: string;
  action?: 'shared' | 'dismissed' | 'saved';
  timestamp: number;
}

interface ShareStats {
  totalShares: number;
  sharesByType: Record<ShareContentType, number>;
  sharesByAction: Record<string, number>;
  lastShareTimestamp: number;
}

export class ShareAnalytics {
  private static events: ShareEvent[] = [];
  private static readonly MAX_EVENTS = 1000;

  static trackShare(
    type: ShareContentType,
    contentId: string,
    action?: 'shared' | 'dismissed' | 'saved'
  ): void {
    if (!GAME_CONFIG.SHARING_CONFIG.analytics.trackShares) {
      return;
    }

    const event: ShareEvent = {
      type,
      contentId,
      action,
      timestamp: Date.now(),
    };

    this.events.push(event);

    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    if (GAME_CONFIG.SHARING_CONFIG.analytics.trackShareSuccess && action === 'shared') {
      console.log(`[ShareAnalytics] Successfully shared ${type}: ${contentId}`);
    }

    this.logEvent(event);
  }

  static getStats(): ShareStats {
    const stats: ShareStats = {
      totalShares: 0,
      sharesByType: {
        achievement: 0,
        'high-score': 0,
        'boss-victory': 0,
        profile: 0,
        streak: 0,
        'mini-game': 0,
      },
      sharesByAction: {
        shared: 0,
        dismissed: 0,
        saved: 0,
      },
      lastShareTimestamp: 0,
    };

    this.events.forEach((event) => {
      stats.totalShares++;
      stats.sharesByType[event.type] = (stats.sharesByType[event.type] || 0) + 1;

      if (event.action) {
        stats.sharesByAction[event.action] = (stats.sharesByAction[event.action] || 0) + 1;
      }

      if (event.timestamp > stats.lastShareTimestamp) {
        stats.lastShareTimestamp = event.timestamp;
      }
    });

    return stats;
  }

  static getSharesByDateRange(startDate: Date, endDate: Date): ShareEvent[] {
    return this.events.filter(
      (event) =>
        event.timestamp >= startDate.getTime() && event.timestamp <= endDate.getTime()
    );
  }

  static getMostSharedContent(): {
    type: ShareContentType;
    count: number;
  } | null {
    const stats = this.getStats();
    let maxCount = 0;
    let mostSharedType: ShareContentType | null = null;

    (Object.keys(stats.sharesByType) as ShareContentType[]).forEach((type) => {
      if (stats.sharesByType[type] > maxCount) {
        maxCount = stats.sharesByType[type];
        mostSharedType = type;
      }
    });

    if (!mostSharedType) return null;

    return {
      type: mostSharedType,
      count: maxCount,
    };
  }

  static getViralCoefficient(): number {
    const totalShares = this.events.filter((e) => e.action === 'shared').length;
    const totalInstalls = 1;

    return totalShares / totalInstalls;
  }

  static getConversionRate(): number {
    const totalShares = this.events.filter((e) => e.action === 'shared').length;
    const totalAttempts = this.events.length;

    if (totalAttempts === 0) return 0;

    return totalShares / totalAttempts;
  }

  static clearEvents(): void {
    this.events = [];
  }

  private static logEvent(event: ShareEvent): void {
    if (__DEV__) {
      console.log('[ShareAnalytics] Event:', {
        type: event.type,
        contentId: event.contentId,
        action: event.action,
        timestamp: new Date(event.timestamp).toISOString(),
      });
    }
  }

  static exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }

  static importEvents(data: string): void {
    try {
      const parsedEvents = JSON.parse(data) as ShareEvent[];
      this.events = parsedEvents.slice(-this.MAX_EVENTS);
    } catch (error) {
      console.error('Failed to import share events:', error);
    }
  }
}
