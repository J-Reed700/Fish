// Vector2D for positions and velocities
export interface Vector2D {
  x: number;
  y: number;
}

// Fish entity type
export interface Fish {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  rotation: number;
  size: number;
  color: string;
  species: FishSpecies;
  maxSpeed: number;
  maxForce: number;
}

// Fish species/types
export type FishSpecies =
  | 'goldfish'
  | 'clownfish'
  | 'angelfish'
  | 'betta'
  | 'guppy'
  | 'neon-tetra'
  | 'koi'
  | 'molly';

// Mouse entity type
export interface Mouse {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'mouse';
  state: 'scurrying' | 'paused' | 'fleeing';
  stateTimer: number;
  wanderAngle: number;
  maxSpeed: number;
  lifetime: number;
  maxLifetime: number;
}

// LaserPointer entity type
export interface LaserPointer {
  id: string;
  position: Vector2D;
  targetPosition: Vector2D;
  velocity: Vector2D;
  size: number;
  type: 'laser';
  opacity: number;
  moveTimer: number;
}

// Insect entity type
export interface Insect {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'insect';
  subType: 'butterfly' | 'fly';
  phaseOffset: number;
  lifetime: number;
  maxLifetime: number;
}

// Cockroach entity type
export interface Cockroach {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'cockroach';
  state: 'scurrying' | 'frozen' | 'dashing' | 'hiding';
  stateTimer: number;
  targetEdge: 'top' | 'bottom' | 'left' | 'right' | null;
  panicLevel: number;
  acceleration: Vector2D;
  maxSpeed: number;
  antennaPhase: number;
  legPhase: number;
  dashDirection: Vector2D | null;
}

export interface Butterfly {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'butterfly';
  state: 'floating' | 'hovering' | 'fleeing';
  wingPhase: number;
  wingFlapSpeed: number;
  noiseOffset: Vector2D;
  floatAmplitude: number;
  floatFrequency: number;
  stateTimer: number;
  lifetime: number;
  maxLifetime: number;
}

// Ladybug entity type
export interface Ladybug {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'ladybug';
  state: 'crawling' | 'paused' | 'climbing';
  stateTimer: number;
  pathPoints: Vector2D[];
  pathProgress: number;
  pathDuration: number;
  rotationSpeed: number;
  targetRotation: number;
  legPhase: number;
}

// Frog entity type
export interface Frog {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'frog';
  state: 'idle' | 'anticipating' | 'jumping' | 'landing' | 'fleeing';
  stateTimer: number;
  idleDuration: number;
  jumpVelocity: Vector2D;
  gravity: number;
  isGrounded: boolean;
  eyeDirection: Vector2D;
  throatPhase: number;
  legExtension: number;
  anticipationProgress: number;
  lifetime: number;
  maxLifetime: number;
}

// Spider entity type
export interface Spider {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'spider';
  state: 'climbing' | 'spinning' | 'hanging' | 'crawling' | 'retreating';
  stateTimer: number;
  targetCorner: Vector2D | null;
  silkAttachPoint: Vector2D | null;
  silkLength: number;
  legPhases: number[];
  climbSpeed: number;
  lifetime: number;
  maxLifetime: number;
}

export interface Bird {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'bird';
  state: 'flying' | 'perching' | 'takeoff' | 'fleeing';
  stateTimer: number;
  perchPosition: Vector2D | null;
  targetDirection: Vector2D;
  wingPhase: number;
  wingFlapSpeed: number;
  bobPhase: number;
  lifetime: number;
  maxLifetime: number;
}

export interface Cricket {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'cricket';
  state: 'crawling' | 'preparing' | 'jumping' | 'landing' | 'fleeing';
  stateTimer: number;
  jumpVelocity: Vector2D;
  gravity: number;
  isGrounded: boolean;
  legPhase: number;
  antennaPhase: number;
  targetJumpDirection: Vector2D | null;
  lifetime: number;
  maxLifetime: number;
}

export interface WormSegment {
  position: Vector2D;
  previousPosition: Vector2D;
  velocity: Vector2D;
}

export interface Worm {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'worm';
  state: 'wiggling' | 'stretching' | 'contracting' | 'burrowing' | 'fleeing';
  stateTimer: number;
  segments: WormSegment[];
  segmentCount: number;
  segmentDistance: number;
  wavePhase: number;
  waveAmplitude: number;
  waveFrequency: number;
  stretchFactor: number;
  targetDirection: Vector2D;
  lifetime: number;
  maxLifetime: number;
}

// Game mode types
export type GameMode = 'free-swim' | 'hunt' | 'bubbles' | 'frenzy' | 'mouse' | 'laser' | 'insect' | 'variety';

// Game state
export interface GameState {
  fish: Fish[];
  particles: Particle[];
  mode: GameMode;
  score: number;
  isPaused: boolean;
}

// Particle for bubbles/splashes
export interface Particle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  lifetime: number;
  maxLifetime: number;
  size: number;
  type: 'bubble' | 'splash';
}

// Boids parameters
export interface BoidsConfig {
  separationDistance: number;
  separationWeight: number;
  alignmentDistance: number;
  alignmentWeight: number;
  cohesionDistance: number;
  cohesionWeight: number;
  edgeMargin: number;
}

// Game configuration
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
  insectMix?: { butterfly: number; fly: number };
  ladybugCount?: number;
  butterflyCount?: number;
  cockroachCount?: number;
  wormCount?: number;
  particleCount?: number;
  spawnRate?: number;
  speedMultiplier?: number;
  boidsOverride?: Partial<BoidsConfig>;
}

export interface Profile {
  id: string;
  name: string;
  photoUri?: string;
  age?: number;
  breed?: string;
  preferences: {
    favoriteMode?: GameMode;
    difficulty?: 'easy' | 'medium' | 'hard';
    favoritePrey?: FishSpecies;
  };
  createdAt: number;
  lastPlayedAt: number;
}

export interface ProfileState {
  activeProfileId: string;
  profiles: Profile[];
  tierLimit: number;
}

export interface SessionRecord {
  id: string;
  profileId: string;
  startTime: number;
  endTime: number;
  duration: number;
  mode: GameMode;
  touchCount: number;
  catchesBySpecies: Record<FishSpecies, number>;
  fishCount: number;
}

export interface StatsAggregate {
  totalPlayTime: number;
  totalCatches: number;
  catchesBySpecies: Record<FishSpecies, number>;
  playTimeByMode: Record<GameMode, number>;
  totalSessions: number;
  averageSessionDuration: number;
  longestSession: number;
  currentStreak: number;
  lastPlayDate: string;
  bestDay: {
    date: string;
    catches: number;
  };
}

export interface DailyData {
  date: string;
  value: number;
}

export interface Screenshot {
  id: string;
  filePath: string;
  timestamp: number;
  profileId: string;
  sessionData: {
    catName: string;
    catches: number;
    playTime: number;
    mode: GameMode;
  };
}

export interface OverlayConfig {
  catName: string;
  catches: number;
  playTime: number;
  mode: GameMode;
  showWatermark: boolean;
  frame?: 'none' | 'rounded' | 'square' | 'fancy';
  theme?: 'light' | 'dark';
}

export type ChallengeType = 'catch-count' | 'play-time' | 'mode-variety' | 'species-diversity' | 'perfect-catches';
export type ChallengeTier = 'easy' | 'medium' | 'hard';
export type RewardType = 'prey-unlock' | 'theme-unlock' | 'achievement' | 'points';

export interface Reward {
  type: RewardType;
  value: string | number;
  displayName: string;
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  tier: ChallengeTier;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: Reward;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string;
  streakHistory: { date: string; played: boolean }[];
}

export interface UnlockState {
  preyTypes: string[];
  themes: string[];
  achievements: string[];
  points: number;
}

export interface SessionData {
  catchCount: number;
  playTime: number;
  modesPlayed: GameMode[];
  speciesCaught: FishSpecies[];
  perfectCatches: number;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    backgroundBottom?: string;
    ambient: string;
  };
  particles: {
    type: 'bubbles' | 'sparkles' | 'leaves';
    count: number;
    color: string;
    size: number;
  }[];
  decorations?: {
    type: 'plant' | 'rock' | 'coral';
    positions: Vector2D[];
    color: string;
  }[];
  isDefault: boolean;
  isPremium: boolean;
}

export interface AmbientParticle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  size: number;
  color: string;
  opacity: number;
  type: 'bubbles' | 'sparkles' | 'leaves';
}

export type AchievementCategory = 'progress' | 'skill' | 'social' | 'fun';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'special';
export type AchievementRequirementType =
  | 'total-catches'
  | 'session-time'
  | 'modes-played'
  | 'species-caught'
  | 'streak'
  | 'challenges'
  | 'perfect-catches'
  | 'time-of-day'
  | 'screenshots';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  tier: AchievementTier;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: AchievementRequirementType;
    target: number | string[];
  };
  reward: {
    points: number;
    badge?: string;
  };
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
}

// Boss Battle Types
export interface Boss {
  id: string;
  type: 'giant-fish' | 'speed-demon' | 'swarm-leader' | 'mega-cockroach';
  entity: Fish | Mouse | Butterfly | Cockroach;
  currentHP: number;
  maxHP: number;
  phase: 1 | 2 | 3;
  isEnraged: boolean;
  followers: (Fish | Butterfly)[];
  specialAbilityTimer: number;
  spawnTime: number;
  duration: number;
}

export interface BossBattle {
  isActive: boolean;
  currentBoss: Boss | null;
  catchCount: number;
  timeRemaining: number;
  difficulty: 'normal' | 'hard' | 'extreme';
}

export interface BossStats {
  fastestDefeat: number;
  totalDefeats: number;
  highestCombo: number;
  defeatsByType: Record<string, number>;
}

// Mini-Game Types
export type MiniGameType = 'whack-a-mole' | 'memory-match' | 'follow-leader' | 'bubble-pop' | 'speed-run';

export interface MiniGameState {
  type: MiniGameType;
  isActive: boolean;
  score: number;
  timeRemaining: number;
  highScore: number;
  difficulty: number;
  currentRound: number;
}

export interface WhackAMoleState extends MiniGameState {
  holes: { isVisible: boolean; position: Vector2D; entity: Fish | null; spawnTime: number }[];
  comboCount: number;
  lastHitTime: number;
}

export interface MemoryMatchState extends MiniGameState {
  cards: { id: string; preyType: string; isFlipped: boolean; isMatched: boolean }[];
  flippedCards: string[];
  moveCount: number;
}

export interface FollowLeaderState extends MiniGameState {
  checkpoints: { id: string; position: Vector2D; order: number; completed: boolean }[];
  currentCheckpoint: number;
  leaderFish: Fish | null;
  showPattern: boolean;
}

export interface BubblePopState extends MiniGameState {
  bubbles: { id: string; position: Vector2D; velocity: Vector2D; type: 'normal' | 'golden' | 'bomb'; size: number }[];
  comboMultiplier: number;
  lastPopTime: number;
}

export interface SpeedRunState extends MiniGameState {
  catchMultiplier: number;
  totalCatches: number;
}

export interface Dragonfly {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'dragonfly';
  state: 'hovering' | 'darting' | 'patrolling' | 'fleeing';
  stateTimer: number;
  hoverDuration: number;
  dartTarget: Vector2D | null;
  wingPhases: number[];
  patrolPath: Vector2D[];
  lifetime: number;
  maxLifetime: number;
}

export interface Bee {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'bee';
  state: 'collecting' | 'returning' | 'buzzing' | 'aggressive' | 'fleeing';
  stateTimer: number;
  targetFlower: Vector2D | null;
  buzzAmplitude: number;
  buzzFrequency: number;
  isAggressive: boolean;
  chargeTarget: Vector2D | null;
  pollenCount: number;
  wingPhase: number;
  lifetime: number;
  maxLifetime: number;
}

export interface Ant {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'ant';
  state: 'marching' | 'carrying' | 'searching' | 'following' | 'fleeing';
  stateTimer: number;
  trailPath: Vector2D[];
  pathIndex: number;
  groupId: string;
  leaderId: string | null;
  carryingFood: boolean;
  legPhase: number;
  lifetime: number;
  maxLifetime: number;
}

export interface Beetle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'beetle';
  state: 'walking' | 'flying' | 'landed' | 'upside-down' | 'fleeing';
  stateTimer: number;
  isFlying: boolean;
  shellOpen: number;
  wobblePhase: number;
  flipProgress: number;
  legPhase: number;
  lifetime: number;
  maxLifetime: number;
}

export interface Snail {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'snail';
  state: 'crawling' | 'hiding' | 'eating' | 'fleeing';
  stateTimer: number;
  bodyWavePhase: number;
  isHiding: boolean;
  hideProgress: number;
  eyeStalks: Vector2D[];
  slimeTrail: Vector2D[];
  lifetime: number;
  maxLifetime: number;
}

export interface Moth {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'moth';
  state: 'flying' | 'attracted' | 'circling' | 'resting' | 'fleeing';
  stateTimer: number;
  lightTarget: Vector2D | null;
  circleRadius: number;
  circleAngle: number;
  wingPhase: number;
  dustParticles: Vector2D[];
  isResting: boolean;
  lifetime: number;
  maxLifetime: number;
}

export interface Firefly {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'firefly';
  state: 'glowing' | 'dark' | 'floating' | 'flashing' | 'fleeing';
  stateTimer: number;
  glowIntensity: number;
  glowPhase: number;
  flashPattern: number[];
  flashIndex: number;
  floatAmplitude: number;
  lifetime: number;
  maxLifetime: number;
}

export interface Caterpillar {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'caterpillar';
  state: 'crawling' | 'munching' | 'curling' | 'stretching' | 'fleeing';
  stateTimer: number;
  segments: WormSegment[];
  segmentCount: number;
  stretchProgress: number;
  isCurled: boolean;
  curlProgress: number;
  munchPhase: number;
  lifetime: number;
  maxLifetime: number;
}

export interface Wasp {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'wasp';
  state: 'patrolling' | 'investigating' | 'attacking' | 'building' | 'fleeing';
  stateTimer: number;
  territory: { min: Vector2D; max: Vector2D };
  threatLevel: number;
  attackTarget: Vector2D | null;
  nestPosition: Vector2D;
  wingPhase: number;
  isAngry: boolean;
  lifetime: number;
  maxLifetime: number;
}

export interface Fly {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'fly';
  state: 'buzzing' | 'landing' | 'cleaning' | 'evading' | 'fleeing';
  stateTimer: number;
  directionChangeTimer: number;
  landingSurface: 'top' | 'bottom' | 'left' | 'right' | null;
  cleaningProgress: number;
  reactionSpeed: number;
  wingPhase: number;
  legPhase: number;
  lifetime: number;
  maxLifetime: number;
}

export type PreyType = 'fish' | 'mouse' | 'butterfly' | 'cockroach' | 'ladybug' | 'laser' | 'frog' | 'spider' | 'dragonfly' | 'bee' | 'ant' | 'beetle' | 'snail' | 'moth' | 'firefly' | 'caterpillar' | 'wasp' | 'fly';

export type EnvironmentId = 'ocean' | 'pond' | 'garden' | 'backyard' | 'jungle' | 'desert';

export interface CatProfile {
  id: string;
  name: string;
  photoUri?: string;
  photoUrl?: string;
  breed?: string;
  age?: number;
  weight?: number;
  weightUnit: 'lbs' | 'kg';
  birthday?: number;
  gender?: 'male' | 'female' | 'unknown';
  personalityTags: ('playful' | 'lazy' | 'curious' | 'aggressive' | 'shy' | 'social')[];
  stats: ProfileStats;
  preferences: ProfilePreferences;
  createdAt: number;
  lastPlayed: number;
  isActive: boolean;
}

export interface ProfileStats {
  totalPlaytime: number;
  totalCatches: number;
  catchesByPreyType: Record<PreyType, number>;
  favoritePreyType?: PreyType;
  favoriteEnvironment?: EnvironmentId;
  bossAttempts: number;
  bossDefeats: number;
  miniGamesPlayed: number;
  playStreak: number;
}

export interface ProfilePreferences {
  defaultEnvironment?: EnvironmentId;
  defaultGameMode: 'normal' | 'variety' | 'boss' | 'mini-game';
  difficulty: 'easy' | 'medium' | 'hard';
  soundVolume: number;
  vibrationIntensity: number;
  autoRotate: boolean;
}

export interface ProfilePhoto {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
}

export type CommunityChallengeType = 'daily' | 'weekly' | 'community' | 'special';
export type ChallengeCategory =
  | 'catch'
  | 'variety'
  | 'combo'
  | 'time'
  | 'environment'
  | 'boss'
  | 'mini-game'
  | 'streak'
  | 'leaderboard'
  | 'social';

export interface CommunityChallenge {
  id: string;
  type: CommunityChallengeType;
  category: ChallengeCategory;
  title: string;
  description: string;
  requirement: ChallengeRequirement;
  reward: ChallengeReward;
  startTime: number;
  endTime: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  isActive: boolean;
  isFeatured: boolean;
}

export interface ChallengeRequirement {
  type: 'count' | 'duration' | 'variety' | 'achievement';
  target: number;
  unit?: string;
  criteria?: Record<string, any>;
}

export interface ChallengeReward {
  xp: number;
  badges?: string[];
  premiumCurrency?: number;
  unlocks?: string[];
  leaderboardBoost?: number;
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
  completedAt?: number;
}

export interface PlayerLevel {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  title: string;
}

export type ShareContentType =
  | 'achievement'
  | 'high-score'
  | 'boss-victory'
  | 'profile'
  | 'streak'
  | 'mini-game';

export interface ShareContent {
  type: ShareContentType;
  title: string;
  message: string;
  imageUri?: string;
  url?: string;
  metadata: Record<string, any>;
}

export interface ShareOptions {
  includeImage: boolean;
  includeLink: boolean;
  saveToGallery: boolean;
  dialogTitle?: string;
}

export interface ShareResult {
  success: boolean;
  action?: 'shared' | 'dismissed' | 'saved';
  error?: string;
}

export type LeaderboardCategory =
  | 'boss-giant-fish'
  | 'boss-speed-demon'
  | 'boss-swarm-leader'
  | 'boss-mega-cockroach'
  | 'boss-total-defeats'
  | 'whack-a-mole'
  | 'memory-match'
  | 'follow-leader'
  | 'bubble-pop'
  | 'speed-run'
  | 'total-catches'
  | 'play-streak'
  | 'achievements'
  | 'playtime';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  catName: string;
  catPhotoUrl?: string;
  score: number;
  rank: number;
  timestamp: number;
  metadata?: {
    bossType?: string;
    difficulty?: string;
    gameMode?: string;
  };
}

export interface Leaderboard {
  category: LeaderboardCategory;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time';
  entries: LeaderboardEntry[];
  userEntry?: LeaderboardEntry;
  lastUpdated: number;
}

export interface UserLeaderboardStats {
  userId: string;
  totalCatches: number;
  bossDefeats: Record<string, number>;
  miniGameHighScores: Record<string, number>;
  playStreak: number;
  totalPlaytime: number;
  lastPlayed: number;
}

export interface ParticleEmitter {
  id: string;
  position: Vector2D;
  particles: EffectParticle[];
  emissionRate: number;
  lifetime: number;
  isActive: boolean;
  config: ParticleEmitterConfig;
}

export interface EffectParticle {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  color: string;
  size: number;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
  rotation: number;
  rotationSpeed: number;
}

export interface ParticleEmitterConfig {
  type: 'burst' | 'continuous' | 'trail';
  particleCount: number;
  particleSize: { min: number; max: number };
  particleLifetime: { min: number; max: number };
  velocity: { min: Vector2D; max: Vector2D };
  acceleration: Vector2D;
  colors: string[];
  fadeOut: boolean;
  shrink: boolean;
  rotate: boolean;
  blendMode: 'normal' | 'additive' | 'multiply';
}

export interface ScreenEffect {
  type: 'shake' | 'flash' | 'vignette' | 'blur' | 'color-grade';
  intensity: number;
  duration: number;
  remainingTime: number;
  params: Record<string, any>;
}

export interface VisualEffectConfig {
  particles: {
    maxParticles: number;
    poolSize: number;
    renderBatchSize: number;
  };
  screenEffects: {
    enableShake: boolean;
    enableFlash: boolean;
    enableBlur: boolean;
    maxActiveEffects: number;
  };
  performance: {
    particleQuality: 'low' | 'medium' | 'high';
    enableMotionBlur: boolean;
    enableBloom: boolean;
    enableShadows: boolean;
  };
}

export type PowerUpType =
  | 'double-points'
  | 'triple-points'
  | 'mega-multiplier'
  | 'freeze-time'
  | 'magnet'
  | 'rapid-fire'
  | 'ghost-mode'
  | 'chain-reaction'
  | 'golden-fish'
  | 'rainbow-butterfly'
  | 'crystal-beetle'
  | 'star-mouse'
  | 'gravity-shift'
  | 'speed-boost'
  | 'swarm-mode'
  | 'invisibility';

export type PowerUpRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type PowerUpCategory = 'multiplier' | 'ability' | 'rare-item' | 'modifier';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  category: PowerUpCategory;
  rarity: PowerUpRarity;
  position: Vector2D;
  velocity: Vector2D;
  lifetime: number;
  maxLifetime: number;
  bobPhase: number;
  glowIntensity: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  duration: number;
  remainingTime: number;
  multiplier?: number;
  startTime: number;
  chainReactionCount?: number;
}

export interface PowerUpInventory {
  slots: (PowerUpType | null)[];
  active: ActivePowerUp[];
}

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  description: string;
  duration: number;
  spawnChance: number;
  spawnInterval: number;
  rarity: PowerUpRarity;
  category: PowerUpCategory;
  icon: string;
  color: string;
  soundEffect: string;
}
