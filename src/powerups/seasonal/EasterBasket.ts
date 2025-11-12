import type { SeasonalPowerUp } from '../../types';

export class EasterBasket {
  static config: SeasonalPowerUp = {
    id: 'easter-basket',
    name: 'Easter Basket',
    description: 'Collect 5 eggs for mega reward',
    icon: 'easter-basket',
    effect: 'easter-basket',
    duration: 15000,
    spawnChance: 0.1,
    eventExclusive: true,
  };

  private static eggsCollected: number = 0;
  private static readonly TARGET_EGGS = 5;

  static apply(): { eggsNeeded: number; bonusPerEgg: number } {
    this.eggsCollected = 0;
    return {
      eggsNeeded: this.TARGET_EGGS,
      bonusPerEgg: 100,
    };
  }

  static onEggCollect(): { completed: boolean; reward?: number } {
    this.eggsCollected++;

    if (this.eggsCollected >= this.TARGET_EGGS) {
      const megaReward = 1000;
      this.eggsCollected = 0;
      return { completed: true, reward: megaReward };
    }

    return { completed: false };
  }

  static onCollect(): void {
    console.log('[EasterBasket] Collect 5 eggs for mega reward!');
  }
}
