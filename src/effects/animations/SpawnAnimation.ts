import { Vector2D } from '../../types';

export interface SpawnAnimationState {
  progress: number;
  scale: number;
  alpha: number;
  rotation: number;
  isComplete: boolean;
}

export class SpawnAnimation {
  private duration: number;
  private elapsed: number = 0;
  private position: Vector2D;
  private particleEmitterId: string | null = null;

  constructor(position: Vector2D, duration: number = 0.3) {
    this.position = position;
    this.duration = duration;
  }

  update(deltaTime: number): SpawnAnimationState {
    this.elapsed += deltaTime;
    const progress = Math.min(this.elapsed / this.duration, 1);

    const elasticOut = (t: number): number => {
      const p = 0.3;
      return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    };

    const scale = elasticOut(progress);
    const alpha = Math.min(progress * 2, 1);
    const rotation = progress * Math.PI * 2;

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

export const createSpawnParticles = (position: Vector2D, color: string) => {
  return {
    type: 'burst' as const,
    particleCount: 15,
    particleSize: { min: 2, max: 5 },
    particleLifetime: { min: 0.2, max: 0.4 },
    velocity: {
      min: { x: -100, y: -100 },
      max: { x: 100, y: 100 },
    },
    acceleration: { x: 0, y: 200 },
    colors: [color, '#FFFFFF'],
    fadeOut: true,
    shrink: true,
    rotate: false,
    blendMode: 'additive' as const,
  };
};
