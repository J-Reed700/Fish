import { Environment } from '../types';

export const oceanEnvironment: Environment = {
  id: 'ocean',
  name: 'Ocean',
  description: 'A peaceful underwater environment with gentle currents and dancing bubbles',

  unlockRequirement: {},

  backgroundLayers: [
    {
      type: 'gradient',
      colors: ['#1a4d7a', '#2d6fa8', '#4a9fd8'],
      positions: [0, 0.5, 1],
      opacity: 1,
      parallaxFactor: 0,
    },
    {
      type: 'gradient',
      colors: ['#2d6fa8', '#4a9fd8', '#6bb8e8'],
      positions: [0, 0.6, 1],
      opacity: 0.6,
      parallaxFactor: 0.2,
      blendMode: 'screen',
    },
    {
      type: 'gradient',
      colors: ['#00000000', '#1a4d7a40'],
      positions: [0, 1],
      opacity: 0.3,
      parallaxFactor: 0.1,
      blendMode: 'multiply',
    },
  ],

  particles: [
    {
      type: 'bubbles',
      density: 0.3,
      minSize: 2,
      maxSize: 8,
      minSpeed: 20,
      maxSpeed: 50,
      color: '#ffffff',
      opacity: 0.6,
      lifetime: 5000,
      acceleration: { x: 0, y: -30 },
      spawnRate: 5,
      maxCount: 50,
    },
    {
      type: 'sparkles',
      density: 0.1,
      minSize: 1,
      maxSize: 3,
      minSpeed: 10,
      maxSpeed: 20,
      color: '#aaddff',
      opacity: 0.8,
      lifetime: 2000,
      rotation: false,
      spawnRate: 3,
      maxCount: 30,
    },
  ],

  physicsModifiers: [
    {
      type: 'waterCurrent',
      strength: 0.3,
      direction: { x: 0.5, y: 0.1 },
      frequency: 0.5,
      scale: 0.002,
      affectsFish: true,
      affectsParticles: true,
      turbulence: 0.2,
      noiseScale: 0.01,
      timeScale: 0.5,
    },
    {
      type: 'drift',
      strength: 0.15,
      direction: { x: 0.3, y: -0.1 },
      affectsFish: true,
      affectsParticles: true,
    },
  ],

  lighting: {
    ambient: 0.85,
    colorTemperature: 6500,
    shadows: true,
    shadowIntensity: 0.3,
  },

  audio: {
    ambient: 'ocean_ambient',
    volume: 0.4,
    loop: true,
  },

  colors: {
    primary: '#2d6fa8',
    secondary: '#4a9fd8',
    accent: '#6bb8e8',
    text: '#ffffff',
    particle: '#aaddff',
  },

  fishBehavior: {
    speedMultiplier: 1.0,
    separationMultiplier: 1.0,
    alignmentMultiplier: 1.0,
    cohesionMultiplier: 1.0,
    maxForceMultiplier: 1.0,
  },

  performance: {
    maxParticles: 80,
    particleUpdateRate: 60,
    renderQuality: 'high',
    enableShadows: true,
    enableReflections: true,
  },
};
