import type { Moth, Vector2D } from '../types';
import { MothBehavior } from '../engine/MothBehavior';

export class MothFactory {
  private static readonly COLORS = ['#F5F5F5', '#795548', '#B2DFDB'];
  private static readonly MIN_SIZE = 20;
  private static readonly MAX_SIZE = 30;
  private static readonly DEFAULT_LIFETIME = 33;

  static create(position: Vector2D, color?: string, size?: number): Moth {
    const mothColor = color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
    const mothSize = size ?? (mothColor === '#B2DFDB' ? this.MAX_SIZE : this.randomInRange(this.MIN_SIZE, this.MAX_SIZE - 5));

    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: mothSize,
      color: mothColor,
      type: 'moth',
      state: 'flying',
      stateTimer: 200,
      lightTarget: null,
      circleRadius: 70,
      circleAngle: 0,
      wingPhase: Math.random() * Math.PI * 2,
      dustParticles: [],
      isResting: false,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Moth {
    const margin = 50;
    const position: Vector2D = {
      x: this.randomInRange(margin, screenWidth - margin),
      y: this.randomInRange(margin, screenHeight - margin),
    };

    const moth = this.create(position);
    moth.lightTarget = MothBehavior.findLightSource(screenWidth, screenHeight);

    if (Math.random() < 0.4) {
      moth.state = 'attracted';
    }

    return moth;
  }

  static createMany(count: number, screenWidth: number, screenHeight: number): Moth[] {
    const moths: Moth[] = [];
    for (let i = 0; i < count; i++) {
      moths.push(this.createRandom(screenWidth, screenHeight));
    }
    return moths;
  }

  static spawnAtEdge(screenWidth: number, screenHeight: number): Moth {
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

    const moth = this.create(position);
    moth.lightTarget = MothBehavior.findLightSource(screenWidth, screenHeight);
    moth.state = 'attracted';

    return moth;
  }

  private static generateId(): string {
    return `moth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
