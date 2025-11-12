import type { Cricket, Vector2D } from '../types';

export class CricketFactory {
  private static readonly COLORS = [
    '#654321',
    '#567D46',
  ];

  private static readonly COLOR_NAMES = [
    'Brown',
    'Green',
  ];

  private static readonly MIN_SIZE = 15;
  private static readonly MAX_SIZE = 25;
  private static readonly DEFAULT_LIFETIME = 35;

  static create(
    position: Vector2D,
    color?: string,
    size?: number,
    initialState?: 'crawling' | 'preparing' | 'jumping' | 'landing' | 'fleeing'
  ): Cricket {
    const cricketSize = size ?? this.randomInRange(this.MIN_SIZE, this.MAX_SIZE);
    const cricketColor = color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      size: cricketSize,
      color: cricketColor,
      type: 'cricket',
      state: initialState ?? 'crawling',
      stateTimer: 2 + Math.random() * 3,
      jumpVelocity: { x: 0, y: 0 },
      gravity: 500,
      isGrounded: true,
      legPhase: Math.random() * Math.PI * 2,
      antennaPhase: Math.random() * Math.PI * 2,
      targetJumpDirection: null,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Cricket {
    const position: Vector2D = {
      x: this.randomInRange(50, screenWidth - 50),
      y: screenHeight - 20,
    };

    return this.create(position);
  }

  static createMany(
    count: number,
    screenWidth: number,
    screenHeight: number
  ): Cricket[] {
    const crickets: Cricket[] = [];

    for (let i = 0; i < count; i++) {
      crickets.push(this.spawnAtBottom(screenWidth, screenHeight));
    }

    return crickets;
  }

  static createAtPosition(
    x: number,
    y: number,
    screenWidth: number,
    screenHeight: number
  ): Cricket {
    const clampedX = Math.max(50, Math.min(screenWidth - 50, x));
    const groundY = screenHeight - 20;

    return this.create({ x: clampedX, y: groundY });
  }

  static createWithColor(
    position: Vector2D,
    colorIndex: number
  ): Cricket {
    const color = this.COLORS[colorIndex % this.COLORS.length];
    return this.create(position, color);
  }

  static spawnAtBottom(screenWidth: number, screenHeight: number): Cricket {
    const position: Vector2D = {
      x: Math.random() * screenWidth,
      y: screenHeight - 20,
    };

    return this.create(position);
  }

  static spawnAtEdge(screenWidth: number, screenHeight: number): Cricket {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const position: Vector2D = {
      x: side === 'left' ? 20 : screenWidth - 20,
      y: screenHeight - 20,
    };

    return this.create(position);
  }

  static createInGroup(
    centerX: number,
    screenHeight: number,
    count: number,
    spread: number = 100
  ): Cricket[] {
    const crickets: Cricket[] = [];

    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * spread;
      const position: Vector2D = {
        x: centerX + offsetX,
        y: screenHeight - 20,
      };

      crickets.push(this.create(position));
    }

    return crickets;
  }

  private static generateId(): string {
    return `cricket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  static getColorPalette(): string[] {
    return [...this.COLORS];
  }

  static getColorNames(): string[] {
    return [...this.COLOR_NAMES];
  }

  static getColorByName(name: 'brown' | 'green'): string {
    const colorMap = {
      'brown': '#654321',
      'green': '#567D46',
    };
    return colorMap[name];
  }
}
