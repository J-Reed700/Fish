import type { Boss, Cockroach, Vector2D } from '../../types';
import { BOSS_BATTLE_CONFIG } from '../../config/GameConfig';
import { Vector } from '../../engine/Vector';

export class MegaCockroachBoss {
  static update(
    boss: Boss,
    deltaTime: number,
    bounds: { width: number; height: number },
    touchPoint: Vector2D | null
  ): Boss {
    'worklet';
    if (boss.type !== 'mega-cockroach') return boss;

    const config = BOSS_BATTLE_CONFIG.bossTypes['mega-cockroach'];
    const entity = boss.entity as Cockroach;

    if (entity.state === 'frozen' && entity.stateTimer <= 0) {
      if (Math.random() < config.fakeDeathProbability) {
        const randomAngle = Math.random() * Math.PI * 2;
        const dashDirection = {
          x: Math.cos(randomAngle),
          y: Math.sin(randomAngle),
        };

        return {
          ...boss,
          entity: {
            ...entity,
            state: 'dashing',
            stateTimer: 0.5,
            dashDirection,
            velocity: Vector.multiply(dashDirection, config.dashSpeed),
          },
        };
      } else {
        return {
          ...boss,
          entity: {
            ...entity,
            state: 'scurrying',
            stateTimer: 3.0,
          },
        };
      }
    }

    if (entity.state === 'dashing') {
      const newPosition = Vector.add(
        entity.position,
        Vector.multiply(entity.velocity, deltaTime)
      );

      const boundedResult = this.bounceOffEdges(newPosition, entity.velocity, bounds);

      const updatedEntity: Cockroach = {
        ...entity,
        position: boundedResult.position,
        velocity: boundedResult.velocity,
        stateTimer: entity.stateTimer - deltaTime,
        rotation: Math.atan2(entity.velocity.y, entity.velocity.x),
      };

      if (updatedEntity.stateTimer <= 0) {
        updatedEntity.state = 'scurrying';
        updatedEntity.stateTimer = 2.0;
        updatedEntity.velocity = Vector.multiply(updatedEntity.velocity, 0.4);
      }

      return {
        ...boss,
        entity: updatedEntity,
      };
    }

    let threatLevel = 0;
    if (touchPoint) {
      const dx = entity.position.x - touchPoint.x;
      const dy = entity.position.y - touchPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        threatLevel = 1 - distance / 100;

        if (Math.random() < 0.05 && entity.state !== 'frozen') {
          return {
            ...boss,
            entity: {
              ...entity,
              state: 'frozen',
              stateTimer: config.fakeDeathDuration / 1000,
              velocity: { x: 0, y: 0 },
            },
          };
        }
      }
    }

    const panicSpeed = 80 + threatLevel * (config.dashSpeed - 80);
    const wanderAngle = (Math.random() - 0.5) * 0.5;

    let direction = entity.velocity;
    if (Vector.magnitude(direction) < 0.1) {
      direction = { x: Math.random() - 0.5, y: Math.random() - 0.5 };
    }

    const currentAngle = Math.atan2(direction.y, direction.x);
    const newAngle = currentAngle + wanderAngle;

    const newVelocity = {
      x: Math.cos(newAngle) * panicSpeed,
      y: Math.sin(newAngle) * panicSpeed,
    };

    const newPosition = Vector.add(entity.position, Vector.multiply(newVelocity, deltaTime));
    const boundedResult = this.bounceOffEdges(newPosition, newVelocity, bounds);

    const updatedEntity: Cockroach = {
      ...entity,
      position: boundedResult.position,
      velocity: boundedResult.velocity,
      rotation: Math.atan2(boundedResult.velocity.y, boundedResult.velocity.x),
      panicLevel: threatLevel,
      stateTimer: Math.max(0, entity.stateTimer - deltaTime),
      antennaPhase: entity.antennaPhase + deltaTime * 5,
      legPhase: entity.legPhase + deltaTime * 10,
    };

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

    const margin = 20;

    if (x < margin || x > bounds.width - margin) {
      vx = -vx;
      x = Math.max(margin, Math.min(bounds.width - margin, x));
    }
    if (y < margin || y > bounds.height - margin) {
      vy = -vy;
      y = Math.max(margin, Math.min(bounds.height - margin, y));
    }

    return {
      position: { x, y },
      velocity: { x: vx, y: vy },
    };
  }
}
