import type { PowerUpType } from '../../types';

export class MultiplierEffect {
  static applyMultiplier(basePoints: number, multiplierTotal: number): number {
    return Math.floor(basePoints * multiplierTotal);
  }

  static getVisualEffect(multiplierTotal: number): {
    auraColor: string;
    auraIntensity: number;
    particleCount: number;
  } {
    if (multiplierTotal >= 5) {
      return {
        auraColor: '#FF6D00',
        auraIntensity: 1.0,
        particleCount: 20,
      };
    } else if (multiplierTotal >= 3) {
      return {
        auraColor: '#9C27B0',
        auraIntensity: 0.8,
        particleCount: 15,
      };
    } else if (multiplierTotal >= 2) {
      return {
        auraColor: '#FFD700',
        auraIntensity: 0.6,
        particleCount: 10,
      };
    }

    return {
      auraColor: '#FFFFFF',
      auraIntensity: 0,
      particleCount: 0,
    };
  }
}
