import type { SeasonalEvent } from '../../types';

export interface DateRange {
  month: number;
  day: number;
}

export interface EventSchedule {
  eventId: SeasonalEvent;
  startDate: DateRange;
  endDate: DateRange;
}

export class DateManager {
  private static testMode: boolean = false;
  private static forcedEvent: SeasonalEvent | null = null;

  static enableTestMode(event: SeasonalEvent | null = null): void {
    this.testMode = true;
    this.forcedEvent = event;
  }

  static disableTestMode(): void {
    this.testMode = false;
    this.forcedEvent = null;
  }

  static getCurrentDate(): Date {
    return new Date();
  }

  static isDateInRange(
    currentMonth: number,
    currentDay: number,
    startDate: DateRange,
    endDate: DateRange
  ): boolean {
    const currentDate = currentMonth * 100 + currentDay;
    const startValue = startDate.month * 100 + startDate.day;
    const endValue = endDate.month * 100 + endDate.day;

    if (startValue <= endValue) {
      return currentDate >= startValue && currentDate <= endValue;
    } else {
      return currentDate >= startValue || currentDate <= endValue;
    }
  }

  static isEventActive(schedule: EventSchedule): boolean {
    if (this.testMode) {
      return this.forcedEvent === null || this.forcedEvent === schedule.eventId;
    }

    const now = this.getCurrentDate();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    return this.isDateInRange(month, day, schedule.startDate, schedule.endDate);
  }

  static getDaysUntilEvent(schedule: EventSchedule): number {
    const now = this.getCurrentDate();
    const currentYear = now.getFullYear();

    const eventDate = new Date(
      currentYear,
      schedule.startDate.month - 1,
      schedule.startDate.day
    );

    if (eventDate < now) {
      eventDate.setFullYear(currentYear + 1);
    }

    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  static getDaysRemainingInEvent(schedule: EventSchedule): number {
    const now = this.getCurrentDate();
    const currentYear = now.getFullYear();

    let eventEndDate = new Date(
      currentYear,
      schedule.endDate.month - 1,
      schedule.endDate.day,
      23,
      59,
      59
    );

    if (schedule.startDate.month > schedule.endDate.month) {
      if (now.getMonth() + 1 < schedule.startDate.month) {
        eventEndDate.setFullYear(currentYear);
      } else {
        eventEndDate.setFullYear(currentYear + 1);
      }
    }

    const diffTime = eventEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  static shouldPreloadAssets(schedule: EventSchedule, preloadDays: number = 3): boolean {
    const daysUntil = this.getDaysUntilEvent(schedule);
    return daysUntil <= preloadDays && daysUntil > 0;
  }

  static formatCountdown(days: number): string {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;

    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;

    if (remainingDays === 0) {
      return weeks === 1 ? '1 week' : `${weeks} weeks`;
    }

    return `${weeks}w ${remainingDays}d`;
  }
}
