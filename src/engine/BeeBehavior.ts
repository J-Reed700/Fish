import type { Bee, Vector2D } from '../types';

export class BeeBehavior {
  static readonly COLLECTING_SPEED = 60;
  static readonly RETURNING_SPEED = 80;
  static readonly BUZZING_SPEED = 50;
  static readonly AGGRESSIVE_SPEED = 150;
  static readonly FLEE_SPEED = 180;
  static readonly BUZZ_AMPLITUDE = 3;
  static readonly BUZZ_FREQUENCY = 0.4;
  static readonly AGGRESSION_DISTANCE = 120;
  static readonly FLEE_DISTANCE = 80;
  static readonly WING_FLAP_SPEED = 100;
  static readonly BOUNDARY_MARGIN = 30;

  static update(
    bee: Bee,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Bee {
    const updated = { ...bee };
    updated.stateTimer -= 1;

    if (touchPosition) {
      const dist = this.distance(updated.position, touchPosition);

      if (dist < this.FLEE_DISTANCE && updated.state !== 'fleeing') {
        updated.state = 'fleeing';
        updated.stateTimer = 90;
        updated.isAggressive = false;
      } else if (dist < this.AGGRESSION_DISTANCE && updated.state === 'buzzing' && !updated.isAggressive) {
        updated.state = 'aggressive';
        updated.chargeTarget = { ...touchPosition };
        updated.isAggressive = true;
        updated.stateTimer = 60;
      }
    }

    switch (updated.state) {
      case 'collecting':
        if (updated.targetFlower) {
          const dist = this.distance(updated.position, updated.targetFlower);
          if (dist < 15) {
            updated.pollenCount++;
            if (updated.pollenCount >= 3) {
              updated.state = 'returning';
              updated.stateTimer = 300;
              updated.targetFlower = null;
            } else {
              updated.targetFlower = this.generateFlowerPosition(screenWidth, screenHeight);
            }
          }
          updated.velocity = this.calculateBuzzingVelocity(
            updated.position,
            updated.targetFlower,
            this.COLLECTING_SPEED,
            time,
            updated.buzzAmplitude,
            updated.buzzFrequency
          );
        } else if (updated.stateTimer <= 0) {
          updated.state = 'buzzing';
          updated.stateTimer = 120;
        }
        break;

      case 'returning':
        const exitPoint = this.getNearestExitPoint(updated.position, screenWidth, screenHeight);
        const distToExit = this.distance(updated.position, exitPoint);

        if (distToExit < 30 || updated.stateTimer <= 0) {
          updated.state = 'collecting';
          updated.targetFlower = this.generateFlowerPosition(screenWidth, screenHeight);
          updated.pollenCount = 0;
          updated.stateTimer = 300;
        }

        updated.velocity = this.calculateDirectVelocity(updated.position, exitPoint, this.RETURNING_SPEED);
        break;

      case 'buzzing':
        if (updated.stateTimer <= 0) {
          updated.state = 'collecting';
          updated.targetFlower = this.generateFlowerPosition(screenWidth, screenHeight);
          updated.stateTimer = 300;
        }

        updated.velocity = {
          x: Math.cos(time * 0.02) * this.BUZZING_SPEED + Math.sin(time * updated.buzzFrequency) * updated.buzzAmplitude,
          y: Math.sin(time * 0.03) * this.BUZZING_SPEED + Math.cos(time * updated.buzzFrequency) * updated.buzzAmplitude,
        };
        break;

      case 'aggressive':
        if (updated.chargeTarget) {
          const dist = this.distance(updated.position, updated.chargeTarget);
          if (dist < 20 || updated.stateTimer <= 0) {
            updated.state = 'fleeing';
            updated.stateTimer = 90;
            updated.chargeTarget = null;
          } else {
            updated.velocity = this.calculateDirectVelocity(
              updated.position,
              updated.chargeTarget,
              this.AGGRESSIVE_SPEED
            );
          }
        } else {
          updated.state = 'buzzing';
          updated.stateTimer = 120;
        }
        break;

      case 'fleeing':
        if (updated.stateTimer <= 0) {
          updated.state = 'buzzing';
          updated.stateTimer = 120;
          updated.isAggressive = false;
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
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, 0.15);
    }

    updated.wingPhase = (updated.wingPhase + this.WING_FLAP_SPEED * deltaTime * 0.1) % (Math.PI * 2);

    updated.lifetime += deltaTime;

    return updated;
  }

  static generateFlowerPosition(screenWidth: number, screenHeight: number): Vector2D {
    return {
      x: this.randomInRange(50, screenWidth - 50),
      y: this.randomInRange(50, screenHeight - 50),
    };
  }

  static getNearestExitPoint(position: Vector2D, screenWidth: number, screenHeight: number): Vector2D {
    const edges = [
      { x: position.x, y: -20 },
      { x: screenWidth + 20, y: position.y },
      { x: position.x, y: screenHeight + 20 },
      { x: -20, y: position.y },
    ];

    return edges.reduce((nearest, edge) => {
      const distToEdge = this.distance(position, edge);
      const distToNearest = this.distance(position, nearest);
      return distToEdge < distToNearest ? edge : nearest;
    });
  }

  static calculateBuzzingVelocity(
    from: Vector2D,
    to: Vector2D,
    speed: number,
    time: number,
    amplitude: number,
    frequency: number
  ): Vector2D {
    const baseVel = this.calculateDirectVelocity(from, to, speed);
    const perpAngle = Math.atan2(baseVel.y, baseVel.x) + Math.PI / 2;
    const buzzOffset = Math.sin(time * frequency) * amplitude;

    return {
      x: baseVel.x + Math.cos(perpAngle) * buzzOffset,
      y: baseVel.y + Math.sin(perpAngle) * buzzOffset,
    };
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

  static handleBoundaries(bee: Bee, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (bee.position.x < margin) {
      bee.position.x = margin;
      bee.velocity.x = Math.abs(bee.velocity.x);
    } else if (bee.position.x > screenWidth - margin) {
      bee.position.x = screenWidth - margin;
      bee.velocity.x = -Math.abs(bee.velocity.x);
    }

    if (bee.position.y < margin) {
      bee.position.y = margin;
      bee.velocity.y = Math.abs(bee.velocity.y);
    } else if (bee.position.y > screenHeight - margin) {
      bee.position.y = screenHeight - margin;
      bee.velocity.y = -Math.abs(bee.velocity.y);
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
