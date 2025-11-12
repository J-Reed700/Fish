import type { Fly, Vector2D } from '../types';

export class FlyBehavior {
  static readonly BUZZING_SPEED = 150;
  static readonly EVADING_SPEED = 250;
  static readonly FLEE_SPEED = 200;
  static readonly WALKING_SPEED = 20;
  static readonly DIRECTION_CHANGE_INTERVAL = 30;
  static readonly FLEE_DISTANCE = 80;
  static readonly REACTION_SPEED = 0.95;
  static readonly WING_FLAP_SPEED = 120;
  static readonly LEG_ANIMATION_SPEED = 25;
  static readonly BOUNDARY_MARGIN = 20;

  static update(
    fly: Fly,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Fly {
    const updated = { ...fly };
    updated.stateTimer -= 1;
    updated.directionChangeTimer -= 1;

    if (touchPosition && updated.state !== 'cleaning') {
      const dist = this.distance(updated.position, touchPosition);

      if (dist < this.FLEE_DISTANCE) {
        if (updated.state === 'landing' || updated.landingSurface) {
          updated.state = 'evading';
          updated.stateTimer = 60;
          updated.landingSurface = null;
        } else if (updated.state === 'buzzing') {
          updated.state = 'evading';
          updated.stateTimer = 60;
        }
      }
    }

    switch (updated.state) {
      case 'buzzing':
        if (updated.directionChangeTimer <= 0) {
          updated.directionChangeTimer = this.DIRECTION_CHANGE_INTERVAL + Math.random() * 20;
          updated.rotation = Math.random() * Math.PI * 2;
        }

        if (Math.random() < 0.01 && updated.stateTimer < 100) {
          updated.state = 'landing';
          updated.landingSurface = this.findNearestSurface(updated.position, screenWidth, screenHeight);
          updated.stateTimer = 180;
        }

        const zigzag = {
          x: Math.sin(time * 0.5) * 30,
          y: Math.cos(time * 0.6) * 30,
        };

        updated.velocity = {
          x: Math.cos(updated.rotation) * this.BUZZING_SPEED + zigzag.x,
          y: Math.sin(updated.rotation) * this.BUZZING_SPEED + zigzag.y,
        };
        break;

      case 'landing':
        if (updated.landingSurface) {
          const targetPos = this.getSurfacePosition(
            updated.position,
            updated.landingSurface,
            screenWidth,
            screenHeight
          );
          const dist = this.distance(updated.position, targetPos);

          if (dist < 15) {
            updated.state = 'cleaning';
            updated.stateTimer = 120;
            updated.cleaningProgress = 0;
          } else {
            updated.velocity = this.calculateDirectVelocity(updated.position, targetPos, this.BUZZING_SPEED * 0.7);
          }
        } else {
          updated.state = 'buzzing';
          updated.stateTimer = 200;
        }
        break;

      case 'cleaning':
        if (updated.stateTimer <= 0) {
          updated.state = 'buzzing';
          updated.landingSurface = null;
          updated.stateTimer = 200;
        }

        updated.cleaningProgress = (updated.cleaningProgress + 0.05) % 1;
        updated.velocity = { x: 0, y: 0 };
        updated.legPhase = (updated.legPhase + this.LEG_ANIMATION_SPEED * deltaTime * 0.1) % (Math.PI * 2);
        break;

      case 'evading':
        if (updated.stateTimer <= 0) {
          updated.state = 'buzzing';
          updated.stateTimer = 200;
        } else if (touchPosition) {
          const fleeVel = this.calculateFleeVelocity(updated.position, touchPosition, this.EVADING_SPEED);

          const erratic = {
            x: (Math.random() - 0.5) * 60,
            y: (Math.random() - 0.5) * 60,
          };

          updated.velocity = {
            x: fleeVel.x + erratic.x,
            y: fleeVel.y + erratic.y,
          };

          updated.directionChangeTimer = 5;
        }
        break;

      case 'fleeing':
        if (updated.stateTimer <= 0) {
          updated.state = 'buzzing';
          updated.stateTimer = 200;
        } else if (touchPosition) {
          updated.velocity = this.calculateFleeVelocity(updated.position, touchPosition, this.FLEE_SPEED);
        }
        break;
    }

    if (updated.landingSurface) {
      const surfacePos = this.getSurfacePosition(updated.position, updated.landingSurface, screenWidth, screenHeight);
      if (updated.state === 'cleaning') {
        updated.position = surfacePos;
      }
    }

    if (updated.state !== 'cleaning') {
      updated.position = {
        x: updated.position.x + updated.velocity.x * deltaTime,
        y: updated.position.y + updated.velocity.y * deltaTime,
      };
    }

    this.handleBoundaries(updated, screenWidth, screenHeight);

    const speed = Math.sqrt(updated.velocity.x ** 2 + updated.velocity.y ** 2);
    if (speed > 0.1 && updated.state !== 'cleaning') {
      const targetRotation = Math.atan2(updated.velocity.y, updated.velocity.x);
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, this.REACTION_SPEED);
    }

    updated.wingPhase = (updated.wingPhase + this.WING_FLAP_SPEED * deltaTime * 0.1) % (Math.PI * 2);
    updated.lifetime += deltaTime;

    return updated;
  }

  static findNearestSurface(
    position: Vector2D,
    screenWidth: number,
    screenHeight: number
  ): 'top' | 'bottom' | 'left' | 'right' {
    const distances = {
      top: position.y,
      bottom: screenHeight - position.y,
      left: position.x,
      right: screenWidth - position.x,
    };

    return Object.entries(distances).reduce((nearest, [surface, dist]) =>
      dist < distances[nearest as keyof typeof distances] ? surface : nearest
    ) as 'top' | 'bottom' | 'left' | 'right';
  }

  static getSurfacePosition(
    currentPos: Vector2D,
    surface: 'top' | 'bottom' | 'left' | 'right',
    screenWidth: number,
    screenHeight: number
  ): Vector2D {
    switch (surface) {
      case 'top':
        return { x: currentPos.x, y: 15 };
      case 'bottom':
        return { x: currentPos.x, y: screenHeight - 15 };
      case 'left':
        return { x: 15, y: currentPos.y };
      case 'right':
        return { x: screenWidth - 15, y: currentPos.y };
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
    if (dist < 0.1) return { x: speed, y: 0 };
    return { x: (dx / dist) * speed, y: (dy / dist) * speed };
  }

  static handleBoundaries(fly: Fly, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (fly.position.x < margin) {
      fly.position.x = margin;
      fly.velocity.x = Math.abs(fly.velocity.x);
    } else if (fly.position.x > screenWidth - margin) {
      fly.position.x = screenWidth - margin;
      fly.velocity.x = -Math.abs(fly.velocity.x);
    }

    if (fly.position.y < margin) {
      fly.position.y = margin;
      fly.velocity.y = Math.abs(fly.velocity.y);
    } else if (fly.position.y > screenHeight - margin) {
      fly.position.y = screenHeight - margin;
      fly.velocity.y = -Math.abs(fly.velocity.y);
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
