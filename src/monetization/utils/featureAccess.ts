import type { PurchaseTier, FeatureAccess } from '../types/purchase.types';
import {
  FREE_TIER_PREY,
  PREMIUM_TIER_PREY,
  FREE_TIER_ENVIRONMENTS,
  PREMIUM_TIER_ENVIRONMENTS,
  PROFILE_LIMITS,
  STATS_RETENTION,
} from '../config/products';

export function getFeatureAccess(tier: PurchaseTier): FeatureAccess {
  switch (tier) {
    case 'family':
      return {
        maxProfiles: PROFILE_LIMITS.family,
        availablePreyTypes: PREMIUM_TIER_PREY,
        availableEnvironments: PREMIUM_TIER_ENVIRONMENTS,
        statsRetentionDays: STATS_RETENTION.family,
        hasFamilyDashboard: true,
      };

    case 'premium':
      return {
        maxProfiles: PROFILE_LIMITS.premium,
        availablePreyTypes: PREMIUM_TIER_PREY,
        availableEnvironments: PREMIUM_TIER_ENVIRONMENTS,
        statsRetentionDays: STATS_RETENTION.premium,
        hasFamilyDashboard: false,
      };

    case 'free':
    default:
      return {
        maxProfiles: PROFILE_LIMITS.free,
        availablePreyTypes: FREE_TIER_PREY,
        availableEnvironments: FREE_TIER_ENVIRONMENTS,
        statsRetentionDays: STATS_RETENTION.free,
        hasFamilyDashboard: false,
      };
  }
}

export function canAccessPreyType(preyType: string, tier: PurchaseTier): boolean {
  const access = getFeatureAccess(tier);
  return access.availablePreyTypes.includes(preyType);
}

export function canAccessEnvironment(environment: string, tier: PurchaseTier): boolean {
  const access = getFeatureAccess(tier);
  return access.availableEnvironments.includes(environment);
}

export function canCreateProfile(currentCount: number, tier: PurchaseTier): boolean {
  const access = getFeatureAccess(tier);
  return currentCount < access.maxProfiles;
}

export function getMaxProfiles(tier: PurchaseTier): number {
  const access = getFeatureAccess(tier);
  return access.maxProfiles;
}

export function canAccessStats(tier: PurchaseTier): boolean {
  return true;
}

export function getStatsRetentionDays(tier: PurchaseTier): number | 'lifetime' {
  const access = getFeatureAccess(tier);
  return access.statsRetentionDays;
}
