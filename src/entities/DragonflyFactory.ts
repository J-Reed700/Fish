import type { Dragonfly, Vector2D } from '../types';
import { DragonflyBehavior } from '../engine/DragonflyBehavior';

export class DragonflyFactory {
  private static readonly COLORS = ['#4A90E2', '#4CAF50', '#E53935'];
  private static readonly MIN_SIZE = 25;
  private static readonly MAX_SIZE = 35;
  private static readonly DEFAULT_LIFETIME = 35;

  static create(
    position: Vector2D,
    color?: string,
    size?: number,
    initialState?: 'hovering' | 'darting' | 'patrolling' | 'fleeing'
  ): Dragonfly {
    const dragonflySize = size ?? this.randomInRange(this.MIN_SIZE, this.MAX_SIZE);
    const dragonflyColor = color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: dragonflySize,
      color: dragonflyColor,
      type: 'dragonfly',
      state: initialState ?? 'hovering',
      stateTimer: 60,
      hoverDuration: this.randomInRange(60, 180),
      dartTarget: null,
      wingPhases: [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2],
      patrolPath: [],
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Dragonfly {
    const margin = 50;
    const position: Vector2D = {
      x: this.randomInRange(margin, screenWidth - margin),
      y: this.randomInRange(margin, screenHeight - margin),
    };

    const dragonfly = this.create(position);
    dragonfly.patrolPath = DragonflyBehavior.generatePatrolPath(screenWidth, screenHeight);

    return dragonfly;
  }

  static createMany(count: number, screenWidth: number, screenHeight: number): Dragonfly[] {
    const dragonflies: Dragonfly[] = [];
    for (let i = 0; i < count; i++) {
      dragonflies.push(this.createRandom(screenWidth, screenHeight));
    }
    return dragonflies;
  }

  static spawnAtEdge(screenWidth: number, screenHeight: number): Dragonfly {
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

    const dragonfly = this.create(position, undefined, undefined, 'darting');
    dragonfly.dartTarget = DragonflyBehavior.generateDartTarget(screenWidth, screenHeight);
    dragonfly.patrolPath = DragonflyBehavior.generatePatrolPath(screenWidth, screenHeight);

    return dragonfly;
  }

  private static generateId(): string {
    return `dragonfly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  static getColorPalette(): string[] {
    return [...this.COLORS];
  }
}
