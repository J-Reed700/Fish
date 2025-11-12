import { ParticleEmitterConfig, PreyType } from '../../types';
import {
  createCatchBurstEmitter,
  createSplashEmitter,
} from '../emitters/BurstEmitter';

export interface CatchEffectPreset {
  particles: ParticleEmitterConfig;
  screenShake?: { intensity: number; duration: number };
  flash?: { color: string; intensity: number; duration: number };
  sound?: string;
}

export const CATCH_EFFECT_PRESETS: Record<PreyType, CatchEffectPreset> = {
  fish: {
    particles: createSplashEmitter({ x: 0, y: 0 }),
    screenShake: { intensity: 5, duration: 0.1 },
    flash: { color: '#4FC3F7', intensity: 0.2, duration: 0.15 },
    sound: 'splash',
  },
  mouse: {
    particles: createCatchBurstEmitter('#8D6E63'),
    screenShake: { intensity: 8, duration: 0.15 },
    flash: { color: '#FFEB3B', intensity: 0.3, duration: 0.2 },
    sound: 'squeak',
  },
  butterfly: {
    particles: createCatchBurstEmitter('#E1BEE7'),
    screenShake: { intensity: 3, duration: 0.1 },
    flash: { color: '#CE93D8', intensity: 0.25, duration: 0.2 },
    sound: 'flutter',
  },
  cockroach: {
    particles: createCatchBurstEmitter('#5D4037'),
    screenShake: { intensity: 6, duration: 0.12 },
    flash: { color: '#8D6E63', intensity: 0.2, duration: 0.15 },
    sound: 'crunch',
  },
  ladybug: {
    particles: createCatchBurstEmitter('#F44336'),
    screenShake: { intensity: 4, duration: 0.1 },
    flash: { color: '#EF5350', intensity: 0.2, duration: 0.15 },
    sound: 'pop',
  },
  laser: {
    particles: {
      type: 'burst',
      particleCount: 20,
      particleSize: { min: 2, max: 5 },
      particleLifetime: { min: 0.3, max: 0.6 },
      velocity: {
        min: { x: -150, y: -150 },
        max: { x: 150, y: 150 },
      },
      acceleration: { x: 0, y: 0 },
      colors: ['#FF0000', '#FF6B6B', '#FFFFFF'],
      fadeOut: true,
      shrink: true,
      rotate: false,
      blendMode: 'additive',
    },
    screenShake: { intensity: 2, duration: 0.08 },
    flash: { color: '#FF0000', intensity: 0.3, duration: 0.1 },
    sound: 'laser',
  },
  frog: {
    particles: createSplashEmitter({ x: 0, y: 0 }),
    screenShake: { intensity: 10, duration: 0.2 },
    flash: { color: '#66BB6A', intensity: 0.25, duration: 0.2 },
    sound: 'ribbit',
  },
  spider: {
    particles: createCatchBurstEmitter('#424242'),
    screenShake: { intensity: 5, duration: 0.12 },
    flash: { color: '#616161', intensity: 0.2, duration: 0.15 },
    sound: 'web',
  },
};

export const getCatchEffect = (preyType: PreyType): CatchEffectPreset => {
  return CATCH_EFFECT_PRESETS[preyType] || CATCH_EFFECT_PRESETS.fish;
};

export const getComboMultiplierEffect = (
  comboLevel: number
): { color: string; intensity: number } => {
  if (comboLevel >= 10) {
    return { color: '#00E5FF', intensity: 0.5 };
  } else if (comboLevel >= 5) {
    return { color: '#FF4081', intensity: 0.4 };
  } else if (comboLevel >= 3) {
    return { color: '#FFD700', intensity: 0.3 };
  }
  return { color: '#FFFFFF', intensity: 0.2 };
};

export const getRarityEffect = (
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
): { color: string; glowIntensity: number; particleCount: number } => {
  switch (rarity) {
    case 'legendary':
      return { color: '#FF4081', glowIntensity: 1.2, particleCount: 50 };
    case 'rare':
      return { color: '#9C27B0', glowIntensity: 0.9, particleCount: 35 };
    case 'uncommon':
      return { color: '#2196F3', glowIntensity: 0.6, particleCount: 25 };
    case 'common':
    default:
      return { color: '#FFFFFF', glowIntensity: 0.3, particleCount: 15 };
  }
};
