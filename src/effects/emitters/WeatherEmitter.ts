import { ParticleEmitterConfig, Vector2D } from '../../types';
import {
  createRainEmitter,
  createSnowEmitter,
  createLeafEmitter,
} from './ContinuousEmitter';

export type WeatherType = 'rain' | 'snow' | 'leaves' | 'fog' | 'storm' | 'clear';

export function createWeatherEmitter(
  weatherType: WeatherType,
  intensity: 'light' | 'medium' | 'heavy' = 'medium'
): ParticleEmitterConfig {
  const intensityMultiplier = intensity === 'light' ? 0.5 : intensity === 'heavy' ? 1.5 : 1;

  switch (weatherType) {
    case 'rain':
      return adjustEmitterIntensity(createRainEmitter(), intensityMultiplier);
    case 'snow':
      return adjustEmitterIntensity(createSnowEmitter(), intensityMultiplier);
    case 'leaves':
      return adjustEmitterIntensity(createLeafEmitter(), intensityMultiplier);
    case 'storm':
      return createStormEmitter(intensity);
    case 'fog':
      return createFogEmitter(intensity);
    case 'clear':
      return createClearWeatherEmitter();
    default:
      return createClearWeatherEmitter();
  }
}

function adjustEmitterIntensity(
  config: ParticleEmitterConfig,
  multiplier: number
): ParticleEmitterConfig {
  return {
    ...config,
    particleCount: Math.floor(config.particleCount * multiplier),
  };
}

function createStormEmitter(intensity: 'light' | 'medium' | 'heavy'): ParticleEmitterConfig {
  const baseCount = intensity === 'light' ? 120 : intensity === 'heavy' ? 200 : 150;

  return {
    type: 'continuous',
    particleCount: baseCount,
    particleSize: { min: 1, max: 3 },
    particleLifetime: { min: 0.8, max: 1.5 },
    velocity: {
      min: { x: -100, y: 500 },
      max: { x: -50, y: 700 },
    },
    acceleration: { x: -50, y: 300 },
    colors: ['#90CAF9', '#64B5F6', '#42A5F5'],
    fadeOut: true,
    shrink: false,
    rotate: false,
    blendMode: 'normal',
  };
}

function createFogEmitter(intensity: 'light' | 'medium' | 'heavy'): ParticleEmitterConfig {
  const baseCount = intensity === 'light' ? 30 : intensity === 'heavy' ? 80 : 50;

  return {
    type: 'continuous',
    particleCount: baseCount,
    particleSize: { min: 20, max: 40 },
    particleLifetime: { min: 5, max: 8 },
    velocity: {
      min: { x: -10, y: -5 },
      max: { x: 10, y: 5 },
    },
    acceleration: { x: 5, y: 0 },
    colors: ['#ECEFF1', '#CFD8DC', '#B0BEC5'],
    fadeOut: false,
    shrink: false,
    rotate: false,
    blendMode: 'normal',
  };
}

function createClearWeatherEmitter(): ParticleEmitterConfig {
  return {
    type: 'continuous',
    particleCount: 0,
    particleSize: { min: 0, max: 0 },
    particleLifetime: { min: 0, max: 0 },
    velocity: {
      min: { x: 0, y: 0 },
      max: { x: 0, y: 0 },
    },
    acceleration: { x: 0, y: 0 },
    colors: [],
    fadeOut: false,
    shrink: false,
    rotate: false,
    blendMode: 'normal',
  };
}

export function createLightningFlash(): { duration: number; color: string } {
  return {
    duration: 0.15,
    color: '#FFFFFF',
  };
}

export function createWindEffect(direction: Vector2D, strength: number) {
  return {
    direction,
    strength,
    turbulence: strength * 0.3,
  };
}
