import type { BoidsConfig, FishSpecies, GameConfig, GameMode, GameModeConfig } from '../types';

export const DEFAULT_BOIDS_CONFIG: BoidsConfig = {
  separationDistance: 40,
  separationWeight: 1.5,
  alignmentDistance: 80,
  alignmentWeight: 1.0,
  cohesionDistance: 100,
  cohesionWeight: 1.0,
  edgeMargin: 100,
};

/**
 * SPECIES_PROPERTIES - Optimized for cat vision
 *
 * Colors use blue/yellow/green spectrum that cats see clearly.
 * Avoided: Red, orange, pink (cats see these as dull gray)
 *
 * Research: Cats have enhanced sensitivity to blue and yellow-green hues.
 * High contrast is more important than specific colors.
 */
export const SPECIES_PROPERTIES: Record<
  FishSpecies,
  {
    size: number;
    maxSpeed: number;
    maxForce: number;
    color: string;
  }
> = {
  // Bright yellow - high visibility for cats
  goldfish: { size: 40, maxSpeed: 100, color: '#FFD700', maxForce: 2 },

  // Electric blue - cats' favorite color (most visible)
  clownfish: { size: 35, maxSpeed: 120, color: '#0080FF', maxForce: 2.5 },

  // Golden yellow - warm, highly visible
  angelfish: { size: 50, maxSpeed: 80, color: '#FFD93D', maxForce: 1.5 },

  // Royal blue - deep, attractive to cats
  betta: { size: 45, maxSpeed: 90, color: '#4169E1', maxForce: 2 },

  // Bright cyan - blue-green spectrum, excellent visibility
  guppy: { size: 25, maxSpeed: 130, color: '#00BFFF', maxForce: 3 },

  // Turquoise - blue-green, neon-like
  'neon-tetra': { size: 20, maxSpeed: 140, color: '#00CED1', maxForce: 3.5 },

  // Lime green - yellow-green spectrum, high contrast
  koi: { size: 60, maxSpeed: 70, color: '#9ACD32', maxForce: 1.2 },

  // Chartreuse - bright yellow-green
  molly: { size: 30, maxSpeed: 110, color: '#7FFF00', maxForce: 2.8 },
};

export const CAT_PAW_MULTIPLIER = 1.5;

export const DEFAULT_GAME_CONFIG: Omit<GameConfig, 'width' | 'height'> = {
  fishCount: 30,
  targetFPS: 60,
  boids: DEFAULT_BOIDS_CONFIG,
  mode: 'free-swim',
};

export const LOCK_CONFIG = {
  cornerSize: 50,
  unlockTimeout: 3000,
  unlockSequence: [0, 1, 3, 2],
  showIndicators: true,
  autoLockOnStart: true,
};

export const GAME_MODE_CONFIGS: Record<GameMode, GameModeConfig> = {
  'free-swim': {},

  'hunt': {
    speedMultiplier: 1.5,
    boidsOverride: {
      separationDistance: 25,
      separationWeight: 2.0,
      alignmentDistance: 60,
      alignmentWeight: 0.8,
      cohesionDistance: 80,
      cohesionWeight: 0.8,
      edgeMargin: 100,
    },
  },

  'bubbles': {
    fishCount: 0,
    particleCount: 35,
    spawnRate: 0.1,
  },

  'frenzy': {
    fishCount: 60,
    boidsOverride: {
      separationDistance: 30,
      separationWeight: 1.2,
      alignmentDistance: 100,
      alignmentWeight: 1.5,
      cohesionDistance: 120,
      cohesionWeight: 1.5,
      edgeMargin: 80,
    },
  },

  'mouse': {
    fishCount: 0,
    mouseCount: 15,
    spawnRate: 0.05,
    particleCount: 10,
  },

  'laser': {
    fishCount: 0,
    mouseCount: 0,
    laserCount: 2,
    particleCount: 5,
  },

  'insect': {
    fishCount: 0,
    mouseCount: 0,
    insectCount: 8,
    insectMix: { butterfly: 0.5, fly: 0.5 },
    spawnRate: 0.03,
  },

  'variety': {
    fishCount: 15,
    mouseCount: 5,
    laserCount: 1,
    insectCount: 5,
    insectMix: { butterfly: 0.5, fly: 0.5 },
    ladybugCount: 10,
    butterflyCount: 8,
    cockroachCount: 8,
    wormCount: 6,
    particleCount: 20,
    spawnRate: 0.02,
  },
};

export const BUTTERFLY_CONFIG = {
  BASE_SPEED: 50,
  FLEE_SPEED_MULTIPLIER: 2.5,
  FLEE_DISTANCE: 150,
  HOVER_PROBABILITY: 0.003,
  HOVER_DURATION: 60,
  WING_FLAP_BASE_SPEED: 0.15,
  NOISE_SCALE: 40,
  BOUNDARY_MARGIN: 50,
  TURN_SPEED: 0.05,
  MIN_SIZE: 60,
  MAX_SIZE: 80,
  DEFAULT_LIFETIME: 30,
  COLORS: ['#00BFFF', '#FFD700', '#FF69B4', '#00FF00'],
};

export const COCKROACH_CONFIG = {
  BASE_SPEED: 80,
  MAX_SPEED: 200,
  DASH_SPEED: 300,
  DASH_PROBABILITY: 0.3,
  FREEZE_DURATION: 0.1,
  MIN_HIDE_DURATION: 2.0,
  MAX_HIDE_DURATION: 5.0,
  PANIC_THRESHOLD: 0.5,
  THREAT_DISTANCE_IMMEDIATE: 50,
  THREAT_DISTANCE_NEAR: 100,
  EDGE_SEEK_PROBABILITY: 0.4,
  MIN_SIZE: 30,
  MAX_SIZE: 40,
  COLORS: ['#3D2817', '#2C1810', '#4A3424'],
  SPAWN_FROM_EDGES: true,
};

export const WORM_CONFIG = {
  maxCount: 6,
  spawnInterval: 8000,
  segmentCount: { min: 8, max: 12 },
  wiggleSpeed: 40,
  stretchSpeed: 60,
  fleeSpeed: 100,
  waveAmplitude: 8,
  waveFrequency: 0.15,
  segmentDistance: 6,
  MIN_SIZE: 4,
  MAX_SIZE: 8,
  MIN_LENGTH: 60,
  MAX_LENGTH: 100,
  DEFAULT_LIFETIME: 40,
  COLORS: ['#E91E63', '#795548', '#F44336'],
  SPAWN_FROM_EDGES: true,
};

export const FROG_CONFIG = {
  maxCount: 4,
  spawnInterval: 12000,
  idleDuration: { min: 3000, max: 8000 },
  jumpSpeed: { horizontal: 300, vertical: 200 },
  gravity: 600,
  anticipationTime: 400,
  MIN_SIZE: 30,
  MAX_SIZE: 40,
  COLORS: ['#4CAF50', '#8D6E63', '#FF6B35'],
  DEFAULT_LIFETIME: 45,
};

export const SPIDER_CONFIG = {
  maxCount: 6,
  spawnInterval: 10000,
  climbSpeed: 50,
  retreatSpeed: 150,
  hangSpeed: 30,
  preferredCorners: true,
  MIN_SIZE: 18,
  MAX_SIZE: 28,
  COLORS: ['#212121', '#5D4037'],
  DEFAULT_LIFETIME: 50,
};

export const BIRD_CONFIG = {
  BASE_SPEED: 100,
  FLEE_SPEED: 200,
  MAX_COUNT: 6,
  SPAWN_INTERVAL: 8000,
  PERCH_DURATION_MIN: 2000,
  PERCH_DURATION_MAX: 5000,
  MIN_SIZE: 20,
  MAX_SIZE: 30,
  COLORS: ['#4A90E2', '#E24A4A', '#E2D74A', '#E2884A'],
  DEFAULT_LIFETIME: 40,
};

export const CRICKET_CONFIG = {
  CRAWL_SPEED: 30,
  JUMP_SPEED_HORIZONTAL: 200,
  JUMP_SPEED_VERTICAL: 150,
  GRAVITY: 500,
  MAX_COUNT: 8,
  SPAWN_INTERVAL: 6000,
  MIN_SIZE: 15,
  MAX_SIZE: 25,
  COLORS: ['#654321', '#567D46'],
  DEFAULT_LIFETIME: 35,
};

export const SESSION_CONFIG = {
  autoPauseDelay: 30,
  reengagementDelay: 5,
  meowVolume: 0.5,
  enableMeowAlert: true,
};

export const SESSION_DURATIONS = {
  short: 5 * 60,
  medium: 10 * 60,
  long: 15 * 60,
  extended: 30 * 60,
  endless: 0,
};

export const TIER_CONFIGS = {
  free: {
    maxProfiles: 1,
    availableSpecies: ['goldfish', 'clownfish', 'guppy', 'neon-tetra'] as FishSpecies[],
    availableEnvironments: ['ocean', 'pond'],
    availableGameModes: ['free-swim', 'hunt', 'bubbles', 'frenzy', 'mouse', 'laser', 'insect', 'variety'] as GameMode[],
    statsRetentionDays: 7,
    maxScreenshots: 10,
  },
  premium: {
    maxProfiles: 3,
    availableSpecies: ['goldfish', 'clownfish', 'angelfish', 'betta', 'guppy', 'neon-tetra', 'koi', 'molly'] as FishSpecies[],
    availableEnvironments: ['ocean', 'pond', 'coral-reef', 'deep-sea', 'river', 'lake', 'aquarium', 'koi-pond', 'tropical', 'arctic', 'sunset', 'midnight'],
    availableGameModes: ['free-swim', 'hunt', 'bubbles', 'frenzy', 'mouse', 'laser', 'insect', 'variety'] as GameMode[],
    statsRetentionDays: 'lifetime' as const,
    maxScreenshots: Infinity,
  },
  family: {
    maxProfiles: 6,
    availableSpecies: ['goldfish', 'clownfish', 'angelfish', 'betta', 'guppy', 'neon-tetra', 'koi', 'molly'] as FishSpecies[],
    availableEnvironments: ['ocean', 'pond', 'coral-reef', 'deep-sea', 'river', 'lake', 'aquarium', 'koi-pond', 'tropical', 'arctic', 'sunset', 'midnight'],
    availableGameModes: ['free-swim', 'hunt', 'bubbles', 'frenzy', 'mouse', 'laser', 'insect', 'variety'] as GameMode[],
    statsRetentionDays: 'lifetime' as const,
    maxScreenshots: Infinity,
    hasFamilyDashboard: true,
  },
};

export const BOSS_BATTLE_CONFIG = {
  weeklyRotation: true,
  duration: { min: 45000, max: 90000 },
  difficultyMultipliers: { normal: 1.0, hard: 1.5, extreme: 2.0 },
  enrageThreshold: 0.3,
  bossTypes: {
    'giant-fish': {
      maxHP: 5,
      size: { min: 80, max: 120 },
      followerCount: { min: 10, max: 15 },
      speedBoostThreshold: 0.6,
      speedBoostMultiplier: 1.5,
      duration: 75000,
    },
    'speed-demon': {
      maxHP: 3,
      size: 40,
      baseSpeed: 300,
      afterImageCount: 5,
      afterImageInterval: 100,
      duration: 52500,
    },
    'swarm-leader': {
      maxHP: 4,
      size: 50,
      followerCount: { min: 15, max: 20 },
      escapeSpeed: 250,
      duration: 60000,
    },
    'mega-cockroach': {
      maxHP: 6,
      size: 60,
      dashSpeed: 350,
      fakeDeathDuration: 2000,
      fakeDeathProbability: 0.3,
      duration: 90000,
    },
  },
};

export const MINI_GAME_CONFIG = {
  'whack-a-mole': {
    gridSize: 3,
    popDuration: 800,
    speedIncrement: 50,
    gameDuration: 60000,
    comboThreshold: 3,
    comboBonus: 50,
  },
  'memory-match': {
    gridSize: 4,
    pairCount: 8,
    timePenalty: 5,
    flipDuration: 300,
  },
  'follow-leader': {
    checkpoints: 5,
    roundCount: 5,
    patternDelay: 2000,
    checkpointRadius: 40,
    scorePerCheckpoint: 20,
  },
  'bubble-pop': {
    bubbleCount: 35,
    duration: 45000,
    comboWindow: 1000,
    normalScore: 5,
    goldenScore: 20,
    bombPenalty: 15,
    comboMultipliers: [1, 2, 3, 4],
  },
  'speed-run': {
    duration: 30000,
    multiplierIncrement: 5,
    multiplierBonus: 0.5,
  },
};

export const LEADERBOARD_CONFIG = {
  maxEntriesPerCategory: 100,
  refreshInterval: 60000,
  submitRateLimit: 10,
  cacheDuration: 300000,
  timeframes: ['daily', 'weekly', 'monthly', 'all-time'] as const,
  scoreValidation: {
    bossDefeatTime: { min: 5000, max: 180000 },
    whackAMole: { min: 0, max: 5000 },
    memoryMatch: { min: 8, max: 100 },
    followLeader: { min: 0, max: 1000 },
    bubblePop: { min: 0, max: 10000 },
    speedRun: { min: 0, max: 5000 },
    totalCatches: { min: 0, max: 1000000 },
    playStreak: { min: 0, max: 365 },
    achievements: { min: 0, max: 100 },
    playtime: { min: 0, max: 10000000 },
  },
};

export const SHARING_CONFIG = {
  imageSize: { width: 1080, height: 1920 },
  imageFormat: 'png' as const,
  imageQuality: 0.9,
  shareDialogTitle: 'Share with friends',
  appDownloadUrl: 'https://catapp.com/download',
  deepLinkBaseUrl: 'https://catapp.com/share',
  analytics: {
    trackShares: true,
    trackShareSuccess: true,
    trackShareDestination: false,
  },
  streakMilestones: [7, 14, 30, 50, 100, 365],
  templates: {
    achievement: {
      backgroundColor: ['#4A90E2', '#2E5C8A'],
      titleColor: '#FFFFFF',
      subtitleColor: '#E0E0E0',
    },
    highScore: {
      backgroundColor: ['#FF6B35', '#D84315'],
      titleColor: '#FFFFFF',
      subtitleColor: '#FFE0B2',
    },
    bossVictory: {
      backgroundColor: ['#9C27B0', '#6A1B9A'],
      titleColor: '#FFFFFF',
      subtitleColor: '#E1BEE7',
    },
    profile: {
      backgroundColor: ['#00BCD4', '#0097A7'],
      titleColor: '#FFFFFF',
      subtitleColor: '#B2EBF2',
    },
    streak: {
      backgroundColor: ['#FF9800', '#F57C00'],
      titleColor: '#FFFFFF',
      subtitleColor: '#FFE0B2',
    },
    miniGame: {
      backgroundColor: ['#4CAF50', '#388E3C'],
      titleColor: '#FFFFFF',
      subtitleColor: '#C8E6C9',
    },
  },
};

export const CHALLENGES_CONFIG = {
  dailyChallengeCount: 3,
  weeklyChallengeCount: 5,
  communityChallengeCount: 1,
  specialEventChallengeCount: 2,
  resetTimes: {
    daily: '09:00',
    weekly: 1,
  },
  notifications: {
    enabled: true,
    expiringWarning: 3600000,
  },
  xpCurve: {
    base: 100,
    exponent: 1.5,
  },
  levelTitles: {
    1: 'Kitten Keeper',
    6: 'Cat Companion',
    11: 'Feline Friend',
    21: 'Cat Whisperer',
    31: 'Master of Meows',
    51: 'Purrfect Player',
    76: 'Legendary Cat Lord',
    100: 'Supreme Feline Master',
  },
  rewardMultipliers: {
    beginner: 1.0,
    intermediate: 1.5,
    expert: 2.0,
  },
  progressUpdateThrottle: 5000,
};

export const PROFILE_CONFIG = {
  maxProfilesByTier: {
    free: 1,
    premium: 999,
    family: 999,
  },
  photo: {
    maxSize: 102400,
    dimensions: 512,
    quality: 0.8,
    format: 'jpeg' as const,
  },
  nameValidation: {
    minLength: 2,
    maxLength: 30,
    allowedChars: /^[a-zA-Z0-9\s\-']+$/,
  },
  breeds: [
    'Abyssinian',
    'American Shorthair',
    'Bengal',
    'British Shorthair',
    'Calico',
    'Maine Coon',
    'Persian',
    'Ragdoll',
    'Siamese',
    'Tabby',
    'Birman',
    'Burmese',
    'Exotic Shorthair',
    'Russian Blue',
    'Scottish Fold',
    'Sphynx',
    'Mixed Breed',
    'Other',
  ],
};

export const AUDIO_CONFIG = {
  masterVolume: 0.7,
  soundEffectsVolume: 0.8,
  ambientVolume: 0.3,
  hapticIntensity: 0.8,
  enableSounds: true,
  enableHaptics: true,
  soundPoolSize: 5,
  fadeTransitionDuration: 2000,
  respectSilentMode: true,
  preloadCriticalSounds: true,
  lazyLoadRemaining: true,
};

export const POWER_UP_CONFIG = {
  maxInventorySlots: 3,
  maxActivePowerUps: 5,
  spawnCheckInterval: 2000,
  orbLifetime: 10000,
  collectionRadius: 50,
  configs: {
    'double-points': {
      type: 'double-points' as const,
      name: 'Double Points',
      description: '2x points for 30 seconds',
      duration: 30000,
      spawnChance: 0.05,
      spawnInterval: 120000,
      rarity: 'common' as const,
      category: 'multiplier' as const,
      icon: 'assets/powerups/icons/double-points.png',
      color: '#FFD700',
      soundEffect: 'assets/sounds/powerups/double.mp3',
    },
    'triple-points': {
      type: 'triple-points' as const,
      name: 'Triple Points',
      description: '3x points for 15 seconds',
      duration: 15000,
      spawnChance: 0.02,
      spawnInterval: 180000,
      rarity: 'uncommon' as const,
      category: 'multiplier' as const,
      icon: 'assets/powerups/icons/triple-points.png',
      color: '#9C27B0',
      soundEffect: 'assets/sounds/powerups/triple.mp3',
    },
    'mega-multiplier': {
      type: 'mega-multiplier' as const,
      name: 'Mega Multiplier',
      description: '5x points for 10 seconds',
      duration: 10000,
      spawnChance: 0.01,
      spawnInterval: 300000,
      rarity: 'rare' as const,
      category: 'multiplier' as const,
      icon: 'assets/powerups/icons/mega-multiplier.png',
      color: '#FF6D00',
      soundEffect: 'assets/sounds/powerups/mega.mp3',
    },
    'freeze-time': {
      type: 'freeze-time' as const,
      name: 'Freeze Time',
      description: 'Slow all prey to 10% speed',
      duration: 5000,
      spawnChance: 0.03,
      spawnInterval: 180000,
      rarity: 'uncommon' as const,
      category: 'ability' as const,
      icon: 'assets/powerups/icons/freeze-time.png',
      color: '#00BCD4',
      soundEffect: 'assets/sounds/powerups/freeze.mp3',
    },
    'magnet': {
      type: 'magnet' as const,
      name: 'Magnet',
      description: 'Attract prey to touch position',
      duration: 20000,
      spawnChance: 0.04,
      spawnInterval: 120000,
      rarity: 'common' as const,
      category: 'ability' as const,
      icon: 'assets/powerups/icons/magnet.png',
      color: '#E91E63',
      soundEffect: 'assets/sounds/powerups/magnet.mp3',
    },
    'rapid-fire': {
      type: 'rapid-fire' as const,
      name: 'Rapid Fire',
      description: 'Massive tap radius for 15 seconds',
      duration: 15000,
      spawnChance: 0.03,
      spawnInterval: 150000,
      rarity: 'uncommon' as const,
      category: 'ability' as const,
      icon: 'assets/powerups/icons/rapid-fire.png',
      color: '#FF5722',
      soundEffect: 'assets/sounds/powerups/rapid.mp3',
    },
    'ghost-mode': {
      type: 'ghost-mode' as const,
      name: 'Ghost Mode',
      description: 'Prey cannot flee for 20 seconds',
      duration: 20000,
      spawnChance: 0.03,
      spawnInterval: 150000,
      rarity: 'common' as const,
      category: 'ability' as const,
      icon: 'assets/powerups/icons/ghost-mode.png',
      color: '#00E676',
      soundEffect: 'assets/sounds/powerups/ghost.mp3',
    },
    'chain-reaction': {
      type: 'chain-reaction' as const,
      name: 'Chain Reaction',
      description: 'Next 5 catches create stun shockwave',
      duration: 0,
      spawnChance: 0.02,
      spawnInterval: 200000,
      rarity: 'rare' as const,
      category: 'ability' as const,
      icon: 'assets/powerups/icons/chain-reaction.png',
      color: '#FFC107',
      soundEffect: 'assets/sounds/powerups/chain.mp3',
    },
    'golden-fish': {
      type: 'golden-fish' as const,
      name: 'Golden Fish',
      description: 'Worth 100 points',
      duration: 0,
      spawnChance: 0.01,
      spawnInterval: 120000,
      rarity: 'rare' as const,
      category: 'rare-item' as const,
      icon: 'assets/powerups/icons/golden-fish.png',
      color: '#FFD700',
      soundEffect: 'assets/sounds/powerups/golden.mp3',
    },
    'rainbow-butterfly': {
      type: 'rainbow-butterfly' as const,
      name: 'Rainbow Butterfly',
      description: 'Worth 150 points',
      duration: 0,
      spawnChance: 0.005,
      spawnInterval: 180000,
      rarity: 'rare' as const,
      category: 'rare-item' as const,
      icon: 'assets/powerups/icons/rainbow-butterfly.png',
      color: '#FF00FF',
      soundEffect: 'assets/sounds/powerups/rainbow.mp3',
    },
    'crystal-beetle': {
      type: 'crystal-beetle' as const,
      name: 'Crystal Beetle',
      description: 'Worth 200 points, cannot flee',
      duration: 0,
      spawnChance: 0.005,
      spawnInterval: 180000,
      rarity: 'rare' as const,
      category: 'rare-item' as const,
      icon: 'assets/powerups/icons/crystal-beetle.png',
      color: '#E0F7FA',
      soundEffect: 'assets/sounds/powerups/crystal.mp3',
    },
    'star-mouse': {
      type: 'star-mouse' as const,
      name: 'Star Mouse',
      description: 'Worth 250 points + random power-up',
      duration: 0,
      spawnChance: 0.003,
      spawnInterval: 300000,
      rarity: 'legendary' as const,
      category: 'rare-item' as const,
      icon: 'assets/powerups/icons/star-mouse.png',
      color: '#FFF59D',
      soundEffect: 'assets/sounds/powerups/star.mp3',
    },
    'gravity-shift': {
      type: 'gravity-shift' as const,
      name: 'Gravity Shift',
      description: 'Reverse gravity for 30 seconds',
      duration: 30000,
      spawnChance: 0.02,
      spawnInterval: 180000,
      rarity: 'uncommon' as const,
      category: 'modifier' as const,
      icon: 'assets/powerups/icons/gravity-shift.png',
      color: '#9C27B0',
      soundEffect: 'assets/sounds/powerups/gravity.mp3',
    },
    'speed-boost': {
      type: 'speed-boost' as const,
      name: 'Speed Boost',
      description: 'All prey move 2x faster',
      duration: 25000,
      spawnChance: 0.03,
      spawnInterval: 150000,
      rarity: 'uncommon' as const,
      category: 'modifier' as const,
      icon: 'assets/powerups/icons/speed-boost.png',
      color: '#FF9800',
      soundEffect: 'assets/sounds/powerups/speed.mp3',
    },
    'swarm-mode': {
      type: 'swarm-mode' as const,
      name: 'Swarm Mode',
      description: 'Double prey spawn rate',
      duration: 20000,
      spawnChance: 0.03,
      spawnInterval: 150000,
      rarity: 'common' as const,
      category: 'modifier' as const,
      icon: 'assets/powerups/icons/swarm-mode.png',
      color: '#4CAF50',
      soundEffect: 'assets/sounds/powerups/swarm.mp3',
    },
    'invisibility': {
      type: 'invisibility' as const,
      name: 'Invisibility',
      description: 'Some prey randomly invisible',
      duration: 15000,
      spawnChance: 0.02,
      spawnInterval: 180000,
      rarity: 'uncommon' as const,
      category: 'modifier' as const,
      icon: 'assets/powerups/icons/invisibility.png',
      color: '#3F51B5',
      soundEffect: 'assets/sounds/powerups/invisible.mp3',
    },
  },
};

export const VISUAL_EFFECTS_CONFIG = {
  particles: {
    maxParticles: 500,
    poolSize: 1000,
    renderBatchSize: 100,
  },
  screenEffects: {
    enableShake: true,
    enableFlash: true,
    enableBlur: true,
    maxActiveEffects: 5,
  },
  performance: {
    particleQuality: 'high' as const,
    enableMotionBlur: true,
    enableBloom: true,
    enableShadows: true,
  },
  adaptiveQuality: {
    enabled: true,
    targetFPS: 60,
    lowFPSThreshold: 50,
    criticalFPSThreshold: 40,
    adjustmentCooldown: 3000,
  },
  effectIntensities: {
    catchBurst: 1.0,
    comboBurst: 1.2,
    powerUpActivation: 1.5,
    screenShake: 1.0,
    screenFlash: 0.8,
  },
  accessibility: {
    reducedMotion: false,
    reduceParticles: false,
    disableScreenEffects: false,
    disableFlashes: false,
  },
};

export const SEASONAL_CONFIG = {
  enabled: true,
  checkInterval: 3600000,
  testMode: false,
  activeEvent: null as string | null,
  autoPreloadAssets: true,
  preloadDaysBeforeEvent: 3,
  notifyUpcomingEvents: true,
  notifyEventStart: true,
  notifyEventEnd: true,
};

export const GAME_CONFIG = {
  ...DEFAULT_GAME_CONFIG,
  SHARING_CONFIG,
  CHALLENGES_CONFIG,
  PROFILE_CONFIG,
  AUDIO_CONFIG,
  POWER_UP_CONFIG,
  VISUAL_EFFECTS_CONFIG,
  SEASONAL_CONFIG,
};
