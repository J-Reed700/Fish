import { PowerUpType, ParticleEmitterConfig } from '../../types';
import {
  createGoldenTrailEmitter,
  createRainbowTrailEmitter,
  createFireTrailEmitter,
  createIceTrailEmitter,
  createMagicTrailEmitter,
  createElectricTrailEmitter,
} from '../emitters/TrailEmitter';

export interface PowerUpEffectPreset {
  trail?: ParticleEmitterConfig;
  aura?: { color: string; intensity: number; pulseSpeed: number };
  screenEffect?: { type: string; params: Record<string, any> };
  statusIcon?: string;
}

export const POWER_UP_EFFECT_PRESETS: Record<PowerUpType, PowerUpEffectPreset> = {
  'double-points': {
    aura: { color: '#FFD700', intensity: 0.6, pulseSpeed: 2 },
    trail: createGoldenTrailEmitter(),
    statusIcon: '2x',
  },
  'triple-points': {
    aura: { color: '#FFA500', intensity: 0.7, pulseSpeed: 2.5 },
    trail: createGoldenTrailEmitter(),
    statusIcon: '3x',
  },
  'mega-multiplier': {
    aura: { color: '#FF1744', intensity: 0.9, pulseSpeed: 3 },
    trail: createRainbowTrailEmitter(),
    statusIcon: '10x',
  },
  'freeze-time': {
    aura: { color: '#4FC3F7', intensity: 0.7, pulseSpeed: 1 },
    trail: createIceTrailEmitter(),
    screenEffect: {
      type: 'color-grade',
      params: { filter: 'cool', intensity: 0.5 },
    },
    statusIcon: '❄️',
  },
  magnet: {
    aura: { color: '#FF4081', intensity: 0.8, pulseSpeed: 2 },
    trail: createMagicTrailEmitter(),
    statusIcon: '🧲',
  },
  'rapid-fire': {
    aura: { color: '#FF5722', intensity: 0.8, pulseSpeed: 3 },
    trail: createFireTrailEmitter(),
    statusIcon: '⚡',
  },
  'ghost-mode': {
    aura: { color: '#E1F5FE', intensity: 0.5, pulseSpeed: 1.5 },
    screenEffect: {
      type: 'vignette',
      params: { intensity: 0.2, color: '#E1F5FE' },
    },
    statusIcon: '👻',
  },
  'chain-reaction': {
    aura: { color: '#00E5FF', intensity: 0.9, pulseSpeed: 2.5 },
    trail: createElectricTrailEmitter(),
    statusIcon: '⚡',
  },
  'golden-fish': {
    aura: { color: '#FFD700', intensity: 1, pulseSpeed: 2 },
    trail: createGoldenTrailEmitter(),
    statusIcon: '🐟',
  },
  'rainbow-butterfly': {
    aura: { color: '#E040FB', intensity: 0.9, pulseSpeed: 2 },
    trail: createRainbowTrailEmitter(),
    statusIcon: '🦋',
  },
  'crystal-beetle': {
    aura: { color: '#4FC3F7', intensity: 0.8, pulseSpeed: 1.5 },
    trail: createIceTrailEmitter(),
    statusIcon: '💎',
  },
  'star-mouse': {
    aura: { color: '#FFD700', intensity: 0.9, pulseSpeed: 2.5 },
    trail: createGoldenTrailEmitter(),
    statusIcon: '⭐',
  },
  'gravity-shift': {
    aura: { color: '#9C27B0', intensity: 0.7, pulseSpeed: 2 },
    trail: createMagicTrailEmitter(),
    screenEffect: {
      type: 'distortion',
      params: { type: 'portal', intensity: 0.3 },
    },
    statusIcon: '🌀',
  },
  'speed-boost': {
    aura: { color: '#00E5FF', intensity: 0.8, pulseSpeed: 3 },
    trail: createElectricTrailEmitter(),
    screenEffect: {
      type: 'motion-blur',
      params: { intensity: 0.5 },
    },
    statusIcon: '💨',
  },
  'swarm-mode': {
    aura: { color: '#8BC34A', intensity: 0.7, pulseSpeed: 2 },
    statusIcon: '🐝',
  },
  invisibility: {
    aura: { color: '#E1F5FE', intensity: 0.3, pulseSpeed: 1 },
    screenEffect: {
      type: 'vignette',
      params: { intensity: 0.3, color: '#E1F5FE' },
    },
    statusIcon: '🌫️',
  },
};

export const getPowerUpEffect = (
  powerUpType: PowerUpType
): PowerUpEffectPreset => {
  return (
    POWER_UP_EFFECT_PRESETS[powerUpType] || {
      aura: { color: '#FFFFFF', intensity: 0.5, pulseSpeed: 1.5 },
    }
  );
};

export const getPowerUpActivationEffect = (powerUpType: PowerUpType) => {
  return {
    flash: {
      color: POWER_UP_EFFECT_PRESETS[powerUpType]?.aura?.color || '#FFFFFF',
      intensity: 0.4,
      duration: 0.3,
    },
    shake: {
      intensity: 8,
      duration: 0.2,
    },
    particles: {
      type: 'burst' as const,
      particleCount: 40,
      particleSize: { min: 4, max: 10 },
      particleLifetime: { min: 0.5, max: 1 },
      velocity: {
        min: { x: -200, y: -200 },
        max: { x: 200, y: 200 },
      },
      acceleration: { x: 0, y: 100 },
      colors: [
        POWER_UP_EFFECT_PRESETS[powerUpType]?.aura?.color || '#FFFFFF',
        '#FFFFFF',
      ],
      fadeOut: true,
      shrink: true,
      rotate: true,
      blendMode: 'additive' as const,
    },
  };
};
