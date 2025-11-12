import type { SeasonalPowerUp } from '../../types';

export class TrickOrTreat {
  static config: SeasonalPowerUp = {
    id: 'trick-or-treat',
    name: 'Trick or Treat Bag',
    description: 'Grants a random power-up effect',
    icon: 'candy-bag',
    effect: 'trick-or-treat',
    duration: 5000,
    spawnChance: 0.1,
    eventExclusive: true,
  };

  static apply(): { effect: string; duration: number } {
    const randomEffects = [
      { effect: 'freeze', duration: 5000 },
      { effect: 'magnet', duration: 8000 },
      { effect: 'double-points', duration: 10000 },
      { effect: 'slow-motion', duration: 7000 },
      { effect: 'frenzy', duration: 5000 },
    ];

    const chosen = randomEffects[Math.floor(Math.random() * randomEffects.length)];
    return chosen;
  }

  static onCollect(): void {
    console.log('[TrickOrTreat] Activating random power-up!');
  }
}
