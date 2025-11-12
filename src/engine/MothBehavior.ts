import type { Moth, Vector2D } from '../types';

export class MothBehavior {
  static readonly FLYING_SPEED = 45;
  static readonly ATTRACTED_SPEED = 60;
  static readonly FLEE_SPEED = 100;
  static readonly LIGHT_ATTRACTION_STRENGTH = 0.3;
  static readonly CIRCLE_RADIUS_MIN = 50;
  static readonly CIRCLE_RADIUS_MAX = 100;
  static readonly FLEE_DISTANCE = 90;
  static readonly WING_FLAP_SPEED = 10;
  static readonly DUST_PARTICLE_MAX = 8;
  static readonly BOUNDARY_MARGIN = 40;

  static update(
    moth: Moth,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Moth {
    const updated = { ...moth };
    updated.stateTimer -= 1;

    if (touchPosition) {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE && updated.state !== 'fleeing') {
        updated.state = 'fleeing';
        updated.stateTimer = 100;
        updated.isResting = false;
      }
    }

    const lightSource = this.findLightSource(screenWidth, screenHeight);

    switch (updated.state) {
      case 'flying':
        if (!updated.lightTarget || Math.random() < 0.01) {
          updated.lightTarget = lightSource;
          updated.state = 'attracted';
          updated.stateTimer = 300;
        }

        updated.velocity = {
          x: Math.cos(time * 0.03 + updated.wingPhase) * this.FLYING_SPEED,
          y: Math.sin(time * 0.025 + updated.wingPhase) * this.FLYING_SPEED - 10,
        };
        break;

      case 'attracted':
        if (updated.lightTarget) {
          const dist = this.distance(updated.position, updated.lightTarget);
          if (dist < 80) {
            updated.state = 'circling';
            updated.circleRadius = this.randomInRange(this.CIRCLE_RADIUS_MIN, this.CIRCLE_RADIUS_MAX);
            updated.circleAngle = Math.atan2(
              updated.position.y - updated.lightTarget.y,
              updated.position.x - updated.lightTarget.x
            );
            updated.stateTimer = 400;
          } else {
            const toLight = this.calculateDirectVelocity(updated.position, updated.lightTarget, this.ATTRACTED_SPEED);
            const erratic = {
              x: Math.sin(time * 0.2) * 20,
              y: Math.cos(time * 0.15) * 20,
            };
            updated.velocity = {
              x: toLight.x + erratic.x,
              y: toLight.y + erratic.y,
            };
          }
        } else {
          updated.state = 'flying';
          updated.stateTimer = 200;
        }
        break;

      case 'circling':
        if (!updated.lightTarget || updated.stateTimer <= 0) {
          if (Math.random() < 0.3) {
            updated.state = 'resting';
            updated.isResting = true;
            updated.stateTimer = 180;
          } else {
            updated.state = 'flying';
            updated.stateTimer = 200;
          }
        } else {
          updated.circleAngle += 0.02;
          const targetX = updated.lightTarget.x + Math.cos(updated.circleAngle) * updated.circleRadius;
          const targetY = updated.lightTarget.y + Math.sin(updated.circleAngle) * updated.circleRadius;

          updated.velocity = this.calculateDirectVelocity(
            updated.position,
            { x: targetX, y: targetY },
            this.ATTRACTED_SPEED * 0.8
          );
        }
        break;

      case 'resting':
        if (updated.stateTimer <= 0 || (touchPosition && this.distance(updated.position, touchPosition) < 100)) {
          updated.state = 'flying';
          updated.isResting = false;
          updated.stateTimer = 200;
        }
        updated.velocity = { x: 0, y: 0 };
        break;

      case 'fleeing':
        if (updated.stateTimer <= 0) {
          updated.state = 'flying';
          updated.stateTimer = 200;
        } else if (touchPosition) {
          const fleeVel = this.calculateFleeVelocity(updated.position, touchPosition, this.FLEE_SPEED);
          const flutter = {
            x: Math.sin(time * 0.5) * 30,
            y: Math.cos(time * 0.4) * 30,
          };
          updated.velocity = {
            x: fleeVel.x + flutter.x,
            y: fleeVel.y + flutter.y,
          };
        }
        break;
    }

    updated.position = {
      x: updated.position.x + updated.velocity.x * deltaTime,
      y: updated.position.y + updated.velocity.y * deltaTime,
    };

    this.handleBoundaries(updated, screenWidth, screenHeight);

    const speed = Math.sqrt(updated.velocity.x ** 2 + updated.velocity.y ** 2);
    if (speed > 0.1 && !updated.isResting) {
      const targetRotation = Math.atan2(updated.velocity.y, updated.velocity.x);
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, 0.1);
    }

    updated.wingPhase = (updated.wingPhase + this.WING_FLAP_SPEED * deltaTime * 0.1) % (Math.PI * 2);

    if (Math.random() < 0.1 && !updated.isResting) {
      updated.dustParticles.push({ ...updated.position });
      if (updated.dustParticles.length > this.DUST_PARTICLE_MAX) {
        updated.dustParticles.shift();
      }
    }

    updated.lifetime += deltaTime;

    return updated;
  }

  static findLightSource(screenWidth: number, screenHeight: number): Vector2D {
    return { x: screenWidth / 2, y: screenHeight * 0.15 };
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

  static handleBoundaries(moth: Moth, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (moth.position.x < margin) {
      moth.position.x = margin;
      moth.velocity.x = Math.abs(moth.velocity.x);
    } else if (moth.position.x > screenWidth - margin) {
      moth.position.x = screenWidth - margin;
      moth.velocity.x = -Math.abs(moth.velocity.x);
    }

    if (moth.position.y < margin) {
      moth.position.y = margin;
      moth.velocity.y = Math.abs(moth.velocity.y);
    } else if (moth.position.y > screenHeight - margin) {
      moth.position.y = screenHeight - margin;
      moth.velocity.y = -Math.abs(moth.velocity.y);
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

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
