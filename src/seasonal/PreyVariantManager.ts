import type { PreyType, PreyVariant } from '../types';
import type { SeasonalEvent, SeasonalEventConfig } from './types';

export interface AppliedVariant {
  originalPreyType: PreyType;
  variant: PreyVariant;
  colors: string[];
  texture?: string;
  pointsMultiplier: number;
}

export class PreyVariantManager {
  private static instance: PreyVariantManager;
  private activeVariants: Map<SeasonalEvent, PreyVariant[]> = new Map();
  private variantProbabilities: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): PreyVariantManager {
    if (!PreyVariantManager.instance) {
      PreyVariantManager.instance = new PreyVariantManager();
    }
    return PreyVariantManager.instance;
  }

  loadEventVariants(event: SeasonalEventConfig): void {
    const variants: PreyVariant[] = event.preyVariants.map((variantConfig) => ({
      id: variantConfig.variantId,
      name: variantConfig.name,
      basePreyType: variantConfig.basePreyType,
      appearance: variantConfig.appearance,
      behaviorModifier: variantConfig.behaviorModifier,
      spawnChance: variantConfig.spawnChance,
      pointsMultiplier: variantConfig.pointsMultiplier,
    }));

    this.activeVariants.set(event.id, variants);

    for (const variant of variants) {
      const key = `${event.id}_${variant.id}`;
      this.variantProbabilities.set(key, variant.spawnChance);
    }

    console.log(`[PreyVariantManager] Loaded ${variants.length} variants for ${event.name}`);
  }

  unloadEventVariants(eventId: SeasonalEvent): void {
    const variants = this.activeVariants.get(eventId);
    if (variants) {
      for (const variant of variants) {
        const key = `${eventId}_${variant.id}`;
        this.variantProbabilities.delete(key);
      }
      this.activeVariants.delete(eventId);
      console.log(`[PreyVariantManager] Unloaded variants for event: ${eventId}`);
    }
  }

  shouldApplyVariant(preyType: PreyType, eventId?: SeasonalEvent): PreyVariant | null {
    if (!eventId) {
      return null;
    }

    const variants = this.activeVariants.get(eventId);
    if (!variants) {
      return null;
    }

    const matchingVariants = variants.filter((v) => v.basePreyType === preyType);
    if (matchingVariants.length === 0) {
      return null;
    }

    for (const variant of matchingVariants) {
      const roll = Math.random();
      if (roll < variant.spawnChance) {
        return variant;
      }
    }

    return null;
  }

  applyVariantToPrey(
    preyType: PreyType,
    variant: PreyVariant
  ): AppliedVariant {
    return {
      originalPreyType: preyType,
      variant,
      colors: variant.appearance.colors,
      texture: variant.appearance.texture,
      pointsMultiplier: variant.pointsMultiplier,
    };
  }

  getActiveVariants(eventId?: SeasonalEvent): PreyVariant[] {
    if (!eventId) {
      return [];
    }
    return this.activeVariants.get(eventId) || [];
  }

  getVariantById(eventId: SeasonalEvent, variantId: string): PreyVariant | undefined {
    const variants = this.activeVariants.get(eventId);
    return variants?.find((v) => v.id === variantId);
  }

  getAllActiveVariants(): PreyVariant[] {
    const allVariants: PreyVariant[] = [];
    for (const variants of this.activeVariants.values()) {
      allVariants.push(...variants);
    }
    return allVariants;
  }

  getVariantAppearance(variant: PreyVariant): {
    colors: string[];
    specialEffects: string[];
    texture: string;
  } {
    return variant.appearance;
  }

  getVariantBehaviorModifier(variant: PreyVariant): {
    speedMultiplier: number;
    specialAbility: string;
  } {
    return variant.behaviorModifier;
  }

  clear(): void {
    this.activeVariants.clear();
    this.variantProbabilities.clear();
  }
}
