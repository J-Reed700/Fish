export type EnvironmentId = 'ocean' | 'garden' | 'koi-pond' | 'night-sky' | 'kitchen' | 'coral-reef' | 'arctic' | 'jungle' | 'desert' | 'space' | 'cave' | 'savanna';

export type PhysicsModifierType = 'waterCurrent' | 'windForce' | 'gravity' | 'drift' | 'turbulence' | 'humidAir' | 'strongWind' | 'zeroGravity' | 'drippingWater' | 'savannaWind';
export type ParticleEffectType = 'bubbles' | 'flowers' | 'leaves' | 'stars' | 'sand' | 'sparkles' | 'fireflies' | 'koi' | 'cherry-blossoms' | 'dragonflies' | 'moths' | 'shooting-stars' | 'bats' | 'crumbs' | 'steam' | 'dust' | 'coral-fish' | 'plankton' | 'jellyfish' | 'snowflakes' | 'ice-crystals' | 'penguins' | 'seals' | 'parrots' | 'rain-drops' | 'sand-grains' | 'tumbleweeds' | 'vultures' | 'scorpions' | 'lizards' | 'comets' | 'space-debris' | 'alien-creatures' | 'energy-orbs' | 'cave-bats' | 'glowworms' | 'water-droplets' | 'cave-crickets' | 'crystals' | 'zebras' | 'gazelles' | 'lions' | 'tropical-butterflies';
export type WeatherType = 'clear' | 'rain' | 'snow' | 'fog' | 'storm';

export interface BackgroundLayer {
  type: 'gradient' | 'solid' | 'pattern';
  colors: string[];
  positions?: number[];
  opacity?: number;
  parallaxFactor?: number;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
}

export interface ParticleConfig {
  type: ParticleEffectType;
  density: number;
  minSize: number;
  maxSize: number;
  minSpeed: number;
  maxSpeed: number;
  color: string;
  opacity: number;
  lifetime?: number;
  acceleration?: { x: number; y: number };
  rotation?: boolean;
  spawnRate?: number;
  maxCount?: number;
}

export interface DecorationConfig {
  type: 'plant' | 'rock' | 'coral' | 'tree' | 'cloud';
  asset: string;
  count: number;
  minScale: number;
  maxScale: number;
  depth: number;
  animated?: boolean;
  positions?: Array<{ x: number; y: number }>;
}

export interface PhysicsModifier {
  type: PhysicsModifierType;
  strength: number;
  direction?: { x: number; y: number };
  frequency?: number;
  scale?: number;
  affectsFish: boolean;
  affectsParticles: boolean;
  turbulence?: number;
  noiseScale?: number;
  timeScale?: number;
}

export interface WeatherEffect {
  type: WeatherType;
  intensity: number;
  particleConfig?: ParticleConfig;
  visibilityModifier?: number;
  colorTint?: string;
  duration?: number;
}

export interface TimeOfDay {
  hour: number;
  sunPosition: { x: number; y: number };
  ambientLight: number;
  colorTemperature: number;
  shadowIntensity: number;
}

export interface Environment {
  id: EnvironmentId;
  name: string;
  description: string;
  unlockRequirement: {
    fishCount?: number;
    achievementId?: string;
    environmentsCompleted?: number;
  };

  backgroundLayers: BackgroundLayer[];

  particles: ParticleConfig[];

  decorations?: DecorationConfig[];

  physicsModifiers: PhysicsModifier[];

  lighting: {
    ambient: number;
    colorTemperature: number;
    shadows: boolean;
    shadowIntensity?: number;
  };

  weather?: WeatherEffect;

  timeOfDay?: TimeOfDay;

  audio?: {
    ambient?: string;
    volume?: number;
    loop?: boolean;
  };

  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    particle: string;
  };

  fishBehavior?: {
    speedMultiplier?: number;
    separationMultiplier?: number;
    alignmentMultiplier?: number;
    cohesionMultiplier?: number;
    maxForceMultiplier?: number;
  };

  performance: {
    maxParticles: number;
    particleUpdateRate: number;
    renderQuality: 'low' | 'medium' | 'high';
    enableShadows: boolean;
    enableReflections: boolean;
  };
}

export interface EnvironmentState {
  currentEnvironment: EnvironmentId;
  unlockedEnvironments: EnvironmentId[];
  timeInEnvironment: number;
  weatherActive: boolean;
  currentWeather?: WeatherType;
  dayNightCycle: boolean;
  currentTime?: number;
  customSettings?: {
    particleDensity?: number;
    physicsIntensity?: number;
    audioVolume?: number;
  };
}

export interface ParticleInstance {
  id: string;
  type: ParticleEffectType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  lifetime: number;
  age: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface PhysicsForce {
  force: Vector2D;
  type: PhysicsModifierType;
  priority: number;
}

export interface EnvironmentAssets {
  images: Map<string, any>;
  sounds: Map<string, any>;
  loaded: boolean;
}
