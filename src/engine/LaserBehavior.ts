import { LaserPointer } from '../entities/LaserPointer';
import { Vector } from './Vector';

export class LaserBehavior {
  static update(
    lasers: LaserPointer[],
    deltaTime: number,
    bounds: { width: number; height: number }
  ): LaserPointer[] {
    const SPEED = 250;

    return lasers.map((laser) => {
      let moveTimer = laser.moveTimer - deltaTime;
      let targetPosition = laser.targetPosition;

      if (moveTimer <= 0) {
        targetPosition = {
          x: Math.random() * bounds.width,
          y: Math.random() * bounds.height,
        };
        moveTimer = 0.5 + Math.random() * 2;
      }

      const direction = Vector.normalize(Vector.subtract(targetPosition, laser.position));

      const velocity = Vector.multiply(direction, SPEED);
      const newPosition = Vector.add(laser.position, Vector.multiply(velocity, deltaTime));

      const distance = Vector.distance(newPosition, targetPosition);
      if (distance < 10) {
        targetPosition = {
          x: Math.random() * bounds.width,
          y: Math.random() * bounds.height,
        };
        moveTimer = 0.5 + Math.random() * 2;
      }

      const opacity = 0.7 + Math.sin(Date.now() / 200) * 0.3;

      return {
        ...laser,
        position: newPosition,
        targetPosition,
        velocity,
        moveTimer,
        opacity,
      };
    });
  }
}
