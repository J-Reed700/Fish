import { Vector2D } from '../types';

export interface Insect {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'insect';
  subType: 'butterfly' | 'fly';
  phaseOffset: number;
  lifetime: number;
  maxLifetime: number;
}

export class InsectFactory {
  static createButterfly(bounds: { width: number; height: number }): Insect {
    const yRange = bounds.height * 0.5;

    return {
      id: Math.random().toString(36).substr(2, 9),
      position: {
        x: Math.random() * bounds.width,
        y: Math.random() * yRange,
      },
      velocity: { x: 50, y: 0 },
      rotation: 0,
      size: 25 + Math.random() * 10,
      color: Math.random() < 0.5 ? '#00BFFF' : '#FFD700',
      type: 'insect',
      subType: 'butterfly',
      phaseOffset: Math.random() * Math.PI * 2,
      lifetime: 0,
      maxLifetime: 20 + Math.random() * 10,
    };
  }

  static createFly(bounds: { width: number; height: number }): Insect {
    return {
      id: Math.random().toString(36).substr(2, 9),
      position: {
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height,
      },
      velocity: {
        x: (Math.random() < 0.5 ? -1 : 1) * 120,
        y: (Math.random() - 0.5) * 80,
      },
      rotation: 0,
      size: 10 + Math.random() * 5,
      color: '#404040',
      type: 'insect',
      subType: 'fly',
      phaseOffset: Math.random() * Math.PI * 2,
      lifetime: 0,
      maxLifetime: 15 + Math.random() * 15,
    };
  }

  static createMany(
    count: number,
    bounds: { width: number; height: number },
    butterflyRatio: number = 0.5
  ): Insect[] {
    const insects: Insect[] = [];
    for (let i = 0; i < count; i++) {
      if (Math.random() < butterflyRatio) {
        insects.push(this.createButterfly(bounds));
      } else {
        insects.push(this.createFly(bounds));
      }
    }
    return insects;
  }
}
