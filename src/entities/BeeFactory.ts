import type { Bee, Vector2D } from '../types';
import { BeeBehavior } from '../engine/BeeBehavior';

export class BeeFactory {
  private static readonly COLORS = ['#FFC107', '#FFFFFF'];
  private static readonly MIN_SIZE = 18;
  private static readonly MAX_SIZE = 25;
  private static readonly DEFAULT_LIFETIME = 32;

  static create(
    position: Vector2D,
    color?: string,
    size?: number,
    initialState?: 'collecting' | 'returning' | 'buzzing' | 'aggressive' | 'fleeing'
  ): Bee {
    const beeSize = size ?? this.randomInRange(this.MIN_SIZE, this.MAX_SIZE);
    const beeColor = color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: beeSize,
      color: beeColor,
      type: 'bee',
      state: initialState ?? 'buzzing',
      stateTimer: 120,
      targetFlower: null,
      buzzAmplitude: this.randomInRange(2, 4),
      buzzFrequency: this.randomInRange(0.3, 0.5),
      isAggressive: false,
      chargeTarget: null,
      pollenCount: 0,
      wingPhase: Math.random() * Math.PI * 2,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Bee {
    const margin = 50;
    const position: Vector2D = {
      x: this.randomInRange(margin, screenWidth - margin),
      y: this.randomInRange(margin, screenHeight - margin),
    };

    const bee = this.create(position);
    if (Math.random() < 0.5) {
      bee.state = 'collecting';
      bee.targetFlower = BeeBehavior.generateFlowerPosition(screenWidth, screenHeight);
    }

    return bee;
  }

  static createMany(count: number, screenWidth: number, screenHeight: number): Bee[] {
    const bees: Bee[] = [];
    for (let i = 0; i < count; i++) {
      bees.push(this.createRandom(screenWidth, screenHeight));
    }
    return bees;
  }

  static spawnAtEdge(screenWidth: number, screenHeight: number): Bee {
    const edge = Math.floor(Math.random() * 4);
    let position: Vector2D;

    switch (edge) {
      case 0:
        position = { x: Math.random() * screenWidth, y: -50 };
        break;
      case 1:
        position = { x: screenWidth + 50, y: Math.random() * screenHeight };
        break;
      case 2:
        position = { x: Math.random() * screenWidth, y: screenHeight + 50 };
        break;
      case 3:
      default:
        position = { x: -50, y: Math.random() * screenHeight };
        break;
    }

    const bee = this.create(position, undefined, undefined, 'collecting');
    bee.targetFlower = BeeBehavior.generateFlowerPosition(screenWidth, screenHeight);

    return bee;
  }

  private static generateId(): string {
    return `bee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  static getColorPalette(): string[] {
    return [...this.COLORS];
  }
}
