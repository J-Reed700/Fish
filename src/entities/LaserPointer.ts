import { Vector2D } from '../types';

export interface LaserPointer {
  id: string;
  position: Vector2D;
  targetPosition: Vector2D;
  velocity: Vector2D;
  size: number;
  type: 'laser';
  opacity: number;
  moveTimer: number;
}

export class LaserFactory {
  static create(bounds: { width: number; height: number }): LaserPointer {
    const position = {
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
    };

    return {
      id: Math.random().toString(36).substr(2, 9),
      position,
      targetPosition: this.getRandomTarget(bounds),
      velocity: { x: 0, y: 0 },
      size: 5 + Math.random() * 3,
      type: 'laser',
      opacity: 0.8 + Math.random() * 0.2,
      moveTimer: 0.5 + Math.random() * 2,
    };
  }

  private static getRandomTarget(bounds: { width: number; height: number }): Vector2D {
    return {
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
    };
  }
}
