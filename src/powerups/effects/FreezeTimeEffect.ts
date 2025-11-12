import type { Vector2D } from '../../types';

export class FreezeTimeEffect {
  static readonly SPEED_MULTIPLIER = 0.1;

  static applyToVelocity(velocity: Vector2D): Vector2D {
    return {
      x: velocity.x * this.SPEED_MULTIPLIER,
      y: velocity.y * this.SPEED_MULTIPLIER,
    };
  }

  static getVisualEffect(): {
    color: string;
    opacity: number;
    blurRadius: number;
  } {
    return {
      color: '#00BCD4',
      opacity: 0.3,
      blurRadius: 10,
    };
  }

  static shouldApplyEffect(isActive: boolean, isRareItem: boolean): boolean {
    return isActive && !isRareItem;
  }
}
