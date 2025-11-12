import type { Beetle, Vector2D } from '../types';

export class BeetleFactory {
  private static readonly COLORS = ['#212121', '#00695C', '#5D4037'];
  private static readonly MIN_SIZE = 20;
  private static readonly MAX_SIZE = 30;
  private static readonly DEFAULT_LIFETIME = 38;

  static create(position: Vector2D, color?: string): Beetle {
    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: this.randomInRange(this.MIN_SIZE, this.MAX_SIZE),
      color: color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
      type: 'beetle',
      state: 'walking',
      stateTimer: 200,
      isFlying: false,
      shellOpen: 0,
      wobblePhase: Math.random() * Math.PI * 2,
      flipProgress: 0,
      legPhase: Math.random() * Math.PI * 2,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Beetle {
    const margin = 50;
    const position: Vector2D = {
      x: this.randomInRange(margin, screenWidth - margin),
      y: this.randomInRange(margin, screenHeight - margin),
    };

    const beetle = this.create(position);

    if (Math.random() < 0.3) {
      beetle.state = 'flying';
      beetle.isFlying = true;
      beetle.shellOpen = 1;
    }

    return beetle;
  }

  static createMany(count: number, screenWidth: number, screenHeight: number): Beetle[] {
    const beetles: Beetle[] = [];
    for (let i = 0; i < count; i++) {
      beetles.push(this.createRandom(screenWidth, screenHeight));
    }
    return beetles;
  }

  private static generateId(): string {
    return `beetle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
