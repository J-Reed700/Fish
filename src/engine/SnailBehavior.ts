import type { Snail, Vector2D } from '../types';

export class SnailBehavior {
  static readonly CRAWL_SPEED = 15;
  static readonly FLEE_SPEED = 30;
  static readonly HIDE_DURATION = 180;
  static readonly EATING_DURATION = 240;
  static readonly SLIME_TRAIL_LENGTH = 20;
  static readonly FLEE_DISTANCE = 50;
  static readonly WAVE_FREQUENCY = 0.1;
  static readonly WAVE_AMPLITUDE = 3;
  static readonly BOUNDARY_MARGIN = 25;

  static update(
    snail: Snail,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Snail {
    const updated = { ...snail };
    updated.stateTimer -= 1;

    if (touchPosition && !updated.isHiding) {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE) {
        updated.state = 'hiding';
        updated.isHiding = true;
        updated.stateTimer = this.HIDE_DURATION;
        updated.hideProgress = 0;
      }
    }

    switch (updated.state) {
      case 'crawling':
        if (Math.random() < 0.005 && updated.stateTimer < 60) {
          updated.state = 'eating';
          updated.stateTimer = this.EATING_DURATION;
        }

        const waveOffset = Math.sin(time * this.WAVE_FREQUENCY + updated.bodyWavePhase) * this.WAVE_AMPLITUDE;
        updated.velocity = {
          x: Math.cos(updated.rotation) * this.CRAWL_SPEED + waveOffset,
          y: Math.sin(updated.rotation) * this.CRAWL_SPEED,
        };

        if (Math.random() < 0.01) {
          updated.rotation += (Math.random() - 0.5) * 0.3;
        }
        break;

      case 'hiding':
        updated.hideProgress = Math.min(1, updated.hideProgress + deltaTime * 0.008);

        if (updated.stateTimer <= 0 && updated.hideProgress >= 0.9) {
          updated.state = 'crawling';
          updated.isHiding = false;
          updated.hideProgress = 1;
          updated.stateTimer = 300;
        }

        updated.velocity = { x: 0, y: 0 };
        break;

      case 'eating':
        if (updated.stateTimer <= 0) {
          updated.state = 'crawling';
          updated.stateTimer = 300;
        }
        updated.velocity = { x: 0, y: 0 };
        break;

      case 'fleeing':
        if (updated.stateTimer <= 0) {
          updated.state = 'crawling';
          updated.stateTimer = 200;
        } else if (touchPosition) {
          updated.velocity = this.calculateFleeVelocity(updated.position, touchPosition, this.FLEE_SPEED);
        }
        break;
    }

    if (!updated.isHiding) {
      updated.hideProgress = Math.max(0, updated.hideProgress - deltaTime * 0.01);
    }

    updated.position = {
      x: updated.position.x + updated.velocity.x * deltaTime,
      y: updated.position.y + updated.velocity.y * deltaTime,
    };

    this.handleBoundaries(updated, screenWidth, screenHeight);

    const speed = Math.sqrt(updated.velocity.x ** 2 + updated.velocity.y ** 2);
    if (speed > 0.1 && updated.state !== 'hiding') {
      const targetRotation = Math.atan2(updated.velocity.y, updated.velocity.x);
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, 0.05);
    }

    updated.slimeTrail.push({ ...updated.position });
    if (updated.slimeTrail.length > this.SLIME_TRAIL_LENGTH) {
      updated.slimeTrail.shift();
    }

    updated.bodyWavePhase = (updated.bodyWavePhase + deltaTime * 0.05) % (Math.PI * 2);

    const eyeDistance = 8;
    const eyeRetract = updated.isHiding ? updated.hideProgress : 0;
    updated.eyeStalks = [
      {
        x: updated.position.x + Math.cos(updated.rotation - 0.3) * eyeDistance * (1 - eyeRetract),
        y: updated.position.y + Math.sin(updated.rotation - 0.3) * eyeDistance * (1 - eyeRetract),
      },
      {
        x: updated.position.x + Math.cos(updated.rotation + 0.3) * eyeDistance * (1 - eyeRetract),
        y: updated.position.y + Math.sin(updated.rotation + 0.3) * eyeDistance * (1 - eyeRetract),
      },
    ];

    updated.lifetime += deltaTime;

    return updated;
  }

  static handleBoundaries(snail: Snail, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (snail.position.x < margin) {
      snail.position.x = margin;
      snail.velocity.x = Math.abs(snail.velocity.x);
      snail.rotation = 0;
    } else if (snail.position.x > screenWidth - margin) {
      snail.position.x = screenWidth - margin;
      snail.velocity.x = -Math.abs(snail.velocity.x);
      snail.rotation = Math.PI;
    }

    if (snail.position.y < margin) {
      snail.position.y = margin;
      snail.velocity.y = Math.abs(snail.velocity.y);
    } else if (snail.position.y > screenHeight - margin) {
      snail.position.y = screenHeight - margin;
      snail.velocity.y = -Math.abs(snail.velocity.y);
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

  private static lerpAngle(a: number, b: number, t: number): number {
    let diff = b - a;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return a + diff * t;
  }
}
