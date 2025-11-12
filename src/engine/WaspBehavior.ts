import type { Wasp, Vector2D } from '../types';

export class WaspBehavior {
  static readonly PATROL_SPEED = 70;
  static readonly INVESTIGATE_SPEED = 40;
  static readonly ATTACK_SPEED = 200;
  static readonly BUILDING_SPEED = 20;
  static readonly FLEE_SPEED = 150;
  static readonly INVESTIGATION_DISTANCE = 150;
  static readonly ATTACK_DISTANCE = 100;
  static readonly WING_FLAP_SPEED = 70;
  static readonly BOUNDARY_MARGIN = 40;

  static update(
    wasp: Wasp,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Wasp {
    const updated = { ...wasp };
    updated.stateTimer -= 1;

    if (touchPosition) {
      const dist = this.distance(updated.position, touchPosition);

      if (dist < this.ATTACK_DISTANCE && updated.state === 'investigating') {
        updated.state = 'attacking';
        updated.attackTarget = { ...touchPosition };
        updated.isAngry = true;
        updated.stateTimer = 90;
        updated.threatLevel = 1;
      } else if (dist < this.INVESTIGATION_DISTANCE && updated.state === 'patrolling') {
        updated.state = 'investigating';
        updated.stateTimer = 120;
        updated.threatLevel = Math.min(1, updated.threatLevel + 0.3);
      }
    }

    switch (updated.state) {
      case 'patrolling':
        const territoryCenter = {
          x: (updated.territory.min.x + updated.territory.max.x) / 2,
          y: (updated.territory.min.y + updated.territory.max.y) / 2,
        };

        const patrolAngle = time * 0.015;
        const patrolRadius = Math.min(
          updated.territory.max.x - territoryCenter.x,
          updated.territory.max.y - territoryCenter.y
        ) * 0.7;

        const patrolTarget = {
          x: territoryCenter.x + Math.cos(patrolAngle) * patrolRadius,
          y: territoryCenter.y + Math.sin(patrolAngle) * patrolRadius,
        };

        updated.velocity = this.calculateDirectVelocity(updated.position, patrolTarget, this.PATROL_SPEED);

        if (Math.random() < 0.005) {
          updated.state = 'building';
          updated.stateTimer = 180;
        }

        updated.threatLevel = Math.max(0, updated.threatLevel - 0.01);
        break;

      case 'investigating':
        if (touchPosition) {
          const hoverOffset = {
            x: Math.sin(time * 0.3) * 20,
            y: Math.cos(time * 0.25) * 15,
          };

          const investigateTarget = {
            x: touchPosition.x + hoverOffset.x,
            y: touchPosition.y + hoverOffset.y - 40,
          };

          updated.velocity = this.calculateDirectVelocity(
            updated.position,
            investigateTarget,
            this.INVESTIGATE_SPEED
          );
        } else if (updated.stateTimer <= 0) {
          updated.state = 'patrolling';
          updated.stateTimer = 300;
          updated.isAngry = false;
        }
        break;

      case 'attacking':
        if (updated.attackTarget) {
          const dist = this.distance(updated.position, updated.attackTarget);

          if (dist < 25 || updated.stateTimer <= 0) {
            updated.state = 'fleeing';
            updated.stateTimer = 100;
            updated.attackTarget = null;
          } else {
            updated.velocity = this.calculateDirectVelocity(
              updated.position,
              updated.attackTarget,
              this.ATTACK_SPEED
            );
          }
        } else {
          updated.state = 'patrolling';
          updated.stateTimer = 200;
        }
        break;

      case 'building':
        if (updated.stateTimer <= 0) {
          updated.state = 'patrolling';
          updated.stateTimer = 300;
        }

        const toNest = this.calculateDirectVelocity(updated.position, updated.nestPosition, this.BUILDING_SPEED);
        updated.velocity = {
          x: toNest.x + Math.sin(time * 0.2) * 10,
          y: toNest.y + Math.cos(time * 0.15) * 10,
        };
        break;

      case 'fleeing':
        if (updated.stateTimer <= 0) {
          updated.state = 'patrolling';
          updated.isAngry = false;
          updated.threatLevel = 0.5;
          updated.stateTimer = 300;
        } else if (touchPosition) {
          updated.velocity = this.calculateFleeVelocity(updated.position, touchPosition, this.FLEE_SPEED);
        }
        break;
    }

    updated.position = {
      x: updated.position.x + updated.velocity.x * deltaTime,
      y: updated.position.y + updated.velocity.y * deltaTime,
    };

    this.handleBoundaries(updated, screenWidth, screenHeight);

    const speed = Math.sqrt(updated.velocity.x ** 2 + updated.velocity.y ** 2);
    if (speed > 0.1) {
      const targetRotation = Math.atan2(updated.velocity.y, updated.velocity.x);
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, 0.2);
    }

    updated.wingPhase = (updated.wingPhase + this.WING_FLAP_SPEED * deltaTime * 0.1) % (Math.PI * 2);
    updated.lifetime += deltaTime;

    return updated;
  }

  static initializeTerritory(screenWidth: number, screenHeight: number): { min: Vector2D; max: Vector2D } {
    const cornerChoice = Math.floor(Math.random() * 4);
    const size = Math.min(screenWidth, screenHeight) * 0.3;

    switch (cornerChoice) {
      case 0:
        return { min: { x: 0, y: 0 }, max: { x: size, y: size } };
      case 1:
        return { min: { x: screenWidth - size, y: 0 }, max: { x: screenWidth, y: size } };
      case 2:
        return { min: { x: screenWidth - size, y: screenHeight - size }, max: { x: screenWidth, y: screenHeight } };
      default:
        return { min: { x: 0, y: screenHeight - size }, max: { x: size, y: screenHeight } };
    }
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
    if (dist < 0.1) return { x: 0, y: -speed };
    return { x: (dx / dist) * speed, y: (dy / dist) * speed };
  }

  static handleBoundaries(wasp: Wasp, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (wasp.position.x < margin) {
      wasp.position.x = margin;
      wasp.velocity.x = Math.abs(wasp.velocity.x);
    } else if (wasp.position.x > screenWidth - margin) {
      wasp.position.x = screenWidth - margin;
      wasp.velocity.x = -Math.abs(wasp.velocity.x);
    }

    if (wasp.position.y < margin) {
      wasp.position.y = margin;
      wasp.velocity.y = Math.abs(wasp.velocity.y);
    } else if (wasp.position.y > screenHeight - margin) {
      wasp.position.y = screenHeight - margin;
      wasp.velocity.y = -Math.abs(wasp.velocity.y);
    }
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
}
