import { PreyType } from '../types/PreyType';
import { EnvironmentId } from '../types/Environment';

export type SeasonalEvent =
  | 'halloween'
  | 'christmas'
  | 'valentines'
  | 'easter'
  | 'summer'
  | 'autumn'
  | 'spring';

export interface SeasonalTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  uiOverlay?: string;
}

export interface PreyVariantConfig {
  basePreyType: PreyType;
  variantName: string;
  colorOverride: string;
  textureOverlay?: string;
  spawnChance: number;
  pointsMultiplier: number;
}

export interface EnvironmentOverlay {
  environmentId: EnvironmentId;
  particleOverlay: string[];
  colorTint: string;
  backgroundOverlay?: string;
}

export interface SeasonalChallengeConfig {
  id: string;
  name: string;
  description: string;
  requirement: {
    type: 'count' | 'points' | 'streak' | 'time';
    target: number;
    preyType?: PreyType;
  };
  reward: {
    xp: number;
    badges?: string[];
    powerUps?: string[];
  };
}

export interface SeasonalReward {
  type: 'badge' | 'powerup' | 'skin' | 'xp';
  itemId: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  amount?: number;
}

export interface SeasonalEventConfig {
  id: SeasonalEvent;
  name: string;
  description: string;
  startDate: { month: number; day: number };
  endDate: { month: number; day: number };
  theme: SeasonalTheme;
  preyVariants: PreyVariantConfig[];
  environmentOverlays: EnvironmentOverlay[];
  powerUpIcons: Record<string, string>;
  challenges: SeasonalChallengeConfig[];
  rewards: SeasonalReward[];
}

export interface SeasonalState {
  activeEvent: SeasonalEvent | null;
  eventStartTime: number;
  eventEndTime: number;
  challengeProgress: Record<string, number>;
  earnedRewards: string[];
}
