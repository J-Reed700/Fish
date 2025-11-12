import type { Snail, Vector2D } from '../types';

export class SnailFactory {
  private static readonly COLORS = ['#8D6E63', '#FDD835', '#EC407A'];
  private static readonly MIN_SIZE = 20;
  private static readonly MAX_SIZE = 28;
  private static readonly DEFAULT_LIFETIME = 45;

  static create(position: Vector2D, color?: string): Snail {
    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: this.randomInRange(this.MIN_SIZE, this.MAX_SIZE),
      color: color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
      type: 'snail',
      state: 'crawling',
      stateTimer: 300,
      bodyWavePhase: Math.random() * Math.PI * 2,
      isHiding: false,
      hideProgress: 0,
      eyeStalks: [
        { x: position.x + 8, y: position.y - 5 },
        { x: position.x + 8, y: position.y + 5 },
      ],
      slimeTrail: [],
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Snail {
    const margin = 40;
    const position: Vector2D = {
      x: this.randomInRange(margin, screenWidth - margin),
      y: this.randomInRange(margin, screenHeight - margin),
    };

    return this.create(position);
  }

  static createMany(count: number, screenWidth: number, screenHeight: number): Snail[] {
    const snails: Snail[] = [];
    for (let i = 0; i < count; i++) {
      snails.push(this.createRandom(screenWidth, screenHeight));
    }
    return snails;
  }

  private static generateId(): string {
    return `snail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
