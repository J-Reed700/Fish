export { PurchaseProvider, usePurchaseContext } from './contexts/PurchaseContext';
export { usePremium } from './hooks/usePremium';
export { usePurchase } from './hooks/usePurchase';
export { Paywall } from './components/Paywall';
export { FeatureGate } from './components/FeatureGate';
export { PremiumBadge } from './components/PremiumBadge';
export { UpgradePrompt } from './components/UpgradePrompt';
export {
  getFeatureAccess,
  canAccessPreyType,
  canAccessEnvironment,
  canCreateProfile,
  getMaxProfiles,
  canAccessStats,
  getStatsRetentionDays
} from './utils/featureAccess';
export type { PurchaseTier, FeatureAccess, PurchaseState, PurchaseResult } from './types/purchase.types';
export { PRODUCT_IDS, ENTITLEMENTS, PRICING, PROFILE_LIMITS, STATS_RETENTION } from './config/products';
export { default as RevenueCatService } from './services/RevenueCatService';
