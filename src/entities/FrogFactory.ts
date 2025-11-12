import type { Frog, Vector2D } from '../types';

export class FrogFactory {
  private static readonly COLORS = ['#4CAF50', '#8D6E63', '#FF6B35'];

  private static readonly MIN_SIZE = 30;
  private static readonly MAX_SIZE = 40;
  private static readonly DEFAULT_LIFETIME = 45;
  private static readonly IDLE_MIN = 3000;
  private static readonly IDLE_MAX = 8000;
  private static readonly GRAVITY = 600;

  static create(
    position: Vector2D,
    color?: string,
    size?: number
  ): Frog {
    const frogSize = size ?? this.randomInRange(this.MIN_SIZE, this.MAX_SIZE);
    const frogColor = color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      size: frogSize,
      color: frogColor,
      type: 'frog',
      state: 'idle',
      stateTimer: this.randomInRange(this.IDLE_MIN, this.IDLE_MAX),
      idleDuration: this.randomInRange(this.IDLE_MIN, this.IDLE_MAX),
      jumpVelocity: { x: 0, y: 0 },
      gravity: this.GRAVITY,
      isGrounded: true,
      eyeDirection: { x: 0, y: 0 },
      throatPhase: Math.random() * Math.PI * 2,
      legExtension: 0,
      anticipationProgress: 0,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Frog {
    const groundMargin = 60;
    const sideMargin = 100;
    const position: Vector2D = {
      x: this.randomInRange(sideMargin, screenWidth - sideMargin),
      y: screenHeight - groundMargin,
    };

    return this.create(position);
  }

  static createMany(
    count: number,
    screenWidth: number,
    screenHeight: number
  ): Frog[] {
    const frogs: Frog[] = [];
    const groundMargin = 60;
    const spacing = (screenWidth - 200) / (count + 1);

    for (let i = 0; i < count; i++) {
      const position: Vector2D = {
        x: 100 + spacing * (i + 1),
        y: screenHeight - groundMargin,
      };

      frogs.push(this.create(position));
    }

    return frogs;
  }

  static createAtPosition(
    x: number,
    y: number,
    screenWidth: number,
    screenHeight: number
  ): Frog {
    const groundMargin = 60;
    const clampedX = Math.max(50, Math.min(screenWidth - 50, x));
    const clampedY = screenHeight - groundMargin;

    return this.create({ x: clampedX, y: clampedY });
  }

  static createWithColor(
    position: Vector2D,
    colorName: 'green' | 'brown' | 'poison-dart'
  ): Frog {
    const colorMap = {
      'green': '#4CAF50',
      'brown': '#8D6E63',
      'poison-dart': '#FF6B35',
    };
    const color = colorMap[colorName];
    return this.create(position, color);
  }

  static spawnAtBottom(screenWidth: number, screenHeight: number): Frog {
    const groundMargin = 60;
    const sideMargin = 100;
    const position: Vector2D = {
      x: this.randomInRange(sideMargin, screenWidth - sideMargin),
      y: screenHeight - groundMargin,
    };

    return this.create(position);
  }

  static spawnOnLilyPad(lilyPadPosition: Vector2D): Frog {
    return this.create({ x: lilyPadPosition.x, y: lilyPadPosition.y });
  }

  private static generateId(): string {
    return `frog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  static getColorPalette(): string[] {
    return [...this.COLORS];
  }

  static getColorByName(name: 'green' | 'brown' | 'poison-dart'): string {
    const colorMap = {
      'green': '#4CAF50',
      'brown': '#8D6E63',
      'poison-dart': '#FF6B35',
    };
    return colorMap[name];
  }
}
