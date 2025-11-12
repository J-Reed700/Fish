import type { Boss, Butterfly, Vector2D } from '../../types';
import { BOSS_BATTLE_CONFIG } from '../../config/GameConfig';
import { Vector } from '../../engine/Vector';
import { ButterflyBehavior } from '../../engine/ButterflyBehavior';

export class SwarmLeaderBoss {
  static update(
    boss: Boss,
    deltaTime: number,
    bounds: { width: number; height: number },
    touchPoint: Vector2D | null,
    time: number
  ): Boss {
    'worklet';
    if (boss.type !== 'swarm-leader') return boss;

    const config = BOSS_BATTLE_CONFIG.bossTypes['swarm-leader'];
    const entity = boss.entity as Butterfly;

    const figure8Radius = 80;
    const figure8Speed = 0.0015;
    const t = time * figure8Speed;

    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;

    const targetX = centerX + figure8Radius * Math.sin(t);
    const targetY = centerY + figure8Radius * Math.sin(2 * t) / 2;

    let targetPosition = { x: targetX, y: targetY };

    if (touchPoint) {
      const dx = entity.position.x - touchPoint.x;
      const dy = entity.position.y - touchPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < entity.size * 1.5) {
        const escapeDirection = Vector.normalize({ x: dx, y: dy });
        const escapeDistance = 200;
        targetPosition = {
          x: entity.position.x + escapeDirection.x * escapeDistance,
          y: entity.position.y + escapeDirection.y * escapeDistance,
        };

        targetPosition.x = Math.max(50, Math.min(bounds.width - 50, targetPosition.x));
        targetPosition.y = Math.max(50, Math.min(bounds.height - 50, targetPosition.y));
      }
    }

    const direction = Vector.subtract(targetPosition, entity.position);
    const distance = Vector.magnitude(direction);

    let newVelocity = entity.velocity;
    if (distance > 10) {
      const steering = Vector.normalize(direction);
      newVelocity = Vector.add(
        entity.velocity,
        Vector.multiply(steering, deltaTime * config.escapeSpeed)
      );
      newVelocity = Vector.limit(newVelocity, config.escapeSpeed);
    }

    const newPosition = Vector.add(entity.position, Vector.multiply(newVelocity, deltaTime));
    const rotation = Math.atan2(newVelocity.y, newVelocity.x);

    const updatedEntity: Butterfly = {
      ...entity,
      position: newPosition,
      velocity: newVelocity,
      rotation,
      wingPhase: entity.wingPhase + entity.wingFlapSpeed * deltaTime,
    };

    const updatedFollowers = boss.followers.map((follower, index) => {
      const angle = (index / boss.followers.length) * Math.PI * 2 + time * 0.001;
      const radius = 60 + Math.sin(time * 0.002 + index) * 20;

      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;

      const targetFollowerPos = {
        x: entity.position.x + offsetX,
        y: entity.position.y + offsetY,
      };

      const followerDirection = Vector.subtract(targetFollowerPos, follower.position);
      const followerVelocity = Vector.multiply(Vector.normalize(followerDirection), 100);

      return ButterflyBehavior.update(
        {
          ...follower,
          velocity: followerVelocity,
        } as Butterfly,
        deltaTime,
        bounds.width,
        bounds.height,
        null,
        time
      );
    });

    return {
      ...boss,
      entity: updatedEntity,
      followers: updatedFollowers,
    };
  }
}
