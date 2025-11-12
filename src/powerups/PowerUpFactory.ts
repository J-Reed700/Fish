import type { PowerUpType, PowerUpRarity, PowerUpConfig, Vector2D } from '../types';

export class PowerUpFactory {
  private configs: Record<PowerUpType, PowerUpConfig>;

  constructor(configs: Record<PowerUpType, PowerUpConfig>) {
    this.configs = configs;
  }

  getRandomPowerUpByRarity(rarity: PowerUpRarity): PowerUpType | null {
    const availableTypes = Object.entries(this.configs)
      .filter(([_, config]) => config.rarity === rarity)
      .map(([type]) => type as PowerUpType);

    if (availableTypes.length === 0) {
      return null;
    }

    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  getRandomPowerUpByCategory(category: string): PowerUpType | null {
    const availableTypes = Object.entries(this.configs)
      .filter(([_, config]) => config.category === category)
      .map(([type]) => type as PowerUpType);

    if (availableTypes.length === 0) {
      return null;
    }

    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  getWeightedRandomPowerUp(): PowerUpType {
    const rarityWeights = {
      common: 50,
      uncommon: 30,
      rare: 15,
      legendary: 5,
    };

    const totalWeight = Object.values(rarityWeights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      random -= weight;
      if (random <= 0) {
        const powerUp = this.getRandomPowerUpByRarity(rarity as PowerUpRarity);
        if (powerUp) {
          return powerUp;
        }
      }
    }

    return 'double-points';
  }

  getRewardPowerUp(rewardType: 'combo' | 'boss' | 'achievement'): PowerUpType {
    const rewardMappings = {
      combo: ['uncommon', 'rare'] as PowerUpRarity[],
      boss: ['rare', 'legendary'] as PowerUpRarity[],
      achievement: ['rare', 'legendary'] as PowerUpRarity[],
    };

    const rarities = rewardMappings[rewardType];
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    const powerUp = this.getRandomPowerUpByRarity(rarity);

    return powerUp || 'double-points';
  }

  getConfig(type: PowerUpType): PowerUpConfig | undefined {
    return this.configs[type];
  }

  getAllConfigs(): Record<PowerUpType, PowerUpConfig> {
    return this.configs;
  }

  getRarityTiers(): Record<PowerUpRarity, PowerUpType[]> {
    const tiers: Record<PowerUpRarity, PowerUpType[]> = {
      common: [],
      uncommon: [],
      rare: [],
      legendary: [],
    };

    Object.entries(this.configs).forEach(([type, config]) => {
      tiers[config.rarity].push(type as PowerUpType);
    });

    return tiers;
  }

  getCategoryGroups(): Record<string, PowerUpType[]> {
    const groups: Record<string, PowerUpType[]> = {};

    Object.entries(this.configs).forEach(([type, config]) => {
      if (!groups[config.category]) {
        groups[config.category] = [];
      }
      groups[config.category].push(type as PowerUpType);
    });

    return groups;
  }

  shouldSpawnRareVariant(baseSpawnChance: number): boolean {
    return Math.random() < baseSpawnChance;
  }
}
