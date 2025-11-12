import type { Timestamp } from 'firebase/firestore';

export type GameMode =
  | 'free-swim'
  | 'hunt'
  | 'bubbles'
  | 'frenzy'
  | 'mouse'
  | 'laser'
  | 'insect'
  | 'variety';

export type FishSpecies =
  | 'goldfish'
  | 'clownfish'
  | 'angelfish'
  | 'betta'
  | 'guppy'
  | 'neon-tetra'
  | 'koi'
  | 'molly';

export type MiniGameType =
  | 'whack-a-mole'
  | 'memory-match'
  | 'follow-leader'
  | 'bubble-pop'
  | 'speed-run';

export type LeaderboardCategory =
  | 'total-catches'
  | 'playtime'
  | 'play-streak'
  | 'boss-giant-fish'
  | 'boss-speed-demon'
  | 'boss-swarm-leader'
  | 'boss-mega-cockroach'
  | 'boss-total-defeats'
  | 'whack-a-mole'
  | 'memory-match'
  | 'follow-leader'
  | 'bubble-pop'
  | 'speed-run';

export type CommunityChallengeType = 'daily' | 'weekly' | 'community' | 'special';

export interface CatProfile {
  id: string;
  name: string;
  photoUrl?: string;
  photoUri?: string;
  isActive: boolean;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  catName: string;
  catPhotoUrl?: string;
  score: number;
  rank: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface Leaderboard {
  category: LeaderboardCategory;
  timeframe: string;
  entries: LeaderboardEntry[];
  lastUpdated: number;
}

export interface UserLeaderboardStats {
  userId: string;
  totalCatches: number;
  bossDefeats: Record<string, number>;
  miniGameHighScores: Record<MiniGameType, number>;
  playStreak: number;
  totalPlaytime: number;
  lastPlayed: number;
}

export interface CommunityChallenge {
  id: string;
  type: CommunityChallengeType;
  title: string;
  description: string;
  requirement: {
    type: string;
    target: number;
  };
  reward: {
    type: string;
    amount: number;
  };
  startTime: number;
  endTime: number;
  isActive: boolean;
}

export interface UserChallengeProgress {
  challengeId: string;
  userId: string;
  profileId: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  completedAt?: number;
  claimedReward: boolean;
}

export interface CommunityChallengeProgress {
  challengeId: string;
  globalProgress: number;
  globalTarget: number;
  contributorCount: number;
  contributions: Record<string, number>;
  isCompleted: boolean;
  completedAt?: Timestamp | null;
}

export interface BoidsConfig {
  separationDistance: number;
  separationWeight: number;
  alignmentDistance: number;
  alignmentWeight: number;
  cohesionDistance: number;
  cohesionWeight: number;
  edgeMargin: number;
}

export interface GameConfig {
  width: number;
  height: number;
  fishCount: number;
  targetFPS: number;
  boids: BoidsConfig;
  mode: GameMode;
}

export interface GameModeConfig {
  fishCount?: number;
  mouseCount?: number;
  laserCount?: number;
  insectCount?: number;
  ladybugCount?: number;
  butterflyCount?: number;
  cockroachCount?: number;
  wormCount?: number;
  particleCount?: number;
  spawnRate?: number;
  speedMultiplier?: number;
  boidsOverride?: Partial<BoidsConfig>;
  insectMix?: Record<string, number>;
}

export type PreyType =
  | 'fish'
  | 'bird'
  | 'mouse'
  | 'butterfly'
  | 'dragonfly'
  | 'beetle'
  | 'spider'
  | 'ant'
  | 'worm'
  | 'snail'
  | 'frog'
  | 'bee'
  | 'ladybug'
  | 'cricket'
  | 'grasshopper'
  | 'moth'
  | 'fly'
  | 'caterpillar'
  | 'crab'
  | 'bat';

export type PowerUpType =
  | 'freeze'
  | 'magnet'
  | 'double-points'
  | 'slow-motion'
  | 'invincibility'
  | 'frenzy'
  | 'trick-or-treat'
  | 'present'
  | 'love-potion'
  | 'easter-basket'
  | 'sun-power'
  | 'cornucopia'
  | 'bloom';

export type SeasonalEvent =
  | 'halloween'
  | 'christmas'
  | 'valentines'
  | 'easter'
  | 'summer'
  | 'autumn'
  | 'spring'
  | 'lunar-new-year'
  | 'st-patricks'
  | 'thanksgiving'
  | 'independence'
  | 'new-year';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'catch' | 'combo' | 'time' | 'boss' | 'collect';
  target: number;
  current: number;
  rewards: SeasonalReward[];
  completed: boolean;
  eventExclusive: boolean;
}

export interface BossAppearance {
  size: number;
  colors: string[];
  specialEffects?: string[];
  spriteSheet?: string;
}

export interface BossPhase {
  phaseNumber: number;
  hpThreshold: number;
  behaviorChanges: {
    speedMultiplier?: number;
    attackPattern?: string;
    specialAbility?: string;
  };
}

export interface SeasonalEventConfig {
  id: SeasonalEvent;
  name: string;
  description: string;
  startDate: { month: number; day: number };
  endDate: { month: number; day: number };
  preyVariants: SeasonalPreyVariant[];
  environments: string[];
  powerUps: SeasonalPowerUp[];
  challenges: Challenge[];
  bosses: SeasonalBoss[];
  rewards: SeasonalReward[];
  theme: SeasonalTheme;
}

export interface SeasonalPreyVariant {
  basePreyType: PreyType;
  variantId: string;
  name: string;
  appearance: {
    colors: string[];
    specialEffects?: string[];
    texture?: string;
  };
  behaviorModifier?: {
    speedMultiplier?: number;
    specialAbility?: string;
  };
  spawnChance: number;
  pointsMultiplier: number;
}

export interface SeasonalPowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: PowerUpType;
  duration: number;
  spawnChance: number;
  eventExclusive: boolean;
}

export interface SeasonalBoss {
  id: string;
  name: string;
  description: string;
  appearance: BossAppearance;
  hp: number;
  phases: BossPhase[];
  rewards: SeasonalReward[];
  spawnSchedule: 'daily' | 'weekly' | 'once';
}

export interface SeasonalReward {
  type: 'currency' | 'badge' | 'cosmetic' | 'power-up' | 'xp';
  itemId: string;
  quantity: number;
  rarity: 'common' | 'rare' | 'legendary';
}

export interface SeasonalTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  music?: string;
  particles?: string[];
  uiOverlay?: string;
}

export interface ActiveSeasonalEvent {
  event: SeasonalEventConfig;
  progress: {
    challengesCompleted: number;
    totalChallenges: number;
    bossesDefeated: number;
    collectiblesFound: number;
    eventCurrency: number;
  };
  startTime: number;
  endTime: number;
  isActive: boolean;
}
