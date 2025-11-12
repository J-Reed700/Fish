import type { Beetle, Vector2D } from '../types';

export class BeetleBehavior {
  static readonly WALKING_SPEED = 30;
  static readonly FLYING_SPEED = 80;
  static readonly FLEE_SPEED = 120;
  static readonly FLIP_DURATION = 180;
  static readonly UPSIDE_DOWN_CHANCE = 0.1;
  static readonly TAKEOFF_CHANCE = 0.01;
  static readonly LAND_CHANCE = 0.02;
  static readonly FLEE_DISTANCE = 70;
  static readonly WOBBLE_AMPLITUDE = 20;
  static readonly BOUNDARY_MARGIN = 35;

  static update(
    beetle: Beetle,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Beetle {
    const updated = { ...beetle };
    updated.stateTimer -= 1;

    if (touchPosition) {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE && updated.state !== 'fleeing' && updated.state !== 'upside-down') {
        updated.state = 'fleeing';
        updated.stateTimer = 150;
      }
    }

    switch (updated.state) {
      case 'walking':
        if (Math.random() < this.TAKEOFF_CHANCE && updated.stateTimer < 60) {
          updated.state = 'flying';
          updated.isFlying = true;
          updated.stateTimer = 300;
        }

        updated.velocity = {
          x: Math.cos(updated.rotation) * this.WALKING_SPEED,
          y: Math.sin(updated.rotation) * this.WALKING_SPEED,
        };

        if (Math.random() < 0.02) {
          updated.rotation += (Math.random() - 0.5) * 0.5;
        }
        break;

      case 'flying':
        if (Math.random() < this.LAND_CHANCE && updated.stateTimer < 200) {
          updated.state = 'landed';
          updated.isFlying = false;
          updated.stateTimer = 120;

          if (Math.random() < this.UPSIDE_DOWN_CHANCE) {
            updated.state = 'upside-down';
            updated.stateTimer = this.FLIP_DURATION;
            updated.flipProgress = 0;
          }
        }

        const wobble = Math.sin(time * 0.2 + updated.wobblePhase) * this.WOBBLE_AMPLITUDE;
        updated.velocity = {
          x: Math.cos(updated.rotation) * this.FLYING_SPEED + wobble,
          y: Math.sin(updated.rotation) * this.FLYING_SPEED + Math.sin(time * 0.15) * 10,
        };
        break;

      case 'landed':
        if (updated.stateTimer <= 0) {
          updated.state = 'walking';
          updated.stateTimer = 300;
        }
        updated.velocity = { x: 0, y: 0 };
        break;

      case 'upside-down':
        updated.flipProgress = Math.min(1, updated.flipProgress + deltaTime * 0.005);

        if (updated.stateTimer <= 0 || updated.flipProgress >= 1) {
          updated.state = 'walking';
          updated.stateTimer = 200;
          updated.flipProgress = 0;
        }

        updated.velocity = {
          x: Math.sin(time * 0.3) * 5,
          y: Math.cos(time * 0.25) * 5,
        };
        break;

      case 'fleeing':
        if (updated.stateTimer <= 0) {
          updated.state = updated.isFlying ? 'flying' : 'walking';
          updated.stateTimer = 200;
        } else if (touchPosition) {
          const fleeVel = this.calculateFleeVelocity(
            updated.position,
            touchPosition,
            updated.isFlying ? this.FLYING_SPEED * 1.5 : this.FLEE_SPEED
          );
          updated.velocity = fleeVel;
        }
        break;
    }

    updated.position = {
      x: updated.position.x + updated.velocity.x * deltaTime,
      y: updated.position.y + updated.velocity.y * deltaTime,
    };

    this.handleBoundaries(updated, screenWidth, screenHeight);

    const speed = Math.sqrt(updated.velocity.x ** 2 + updated.velocity.y ** 2);
    if (speed > 0.1 && updated.state !== 'upside-down') {
      const targetRotation = Math.atan2(updated.velocity.y, updated.velocity.x);
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, 0.08);
    }

    updated.shellOpen = this.lerp(updated.shellOpen, updated.isFlying ? 1 : 0, 0.1);
    updated.legPhase = (updated.legPhase + (updated.state === 'walking' ? 15 : 0) * deltaTime * 0.1) % (Math.PI * 2);
    updated.lifetime += deltaTime;

    return updated;
  }

  static handleBoundaries(beetle: Beetle, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (beetle.position.x < margin) {
      beetle.position.x = margin;
      beetle.velocity.x = Math.abs(beetle.velocity.x);
    } else if (beetle.position.x > screenWidth - margin) {
      beetle.position.x = screenWidth - margin;
      beetle.velocity.x = -Math.abs(beetle.velocity.x);
    }

    if (beetle.position.y < margin) {
      beetle.position.y = margin;
      beetle.velocity.y = Math.abs(beetle.velocity.y);
    } else if (beetle.position.y > screenHeight - margin) {
      beetle.position.y = screenHeight - margin;
      beetle.velocity.y = -Math.abs(beetle.velocity.y);
    }
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

  private static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private static lerpAngle(a: number, b: number, t: number): number {
    let diff = b - a;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return a + diff * t;
  }
}
