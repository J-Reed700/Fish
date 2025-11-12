import { Mouse } from '../entities/Mouse';
import { Vector2D } from '../types';
import { Vector } from './Vector';

export class MouseBehavior {
  private static readonly WANDER_DISTANCE = 50;
  private static readonly WANDER_RADIUS = 30;
  private static readonly WANDER_ANGLE_CHANGE = 0.3;
  private static readonly FLEE_RADIUS = 150;
  private static readonly FLEE_MULTIPLIER = 5.0;
  private static readonly FLEE_ESCAPE_DISTANCE = 200;
  private static readonly PAUSE_CHANCE = 0.02;
  private static readonly PAUSE_DURATION_MIN = 60;
  private static readonly PAUSE_DURATION_MAX = 90;

  static wander(mouse: Mouse): Vector2D {
    mouse.wanderAngle += (Math.random() - 0.5) * this.WANDER_ANGLE_CHANGE * 2;

    const velocityMag = Vector.magnitude(mouse.velocity);
    if (velocityMag < 0.1) {
      const randomAngle = Math.random() * Math.PI * 2;
      return Vector.fromAngle(randomAngle, this.WANDER_RADIUS);
    }

    const normalizedVelocity = Vector.normalize(mouse.velocity);
    const circleCenter = Vector.multiply(
      normalizedVelocity,
      this.WANDER_DISTANCE
    );

    const offset = {
      x: this.WANDER_RADIUS * Math.cos(mouse.wanderAngle),
      y: this.WANDER_RADIUS * Math.sin(mouse.wanderAngle),
    };

    return Vector.add(circleCenter, offset);
  }

  static flee(position: Vector2D, threat: Vector2D, maxSpeed: number): Vector2D {
    const desired = Vector.subtract(position, threat);
    const distance = Vector.magnitude(desired);

    if (distance === 0) return { x: 0, y: 0 };

    const normalized = Vector.normalize(desired);
    return Vector.multiply(normalized, maxSpeed);
  }

  static update(
    mice: Mouse[],
    deltaTime: number,
    bounds: { width: number; height: number },
    touchPosition: Vector2D | null = null
  ): Mouse[] {
    return mice
      .map((mouse) => {
        const newLifetime = mouse.lifetime + deltaTime;
        if (newLifetime > mouse.maxLifetime) return null;

        let updatedMouse = { ...mouse, lifetime: newLifetime };

        if (updatedMouse.state === 'paused') {
          updatedMouse.stateTimer -= deltaTime * 60;
          if (updatedMouse.stateTimer <= 0) {
            updatedMouse.state = 'scurrying';
            updatedMouse.stateTimer = 0;
          }
          return updatedMouse;
        }

        updatedMouse.acceleration = { x: 0, y: 0 };

        if (touchPosition) {
          const distance = Vector.distance(
            updatedMouse.position,
            touchPosition
          );

          if (distance < this.FLEE_RADIUS) {
            updatedMouse.state = 'fleeing';
            const fleeForce = this.flee(
              updatedMouse.position,
              touchPosition,
              updatedMouse.maxSpeed
            );

            const zigzagAngle = Math.sin(Date.now() * 0.01) * 0.5;
            const zigzagForce = {
              x: fleeForce.x * Math.cos(zigzagAngle) - fleeForce.y * Math.sin(zigzagAngle),
              y: fleeForce.x * Math.sin(zigzagAngle) + fleeForce.y * Math.cos(zigzagAngle),
            };

            updatedMouse.acceleration = Vector.add(
              updatedMouse.acceleration,
              Vector.multiply(zigzagForce, this.FLEE_MULTIPLIER)
            );
          } else if (
            updatedMouse.state === 'fleeing' &&
            distance > this.FLEE_ESCAPE_DISTANCE
          ) {
            updatedMouse.state = 'scurrying';
          }
        }

        if (updatedMouse.state === 'scurrying') {
          if (Math.random() < this.PAUSE_CHANCE) {
            updatedMouse.state = 'paused';
            updatedMouse.stateTimer =
              this.PAUSE_DURATION_MIN +
              Math.random() * (this.PAUSE_DURATION_MAX - this.PAUSE_DURATION_MIN);
            updatedMouse.velocity = { x: 0, y: 0 };
            return updatedMouse;
          }

          const wanderForce = this.wander(updatedMouse);
          updatedMouse.acceleration = Vector.add(
            updatedMouse.acceleration,
            wanderForce
          );
        }

        updatedMouse.velocity = Vector.add(
          updatedMouse.velocity,
          updatedMouse.acceleration
        );
        updatedMouse.velocity = Vector.limit(
          updatedMouse.velocity,
          updatedMouse.maxSpeed
        );

        updatedMouse.position = Vector.add(
          updatedMouse.position,
          Vector.multiply(updatedMouse.velocity, deltaTime)
        );

        if (
          updatedMouse.position.x < 0 ||
          updatedMouse.position.x > bounds.width ||
          updatedMouse.position.y < 0 ||
          updatedMouse.position.y > bounds.height
        ) {
          const center = {
            x: bounds.width / 2,
            y: bounds.height / 2,
          };
          const toCenter = Vector.subtract(center, updatedMouse.position);
          updatedMouse.velocity = Vector.normalize(toCenter);
          updatedMouse.velocity = Vector.multiply(updatedMouse.velocity, updatedMouse.maxSpeed);
        }

        if (Vector.magnitude(updatedMouse.velocity) > 0.1) {
          updatedMouse.rotation = Vector.angle(updatedMouse.velocity);
        }

        return updatedMouse;
      })
      .filter(Boolean) as Mouse[];
  }

  static handleTouch(
    mice: Mouse[],
    touchPoint: Vector2D,
    scareRadius: number = 150
  ): Mouse[] {
    return mice.map((mouse) => {
      const distance = Vector.distance(mouse.position, touchPoint);

      if (distance < scareRadius) {
        const direction = Vector.normalize(
          Vector.subtract(mouse.position, touchPoint)
        );

        return {
          ...mouse,
          state: 'fleeing',
          stateTimer: 0,
          velocity: Vector.multiply(direction, mouse.maxSpeed * 2),
        };
      }

      return mouse;
    });
  }
}
