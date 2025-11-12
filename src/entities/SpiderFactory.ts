import type { Spider, Vector2D } from '../types';

export class SpiderFactory {
  private static readonly COLORS = ['#212121', '#5D4037'];

  private static readonly MIN_SIZE = 18;
  private static readonly MAX_SIZE = 28;
  private static readonly DEFAULT_LIFETIME = 50;
  private static readonly BASE_CLIMB_SPEED = 50;

  static create(
    position: Vector2D,
    color?: string,
    size?: number
  ): Spider {
    const spiderSize = size ?? this.randomInRange(this.MIN_SIZE, this.MAX_SIZE);
    const spiderColor = color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      size: spiderSize,
      color: spiderColor,
      type: 'spider',
      state: 'climbing',
      stateTimer: 5000,
      targetCorner: null,
      silkAttachPoint: null,
      silkLength: 0,
      legPhases: Array(8).fill(0).map((_, i) => i * Math.PI / 4),
      climbSpeed: this.BASE_CLIMB_SPEED,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Spider {
    const margin = 50;
    const position: Vector2D = {
      x: this.randomInRange(margin, screenWidth - margin),
      y: this.randomInRange(margin, screenHeight - margin),
    };

    return this.create(position);
  }

  static createMany(
    count: number,
    screenWidth: number,
    screenHeight: number
  ): Spider[] {
    const spiders: Spider[] = [];

    for (let i = 0; i < count; i++) {
      spiders.push(this.createRandom(screenWidth, screenHeight));
    }

    return spiders;
  }

  static createAtCorner(
    screenWidth: number,
    screenHeight: number,
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  ): Spider {
    const margin = 20;
    let position: Vector2D;

    switch (corner) {
      case 'top-left':
        position = { x: margin, y: margin };
        break;
      case 'top-right':
        position = { x: screenWidth - margin, y: margin };
        break;
      case 'bottom-left':
        position = { x: margin, y: screenHeight - margin };
        break;
      case 'bottom-right':
        position = { x: screenWidth - margin, y: screenHeight - margin };
        break;
    }

    return this.create(position);
  }

  static createAtPosition(
    x: number,
    y: number,
    screenWidth: number,
    screenHeight: number
  ): Spider {
    const clampedX = Math.max(30, Math.min(screenWidth - 30, x));
    const clampedY = Math.max(30, Math.min(screenHeight - 30, y));

    return this.create({ x: clampedX, y: clampedY });
  }

  static createWithColor(
    position: Vector2D,
    colorName: 'black' | 'brown'
  ): Spider {
    const colorMap = {
      'black': '#212121',
      'brown': '#5D4037',
    };
    const color = colorMap[colorName];
    return this.create(position, color);
  }

  static spawnAtCorners(screenWidth: number, screenHeight: number, count: number): Spider[] {
    const spiders: Spider[] = [];
    const corners: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ];

    for (let i = 0; i < count; i++) {
      const corner = corners[i % corners.length];
      spiders.push(this.createAtCorner(screenWidth, screenHeight, corner));
    }

    return spiders;
  }

  static spawnOnCeiling(screenWidth: number): Spider {
    const margin = 100;
    const position: Vector2D = {
      x: this.randomInRange(margin, screenWidth - margin),
      y: 20,
    };

    const spider = this.create(position);
    spider.state = 'hanging';
    spider.silkAttachPoint = { ...position };
    spider.silkLength = 0;
    spider.stateTimer = 3000;

    return spider;
  }

  private static generateId(): string {
    return `spider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  static getColorPalette(): string[] {
    return [...this.COLORS];
  }

  static getColorByName(name: 'black' | 'brown'): string {
    const colorMap = {
      'black': '#212121',
      'brown': '#5D4037',
    };
    return colorMap[name];
  }
}
