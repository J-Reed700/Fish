import type { Dragonfly, Vector2D } from '../types';

export class DragonflyBehavior {
  static readonly HOVER_SPEED = 0;
  static readonly DART_SPEED = 250;
  static readonly PATROL_SPEED = 120;
  static readonly FLEE_SPEED = 300;
  static readonly HOVER_MIN_DURATION = 60;
  static readonly HOVER_MAX_DURATION = 180;
  static readonly DART_PROBABILITY = 0.02;
  static readonly FLEE_DISTANCE = 100;
  static readonly WING_FLAP_HOVER = 20;
  static readonly WING_FLAP_ACTIVE = 50;
  static readonly TURN_SPEED = 1.0;
  static readonly BOUNDARY_MARGIN = 40;

  static update(
    dragonfly: Dragonfly,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Dragonfly {
    const updated = { ...dragonfly };
    updated.stateTimer -= 1;

    if (touchPosition && updated.state !== 'fleeing') {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE) {
        updated.state = 'fleeing';
        updated.stateTimer = 120;
        updated.dartTarget = null;
      }
    }

    switch (updated.state) {
      case 'hovering':
        if (updated.stateTimer <= 0 || (Math.random() < this.DART_PROBABILITY && updated.stateTimer < 30)) {
          updated.state = 'darting';
          updated.dartTarget = this.generateDartTarget(screenWidth, screenHeight);
          updated.stateTimer = 300;
        }
        updated.velocity = { x: 0, y: Math.sin(time * 0.05) * 2 };
        break;

      case 'darting':
        if (updated.dartTarget) {
          const dist = this.distance(updated.position, updated.dartTarget);
          if (dist < 20 || updated.stateTimer <= 0) {
            updated.state = 'hovering';
            updated.hoverDuration = this.randomInRange(this.HOVER_MIN_DURATION, this.HOVER_MAX_DURATION);
            updated.stateTimer = updated.hoverDuration;
            updated.dartTarget = null;
          } else {
            updated.velocity = this.calculateDirectVelocity(updated.position, updated.dartTarget, this.DART_SPEED);
          }
        } else {
          updated.state = 'hovering';
          updated.stateTimer = this.HOVER_MIN_DURATION;
        }
        break;

      case 'patrolling':
        if (updated.patrolPath.length === 0 || updated.stateTimer <= 0) {
          updated.state = 'hovering';
          updated.stateTimer = this.HOVER_MIN_DURATION;
        } else {
          const targetIdx = Math.floor(time * 0.01) % updated.patrolPath.length;
          const target = updated.patrolPath[targetIdx];
          updated.velocity = this.calculateDirectVelocity(updated.position, target, this.PATROL_SPEED);
        }
        break;

      case 'fleeing':
        if (updated.stateTimer <= 0) {
          updated.state = 'hovering';
          updated.stateTimer = this.HOVER_MIN_DURATION;
        } else if (touchPosition) {
          updated.velocity = this.calculateFleeVelocity(updated.position, touchPosition, this.FLEE_SPEED);

          const zigzag = Math.sin(time * 0.3) * 40;
          updated.velocity.x += zigzag;
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
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, this.TURN_SPEED);
    }

    const wingSpeed = updated.state === 'hovering' ? this.WING_FLAP_HOVER : this.WING_FLAP_ACTIVE;
    for (let i = 0; i < 4; i++) {
      updated.wingPhases[i] = (updated.wingPhases[i] + wingSpeed * deltaTime * 0.1 + i * 0.5) % (Math.PI * 2);
    }

    updated.lifetime += deltaTime;

    return updated;
  }

  static generateDartTarget(screenWidth: number, screenHeight: number): Vector2D {
    const margin = this.BOUNDARY_MARGIN;
    return {
      x: this.randomInRange(margin, screenWidth - margin),
      y: this.randomInRange(margin, screenHeight - margin),
    };
  }

  static generatePatrolPath(screenWidth: number, screenHeight: number): Vector2D[] {
    const points: Vector2D[] = [];
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    const radius = Math.min(screenWidth, screenHeight) * 0.3;

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    }

    return points;
  }

  static calculateDirectVelocity(from: Vector2D, to: Vector2D, speed: number): Vector2D {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.1) {
      return { x: 0, y: 0 };
    }

    return {
      x: (dx / dist) * speed,
      y: (dy / dist) * speed,
    };
  }

  static calculateFleeVelocity(position: Vector2D, threat: Vector2D, speed: number): Vector2D {
    const dx = position.x - threat.x;
    const dy = position.y - threat.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.1) {
      return { x: 0, y: -speed };
    }

    return {
      x: (dx / dist) * speed,
      y: (dy / dist) * speed,
    };
  }

  static handleBoundaries(dragonfly: Dragonfly, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (dragonfly.position.x < margin) {
      dragonfly.position.x = margin;
      dragonfly.velocity.x = Math.abs(dragonfly.velocity.x);
    } else if (dragonfly.position.x > screenWidth - margin) {
      dragonfly.position.x = screenWidth - margin;
      dragonfly.velocity.x = -Math.abs(dragonfly.velocity.x);
    }

    if (dragonfly.position.y < margin) {
      dragonfly.position.y = margin;
      dragonfly.velocity.y = Math.abs(dragonfly.velocity.y);
    } else if (dragonfly.position.y > screenHeight - margin) {
      dragonfly.position.y = screenHeight - margin;
      dragonfly.velocity.y = -Math.abs(dragonfly.velocity.y);
    }
  }

  private static distance(a: Vector2D, b: Vector2D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
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
