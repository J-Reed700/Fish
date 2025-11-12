export type PurchaseTier = 'free' | 'premium' | 'family';

export interface TierLimits {
  maxProfiles: number;
  cloudSync: boolean;
  unlimitedStorage: boolean;
}

export class TierValidator {
  private static readonly TIER_LIMITS: Record<PurchaseTier, TierLimits> = {
    free: {
      maxProfiles: 1,
      cloudSync: false,
      unlimitedStorage: false,
    },
    premium: {
      maxProfiles: 999,
      cloudSync: false,
      unlimitedStorage: true,
    },
    family: {
      maxProfiles: 999,
      cloudSync: true,
      unlimitedStorage: true,
    },
  };

  static getTierLimits(tier: PurchaseTier): TierLimits {
    return this.TIER_LIMITS[tier];
  }

  static getMaxProfiles(tier: PurchaseTier): number {
    return this.TIER_LIMITS[tier].maxProfiles;
  }

  static canCreateProfile(tier: PurchaseTier, currentCount: number): boolean {
    return currentCount < this.getMaxProfiles(tier);
  }

  static canUseCloudSync(tier: PurchaseTier): boolean {
    return this.TIER_LIMITS[tier].cloudSync;
  }

  static getUpgradeMessage(tier: PurchaseTier): string {
    if (tier === 'free') {
      return 'Upgrade to Premium ($4.99) for unlimited profiles, or Family ($7.99) for unlimited profiles with cloud sync and sharing!';
    }
    if (tier === 'premium') {
      return 'Upgrade to Family ($7.99) to enable cloud sync and profile sharing!';
    }
    return '';
  }

  static validateProfileCreation(
    tier: PurchaseTier,
    currentCount: number
  ): { valid: boolean; error?: string; upgradeMessage?: string } {
    if (!this.canCreateProfile(tier, currentCount)) {
      return {
        valid: false,
        error: `Profile limit reached (${this.getMaxProfiles(tier)} max for ${tier} tier)`,
        upgradeMessage: this.getUpgradeMessage(tier),
      };
    }

    return { valid: true };
  }
}

export default TierValidator;
