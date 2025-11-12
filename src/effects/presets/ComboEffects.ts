import { ParticleEmitterConfig } from '../../types';

export interface ComboEffect {
  threshold: number;
  particles: ParticleEmitterConfig;
  screenShake?: { intensity: number; duration: number };
  flash?: { color: string; intensity: number; duration: number };
  text: string;
  sound?: string;
}

export const COMBO_EFFECTS: Record<number, ComboEffect> = {
  3: {
    threshold: 3,
    text: '3X COMBO!',
    particles: {
      type: 'burst',
      particleCount: 30,
      particleSize: { min: 3, max: 8 },
      particleLifetime: { min: 0.4, max: 0.8 },
      velocity: {
        min: { x: -200, y: -200 },
        max: { x: 200, y: 200 },
      },
      acceleration: { x: 0, y: 100 },
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
      fadeOut: true,
      shrink: true,
      rotate: true,
      blendMode: 'additive',
    },
    screenShake: { intensity: 8, duration: 0.2 },
    flash: { color: '#FFD700', intensity: 0.3, duration: 0.15 },
    sound: 'combo3',
  },
  5: {
    threshold: 5,
    text: '5X COMBO!!',
    particles: {
      type: 'burst',
      particleCount: 40,
      particleSize: { min: 4, max: 10 },
      particleLifetime: { min: 0.5, max: 0.9 },
      velocity: {
        min: { x: -250, y: -250 },
        max: { x: 250, y: 250 },
      },
      acceleration: { x: 0, y: 100 },
      colors: [
        '#FF0080',
        '#FF4081',
        '#FF80AB',
        '#FFB300',
        '#FFC107',
        '#FFEB3B',
      ],
      fadeOut: true,
      shrink: true,
      rotate: true,
      blendMode: 'additive',
    },
    screenShake: { intensity: 12, duration: 0.25 },
    flash: { color: '#FF4081', intensity: 0.4, duration: 0.2 },
    sound: 'combo5',
  },
  10: {
    threshold: 10,
    text: '10X MEGA COMBO!!!',
    particles: {
      type: 'burst',
      particleCount: 50,
      particleSize: { min: 5, max: 12 },
      particleLifetime: { min: 0.6, max: 1.0 },
      velocity: {
        min: { x: -300, y: -300 },
        max: { x: 300, y: 300 },
      },
      acceleration: { x: 0, y: 150 },
      colors: ['#00E5FF', '#00B8D4', '#0091EA', '#FFFFFF'],
      fadeOut: true,
      shrink: true,
      rotate: true,
      blendMode: 'additive',
    },
    screenShake: { intensity: 15, duration: 0.3 },
    flash: { color: '#00E5FF', intensity: 0.5, duration: 0.25 },
    sound: 'combo10',
  },
};

export const getComboEffect = (comboLevel: number): ComboEffect | null => {
  if (comboLevel >= 10) return COMBO_EFFECTS[10];
  if (comboLevel >= 5) return COMBO_EFFECTS[5];
  if (comboLevel >= 3) return COMBO_EFFECTS[3];
  return null;
};

export const shouldTriggerComboEffect = (comboLevel: number): boolean => {
  return comboLevel === 3 || comboLevel === 5 || comboLevel === 10 || (comboLevel > 10 && comboLevel % 5 === 0);
};

export const getComboColor = (comboLevel: number): string => {
  if (comboLevel >= 10) return '#00E5FF';
  if (comboLevel >= 5) return '#FF4081';
  if (comboLevel >= 3) return '#FFD700';
  return '#FFFFFF';
};

export const getComboIntensity = (comboLevel: number): number => {
  if (comboLevel >= 10) return 1.5;
  if (comboLevel >= 5) return 1.2;
  if (comboLevel >= 3) return 1.0;
  return 0.8;
};

export const createComboRingEmitter = (comboLevel: number): ParticleEmitterConfig => {
  const colors = getComboColor(comboLevel);
  const particleCount = Math.min(20 + comboLevel * 2, 60);

  return {
    type: 'burst',
    particleCount,
    particleSize: { min: 2, max: 6 },
    particleLifetime: { min: 0.5, max: 1.0 },
    velocity: {
      min: { x: -150, y: -150 },
      max: { x: 150, y: 150 },
    },
    acceleration: { x: 0, y: 0 },
    colors: [colors],
    fadeOut: true,
    shrink: false,
    rotate: false,
    blendMode: 'additive',
  };
};
