import type { Worm, WormSegment, Vector2D } from '../types';

export class WormFactory {
  private static readonly COLORS = ['#E91E63', '#795548', '#F44336'];

  private static readonly MIN_SIZE = 4;
  private static readonly MAX_SIZE = 8;
  private static readonly MIN_LENGTH = 60;
  private static readonly MAX_LENGTH = 100;
  private static readonly MIN_SEGMENTS = 8;
  private static readonly MAX_SEGMENTS = 12;
  private static readonly DEFAULT_LIFETIME = 40;

  static create(
    position: Vector2D,
    color?: string,
    segmentCount?: number
  ): Worm {
    const wormColor = color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
    const count = segmentCount ?? Math.floor(
      this.MIN_SEGMENTS + Math.random() * (this.MAX_SEGMENTS - this.MIN_SEGMENTS + 1)
    );
    const segmentSize = this.MIN_SIZE + Math.random() * (this.MAX_SIZE - this.MIN_SIZE);
    const totalLength = this.MIN_LENGTH + Math.random() * (this.MAX_LENGTH - this.MIN_LENGTH);
    const segmentDistance = totalLength / count;

    const segments: WormSegment[] = [];
    for (let i = 0; i < count; i++) {
      const segmentPos = {
        x: position.x - i * segmentDistance,
        y: position.y,
      };
      segments.push({
        position: { ...segmentPos },
        previousPosition: { ...segmentPos },
        velocity: { x: 0, y: 0 },
      });
    }

    const angle = Math.random() * Math.PI * 2;

    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: angle,
      size: segmentSize,
      color: wormColor,
      type: 'worm',
      state: 'wiggling',
      stateTimer: 3000,
      segments,
      segmentCount: count,
      segmentDistance,
      wavePhase: Math.random() * Math.PI * 2,
      waveAmplitude: 8,
      waveFrequency: 0.15,
      stretchFactor: 1.0,
      targetDirection: { x: Math.cos(angle), y: Math.sin(angle) },
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Worm {
    const margin = 100;
    const position: Vector2D = {
      x: this.randomInRange(margin, screenWidth - margin),
      y: this.randomInRange(margin, screenHeight - margin),
    };

    return this.create(position);
  }

  static createMany(
    count: number,
    screenWidth: number,
    screenHeight: number,
    distribution: 'random' | 'edges' = 'edges'
  ): Worm[] {
    const worms: Worm[] = [];

    if (distribution === 'edges') {
      for (let i = 0; i < count; i++) {
        worms.push(this.spawnAtEdge(screenWidth, screenHeight));
      }
    } else {
      for (let i = 0; i < count; i++) {
        worms.push(this.createRandom(screenWidth, screenHeight));
      }
    }

    return worms;
  }

  static createAtPosition(
    x: number,
    y: number,
    screenWidth: number,
    screenHeight: number
  ): Worm {
    const clampedX = Math.max(50, Math.min(screenWidth - 50, x));
    const clampedY = Math.max(50, Math.min(screenHeight - 50, y));

    return this.create({ x: clampedX, y: clampedY });
  }

  static createWithColor(
    position: Vector2D,
    colorIndex: number
  ): Worm {
    const color = this.COLORS[colorIndex % this.COLORS.length];
    return this.create(position, color);
  }

  static spawnAtEdge(screenWidth: number, screenHeight: number): Worm {
    const edge = Math.floor(Math.random() * 4);
    let position: Vector2D;
    let angle: number;

    switch (edge) {
      case 0:
        position = { x: Math.random() * screenWidth, y: -20 };
        angle = Math.PI / 2;
        break;
      case 1:
        position = { x: screenWidth + 20, y: Math.random() * screenHeight };
        angle = Math.PI;
        break;
      case 2:
        position = { x: Math.random() * screenWidth, y: screenHeight + 20 };
        angle = -Math.PI / 2;
        break;
      case 3:
      default:
        position = { x: -20, y: Math.random() * screenHeight };
        angle = 0;
        break;
    }

    const worm = this.create(position);
    worm.rotation = angle;
    worm.targetDirection = { x: Math.cos(angle), y: Math.sin(angle) };

    for (let i = 0; i < worm.segments.length; i++) {
      const offsetX = -Math.cos(angle) * worm.segmentDistance * i;
      const offsetY = -Math.sin(angle) * worm.segmentDistance * i;
      worm.segments[i].position.x = position.x + offsetX;
      worm.segments[i].position.y = position.y + offsetY;
      worm.segments[i].previousPosition.x = worm.segments[i].position.x;
      worm.segments[i].previousPosition.y = worm.segments[i].position.y;
    }

    return worm;
  }

  private static generateId(): string {
    return `worm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  static getColorPalette(): string[] {
    return [...this.COLORS];
  }

  static getColorByName(name: 'pink' | 'brown' | 'red'): string {
    const colorMap = {
      pink: '#E91E63',
      brown: '#795548',
      red: '#F44336',
    };
    return colorMap[name];
  }
}
