import type { SeasonalPowerUp } from '../../types';

export class LovePotion {
  static config: SeasonalPowerUp = {
    id: 'love-potion',
    name: 'Love Potion',
    description: 'All prey attracted to center of screen',
    icon: 'love-potion',
    effect: 'love-potion',
    duration: 8000,
    spawnChance: 0.12,
    eventExclusive: true,
  };

  static apply(): { attractionForce: number; attractionPoint: { x: number; y: number } } {
    return {
      attractionForce: 5.0,
      attractionPoint: { x: 0.5, y: 0.5 },
    };
  }

  static onCollect(): void {
    console.log('[LovePotion] Attracting all prey to center!');
  }
}
