import type { Ant, Vector2D } from '../types';

export class AntBehavior {
  static readonly MARCHING_SPEED = 30;
  static readonly CARRYING_SPEED = 20;
  static readonly SEARCHING_SPEED = 15;
  static readonly FOLLOWING_SPEED = 28;
  static readonly FLEE_SPEED = 50;
  static readonly FLEE_DISTANCE = 60;
  static readonly LEG_ANIMATION_SPEED = 18;
  static readonly GROUND_ZONE_PERCENT = 0.2;

  static update(
    ant: Ant,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number,
    otherAnts: Ant[] = []
  ): Ant {
    const updated = { ...ant };
    updated.stateTimer -= 1;

    if (touchPosition) {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE && updated.state !== 'fleeing') {
        updated.state = 'fleeing';
        updated.stateTimer = 120;
      }
    }

    const groundY = screenHeight * (1 - this.GROUND_ZONE_PERCENT);

    switch (updated.state) {
      case 'marching':
        if (updated.trailPath.length === 0) {
          updated.state = 'searching';
          updated.stateTimer = 180;
        } else {
          const target = updated.trailPath[updated.pathIndex % updated.trailPath.length];
          const dist = this.distance(updated.position, target);

          if (dist < 10) {
            updated.pathIndex++;
            if (updated.pathIndex >= updated.trailPath.length) {
              updated.state = 'carrying';
              updated.carryingFood = true;
              updated.stateTimer = 300;
            }
          }

          updated.velocity = this.calculateDirectVelocity(updated.position, target, this.MARCHING_SPEED);
        }
        break;

      case 'carrying':
        if (updated.stateTimer <= 0 || updated.position.x < 10 || updated.position.x > screenWidth - 10) {
          updated.state = 'marching';
          updated.carryingFood = false;
          updated.pathIndex = 0;
          updated.stateTimer = 300;
        }

        const exitPoint = updated.position.x < screenWidth / 2 ? { x: -10, y: updated.position.y } : { x: screenWidth + 10, y: updated.position.y };
        updated.velocity = this.calculateDirectVelocity(updated.position, exitPoint, this.CARRYING_SPEED);
        break;

      case 'searching':
        if (updated.stateTimer <= 0) {
          updated.state = 'marching';
          updated.stateTimer = 300;
        }

        updated.velocity = {
          x: Math.cos(time * 0.1 + updated.legPhase) * this.SEARCHING_SPEED,
          y: Math.sin(time * 0.05) * 5,
        };
        break;

      case 'following':
        const leader = otherAnts.find(a => a.id === updated.leaderId);
        if (!leader || updated.stateTimer <= 0) {
          updated.state = 'marching';
          updated.leaderId = null;
          updated.stateTimer = 300;
        } else {
          const targetPos = {
            x: leader.position.x - Math.cos(leader.rotation) * 15,
            y: leader.position.y - Math.sin(leader.rotation) * 15,
          };
          updated.velocity = this.calculateDirectVelocity(updated.position, targetPos, this.FOLLOWING_SPEED);
        }
        break;

      case 'fleeing':
        if (updated.stateTimer <= 0) {
          updated.state = 'searching';
          updated.stateTimer = 180;
        } else if (touchPosition) {
          updated.velocity = this.calculateFleeVelocity(updated.position, touchPosition, this.FLEE_SPEED);
        }
        break;
    }

    updated.position = {
      x: updated.position.x + updated.velocity.x * deltaTime,
      y: updated.position.y + updated.velocity.y * deltaTime,
    };

    if (updated.position.y < groundY) {
      updated.position.y = groundY;
      updated.velocity.y = Math.abs(updated.velocity.y);
    }

    if (updated.position.x < 0) updated.position.x = 0;
    if (updated.position.x > screenWidth) updated.position.x = screenWidth;
    if (updated.position.y > screenHeight) updated.position.y = screenHeight;

    const speed = Math.sqrt(updated.velocity.x ** 2 + updated.velocity.y ** 2);
    if (speed > 0.1) {
      const targetRotation = Math.atan2(updated.velocity.y, updated.velocity.x);
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, 0.2);
    }

    updated.legPhase = (updated.legPhase + this.LEG_ANIMATION_SPEED * deltaTime * 0.1) % (Math.PI * 2);
    updated.lifetime += deltaTime;

    return updated;
  }

  static generateTrailPath(screenWidth: number, screenHeight: number): Vector2D[] {
    const groundY = screenHeight * (1 - this.GROUND_ZONE_PERCENT);
    const points: Vector2D[] = [];
    const startX = Math.random() < 0.5 ? 20 : screenWidth - 20;

    for (let i = 0; i < 5; i++) {
      points.push({
        x: this.randomInRange(50, screenWidth - 50),
        y: groundY + this.randomInRange(-10, 10),
      });
    }

    return points;
  }

  static calculateDirectVelocity(from: Vector2D, to: Vector2D, speed: number): Vector2D {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.1) return { x: 0, y: 0 };
    return { x: (dx / dist) * speed, y: (dy / dist) * speed };
  }

  static calculateFleeVelocity(position: Vector2D, threat: Vector2D, speed: number): Vector2D {
    const dx = position.x - threat.x;
    const dy = position.y - threat.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.1) return { x: speed, y: 0 };
    return { x: (dx / dist) * speed, y: (dy / dist) * speed };
  }

  private static distance(a: Vector2D, b: Vector2D): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  private static lerpAngle(a: number, b: number, t: number): number {
    let diff = b - a;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return a + diff * t;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
