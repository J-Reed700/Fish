import type { Firefly, Vector2D } from '../types';

export class FireflyBehavior {
  static readonly FLOATING_SPEED = 25;
  static readonly FLEE_SPEED = 80;
  static readonly GLOW_CYCLE_DURATION = 120;
  static readonly FLASH_DURATION = 30;
  static readonly FLEE_DISTANCE = 70;
  static readonly FLOAT_AMPLITUDE = 15;
  static readonly WIND_INFLUENCE = 0.3;
  static readonly BOUNDARY_MARGIN = 30;

  static update(
    firefly: Firefly,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Firefly {
    const updated = { ...firefly };
    updated.stateTimer -= 1;

    if (touchPosition) {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE && updated.state !== 'fleeing') {
        updated.state = 'fleeing';
        updated.stateTimer = 100;
        updated.glowIntensity = 1;
      }
    }

    switch (updated.state) {
      case 'glowing':
        updated.glowIntensity = Math.abs(Math.sin(updated.glowPhase));

        if (updated.stateTimer <= 0) {
          updated.state = 'dark';
          updated.stateTimer = this.GLOW_CYCLE_DURATION;
          updated.glowIntensity = 0;
        }

        updated.velocity = this.calculateFloatVelocity(time, updated.floatAmplitude);
        break;

      case 'dark':
        updated.glowIntensity = 0;

        if (updated.stateTimer <= 0) {
          if (Math.random() < 0.3) {
            updated.state = 'flashing';
            updated.flashPattern = this.generateFlashPattern();
            updated.flashIndex = 0;
            updated.stateTimer = this.FLASH_DURATION * updated.flashPattern.length;
          } else {
            updated.state = 'glowing';
            updated.stateTimer = this.GLOW_CYCLE_DURATION;
          }
        }

        updated.velocity = this.calculateFloatVelocity(time, updated.floatAmplitude * 0.5);
        break;

      case 'floating':
        updated.glowIntensity = Math.abs(Math.sin(updated.glowPhase)) * 0.7;
        updated.velocity = this.calculateFloatVelocity(time, updated.floatAmplitude);

        if (Math.random() < 0.01) {
          updated.state = 'glowing';
          updated.stateTimer = this.GLOW_CYCLE_DURATION;
        }
        break;

      case 'flashing':
        const flashIdx = Math.floor((this.FLASH_DURATION * updated.flashPattern.length - updated.stateTimer) / this.FLASH_DURATION);
        updated.glowIntensity = updated.flashPattern[flashIdx] || 0;

        if (updated.stateTimer <= 0) {
          updated.state = 'floating';
          updated.stateTimer = 200;
        }

        updated.velocity = this.calculateFloatVelocity(time, updated.floatAmplitude * 0.3);
        break;

      case 'fleeing':
        updated.glowIntensity = 1;

        if (updated.stateTimer <= 0) {
          updated.state = 'floating';
          updated.stateTimer = 200;
        } else if (touchPosition) {
          updated.velocity = this.calculateFleeVelocity(updated.position, touchPosition, this.FLEE_SPEED);
        }
        break;
    }

    const wind = {
      x: Math.sin(time * 0.02) * this.WIND_INFLUENCE * 20,
      y: Math.cos(time * 0.015) * this.WIND_INFLUENCE * 10,
    };

    updated.position = {
      x: updated.position.x + (updated.velocity.x + wind.x) * deltaTime,
      y: updated.position.y + (updated.velocity.y + wind.y) * deltaTime,
    };

    this.handleBoundaries(updated, screenWidth, screenHeight);

    const speed = Math.sqrt(updated.velocity.x ** 2 + updated.velocity.y ** 2);
    if (speed > 0.1) {
      const targetRotation = Math.atan2(updated.velocity.y, updated.velocity.x);
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, 0.08);
    }

    updated.glowPhase = (updated.glowPhase + deltaTime * 0.05) % (Math.PI * 2);
    updated.lifetime += deltaTime;

    return updated;
  }

  static generateFlashPattern(): number[] {
    const patterns = [
      [1, 0, 1, 0, 1],
      [1, 1, 0, 0],
      [1, 0, 1, 0, 0, 1],
      [1, 1, 1, 0, 0],
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  static calculateFloatVelocity(time: number, amplitude: number): Vector2D {
    return {
      x: Math.cos(time * 0.02) * this.FLOATING_SPEED + Math.sin(time * 0.05) * amplitude,
      y: Math.sin(time * 0.025) * this.FLOATING_SPEED - 5 + Math.cos(time * 0.04) * amplitude,
    };
  }

  static calculateFleeVelocity(position: Vector2D, threat: Vector2D, speed: number): Vector2D {
    const dx = position.x - threat.x;
    const dy = position.y - threat.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.1) return { x: 0, y: -speed };
    return { x: (dx / dist) * speed, y: (dy / dist) * speed };
  }

  static handleBoundaries(firefly: Firefly, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (firefly.position.x < margin) {
      firefly.position.x = margin;
      firefly.velocity.x = Math.abs(firefly.velocity.x);
    } else if (firefly.position.x > screenWidth - margin) {
      firefly.position.x = screenWidth - margin;
      firefly.velocity.x = -Math.abs(firefly.velocity.x);
    }

    if (firefly.position.y < margin) {
      firefly.position.y = margin;
      firefly.velocity.y = Math.abs(firefly.velocity.y);
    } else if (firefly.position.y > screenHeight - margin) {
      firefly.position.y = screenHeight - margin;
      firefly.velocity.y = -Math.abs(firefly.velocity.y);
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
