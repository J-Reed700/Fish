import { Platform } from 'react-native';

export const REVENUECAT_CONFIG = {
  ios: 'appl_XXXXXXXXXXXXXXXXXXXXXXXX',
  android: 'goog_XXXXXXXXXXXXXXXXXXXXXXXX',
};

export const PRODUCT_IDS = {
  premium: Platform.select({
    ios: 'com.fishcatgame.premium',
    android: 'premium_unlock',
  })!,
  family: Platform.select({
    ios: 'com.fishcatgame.family',
    android: 'family_unlock',
  })!,
};

export const ENTITLEMENTS = {
  premium: 'premium',
  family: 'family',
};

export const PRICING = {
  premium: 4.99,
  family: 7.99,
};

export const FREE_TIER_PREY = ['fish', 'butterfly', 'ladybug', 'mouse'];
export const PREMIUM_TIER_PREY = [
  'fish',
  'butterfly',
  'ladybug',
  'mouse',
  'cricket',
  'dragonfly',
  'bee',
  'ant',
  'spider',
  'worm',
  'beetle',
  'caterpillar',
  'moth',
  'fly',
  'grasshopper',
];

export const FREE_TIER_ENVIRONMENTS = ['ocean', 'pond'];
export const PREMIUM_TIER_ENVIRONMENTS = [
  'ocean',
  'pond',
  'coral-reef',
  'deep-sea',
  'river',
  'lake',
  'aquarium',
  'koi-pond',
  'tropical',
  'arctic',
  'sunset',
  'midnight',
];

export const PROFILE_LIMITS = {
  free: 1,
  premium: 3,
  family: 6,
};

export const STATS_RETENTION = {
  free: 7,
  premium: 'lifetime' as const,
  family: 'lifetime' as const,
};
