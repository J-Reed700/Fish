import type { Wasp, Vector2D } from '../types';
import { WaspBehavior } from '../engine/WaspBehavior';

export class WaspFactory {
  private static readonly COLORS = ['#FFC107', '#F44336'];
  private static readonly MIN_SIZE = 20;
  private static readonly MAX_SIZE = 28;
  private static readonly DEFAULT_LIFETIME = 36;

  static create(position: Vector2D, screenWidth: number, screenHeight: number, color?: string): Wasp {
    const territory = WaspBehavior.initializeTerritory(screenWidth, screenHeight);
    const nestPosition = {
      x: (territory.min.x + territory.max.x) / 2,
      y: territory.min.y + 20,
    };

    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: this.randomInRange(this.MIN_SIZE, this.MAX_SIZE),
      color: color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
      type: 'wasp',
      state: 'patrolling',
      stateTimer: 300,
      territory,
      threatLevel: 0,
      attackTarget: null,
      nestPosition,
      wingPhase: Math.random() * Math.PI * 2,
      isAngry: false,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Wasp {
    const territory = WaspBehavior.initializeTerritory(screenWidth, screenHeight);
    const position: Vector2D = {
      x: (territory.min.x + territory.max.x) / 2,
      y: (territory.min.y + territory.max.y) / 2,
    };

    return this.create(position, screenWidth, screenHeight);
  }

  static createMany(count: number, screenWidth: number, screenHeight: number): Wasp[] {
    const wasps: Wasp[] = [];
    for (let i = 0; i < count; i++) {
      wasps.push(this.createRandom(screenWidth, screenHeight));
    }
    return wasps;
  }

  private static generateId(): string {
    return `wasp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
