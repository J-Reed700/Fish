import type { Fish, Vector2D } from '../../types';

export class GoldenFish {
  static readonly POINT_VALUE = 100;
  static readonly SPEED_MULTIPLIER = 1.5;
  static readonly COLOR = '#FFD700';
  static readonly SPAWN_CHANCE = 0.01;

  static create(id: string, position: Vector2D, baseFish: Partial<Fish>): Fish {
    return {
      id,
      position,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: (baseFish.size || 30) * 1.2,
      color: this.COLOR,
      species: 'goldfish',
      maxSpeed: (baseFish.maxSpeed || 100) * this.SPEED_MULTIPLIER,
      maxForce: baseFish.maxForce || 0.1,
    };
  }

  static isGoldenFish(fish: Fish): boolean {
    return fish.color === this.COLOR && fish.species === 'goldfish';
  }

  static getVisualEffect(): {
    glowColor: string;
    glowIntensity: number;
    sparkleCount: number;
    shimmerSpeed: number;
  } {
    return {
      glowColor: '#FFF8DC',
      glowIntensity: 0.8,
      sparkleCount: 10,
      shimmerSpeed: 2,
    };
  }
}
