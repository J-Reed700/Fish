import { Vector2D } from '../types';
import { Vector } from '../engine/Vector';

export interface Mouse {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  rotation: number;
  size: number;
  color: string;
  type: 'mouse';
  state: 'scurrying' | 'paused' | 'fleeing';
  stateTimer: number;
  wanderAngle: number;
  maxSpeed: number;
  lifetime: number;
  maxLifetime: number;
}

export class MouseFactory {
  static create(bounds: { width: number; height: number }): Mouse {
    const randomAngle = Math.random() * Math.PI * 2;
    const initialSpeed = 3;

    return {
      id: Math.random().toString(36).substr(2, 9),
      position: {
        x: 50 + Math.random() * (bounds.width - 100),
        y: 50 + Math.random() * (bounds.height - 100),
      },
      velocity: {
        x: Math.cos(randomAngle) * initialSpeed,
        y: Math.sin(randomAngle) * initialSpeed,
      },
      acceleration: { x: 0, y: 0 },
      rotation: randomAngle,
      size: 15 + Math.random() * 10,
      color: Math.random() < 0.5 ? '#A0826D' : '#808080',
      type: 'mouse',
      state: 'scurrying',
      stateTimer: 0,
      wanderAngle: Math.random() * Math.PI * 2,
      maxSpeed: 6,
      lifetime: 0,
      maxLifetime: 20 + Math.random() * 20,
    };
  }

  static createMany(
    count: number,
    bounds: { width: number; height: number }
  ): Mouse[] {
    const mice: Mouse[] = [];

    for (let i = 0; i < count; i++) {
      mice.push(this.create(bounds));
    }

    return mice;
  }
}
