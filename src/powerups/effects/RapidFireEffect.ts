import type { Vector2D } from '../../types';

export class RapidFireEffect {
  static readonly NORMAL_TAP_RADIUS = 50;
  static readonly RAPID_FIRE_TAP_RADIUS = 300;

  static checkCollision(
    touchPosition: Vector2D,
    preyPosition: Vector2D,
    preySize: number,
    isActive: boolean
  ): boolean {
    const tapRadius = isActive ? this.RAPID_FIRE_TAP_RADIUS : this.NORMAL_TAP_RADIUS;
    const effectiveRadius = tapRadius + preySize;

    const dx = touchPosition.x - preyPosition.x;
    const dy = touchPosition.y - preyPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < effectiveRadius;
  }

  static getVisualEffect(touchPosition: Vector2D): {
    position: Vector2D;
    radius: number;
    color: string;
    pulseSpeed: number;
  } {
    return {
      position: touchPosition,
      radius: this.RAPID_FIRE_TAP_RADIUS,
      color: '#FF5722',
      pulseSpeed: 2,
    };
  }
}
