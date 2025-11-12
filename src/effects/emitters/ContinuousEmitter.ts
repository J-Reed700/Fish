import { ParticleEmitterConfig } from '../../types';

export function createContinuousEmitter(
  emissionRate: number = 30,
  colors: string[] = ['#FFFFFF'],
  velocity: { min: { x: number; y: number }; max: { x: number; y: number } },
  size: { min: number; max: number } = { min: 2, max: 5 },
  lifetime: { min: number; max: number } = { min: 1, max: 2 }
): ParticleEmitterConfig {
  return {
    type: 'continuous',
    particleCount: emissionRate,
    particleSize: size,
    particleLifetime: lifetime,
    velocity,
    acceleration: { x: 0, y: 0 },
    colors,
    fadeOut: true,
    shrink: false,
    rotate: false,
    blendMode: 'normal',
  };
}

export function createRainEmitter(): ParticleEmitterConfig {
  return {
    type: 'continuous',
    particleCount: 100,
    particleSize: { min: 1, max: 2 },
    particleLifetime: { min: 1, max: 2 },
    velocity: {
      min: { x: -20, y: 400 },
      max: { x: 20, y: 600 },
    },
    acceleration: { x: 0, y: 200 },
    colors: ['#B3E5FC', '#81D4FA', '#4FC3F7'],
    fadeOut: true,
    shrink: false,
    rotate: false,
    blendMode: 'normal',
  };
}

export function createSnowEmitter(): ParticleEmitterConfig {
  return {
    type: 'continuous',
    particleCount: 80,
    particleSize: { min: 2, max: 5 },
    particleLifetime: { min: 3, max: 5 },
    velocity: {
      min: { x: -30, y: 50 },
      max: { x: 30, y: 100 },
    },
    acceleration: { x: 0, y: 20 },
    colors: ['#FFFFFF', '#F5F5F5', '#E8E8E8'],
    fadeOut: true,
    shrink: false,
    rotate: true,
    blendMode: 'normal',
  };
}

export function createBubbleEmitter(): ParticleEmitterConfig {
  return {
    type: 'continuous',
    particleCount: 40,
    particleSize: { min: 3, max: 10 },
    particleLifetime: { min: 2, max: 4 },
    velocity: {
      min: { x: -20, y: -80 },
      max: { x: 20, y: -120 },
    },
    acceleration: { x: 0, y: -30 },
    colors: ['#E1F5FE', '#B3E5FC', '#81D4FA', '#4FC3F7'],
    fadeOut: true,
    shrink: false,
    rotate: false,
    blendMode: 'normal',
  };
}

export function createLeafEmitter(): ParticleEmitterConfig {
  return {
    type: 'continuous',
    particleCount: 50,
    particleSize: { min: 4, max: 8 },
    particleLifetime: { min: 3, max: 6 },
    velocity: {
      min: { x: -40, y: 60 },
      max: { x: 40, y: 100 },
    },
    acceleration: { x: 10, y: 40 },
    colors: ['#66BB6A', '#81C784', '#A5D6A7', '#FF8A65'],
    fadeOut: true,
    shrink: false,
    rotate: true,
    blendMode: 'normal',
  };
}

export function createSparkleEmitter(): ParticleEmitterConfig {
  return {
    type: 'continuous',
    particleCount: 60,
    particleSize: { min: 2, max: 4 },
    particleLifetime: { min: 0.5, max: 1.5 },
    velocity: {
      min: { x: -10, y: -10 },
      max: { x: 10, y: 10 },
    },
    acceleration: { x: 0, y: 0 },
    colors: ['#FFD700', '#FFC107', '#FFEB3B', '#FFFFFF'],
    fadeOut: true,
    shrink: true,
    rotate: true,
    blendMode: 'additive',
  };
}

export function createDustEmitter(): ParticleEmitterConfig {
  return {
    type: 'continuous',
    particleCount: 20,
    particleSize: { min: 1, max: 3 },
    particleLifetime: { min: 0.3, max: 0.6 },
    velocity: {
      min: { x: -30, y: -20 },
      max: { x: 30, y: -40 },
    },
    acceleration: { x: 0, y: 50 },
    colors: ['#D7CCC8', '#BCAAA4', '#A1887F'],
    fadeOut: true,
    shrink: true,
    rotate: false,
    blendMode: 'normal',
  };
}
