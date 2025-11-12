import { Environment } from '../types';

export const koiPondEnvironment: Environment = {
  id: 'koi-pond',
  name: 'Koi Pond',
  description: 'A zen Japanese garden with graceful koi fish and falling cherry blossoms',

  unlockRequirement: {
    fishCount: 25,
  },

  backgroundLayers: [
    {
      type: 'gradient',
      colors: ['#1A472A', '#2E7D4E', '#3A9D5D'],
      positions: [0, 0.6, 1],
      opacity: 1,
      parallaxFactor: 0,
    },
    {
      type: 'gradient',
      colors: ['#2E7D4E80', '#3A9D5D60'],
      positions: [0, 1],
      opacity: 0.5,
      parallaxFactor: 0.1,
      blendMode: 'screen',
    },
    {
      type: 'solid',
      colors: ['#1A472A40'],
      opacity: 0.3,
      parallaxFactor: 0.05,
      blendMode: 'multiply',
    },
  ],

  particles: [
    {
      type: 'koi',
      density: 0.05,
      minSize: 20,
      maxSize: 35,
      minSpeed: 15,
      maxSpeed: 30,
      color: '#FF9800',
      opacity: 0.95,
      lifetime: 15000,
      acceleration: { x: 0, y: 0 },
      rotation: true,
      spawnRate: 0.5,
      maxCount: 5,
    },
    {
      type: 'cherry-blossoms',
      density: 0.2,
      minSize: 4,
      maxSize: 8,
      minSpeed: 8,
      maxSpeed: 20,
      color: '#FFC0CB',
      opacity: 0.85,
      lifetime: 12000,
      acceleration: { x: 2, y: 15 },
      rotation: true,
      spawnRate: 2,
      maxCount: 20,
    },
    {
      type: 'dragonflies',
      density: 0.08,
      minSize: 5,
      maxSize: 10,
      minSpeed: 40,
      maxSpeed: 80,
      color: '#4DB6AC',
      opacity: 0.8,
      lifetime: 6000,
      acceleration: { x: 0, y: 0 },
      rotation: false,
      spawnRate: 1,
      maxCount: 8,
    },
    {
      type: 'sparkles',
      density: 0.05,
      minSize: 1,
      maxSize: 3,
      minSpeed: 5,
      maxSpeed: 15,
      color: '#FFFFFF',
      opacity: 0.7,
      lifetime: 3000,
      rotation: false,
      spawnRate: 1.5,
      maxCount: 15,
    },
  ],

  physicsModifiers: [
    {
      type: 'waterCurrent',
      strength: 0.2,
      direction: { x: 0.3, y: 0.1 },
      frequency: 0.2,
      scale: 0.003,
      affectsFish: true,
      affectsParticles: true,
      turbulence: 0.15,
      noiseScale: 0.008,
      timeScale: 0.3,
    },
    {
      type: 'drift',
      strength: 0.1,
      direction: { x: 0.2, y: 0.05 },
      affectsFish: true,
      affectsParticles: true,
    },
  ],

  lighting: {
    ambient: 0.8,
    colorTemperature: 5800,
    shadows: true,
    shadowIntensity: 0.4,
  },

  timeOfDay: {
    hour: 16,
    sunPosition: { x: 0.6, y: 0.4 },
    ambientLight: 0.8,
    colorTemperature: 5800,
    shadowIntensity: 0.4,
  },

  audio: {
    ambient: 'koi_pond_ambient',
    volume: 0.35,
    loop: true,
  },

  colors: {
    primary: '#FF9800',
    secondary: '#FFC0CB',
    accent: '#4DB6AC',
    text: '#1A472A',
    particle: '#FFFFFF',
  },

  fishBehavior: {
    speedMultiplier: 0.85,
    separationMultiplier: 1.2,
    alignmentMultiplier: 0.9,
    cohesionMultiplier: 1.1,
    maxForceMultiplier: 0.9,
  },

  performance: {
    maxParticles: 48,
    particleUpdateRate: 60,
    renderQuality: 'medium',
    enableShadows: true,
    enableReflections: true,
  },
};
