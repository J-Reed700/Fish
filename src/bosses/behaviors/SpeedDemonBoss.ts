import type { Boss, Mouse, Vector2D } from '../../types';
import { BOSS_BATTLE_CONFIG } from '../../config/GameConfig';
import { Vector } from '../../engine/Vector';

export interface AfterImage {
  id: string;
  position: Vector2D;
  rotation: number;
  opacity: number;
  timestamp: number;
}

export class SpeedDemonBoss {
  static afterImages: AfterImage[] = [];

  static update(
    boss: Boss,
    deltaTime: number,
    bounds: { width: number; height: number },
    touchPoint: Vector2D | null
  ): Boss {
    'worklet';
    if (boss.type !== 'speed-demon') return boss;

    const config = BOSS_BATTLE_CONFIG.bossTypes['speed-demon'];
    const entity = boss.entity as Mouse;

    const wanderStrength = 0.5;
    const wanderAngle = (entity.wanderAngle || 0) + (Math.random() - 0.5) * 0.3;

    const wanderForce = {
      x: Math.cos(wanderAngle) * wanderStrength,
      y: Math.sin(wanderAngle) * wanderStrength,
    };

    let acceleration = wanderForce;

    if (touchPoint) {
      const dx = entity.position.x - touchPoint.x;
      const dy = entity.position.y - touchPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        const fleeForce = Vector.normalize({ x: dx, y: dy });
        acceleration = Vector.add(acceleration, Vector.multiply(fleeForce, 8));
      }
    }

    let newVelocity = Vector.add(entity.velocity, acceleration);
    newVelocity = Vector.limit(newVelocity, config.baseSpeed);

    const zigzagAmplitude = 2;
    const zigzagFrequency = 5;
    const perpendicular = { x: -newVelocity.y, y: newVelocity.x };
    const zigzagOffset = Vector.multiply(
      Vector.normalize(perpendicular),
      Math.sin(Date.now() / 1000 * zigzagFrequency) * zigzagAmplitude
    );
    newVelocity = Vector.add(newVelocity, zigzagOffset);

    const newPosition = Vector.add(entity.position, Vector.multiply(newVelocity, deltaTime));
    const boundedPosition = this.bounceOffEdges(newPosition, newVelocity, bounds);

    const rotation = Math.atan2(newVelocity.y, newVelocity.x);

    const updatedEntity: Mouse = {
      ...entity,
      position: boundedPosition.position,
      velocity: boundedPosition.velocity,
      rotation,
      wanderAngle,
    };

    this.updateAfterImages(updatedEntity, config.afterImageCount);

    return {
      ...boss,
      entity: updatedEntity,
    };
  }

  private static bounceOffEdges(
    position: Vector2D,
    velocity: Vector2D,
    bounds: { width: number; height: number }
  ): { position: Vector2D; velocity: Vector2D } {
    'worklet';
    let { x, y } = position;
    let { x: vx, y: vy } = velocity;

    if (x < 0 || x > bounds.width) {
      vx = -vx;
      x = Math.max(0, Math.min(bounds.width, x));
    }
    if (y < 0 || y > bounds.height) {
      vy = -vy;
      y = Math.max(0, Math.min(bounds.height, y));
    }

    return {
      position: { x, y },
      velocity: { x: vx, y: vy },
    };
  }

  private static updateAfterImages(entity: Mouse, maxImages: number): void {
    'worklet';
    const now = Date.now();

    this.afterImages.push({
      id: `afterimage-${now}`,
      position: { ...entity.position },
      rotation: entity.rotation,
      opacity: 0.6,
      timestamp: now,
    });

    this.afterImages = this.afterImages
      .filter((img) => now - img.timestamp < 500)
      .slice(-maxImages)
      .map((img) => ({
        ...img,
        opacity: Math.max(0, 0.6 - (now - img.timestamp) / 500),
      }));
  }

  static getAfterImages(): AfterImage[] {
    'worklet';
    return this.afterImages;
  }

  static clearAfterImages(): void {
    'worklet';
    this.afterImages = [];
  }
}
