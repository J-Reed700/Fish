import { ParticleEmitterConfig, Vector2D } from '../../types';

export function createBurstEmitter(
  particleCount: number = 30,
  colors: string[] = ['#FFD700', '#FFA500', '#FF6347'],
  speed: { min: number; max: number } = { min: 100, max: 300 },
  size: { min: number; max: number } = { min: 3, max: 8 },
  lifetime: { min: number; max: number } = { min: 0.3, max: 0.7 }
): ParticleEmitterConfig {
  return {
    type: 'burst',
    particleCount,
    particleSize: size,
    particleLifetime: lifetime,
    velocity: {
      min: { x: -speed.max, y: -speed.max },
      max: { x: speed.max, y: speed.max },
    },
    acceleration: { x: 0, y: 300 },
    colors,
    fadeOut: true,
    shrink: true,
    rotate: true,
    blendMode: 'additive',
  };
}

export function createCatchBurstEmitter(preyColor: string): ParticleEmitterConfig {
  const baseColor = preyColor;
  const colors = [baseColor, lightenColor(baseColor, 30), lightenColor(baseColor, 60)];

  return createBurstEmitter(25, colors, { min: 150, max: 250 }, { min: 4, max: 10 });
}

export function createComboBurstEmitter(comboLevel: number): ParticleEmitterConfig {
  let colors: string[];
  let particleCount: number;
  let speed: { min: number; max: number };

  if (comboLevel >= 10) {
    colors = ['#00E5FF', '#00B8D4', '#0091EA'];
    particleCount = 50;
    speed = { min: 200, max: 400 };
  } else if (comboLevel >= 5) {
    colors = [
      '#FF0080',
      '#FF4081',
      '#FF80AB',
      '#FFB300',
      '#FFC107',
      '#FFEB3B',
    ];
    particleCount = 40;
    speed = { min: 175, max: 350 };
  } else {
    colors = ['#FFD700', '#FFA500', '#FF8C00'];
    particleCount = 30;
    speed = { min: 150, max: 300 };
  }

  return createBurstEmitter(particleCount, colors, speed);
}

export function createPowerUpBurstEmitter(
  powerUpColor: string
): ParticleEmitterConfig {
  const colors = [
    powerUpColor,
    '#FFFFFF',
    lightenColor(powerUpColor, 40),
  ];

  return createBurstEmitter(35, colors, { min: 180, max: 320 }, { min: 5, max: 12 });
}

export function createSplashEmitter(position: Vector2D): ParticleEmitterConfig {
  return {
    type: 'burst',
    particleCount: 20,
    particleSize: { min: 2, max: 6 },
    particleLifetime: { min: 0.4, max: 0.8 },
    velocity: {
      min: { x: -200, y: -150 },
      max: { x: 200, y: 50 },
    },
    acceleration: { x: 0, y: 500 },
    colors: ['#4FC3F7', '#29B6F6', '#03A9F4', '#FFFFFF'],
    fadeOut: true,
    shrink: true,
    rotate: false,
    blendMode: 'normal',
  };
}

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + percent);
  const b = Math.min(255, (num & 0xff) + percent);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
