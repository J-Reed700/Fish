import type { Firefly, Vector2D } from '../types';
import { FireflyBehavior } from '../engine/FireflyBehavior';

export class FireflyFactory {
  private static readonly MIN_SIZE = 10;
  private static readonly MAX_SIZE = 15;
  private static readonly DEFAULT_LIFETIME = 40;

  static create(position: Vector2D): Firefly {
    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: this.randomInRange(this.MIN_SIZE, this.MAX_SIZE),
      color: '#FFEB3B',
      type: 'firefly',
      state: Math.random() < 0.5 ? 'glowing' : 'dark',
      stateTimer: 120,
      glowIntensity: Math.random(),
      glowPhase: Math.random() * Math.PI * 2,
      flashPattern: FireflyBehavior.generateFlashPattern(),
      flashIndex: 0,
      floatAmplitude: this.randomInRange(12, 18),
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Firefly {
    const margin = 50;
    const position: Vector2D = {
      x: this.randomInRange(margin, screenWidth - margin),
      y: this.randomInRange(screenHeight * 0.3, screenHeight - margin),
    };

    return this.create(position);
  }

  static createMany(count: number, screenWidth: number, screenHeight: number): Firefly[] {
    const fireflies: Firefly[] = [];
    for (let i = 0; i < count; i++) {
      const firefly = this.createRandom(screenWidth, screenHeight);

      if (i % 3 === 0) {
        firefly.state = 'flashing';
        firefly.stateTimer = 150;
      }

      fireflies.push(firefly);
    }
    return fireflies;
  }

  private static generateId(): string {
    return `firefly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
