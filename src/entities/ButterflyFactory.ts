import type { Butterfly, Vector2D } from '../types';

export class ButterflyFactory {
  private static readonly COLORS = ['#00BFFF', '#FFD700', '#FF69B4', '#00FF00'];

  private static readonly MIN_SIZE = 60;
  private static readonly MAX_SIZE = 80;
  private static readonly DEFAULT_LIFETIME = 30;

  static create(
    position: Vector2D,
    color?: string,
    size?: number,
    initialState?: 'floating' | 'hovering' | 'fleeing'
  ): Butterfly {
    const butterflySize = size ?? this.randomInRange(this.MIN_SIZE, this.MAX_SIZE);
    const butterflyColor = color ?? this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: butterflySize,
      color: butterflyColor,
      type: 'butterfly',
      state: initialState ?? 'floating',
      wingPhase: Math.random() * Math.PI * 2,
      wingFlapSpeed: 0.15,
      noiseOffset: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
      },
      floatAmplitude: this.randomInRange(15, 30),
      floatFrequency: this.randomInRange(0.015, 0.025),
      stateTimer: 0,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Butterfly {
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
    distribution: 'random' | 'grid' = 'random'
  ): Butterfly[] {
    const butterflies: Butterfly[] = [];

    if (distribution === 'grid') {
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      const cellWidth = screenWidth / (cols + 1);
      const cellHeight = screenHeight / (rows + 1);

      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const baseX = cellWidth * (col + 1);
        const baseY = cellHeight * (row + 1);

        const offsetX = (Math.random() - 0.5) * cellWidth * 0.5;
        const offsetY = (Math.random() - 0.5) * cellHeight * 0.5;

        const position: Vector2D = {
          x: baseX + offsetX,
          y: baseY + offsetY,
        };

        butterflies.push(this.create(position));
      }
    } else {
      for (let i = 0; i < count; i++) {
        butterflies.push(this.createRandom(screenWidth, screenHeight));
      }
    }

    return butterflies;
  }

  static createAtPosition(
    x: number,
    y: number,
    screenWidth: number,
    screenHeight: number
  ): Butterfly {
    const clampedX = Math.max(50, Math.min(screenWidth - 50, x));
    const clampedY = Math.max(50, Math.min(screenHeight - 50, y));

    return this.create({ x: clampedX, y: clampedY });
  }

  static createWithColor(
    position: Vector2D,
    colorIndex: number
  ): Butterfly {
    const color = this.COLORS[colorIndex % this.COLORS.length];
    return this.create(position, color);
  }

  static spawnAtEdge(screenWidth: number, screenHeight: number): Butterfly {
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

    return this.create(position);
  }

  private static generateId(): string {
    return `butterfly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  static getColorPalette(): string[] {
    return [...this.COLORS];
  }

  static getColorByName(name: 'blue' | 'yellow' | 'pink' | 'green'): string {
    const colorMap = {
      blue: '#00BFFF',
      yellow: '#FFD700',
      pink: '#FF69B4',
      green: '#00FF00',
    };
    return colorMap[name];
  }
}
