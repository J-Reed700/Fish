import { Vector2D, ParticleEmitterConfig } from '../../types';

export interface DeathAnimationState {
  progress: number;
  scale: number;
  alpha: number;
  rotation: number;
  isComplete: boolean;
}

export class DeathAnimation {
  private duration: number;
  private elapsed: number = 0;
  private position: Vector2D;
  private particleEmitterId: string | null = null;

  constructor(position: Vector2D, duration: number = 0.3) {
    this.position = position;
    this.duration = duration;
  }

  update(deltaTime: number): DeathAnimationState {
    this.elapsed += deltaTime;
    const progress = Math.min(this.elapsed / this.duration, 1);

    const scale = 1 + progress * 0.5;
    const alpha = 1 - progress;
    const rotation = progress * Math.PI;

    return {
      progress,
      scale,
      alpha,
      rotation,
      isComplete: progress >= 1,
    };
  }

  getPosition(): Vector2D {
    return this.position;
  }

  setParticleEmitterId(id: string): void {
    this.particleEmitterId = id;
  }

  getParticleEmitterId(): string | null {
    return this.particleEmitterId;
  }

  isComplete(): boolean {
    return this.elapsed >= this.duration;
  }

  reset(): void {
    this.elapsed = 0;
    this.particleEmitterId = null;
  }
}

export const createDeathBurstParticles = (
  position: Vector2D,
  color: string,
  size: number = 30
): ParticleEmitterConfig => {
  return {
    type: 'burst',
    particleCount: size,
    particleSize: { min: 3, max: 8 },
    particleLifetime: { min: 0.3, max: 0.6 },
    velocity: {
      min: { x: -200, y: -200 },
      max: { x: 200, y: 200 },
    },
    acceleration: { x: 0, y: 300 },
    colors: [color, lightenColor(color, 30), '#FFFFFF'],
    fadeOut: true,
    shrink: true,
    rotate: true,
    blendMode: 'additive',
  };
};

export const createCatchPopEffect = (
  position: Vector2D,
  color: string
): ParticleEmitterConfig => {
  return {
    type: 'burst',
    particleCount: 20,
    particleSize: { min: 4, max: 10 },
    particleLifetime: { min: 0.4, max: 0.7 },
    velocity: {
      min: { x: -150, y: -150 },
      max: { x: 150, y: 150 },
    },
    acceleration: { x: 0, y: 250 },
    colors: [color, lightenColor(color, 40), lightenColor(color, 60)],
    fadeOut: true,
    shrink: true,
    rotate: true,
    blendMode: 'additive',
  };
};

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + percent);
  const b = Math.min(255, (num & 0xff) + percent);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export const DEATH_ANIMATION_PRESETS = {
  quick: { duration: 0.2, scale: 1.3, particleCount: 15 },
  normal: { duration: 0.3, scale: 1.5, particleCount: 25 },
  dramatic: { duration: 0.5, scale: 2.0, particleCount: 40 },
};
