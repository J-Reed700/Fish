import type {
  SeasonalEvent,
  SeasonalEventConfig,
  ActiveSeasonalEvent,
} from '../types';
import { DateManager, type EventSchedule } from './utils/DateManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@seasonal_progress';
const CHECK_INTERVAL = 3600000;

export class SeasonalManager {
  private static instance: SeasonalManager;
  private activeEvents: Map<SeasonalEvent, ActiveSeasonalEvent> = new Map();
  private eventConfigs: Map<SeasonalEvent, SeasonalEventConfig> = new Map();
  private checkIntervalId: NodeJS.Timeout | null = null;
  private listeners: Set<(events: ActiveSeasonalEvent[]) => void> = new Set();

  private constructor() {}

  static getInstance(): SeasonalManager {
    if (!SeasonalManager.instance) {
      SeasonalManager.instance = new SeasonalManager();
    }
    return SeasonalManager.instance;
  }

  async initialize(configs: SeasonalEventConfig[]): Promise<void> {
    for (const config of configs) {
      this.eventConfigs.set(config.id, config);
    }

    await this.loadProgress();
    this.checkActiveEvents();
    this.startPeriodicCheck();
  }

  registerEventConfig(config: SeasonalEventConfig): void {
    this.eventConfigs.set(config.id, config);
  }

  private startPeriodicCheck(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }

    this.checkIntervalId = setInterval(() => {
      this.checkActiveEvents();
    }, CHECK_INTERVAL);
  }

  private checkActiveEvents(): void {
    const now = Date.now();
    let hasChanges = false;

    for (const [eventId, config] of this.eventConfigs.entries()) {
      const schedule: EventSchedule = {
        eventId,
        startDate: config.startDate,
        endDate: config.endDate,
      };

      const isActive = DateManager.isEventActive(schedule);
      const currentlyActive = this.activeEvents.has(eventId);

      if (isActive && !currentlyActive) {
        this.activateEvent(config);
        hasChanges = true;
      } else if (!isActive && currentlyActive) {
        this.deactivateEvent(eventId);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.notifyListeners();
      this.saveProgress();
    }
  }

  private activateEvent(config: SeasonalEventConfig): void {
    const now = Date.now();
    const schedule: EventSchedule = {
      eventId: config.id,
      startDate: config.startDate,
      endDate: config.endDate,
    };

    const daysRemaining = DateManager.getDaysRemainingInEvent(schedule);
    const endTime = now + daysRemaining * 24 * 60 * 60 * 1000;

    const activeEvent: ActiveSeasonalEvent = {
      event: config,
      progress: {
        challengesCompleted: 0,
        totalChallenges: config.challenges.length,
        bossesDefeated: 0,
        collectiblesFound: 0,
        eventCurrency: 0,
      },
      startTime: now,
      endTime,
      isActive: true,
    };

    this.activeEvents.set(config.id, activeEvent);
    console.log(`[SeasonalManager] Activated event: ${config.name}`);
  }

  private deactivateEvent(eventId: SeasonalEvent): void {
    const event = this.activeEvents.get(eventId);
    if (event) {
      event.isActive = false;
      console.log(`[SeasonalManager] Deactivated event: ${event.event.name}`);
      this.activeEvents.delete(eventId);
    }
  }

  getActiveEvents(): ActiveSeasonalEvent[] {
    return Array.from(this.activeEvents.values()).filter((event) => event.isActive);
  }

  getEvent(eventId: SeasonalEvent): ActiveSeasonalEvent | undefined {
    return this.activeEvents.get(eventId);
  }

  isEventActive(eventId: SeasonalEvent): boolean {
    const event = this.activeEvents.get(eventId);
    return event?.isActive ?? false;
  }

  updateProgress(
    eventId: SeasonalEvent,
    updates: Partial<ActiveSeasonalEvent['progress']>
  ): void {
    const event = this.activeEvents.get(eventId);
    if (event) {
      event.progress = { ...event.progress, ...updates };
      this.saveProgress();
      this.notifyListeners();
    }
  }

  incrementCurrency(eventId: SeasonalEvent, amount: number): void {
    const event = this.activeEvents.get(eventId);
    if (event) {
      event.progress.eventCurrency += amount;
      this.saveProgress();
      this.notifyListeners();
    }
  }

  spendCurrency(eventId: SeasonalEvent, amount: number): boolean {
    const event = this.activeEvents.get(eventId);
    if (event && event.progress.eventCurrency >= amount) {
      event.progress.eventCurrency -= amount;
      this.saveProgress();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  completeChallenge(eventId: SeasonalEvent, challengeId: string): void {
    const event = this.activeEvents.get(eventId);
    if (event) {
      const challenge = event.event.challenges.find((c) => c.id === challengeId);
      if (challenge && !challenge.completed) {
        challenge.completed = true;
        event.progress.challengesCompleted += 1;

        for (const reward of challenge.rewards) {
          if (reward.type === 'currency') {
            event.progress.eventCurrency += reward.quantity;
          }
        }

        this.saveProgress();
        this.notifyListeners();
      }
    }
  }

  defeatBoss(eventId: SeasonalEvent, bossId: string): void {
    const event = this.activeEvents.get(eventId);
    if (event) {
      event.progress.bossesDefeated += 1;

      const boss = event.event.bosses.find((b) => b.id === bossId);
      if (boss) {
        for (const reward of boss.rewards) {
          if (reward.type === 'currency') {
            event.progress.eventCurrency += reward.quantity;
          }
        }
      }

      this.saveProgress();
      this.notifyListeners();
    }
  }

  subscribe(listener: (events: ActiveSeasonalEvent[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const events = this.getActiveEvents();
    this.listeners.forEach((listener) => listener(events));
  }

  private async saveProgress(): Promise<void> {
    try {
      const data = Array.from(this.activeEvents.entries()).map(([id, event]) => ({
        id,
        progress: event.progress,
        startTime: event.startTime,
        endTime: event.endTime,
      }));

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[SeasonalManager] Failed to save progress:', error);
    }
  }

  private async loadProgress(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const saved = JSON.parse(data);
        for (const item of saved) {
          const config = this.eventConfigs.get(item.id);
          if (config) {
            const activeEvent: ActiveSeasonalEvent = {
              event: config,
              progress: item.progress,
              startTime: item.startTime,
              endTime: item.endTime,
              isActive: true,
            };
            this.activeEvents.set(item.id, activeEvent);
          }
        }
      }
    } catch (error) {
      console.error('[SeasonalManager] Failed to load progress:', error);
    }
  }

  destroy(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
    this.listeners.clear();
  }

  getUpcomingEvents(limit: number = 3): Array<{
    event: SeasonalEventConfig;
    daysUntil: number;
  }> {
    const upcoming: Array<{ event: SeasonalEventConfig; daysUntil: number }> = [];

    for (const config of this.eventConfigs.values()) {
      if (!this.isEventActive(config.id)) {
        const schedule: EventSchedule = {
          eventId: config.id,
          startDate: config.startDate,
          endDate: config.endDate,
        };
        const daysUntil = DateManager.getDaysUntilEvent(schedule);
        if (daysUntil > 0) {
          upcoming.push({ event: config, daysUntil });
        }
      }
    }

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, limit);
  }
}

export default SeasonalManager.getInstance();
