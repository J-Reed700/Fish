import type { Vector2D } from '../../types';

export class GravityShiftEffect {
  static readonly GRAVITY_STRENGTH = 0.5;

  static applyGravity(velocity: Vector2D, deltaTime: number): Vector2D {
    return {
      x: velocity.x,
      y: velocity.y - this.GRAVITY_STRENGTH * deltaTime,
    };
  }

  static getVisualEffect(): {
    particleDirection: 'up' | 'down';
    color: string;
    intensity: number;
  } {
    return {
      particleDirection: 'up',
      color: '#9C27B0',
      intensity: 0.5,
    };
  }
}
