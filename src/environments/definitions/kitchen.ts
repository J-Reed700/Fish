import { Environment } from '../types';

export const kitchenEnvironment: Environment = {
  id: 'kitchen',
  name: 'Kitchen',
  description: 'A familiar household setting with crumbs, steam wisps, and floating dust motes',

  unlockRequirement: {},

  backgroundLayers: [
    {
      type: 'gradient',
      colors: ['#E0E0E0', '#D5D5D5', '#BDBDBD'],
      positions: [0, 0.5, 1],
      opacity: 1,
      parallaxFactor: 0,
    },
    {
      type: 'solid',
      colors: ['#9E9E9E30'],
      opacity: 0.4,
      parallaxFactor: 0.08,
      blendMode: 'multiply',
    },
    {
      type: 'gradient',
      colors: ['#00000000', '#42424260'],
      positions: [0, 1],
      opacity: 0.3,
      parallaxFactor: 0.05,
      blendMode: 'multiply',
    },
  ],

  particles: [
    {
      type: 'crumbs',
      density: 0.1,
      minSize: 2,
      maxSize: 5,
      minSpeed: 0,
      maxSpeed: 3,
      color: '#8D6E63',
      opacity: 0.9,
      lifetime: 60000,
      acceleration: { x: 0, y: 2 },
      rotation: false,
      spawnRate: 0.5,
      maxCount: 15,
    },
    {
      type: 'steam',
      density: 0.08,
      minSize: 8,
      maxSize: 18,
      minSpeed: 20,
      maxSpeed: 40,
      color: '#F5F5F5',
      opacity: 0.5,
      lifetime: 6000,
      acceleration: { x: 0, y: -25 },
      rotation: false,
      spawnRate: 1,
      maxCount: 8,
    },
    {
      type: 'dust',
      density: 0.25,
      minSize: 1,
      maxSize: 3,
      minSpeed: 5,
      maxSpeed: 15,
      color: '#BDBDBD',
      opacity: 0.4,
      lifetime: 15000,
      acceleration: { x: 0, y: 1 },
      rotation: false,
      spawnRate: 2,
      maxCount: 30,
    },
    {
      type: 'sparkles',
      density: 0.03,
      minSize: 1,
      maxSize: 2,
      minSpeed: 2,
      maxSpeed: 8,
      color: '#FFFFFF',
      opacity: 0.6,
      lifetime: 3000,
      rotation: false,
      spawnRate: 0.5,
      maxCount: 10,
    },
  ],

  physicsModifiers: [
    {
      type: 'drift',
      strength: 0.25,
      direction: { x: 0, y: -0.3 },
      affectsFish: false,
      affectsParticles: true,
    },
    {
      type: 'turbulence',
      strength: 0.1,
      frequency: 0.2,
      affectsFish: true,
      affectsParticles: true,
      turbulence: 0.15,
      noiseScale: 0.01,
      timeScale: 0.4,
    },
  ],

  lighting: {
    ambient: 0.9,
    colorTemperature: 4500,
    shadows: true,
    shadowIntensity: 0.25,
  },

  timeOfDay: {
    hour: 12,
    sunPosition: { x: 0.5, y: 0.8 },
    ambientLight: 0.9,
    colorTemperature: 4500,
    shadowIntensity: 0.25,
  },

  audio: {
    ambient: 'kitchen_ambient',
    volume: 0.3,
    loop: true,
  },

  colors: {
    primary: '#8D6E63',
    secondary: '#F5F5F5',
    accent: '#424242',
    text: '#424242',
    particle: '#BDBDBD',
  },

  fishBehavior: {
    speedMultiplier: 1.0,
    separationMultiplier: 1.0,
    alignmentMultiplier: 1.0,
    cohesionMultiplier: 1.0,
    maxForceMultiplier: 1.0,
  },

  performance: {
    maxParticles: 63,
    particleUpdateRate: 60,
    renderQuality: 'low',
    enableShadows: false,
    enableReflections: false,
  },
};
