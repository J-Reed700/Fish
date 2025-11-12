import type { SeasonalPowerUp } from '../../types';

export class Bloom {
  static config: SeasonalPowerUp = {
    id: 'bloom',
    name: 'Bloom',
    description: 'Spreads power-up effect to nearby prey',
    icon: 'flower-bloom',
    effect: 'bloom',
    duration: 8000,
    spawnChance: 0.11,
    eventExclusive: true,
  };

  static apply(): { spreadRadius: number; effectMultiplier: number } {
    return {
      spreadRadius: 150,
      effectMultiplier: 1.5,
    };
  }

  static shouldSpread(distance: number, spreadRadius: number): boolean {
    return distance <= spreadRadius;
  }

  static onCollect(): void {
    console.log('[Bloom] Power-up effects spreading to nearby prey!');
  }
}
