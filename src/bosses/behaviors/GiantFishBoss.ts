import type { Boss, Fish, Vector2D } from '../../types';
import { BOSS_BATTLE_CONFIG } from '../../config/GameConfig';
import { Vector } from '../../engine/Vector';
import { BoidsEngine } from '../../engine/BoidsEngine';
import { DEFAULT_BOIDS_CONFIG } from '../../config/GameConfig';

export class GiantFishBoss {
  static update(
    boss: Boss,
    deltaTime: number,
    bounds: { width: number; height: number },
    touchPoint: Vector2D | null
  ): Boss {
    'worklet';
    if (boss.type !== 'giant-fish') return boss;

    const config = BOSS_BATTLE_CONFIG.bossTypes['giant-fish'];
    const entity = boss.entity as Fish;

    const hpPercentage = boss.currentHP / boss.maxHP;
    const shouldSpeedBoost = hpPercentage < config.speedBoostThreshold;

    let newVelocity = entity.velocity;
    if (shouldSpeedBoost) {
      const speed = Vector.magnitude(entity.velocity);
      const targetSpeed = entity.maxSpeed * config.speedBoostMultiplier;
      if (speed > 0) {
        newVelocity = Vector.setMagnitude(entity.velocity, targetSpeed);
      }
    }

    if (touchPoint) {
      const dx = entity.position.x - touchPoint.x;
      const dy = entity.position.y - touchPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 200) {
        const fleeForce = Vector.normalize({ x: dx, y: dy });
        const acceleration = Vector.multiply(fleeForce, 5);
        newVelocity = Vector.add(newVelocity, acceleration);
        newVelocity = Vector.limit(newVelocity, entity.maxSpeed * (shouldSpeedBoost ? config.speedBoostMultiplier : 1));
      }
    }

    const newPosition = Vector.add(entity.position, Vector.multiply(newVelocity, deltaTime));
    const boundedPosition = this.wrapPosition(newPosition, bounds);

    const rotation = Math.atan2(newVelocity.y, newVelocity.x);

    const updatedEntity: Fish = {
      ...entity,
      position: boundedPosition,
      velocity: newVelocity,
      rotation,
    };

    const updatedFollowers = BoidsEngine.updateWithTouch(
      boss.followers as Fish[],
      {
        ...DEFAULT_BOIDS_CONFIG,
        cohesionWeight: 2.0,
        alignmentWeight: 1.5,
      },
      bounds,
      deltaTime,
      null
    );

    return {
      ...boss,
      entity: updatedEntity,
      followers: updatedFollowers,
    };
  }

  private static wrapPosition(position: Vector2D, bounds: { width: number; height: number }): Vector2D {
    'worklet';
    let { x, y } = position;

    if (x < 0) x = bounds.width;
    if (x > bounds.width) x = 0;
    if (y < 0) y = bounds.height;
    if (y > bounds.height) y = 0;

    return { x, y };
  }
}
