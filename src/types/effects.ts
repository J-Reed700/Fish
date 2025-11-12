export interface Vector2D {
  x: number;
  y: number;
}

export interface Particle {
  id: number;
  position: Vector2D;
  velocity: Vector2D;
  color: string;
  size: number;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
  rotation: number;
  rotationSpeed: number;
  isActive: boolean;
}

export interface ParticleConfig {
  particleCount: number;
  particleSize: { min: number; max: number };
  particleLifetime: { min: number; max: number };
  velocity: { min: Vector2D; max: Vector2D };
  colors: string[];
  fadeOut: boolean;
  gravity?: number;
  friction?: number;
}

export interface ParticleEmitter {
  id: string;
  position: Vector2D;
  particles: Particle[];
  lifetime: number;
  maxLifetime: number;
  isActive: boolean;
  config: ParticleConfig;
  emissionRate?: number;
  lastEmissionTime?: number;
}

export type ScreenEffectType = 'shake' | 'flash' | 'vignette' | 'slow-motion';

export interface ScreenEffect {
  type: ScreenEffectType;
  intensity: number;
  duration: number;
  remainingTime: number;
  startTime: number;
}

export interface EffectQuality {
  maxParticles: number;
  particleSize: number;
  enableShadows: boolean;
  enableTrails: boolean;
}

export type QualityLevel = 'low' | 'medium' | 'high';

export interface PerformanceMetrics {
  fps: number;
  activeParticles: number;
  activeEmitters: number;
  frameTime: number;
  quality: QualityLevel;
}

export interface CatchEffectConfig {
  particleCount: number;
  colors: string[];
  size: number;
  intensity: number;
}

export interface ComboEffectConfig {
  threshold: number;
  particleCount: number;
  colors: string[];
  text: string;
  screenShake?: number;
  flash?: boolean;
}

export interface PowerUpEffectConfig {
  trailColors: string[];
  particleSize: number;
  emissionRate: number;
}

export interface ShadowConfig {
  alpha: number;
  offsetX: number;
  offsetY: number;
  blur: number;
}
