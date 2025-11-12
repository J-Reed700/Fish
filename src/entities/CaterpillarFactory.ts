import type { Caterpillar, Vector2D } from '../types';
import { CaterpillarBehavior } from '../engine/CaterpillarBehavior';

export class CaterpillarFactory {
  private static readonly COLORS = ['#4CAF50', '#FFC107', '#2196F3'];
  private static readonly MIN_SIZE = 40;
  private static readonly MAX_SIZE = 60;
  private static readonly SEGMENT_COUNT_MIN = 8;
  private static readonly SEGMENT_COUNT_MAX = 12;
  private static readonly DEFAULT_LIFETIME = 42;

  static create(position: Vector2D, color?: string): Caterpillar {
    const segmentCount = Math.floor(this.randomInRange(this.SEGMENT_COUNT_MIN, this.SEGMENT_COUNT_MAX));
    const caterpillarColor = color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: this.randomInRange(this.MIN_SIZE, this.MAX_SIZE),
      color: caterpillarColor,
      type: 'caterpillar',
      state: 'crawling',
      stateTimer: 300,
      segments: CaterpillarBehavior.initializeSegments(segmentCount, position),
      segmentCount,
      stretchProgress: 0,
      isCurled: false,
      curlProgress: 0,
      munchPhase: 0,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Caterpillar {
    const margin = 60;
    const position: Vector2D = {
      x: this.randomInRange(margin, screenWidth - margin),
      y: this.randomInRange(margin, screenHeight - margin),
    };

    return this.create(position);
  }

  static createMany(count: number, screenWidth: number, screenHeight: number): Caterpillar[] {
    const caterpillars: Caterpillar[] = [];
    for (let i = 0; i < count; i++) {
      caterpillars.push(this.createRandom(screenWidth, screenHeight));
    }
    return caterpillars;
  }

  private static generateId(): string {
    return `caterpillar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
