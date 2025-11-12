import { Ladybug, Vector2D } from '../types';
import { LadybugBehavior } from '../engine/LadybugBehavior';

export class LadybugFactory {
  private static readonly COLOR = '#FF0000';

  private static readonly SPOT_PATTERN = [
    { x: 0.15, y: -0.25 },
    { x: -0.15, y: -0.25 },
    { x: 0.25, y: 0.1 },
    { x: -0.25, y: 0.1 },
    { x: 0, y: 0.3 }
  ];

  private static idCounter = 0;

  public static create(
    position: Vector2D,
    size: number,
    screenWidth: number,
    screenHeight: number
  ): Ladybug {
    const pathPoints = LadybugBehavior.generateBezierPath(position, screenWidth, screenHeight);
    const pathDuration = 3000 + Math.random() * 2000;

    return {
      id: `ladybug-${this.idCounter++}`,
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size,
      color: this.COLOR,
      type: 'ladybug',
      state: 'crawling',
      stateTimer: pathDuration,
      pathPoints,
      pathProgress: 0,
      pathDuration,
      rotationSpeed: 0.08,
      targetRotation: 0,
      legPhase: Math.random() * Math.PI * 2,
    };
  }

  public static createRandom(screenWidth: number, screenHeight: number): Ladybug {
    const margin = 100;
    const position: Vector2D = {
      x: margin + Math.random() * (screenWidth - margin * 2),
      y: margin + Math.random() * (screenHeight - margin * 2),
    };

    const size = 25 + Math.random() * 10;

    return this.create(position, size, screenWidth, screenHeight);
  }

  public static createMany(
    count: number,
    screenWidth: number,
    screenHeight: number
  ): Ladybug[] {
    const ladybugs: Ladybug[] = [];
    const margin = 100;

    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    const cellWidth = (screenWidth - margin * 2) / cols;
    const cellHeight = (screenHeight - margin * 2) / rows;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const baseX = margin + col * cellWidth;
      const baseY = margin + row * cellHeight;

      const position: Vector2D = {
        x: baseX + Math.random() * cellWidth,
        y: baseY + Math.random() * cellHeight,
      };

      const size = 25 + Math.random() * 10;

      ladybugs.push(this.create(position, size, screenWidth, screenHeight));
    }

    return ladybugs;
  }

  public static getSpotPattern(): Array<{ x: number; y: number }> {
    return this.SPOT_PATTERN;
  }
}
