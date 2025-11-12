import type { Beetle, Vector2D } from '../../types';

export class CrystalBeetle {
  static readonly POINT_VALUE = 200;
  static readonly SPAWN_CHANCE = 0.005;
  static readonly COLOR = '#E0F7FA';

  static create(id: string, position: Vector2D, baseBeetle: Partial<Beetle>): Beetle {
    return {
      id,
      position,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: (baseBeetle.size || 35) * 1.2,
      color: this.COLOR,
      type: 'beetle',
      state: 'walking',
      stateTimer: 0,
      isFlying: false,
      shellOpen: 0,
      wobblePhase: 0,
      flipProgress: 0,
      legPhase: 0,
      lifetime: 0,
      maxLifetime: baseBeetle.maxLifetime || 45000,
    };
  }

  static isCrystalBeetle(beetle: Beetle): boolean {
    return beetle.color === this.COLOR;
  }

  static shouldPreventFlee(): boolean {
    return true;
  }

  static getVisualEffect(): {
    refractiveIndex: number;
    transparency: number;
    prismColors: string[];
    glowIntensity: number;
  } {
    return {
      refractiveIndex: 1.5,
      transparency: 0.6,
      prismColors: ['#00BCD4', '#03A9F4', '#4FC3F7', '#B3E5FC'],
      glowIntensity: 0.7,
    };
  }
}
