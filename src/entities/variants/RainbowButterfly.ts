import type { Butterfly, Vector2D } from '../../types';

export class RainbowButterfly {
  static readonly POINT_VALUE = 150;
  static readonly SPAWN_CHANCE = 0.005;
  static readonly RAINBOW_COLORS = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];

  static create(id: string, position: Vector2D, baseButterfly: Partial<Butterfly>): Butterfly {
    return {
      id,
      position,
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: (baseButterfly.size || 40) * 1.3,
      color: this.RAINBOW_COLORS[0],
      type: 'butterfly',
      state: 'floating',
      wingPhase: Math.random() * Math.PI * 2,
      wingFlapSpeed: 8,
      noiseOffset: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
      },
      floatAmplitude: 30,
      floatFrequency: 2,
      stateTimer: 0,
      lifetime: 0,
      maxLifetime: baseButterfly.maxLifetime || 60000,
    };
  }

  static isRainbowButterfly(butterfly: Butterfly): boolean {
    return this.RAINBOW_COLORS.includes(butterfly.color);
  }

  static getColorForTime(time: number): string {
    const index = Math.floor((time * 0.005) % this.RAINBOW_COLORS.length);
    return this.RAINBOW_COLORS[index];
  }

  static getVisualEffect(): {
    trailLength: number;
    trailColors: string[];
    glowIntensity: number;
    particleCount: number;
  } {
    return {
      trailLength: 20,
      trailColors: this.RAINBOW_COLORS,
      glowIntensity: 0.9,
      particleCount: 15,
    };
  }
}
