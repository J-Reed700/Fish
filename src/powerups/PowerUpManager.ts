import { SharedValue } from 'react-native-reanimated';
import type {
  PowerUp,
  PowerUpType,
  PowerUpInventory,
  ActivePowerUp,
  Vector2D,
  PowerUpConfig,
  PowerUpRarity,
} from '../types';

interface PowerUpManagerConfig {
  screenWidth: number;
  screenHeight: number;
  maxInventorySlots: number;
  maxActivePowerUps: number;
  spawnCheckInterval: number;
  orbLifetime: number;
  collectionRadius: number;
  configs: Record<PowerUpType, PowerUpConfig>;
}

export class PowerUpManager {
  private config: PowerUpManagerConfig;
  private powerUps: PowerUp[] = [];
  private inventory: PowerUpInventory = {
    slots: [null, null, null],
    active: [],
  };
  private lastSpawnCheck: number = 0;
  private spawnTimers: Map<PowerUpType, number> = new Map();
  private idCounter: number = 0;

  constructor(config: PowerUpManagerConfig) {
    this.config = config;
  }

  update(deltaTime: number, currentTime: number): void {
    this.updatePowerUpLifetimes(deltaTime);
    this.updateActivePowerUps(deltaTime);
    this.updateBobPhase(deltaTime);
    this.checkSpawns(currentTime);
  }

  private updatePowerUpLifetimes(deltaTime: number): void {
    this.powerUps = this.powerUps.filter((powerUp) => {
      powerUp.lifetime += deltaTime;
      return powerUp.lifetime < powerUp.maxLifetime;
    });
  }

  private updateActivePowerUps(deltaTime: number): void {
    this.inventory.active = this.inventory.active.filter((active) => {
      active.remainingTime -= deltaTime;

      if (active.type === 'chain-reaction' && active.chainReactionCount !== undefined) {
        return active.chainReactionCount > 0;
      }

      return active.remainingTime > 0;
    });
  }

  private updateBobPhase(deltaTime: number): void {
    this.powerUps.forEach((powerUp) => {
      powerUp.bobPhase += deltaTime * 0.003;
      powerUp.glowIntensity = 0.7 + Math.sin(powerUp.bobPhase * 2) * 0.3;

      const bobOffset = Math.sin(powerUp.bobPhase) * 20;
      powerUp.position.y += bobOffset * deltaTime * 0.001;
    });
  }

  private checkSpawns(currentTime: number): void {
    if (currentTime - this.lastSpawnCheck < this.config.spawnCheckInterval) {
      return;
    }

    this.lastSpawnCheck = currentTime;

    Object.entries(this.config.configs).forEach(([type, config]) => {
      const lastSpawn = this.spawnTimers.get(type as PowerUpType) || 0;

      if (currentTime - lastSpawn < config.spawnInterval) {
        return;
      }

      if (Math.random() < config.spawnChance) {
        this.spawnPowerUp(type as PowerUpType);
        this.spawnTimers.set(type as PowerUpType, currentTime);
      }
    });
  }

  spawnPowerUp(type: PowerUpType, position?: Vector2D): string {
    const config = this.config.configs[type];
    const margin = 100;

    const spawnPosition = position || {
      x: margin + Math.random() * (this.config.screenWidth - 2 * margin),
      y: margin + Math.random() * (this.config.screenHeight - 2 * margin),
    };

    const powerUp: PowerUp = {
      id: `powerup-${this.idCounter++}`,
      type,
      category: config.category,
      rarity: config.rarity,
      position: spawnPosition,
      velocity: { x: 0, y: 0 },
      lifetime: 0,
      maxLifetime: this.config.orbLifetime,
      bobPhase: Math.random() * Math.PI * 2,
      glowIntensity: 1,
    };

    this.powerUps.push(powerUp);
    return powerUp.id;
  }

  checkCollection(touchPosition: Vector2D): PowerUpType | null {
    const collectedIndex = this.powerUps.findIndex((powerUp) => {
      const dx = powerUp.position.x - touchPosition.x;
      const dy = powerUp.position.y - touchPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < this.config.collectionRadius;
    });

    if (collectedIndex !== -1) {
      const collected = this.powerUps[collectedIndex];
      this.powerUps.splice(collectedIndex, 1);

      if (collected.category === 'rare-item') {
        this.activatePowerUp(collected.type);
        return collected.type;
      }

      const emptySlot = this.inventory.slots.findIndex((slot) => slot === null);
      if (emptySlot !== -1) {
        this.inventory.slots[emptySlot] = collected.type;
      } else {
        this.activatePowerUp(collected.type);
      }

      return collected.type;
    }

    return null;
  }

  activatePowerUp(type: PowerUpType): void {
    const config = this.config.configs[type];

    if (config.category === 'rare-item') {
      return;
    }

    if (this.inventory.active.length >= this.config.maxActivePowerUps) {
      return;
    }

    const existingMultiplier = this.inventory.active.find(
      (a) => a.type === type && config.category === 'multiplier'
    );

    if (existingMultiplier) {
      existingMultiplier.remainingTime = Math.max(
        existingMultiplier.remainingTime,
        config.duration
      );
      return;
    }

    const active: ActivePowerUp = {
      type,
      duration: config.duration,
      remainingTime: config.duration,
      startTime: Date.now(),
      multiplier: this.getMultiplier(type),
      chainReactionCount: type === 'chain-reaction' ? 5 : undefined,
    };

    this.inventory.active.push(active);
  }

  activateFromInventory(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= this.inventory.slots.length) {
      return false;
    }

    const type = this.inventory.slots[slotIndex];
    if (!type) {
      return false;
    }

    this.activatePowerUp(type);
    this.inventory.slots[slotIndex] = null;
    return true;
  }

  private getMultiplier(type: PowerUpType): number | undefined {
    switch (type) {
      case 'double-points':
        return 2;
      case 'triple-points':
        return 3;
      case 'mega-multiplier':
        return 5;
      default:
        return undefined;
    }
  }

  getTotalMultiplier(): number {
    const multipliers = this.inventory.active
      .filter((a) => a.multiplier !== undefined)
      .reduce((sum, a) => sum + (a.multiplier! - 1), 0);

    return 1 + multipliers;
  }

  isEffectActive(type: PowerUpType): boolean {
    return this.inventory.active.some((a) => a.type === type);
  }

  getActiveEffect(type: PowerUpType): ActivePowerUp | undefined {
    return this.inventory.active.find((a) => a.type === type);
  }

  decrementChainReaction(): void {
    const chainReaction = this.inventory.active.find((a) => a.type === 'chain-reaction');
    if (chainReaction && chainReaction.chainReactionCount !== undefined) {
      chainReaction.chainReactionCount--;
    }
  }

  spawnRewardPowerUp(position: Vector2D, rarity?: PowerUpRarity): void {
    const availableTypes = Object.entries(this.config.configs)
      .filter(([_, config]) => !rarity || config.rarity === rarity)
      .map(([type]) => type as PowerUpType);

    if (availableTypes.length > 0) {
      const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      this.spawnPowerUp(randomType, position);
    }
  }

  getPowerUps(): PowerUp[] {
    return this.powerUps;
  }

  getInventory(): PowerUpInventory {
    return this.inventory;
  }

  getActivePowerUps(): ActivePowerUp[] {
    return this.inventory.active;
  }

  clearAll(): void {
    this.powerUps = [];
    this.inventory = {
      slots: [null, null, null],
      active: [],
    };
    this.spawnTimers.clear();
  }

  reset(): void {
    this.clearAll();
    this.lastSpawnCheck = 0;
    this.idCounter = 0;
  }
}
