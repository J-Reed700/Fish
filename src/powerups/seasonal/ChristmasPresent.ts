import type { SeasonalPowerUp } from '../../types';

export class ChristmasPresent {
  static config: SeasonalPowerUp = {
    id: 'christmas-present',
    name: 'Christmas Present',
    description: 'Grants bonus points and XP',
    icon: 'gift-box',
    effect: 'present',
    duration: 10000,
    spawnChance: 0.15,
    eventExclusive: true,
  };

  static apply(): { pointsMultiplier: number; xpBonus: number } {
    return {
      pointsMultiplier: 2.0,
      xpBonus: 50,
    };
  }

  static onCollect(): void {
    console.log('[ChristmasPresent] Double points and bonus XP!');
  }
}
