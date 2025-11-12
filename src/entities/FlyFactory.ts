import type { Fly, Vector2D } from '../types';

export class FlyFactory {
  private static readonly COLORS = ['#212121', '#4CAF50'];
  private static readonly MIN_SIZE = 12;
  private static readonly MAX_SIZE = 18;
  private static readonly DEFAULT_LIFETIME = 28;

  static create(position: Vector2D, color?: string): Fly {
    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: this.randomInRange(this.MIN_SIZE, this.MAX_SIZE),
      color: color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
      type: 'fly',
      state: 'buzzing',
      stateTimer: 200,
      directionChangeTimer: 30,
      landingSurface: null,
      cleaningProgress: 0,
      reactionSpeed: this.randomInRange(0.9, 0.98),
      wingPhase: Math.random() * Math.PI * 2,
      legPhase: Math.random() * Math.PI * 2,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Fly {
    const margin = 30;
    const position: Vector2D = {
      x: this.randomInRange(margin, screenWidth - margin),
      y: this.randomInRange(margin, screenHeight - margin),
    };

    return this.create(position);
  }

  static createMany(count: number, screenWidth: number, screenHeight: number): Fly[] {
    const flies: Fly[] = [];
    for (let i = 0; i < count; i++) {
      flies.push(this.createRandom(screenWidth, screenHeight));
    }
    return flies;
  }

  static spawnAtEdge(screenWidth: number, screenHeight: number): Fly {
    const edge = Math.floor(Math.random() * 4);
    let position: Vector2D;

    switch (edge) {
      case 0:
        position = { x: Math.random() * screenWidth, y: -30 };
        break;
      case 1:
        position = { x: screenWidth + 30, y: Math.random() * screenHeight };
        break;
      case 2:
        position = { x: Math.random() * screenWidth, y: screenHeight + 30 };
        break;
      case 3:
      default:
        position = { x: -30, y: Math.random() * screenHeight };
        break;
    }

    return this.create(position);
  }

  private static generateId(): string {
    return `fly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
