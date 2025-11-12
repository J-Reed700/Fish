import type { SeasonalPowerUp } from '../../types';

export class Cornucopia {
  static config: SeasonalPowerUp = {
    id: 'cornucopia',
    name: 'Cornucopia',
    description: 'Increases prey spawn rate',
    icon: 'cornucopia',
    effect: 'cornucopia',
    duration: 10000,
    spawnChance: 0.13,
    eventExclusive: true,
  };

  static apply(): { spawnRateMultiplier: number } {
    return {
      spawnRateMultiplier: 2.5,
    };
  }

  static onCollect(): void {
    console.log('[Cornucopia] Prey spawn rate boosted!');
  }
}
