import { ParticleEmitterConfig, Vector2D } from '../../types';

export function createTrailEmitter(
  colors: string[] = ['#FFFFFF'],
  particleLifetime: number = 0.5,
  size: { min: number; max: number } = { min: 3, max: 6 },
  emissionRate: number = 20
): ParticleEmitterConfig {
  return {
    type: 'trail',
    particleCount: emissionRate,
    particleSize: size,
    particleLifetime: { min: particleLifetime * 0.8, max: particleLifetime * 1.2 },
    velocity: {
      min: { x: -10, y: -10 },
      max: { x: 10, y: 10 },
    },
    acceleration: { x: 0, y: 0 },
    colors,
    fadeOut: true,
    shrink: true,
    rotate: false,
    blendMode: 'additive',
  };
}

export function createSpeedTrailEmitter(): ParticleEmitterConfig {
  return createTrailEmitter(
    ['#00E5FF', '#00B8D4', '#0091EA'],
    0.4,
    { min: 2, max: 5 },
    30
  );
}

export function createFireTrailEmitter(): ParticleEmitterConfig {
  return createTrailEmitter(
    ['#FF5722', '#FF9800', '#FFC107', '#FFEB3B'],
    0.6,
    { min: 4, max: 8 },
    25
  );
}

export function createIceTrailEmitter(): ParticleEmitterConfig {
  return createTrailEmitter(
    ['#B3E5FC', '#81D4FA', '#4FC3F7', '#FFFFFF'],
    0.8,
    { min: 3, max: 7 },
    20
  );
}

export function createMagicTrailEmitter(): ParticleEmitterConfig {
  return createTrailEmitter(
    ['#E040FB', '#CE93D8', '#BA68C8', '#9C27B0'],
    0.7,
    { min: 3, max: 6 },
    22
  );
}

export function createGoldenTrailEmitter(): ParticleEmitterConfig {
  return createTrailEmitter(
    ['#FFD700', '#FFC107', '#FFB300', '#FFECB3'],
    0.5,
    { min: 4, max: 7 },
    28
  );
}

export function createRainbowTrailEmitter(): ParticleEmitterConfig {
  return createTrailEmitter(
    [
      '#FF0080',
      '#FF4081',
      '#E040FB',
      '#7C4DFF',
      '#2979FF',
      '#00E5FF',
      '#1DE9B6',
      '#76FF03',
      '#FFEA00',
      '#FF9100',
    ],
    0.6,
    { min: 3, max: 6 },
    35
  );
}

export function createSmokeTrailEmitter(): ParticleEmitterConfig {
  return {
    type: 'trail',
    particleCount: 15,
    particleSize: { min: 5, max: 10 },
    particleLifetime: { min: 0.8, max: 1.2 },
    velocity: {
      min: { x: -20, y: -20 },
      max: { x: 20, y: -40 },
    },
    acceleration: { x: 0, y: -30 },
    colors: ['#757575', '#9E9E9E', '#BDBDBD'],
    fadeOut: true,
    shrink: false,
    rotate: true,
    blendMode: 'normal',
  };
}

export function createElectricTrailEmitter(): ParticleEmitterConfig {
  return {
    type: 'trail',
    particleCount: 40,
    particleSize: { min: 2, max: 4 },
    particleLifetime: { min: 0.2, max: 0.4 },
    velocity: {
      min: { x: -30, y: -30 },
      max: { x: 30, y: 30 },
    },
    acceleration: { x: 0, y: 0 },
    colors: ['#00E5FF', '#FFFFFF', '#B3E5FC'],
    fadeOut: true,
    shrink: true,
    rotate: false,
    blendMode: 'additive',
  };
}
