import type { Caterpillar, Vector2D, WormSegment } from '../types';

export class CaterpillarBehavior {
  static readonly CRAWL_SPEED = 25;
  static readonly FLEE_SPEED = 50;
  static readonly SEGMENT_DISTANCE = 8;
  static readonly STRETCH_SPEED = 0.02;
  static readonly CURL_SPEED = 0.05;
  static readonly FLEE_DISTANCE = 60;
  static readonly MUNCH_DURATION = 180;
  static readonly BOUNDARY_MARGIN = 30;

  static update(
    caterpillar: Caterpillar,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Caterpillar {
    const updated = { ...caterpillar };
    updated.stateTimer -= 1;

    if (touchPosition) {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE && updated.state !== 'curling' && updated.state !== 'fleeing') {
        updated.state = 'curling';
        updated.isCurled = true;
        updated.stateTimer = 120;
        updated.curlProgress = 0;
      }
    }

    switch (updated.state) {
      case 'crawling':
        if (Math.random() < 0.008 && updated.stateTimer < 60) {
          updated.state = 'munching';
          updated.stateTimer = this.MUNCH_DURATION;
        }

        updated.stretchProgress = (updated.stretchProgress + this.STRETCH_SPEED * deltaTime) % 1;

        const stretchMult = 0.5 + Math.sin(updated.stretchProgress * Math.PI) * 0.5;
        updated.velocity = {
          x: Math.cos(updated.rotation) * this.CRAWL_SPEED * stretchMult,
          y: Math.sin(updated.rotation) * this.CRAWL_SPEED * stretchMult,
        };

        if (Math.random() < 0.015) {
          updated.rotation += (Math.random() - 0.5) * 0.4;
        }
        break;

      case 'munching':
        if (updated.stateTimer <= 0) {
          updated.state = 'crawling';
          updated.stateTimer = 300;
        }

        updated.velocity = { x: 0, y: 0 };
        updated.munchPhase = (updated.munchPhase + 0.2) % (Math.PI * 2);
        break;

      case 'curling':
        updated.curlProgress = Math.min(1, updated.curlProgress + this.CURL_SPEED * deltaTime);

        if (updated.curlProgress >= 1 && updated.stateTimer <= 0) {
          updated.state = 'stretching';
          updated.stateTimer = 90;
        }

        updated.velocity = {
          x: updated.velocity.x * 0.9,
          y: updated.velocity.y * 0.9,
        };
        break;

      case 'stretching':
        updated.curlProgress = Math.max(0, updated.curlProgress - this.CURL_SPEED * deltaTime);

        if (updated.curlProgress <= 0) {
          updated.state = 'crawling';
          updated.isCurled = false;
          updated.stateTimer = 300;
        }
        break;

      case 'fleeing':
        if (updated.stateTimer <= 0) {
          updated.state = 'crawling';
          updated.stateTimer = 200;
        } else if (touchPosition) {
          updated.velocity = this.calculateFleeVelocity(updated.position, touchPosition, this.FLEE_SPEED);
        }

        updated.stretchProgress = (updated.stretchProgress + this.STRETCH_SPEED * deltaTime * 2) % 1;
        break;
    }

    updated.position = {
      x: updated.position.x + updated.velocity.x * deltaTime,
      y: updated.position.y + updated.velocity.y * deltaTime,
    };

    this.handleBoundaries(updated, screenWidth, screenHeight);

    this.updateSegments(updated, deltaTime);

    const speed = Math.sqrt(updated.velocity.x ** 2 + updated.velocity.y ** 2);
    if (speed > 0.1 && !updated.isCurled) {
      const targetRotation = Math.atan2(updated.velocity.y, updated.velocity.x);
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, 0.1);
    }

    updated.lifetime += deltaTime;

    return updated;
  }

  static updateSegments(caterpillar: Caterpillar, deltaTime: number): void {
    if (caterpillar.segments.length === 0) return;

    caterpillar.segments[0].position = { ...caterpillar.position };

    const effectiveDistance = caterpillar.isCurled
      ? this.SEGMENT_DISTANCE * (0.3 + caterpillar.curlProgress * 0.2)
      : this.SEGMENT_DISTANCE * (0.8 + Math.sin(caterpillar.stretchProgress * Math.PI) * 0.4);

    for (let i = 1; i < caterpillar.segments.length; i++) {
      const prev = caterpillar.segments[i - 1];
      const current = caterpillar.segments[i];

      const dx = current.position.x - prev.position.x;
      const dy = current.position.y - prev.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > effectiveDistance) {
        const ratio = effectiveDistance / dist;
        current.position = {
          x: prev.position.x + dx * ratio,
          y: prev.position.y + dy * ratio,
        };
      }

      if (caterpillar.isCurled) {
        const curlAngle = (i / caterpillar.segments.length) * Math.PI * 2 * caterpillar.curlProgress;
        const curlRadius = 20 * caterpillar.curlProgress;
        current.position = {
          x: caterpillar.position.x + Math.cos(curlAngle) * curlRadius,
          y: caterpillar.position.y + Math.sin(curlAngle) * curlRadius,
        };
      }
    }
  }

  static initializeSegments(count: number, position: Vector2D): WormSegment[] {
    const segments: WormSegment[] = [];
    for (let i = 0; i < count; i++) {
      segments.push({
        position: { x: position.x - i * this.SEGMENT_DISTANCE, y: position.y },
        previousPosition: { x: position.x - i * this.SEGMENT_DISTANCE, y: position.y },
        velocity: { x: 0, y: 0 },
      });
    }
    return segments;
  }

  static handleBoundaries(caterpillar: Caterpillar, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (caterpillar.position.x < margin) {
      caterpillar.position.x = margin;
      caterpillar.velocity.x = Math.abs(caterpillar.velocity.x);
    } else if (caterpillar.position.x > screenWidth - margin) {
      caterpillar.position.x = screenWidth - margin;
      caterpillar.velocity.x = -Math.abs(caterpillar.velocity.x);
    }

    if (caterpillar.position.y < margin) {
      caterpillar.position.y = margin;
      caterpillar.velocity.y = Math.abs(caterpillar.velocity.y);
    } else if (caterpillar.position.y > screenHeight - margin) {
      caterpillar.position.y = screenHeight - margin;
      caterpillar.velocity.y = -Math.abs(caterpillar.velocity.y);
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
