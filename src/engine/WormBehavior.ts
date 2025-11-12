import type { Worm, WormSegment, Vector2D } from '../types';

export class WormBehavior {
  static readonly WIGGLE_SPEED = 40;
  static readonly STRETCH_SPEED = 60;
  static readonly CONTRACT_SPEED = 30;
  static readonly BURROW_SPEED = 40;
  static readonly FLEE_SPEED = 100;

  static readonly WAVE_AMPLITUDE_MIN = 6;
  static readonly WAVE_AMPLITUDE_MAX = 10;
  static readonly WAVE_FREQUENCY = 0.15;
  static readonly WAVE_SPEED = 2.0;

  static readonly STRETCH_FACTOR_MAX = 1.5;
  static readonly CONTRACT_FACTOR_MIN = 0.7;

  static readonly STATE_DURATION_MIN = 2000;
  static readonly STATE_DURATION_MAX = 5000;
  static readonly FLEE_DURATION = 2000;
  static readonly BURROW_DISTANCE_THRESHOLD = 30;

  static readonly EDGE_MARGIN = 50;
  static readonly FLEE_DISTANCE = 120;

  static readonly CONSTRAINT_STIFFNESS = 0.5;
  static readonly DAMPING = 0.98;

  static update(
    worm: Worm,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null
  ): Worm {
    const updated = { ...worm };
    updated.stateTimer -= deltaTime * 1000;

    if (touchPosition && updated.state !== 'fleeing') {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE) {
        updated.state = 'fleeing';
        updated.stateTimer = this.FLEE_DURATION;

        const dx = updated.position.x - touchPosition.x;
        const dy = updated.position.y - touchPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          updated.targetDirection = { x: dx / dist, y: dy / dist };
        }
      }
    }

    if (updated.stateTimer <= 0) {
      updated.stateTimer = this.STATE_DURATION_MIN + Math.random() * (this.STATE_DURATION_MAX - this.STATE_DURATION_MIN);

      const atEdge = this.isNearEdge(updated.position, screenWidth, screenHeight);

      if (atEdge && Math.random() < 0.4) {
        updated.state = 'burrowing';
        updated.targetDirection = this.getEdgeDirection(updated.position, screenWidth, screenHeight);
      } else {
        const states: Array<'wiggling' | 'stretching' | 'contracting'> = ['wiggling', 'stretching', 'contracting'];
        updated.state = states[Math.floor(Math.random() * states.length)];

        const angle = Math.random() * Math.PI * 2;
        updated.targetDirection = { x: Math.cos(angle), y: Math.sin(angle) };
      }
    }

    this.updateMovement(updated, deltaTime);
    this.updateSegments(updated, deltaTime);
    this.handleBoundaries(updated, screenWidth, screenHeight);

    updated.wavePhase += this.WAVE_SPEED * deltaTime;
    updated.lifetime += deltaTime;

    return updated;
  }

  private static updateMovement(worm: Worm, deltaTime: number): void {
    let speed = 0;

    switch (worm.state) {
      case 'wiggling':
        speed = this.WIGGLE_SPEED;
        worm.stretchFactor = 1.0;
        worm.waveAmplitude = this.WAVE_AMPLITUDE_MAX;
        break;

      case 'stretching':
        speed = this.STRETCH_SPEED;
        worm.stretchFactor = Math.min(worm.stretchFactor + deltaTime * 0.5, this.STRETCH_FACTOR_MAX);
        worm.waveAmplitude = this.WAVE_AMPLITUDE_MIN;
        break;

      case 'contracting':
        speed = this.CONTRACT_SPEED;
        worm.stretchFactor = Math.max(worm.stretchFactor - deltaTime * 0.5, this.CONTRACT_FACTOR_MIN);
        worm.waveAmplitude = this.WAVE_AMPLITUDE_MIN;
        break;

      case 'burrowing':
        speed = this.BURROW_SPEED;
        worm.stretchFactor = 1.0;
        worm.waveAmplitude = this.WAVE_AMPLITUDE_MIN * 0.5;
        break;

      case 'fleeing':
        speed = this.FLEE_SPEED;
        worm.stretchFactor = Math.min(worm.stretchFactor + deltaTime * 1.0, this.STRETCH_FACTOR_MAX);
        worm.waveAmplitude = this.WAVE_AMPLITUDE_MAX * 1.5;
        break;
    }

    worm.velocity.x = worm.targetDirection.x * speed;
    worm.velocity.y = worm.targetDirection.y * speed;

    worm.position.x += worm.velocity.x * deltaTime;
    worm.position.y += worm.velocity.y * deltaTime;

    const angle = Math.atan2(worm.velocity.y, worm.velocity.x);
    worm.rotation = angle;
  }

  private static updateSegments(worm: Worm, deltaTime: number): void {
    if (worm.segments.length === 0) return;

    worm.segments[0].position.x = worm.position.x;
    worm.segments[0].position.y = worm.position.y;

    for (let i = 1; i < worm.segments.length; i++) {
      const segment = worm.segments[i];
      const previous = worm.segments[i - 1];

      const velocityX = segment.position.x - segment.previousPosition.x;
      const velocityY = segment.position.y - segment.previousPosition.y;

      segment.previousPosition.x = segment.position.x;
      segment.previousPosition.y = segment.position.y;

      segment.position.x += velocityX * this.DAMPING;
      segment.position.y += velocityY * this.DAMPING;

      const dx = segment.position.x - previous.position.x;
      const dy = segment.position.y - previous.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const targetDistance = worm.segmentDistance * worm.stretchFactor;

      if (distance > 0.001) {
        const difference = targetDistance - distance;
        const offsetX = (dx / distance) * difference * this.CONSTRAINT_STIFFNESS;
        const offsetY = (dy / distance) * difference * this.CONSTRAINT_STIFFNESS;

        segment.position.x += offsetX;
        segment.position.y += offsetY;
        previous.position.x -= offsetX;
        previous.position.y -= offsetY;
      }

      const perpX = -dy / (distance + 0.001);
      const perpY = dx / (distance + 0.001);

      const waveOffset = Math.sin(worm.wavePhase + i * 0.5) * worm.waveAmplitude;

      segment.position.x += perpX * waveOffset * deltaTime * 60;
      segment.position.y += perpY * waveOffset * deltaTime * 60;

      segment.velocity.x = velocityX;
      segment.velocity.y = velocityY;
    }
  }

  private static isNearEdge(position: Vector2D, screenWidth: number, screenHeight: number): boolean {
    return (
      position.x < this.EDGE_MARGIN ||
      position.x > screenWidth - this.EDGE_MARGIN ||
      position.y < this.EDGE_MARGIN ||
      position.y > screenHeight - this.EDGE_MARGIN
    );
  }

  private static getEdgeDirection(position: Vector2D, screenWidth: number, screenHeight: number): Vector2D {
    const distToLeft = position.x;
    const distToRight = screenWidth - position.x;
    const distToTop = position.y;
    const distToBottom = screenHeight - position.y;

    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    if (minDist === distToLeft) return { x: -1, y: 0 };
    if (minDist === distToRight) return { x: 1, y: 0 };
    if (minDist === distToTop) return { x: 0, y: -1 };
    return { x: 0, y: 1 };
  }

  private static handleBoundaries(worm: Worm, screenWidth: number, screenHeight: number): void {
    const margin = 10;

    if (worm.position.x < margin) {
      worm.position.x = margin;
      worm.velocity.x = Math.abs(worm.velocity.x);
    } else if (worm.position.x > screenWidth - margin) {
      worm.position.x = screenWidth - margin;
      worm.velocity.x = -Math.abs(worm.velocity.x);
    }

    if (worm.position.y < margin) {
      worm.position.y = margin;
      worm.velocity.y = Math.abs(worm.velocity.y);
    } else if (worm.position.y > screenHeight - margin) {
      worm.position.y = screenHeight - margin;
      worm.velocity.y = -Math.abs(worm.velocity.y);
    }

    for (const segment of worm.segments) {
      if (segment.position.x < 0) segment.position.x = 0;
      if (segment.position.x > screenWidth) segment.position.x = screenWidth;
      if (segment.position.y < 0) segment.position.y = 0;
      if (segment.position.y > screenHeight) segment.position.y = screenHeight;
    }
  }

  private static distance(a: Vector2D, b: Vector2D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
