import type { Bird, Vector2D } from '../types';

export class BirdFactory {
  private static readonly COLORS = [
    '#4A90E2',
    '#E24A4A',
    '#E2D74A',
    '#E2884A',
  ];

  private static readonly COLOR_NAMES = [
    'Blue Jay',
    'Cardinal',
    'Goldfinch',
    'Robin',
  ];

  private static readonly MIN_SIZE = 20;
  private static readonly MAX_SIZE = 30;
  private static readonly DEFAULT_LIFETIME = 40;

  static create(
    position: Vector2D,
    color?: string,
    size?: number,
    initialState?: 'flying' | 'perching' | 'takeoff' | 'fleeing'
  ): Bird {
    const birdSize = size ?? this.randomInRange(this.MIN_SIZE, this.MAX_SIZE);
    const birdColor = color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

    const angle = Math.random() * Math.PI * 2;

    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: angle,
      size: birdSize,
      color: birdColor,
      type: 'bird',
      state: initialState ?? 'flying',
      stateTimer: 0,
      perchPosition: null,
      targetDirection: {
        x: Math.cos(angle),
        y: Math.sin(angle),
      },
      wingPhase: Math.random() * Math.PI * 2,
      wingFlapSpeed: 12,
      bobPhase: 0,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Bird {
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
  ): Bird[] {
    const birds: Bird[] = [];

    if (distribution === 'edges') {
      for (let i = 0; i < count; i++) {
        birds.push(this.spawnAtEdge(screenWidth, screenHeight));
      }
    } else {
      for (let i = 0; i < count; i++) {
        birds.push(this.createRandom(screenWidth, screenHeight));
      }
    }

    return birds;
  }

  static createAtPosition(
    x: number,
    y: number,
    screenWidth: number,
    screenHeight: number
  ): Bird {
    const clampedX = Math.max(50, Math.min(screenWidth - 50, x));
    const clampedY = Math.max(50, Math.min(screenHeight - 50, y));

    return this.create({ x: clampedX, y: clampedY });
  }

  static createWithColor(
    position: Vector2D,
    colorIndex: number
  ): Bird {
    const color = this.COLORS[colorIndex % this.COLORS.length];
    return this.create(position, color);
  }

  static spawnAtEdge(screenWidth: number, screenHeight: number): Bird {
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

    const bird = this.create(position);

    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    const dx = centerX - position.x;
    const dy = centerY - position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      bird.targetDirection = {
        x: dx / dist,
        y: dy / dist,
      };
      bird.rotation = Math.atan2(dy, dx);
    }

    return bird;
  }

  static spawnPerched(screenWidth: number, screenHeight: number): Bird {
    const edge = Math.floor(Math.random() * 3);
    let position: Vector2D;

    switch (edge) {
      case 0:
        position = {
          x: Math.random() * screenWidth,
          y: 20,
        };
        break;
      case 1:
        position = {
          x: 20,
          y: Math.random() * screenHeight * 0.5,
        };
        break;
      case 2:
      default:
        position = {
          x: screenWidth - 20,
          y: Math.random() * screenHeight * 0.5,
        };
        break;
    }

    const bird = this.create(position, undefined, undefined, 'perching');
    bird.perchPosition = { ...position };
    bird.stateTimer = 2 + Math.random() * 3;

    return bird;
  }

  private static generateId(): string {
    return `bird-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  static getColorByName(name: 'blue-jay' | 'cardinal' | 'goldfinch' | 'robin'): string {
    const colorMap = {
      'blue-jay': '#4A90E2',
      'cardinal': '#E24A4A',
      'goldfinch': '#E2D74A',
      'robin': '#E2884A',
    };
    return colorMap[name];
  }
}
