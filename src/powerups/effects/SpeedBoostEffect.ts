import type { Vector2D } from '../../types';

export class SpeedBoostEffect {
  static readonly SPEED_MULTIPLIER = 2.0;

  static applySpeedBoost(velocity: Vector2D): Vector2D {
    return {
      x: velocity.x * this.SPEED_MULTIPLIER,
      y: velocity.y * this.SPEED_MULTIPLIER,
    };
  }

  static getVisualEffect(): {
    motionBlurIntensity: number;
    speedLineCount: number;
    color: string;
  } {
    return {
      motionBlurIntensity: 0.6,
      speedLineCount: 5,
      color: '#FF9800',
    };
  }
}
