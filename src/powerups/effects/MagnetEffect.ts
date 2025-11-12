import type { Vector2D } from '../../types';

export class MagnetEffect {
  static readonly ATTRACTION_RADIUS = 150;
  static readonly ATTRACTION_STRENGTH = 0.8;

  static calculateAttraction(
    preyPosition: Vector2D,
    touchPosition: Vector2D
  ): Vector2D | null {
    const dx = touchPosition.x - preyPosition.x;
    const dy = touchPosition.y - preyPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.ATTRACTION_RADIUS || distance < 1) {
      return null;
    }

    const force = this.ATTRACTION_STRENGTH * (1 - distance / this.ATTRACTION_RADIUS);
    const directionX = dx / distance;
    const directionY = dy / distance;

    return {
      x: directionX * force,
      y: directionY * force,
    };
  }

  static getVisualEffect(touchPosition: Vector2D): {
    centerPosition: Vector2D;
    radius: number;
    color: string;
    lineCount: number;
  } {
    return {
      centerPosition: touchPosition,
      radius: this.ATTRACTION_RADIUS,
      color: '#E91E63',
      lineCount: 12,
    };
  }
}
