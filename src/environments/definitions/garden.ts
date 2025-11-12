import { Environment } from '../types';

export const gardenEnvironment: Environment = {
  id: 'garden',
  name: 'Garden',
  description: 'A vibrant garden with colorful flowers and gentle breezes',

  unlockRequirement: {
    fishCount: 10,
  },

  backgroundLayers: [
    {
      type: 'gradient',
      colors: ['#87CEEB', '#98D8E8', '#B0E2FF'],
      positions: [0, 0.5, 1],
      opacity: 1,
      parallaxFactor: 0,
    },
    {
      type: 'gradient',
      colors: ['#90EE90', '#98FB98', '#ADFF2F'],
      positions: [0, 0.3, 1],
      opacity: 0.7,
      parallaxFactor: 0.3,
      blendMode: 'normal',
    },
    {
      type: 'solid',
      colors: ['#228B2280'],
      opacity: 0.2,
      parallaxFactor: 0.15,
      blendMode: 'multiply',
    },
  ],

  particles: [
    {
      type: 'flowers',
      density: 0.2,
      minSize: 4,
      maxSize: 10,
      minSpeed: 15,
      maxSpeed: 35,
      color: '#FF69B4',
      opacity: 0.8,
      lifetime: 8000,
      acceleration: { x: 0, y: 10 },
      rotation: true,
      spawnRate: 2,
      maxCount: 40,
    },
    {
      type: 'leaves',
      density: 0.15,
      minSize: 3,
      maxSize: 7,
      minSpeed: 10,
      maxSpeed: 25,
      color: '#90EE90',
      opacity: 0.7,
      lifetime: 6000,
      acceleration: { x: 5, y: 15 },
      rotation: true,
      spawnRate: 3,
      maxCount: 35,
    },
    {
      type: 'fireflies',
      density: 0.08,
      minSize: 2,
      maxSize: 4,
      minSpeed: 20,
      maxSpeed: 40,
      color: '#FFFF99',
      opacity: 0.9,
      lifetime: 4000,
      rotation: false,
      spawnRate: 1,
      maxCount: 20,
    },
  ],

  physicsModifiers: [
    {
      type: 'windForce',
      strength: 0.25,
      direction: { x: 0.7, y: 0.1 },
      frequency: 0.3,
      affectsFish: true,
      affectsParticles: true,
      turbulence: 0.3,
      noiseScale: 0.015,
      timeScale: 0.8,
    },
    {
      type: 'drift',
      strength: 0.1,
      direction: { x: 0.2, y: 0.05 },
      affectsFish: false,
      affectsParticles: true,
    },
  ],

  lighting: {
    ambient: 0.95,
    colorTemperature: 5500,
    shadows: true,
    shadowIntensity: 0.2,
  },

  timeOfDay: {
    hour: 14,
    sunPosition: { x: 0.7, y: 0.3 },
    ambientLight: 0.95,
    colorTemperature: 5500,
    shadowIntensity: 0.2,
  },

  audio: {
    ambient: 'garden_ambient',
    volume: 0.3,
    loop: true,
  },

  colors: {
    primary: '#90EE90',
    secondary: '#98FB98',
    accent: '#FF69B4',
    text: '#2F4F2F',
    particle: '#FFFF99',
  },

  fishBehavior: {
    speedMultiplier: 0.9,
    separationMultiplier: 1.1,
    alignmentMultiplier: 0.95,
    cohesionMultiplier: 1.05,
    maxForceMultiplier: 0.95,
  },

  performance: {
    maxParticles: 95,
    particleUpdateRate: 60,
    renderQuality: 'high',
    enableShadows: true,
    enableReflections: false,
  },
};
