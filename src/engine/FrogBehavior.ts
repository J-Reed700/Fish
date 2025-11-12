import type { Frog, Vector2D } from '../types';

export class FrogBehavior {
  static readonly GRAVITY = 600;
  static readonly JUMP_HORIZONTAL_MIN = 200;
  static readonly JUMP_HORIZONTAL_MAX = 400;
  static readonly JUMP_VERTICAL_MIN = 150;
  static readonly JUMP_VERTICAL_MAX = 300;
  static readonly IDLE_MIN_DURATION = 3000;
  static readonly IDLE_MAX_DURATION = 8000;
  static readonly ANTICIPATION_DURATION = 400;
  static readonly LANDING_DURATION = 200;
  static readonly FLEE_JUMP_COUNT = 3;
  static readonly FLEE_DISTANCE = 200;
  static readonly THROAT_PULSE_SPEED = 0.1;
  static readonly BOUNDARY_MARGIN = 50;

  static update(
    frog: Frog,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Frog {
    const updated = { ...frog };
    const dt = deltaTime;

    updated.stateTimer -= deltaTime * 1000;
    updated.lifetime += deltaTime;

    if (touchPosition && updated.state !== 'fleeing' && updated.state !== 'jumping') {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE) {
        updated.state = 'fleeing';
        updated.stateTimer = 0;
      }
    }

    switch (updated.state) {
      case 'idle':
        this.updateIdleState(updated, time);
        break;
      case 'anticipating':
        this.updateAnticipatingState(updated);
        break;
      case 'jumping':
        this.updateJumpingState(updated, dt, screenHeight);
        break;
      case 'landing':
        this.updateLandingState(updated);
        break;
      case 'fleeing':
        this.updateFleeingState(updated, touchPosition);
        break;
    }

    this.handleBoundaries(updated, screenWidth, screenHeight);

    if (updated.state === 'jumping' && updated.velocity.x !== 0) {
      updated.rotation = Math.atan2(updated.velocity.y, updated.velocity.x);
    } else if (updated.isGrounded) {
      updated.rotation = 0;
    }

    if (touchPosition) {
      this.updateEyeTracking(updated, touchPosition);
    }

    return updated;
  }

  private static updateIdleState(frog: Frog, time: number): void {
    frog.velocity = { x: 0, y: 0 };
    frog.isGrounded = true;
    frog.legExtension = 0;

    frog.throatPhase = Math.sin(time * this.THROAT_PULSE_SPEED) * 0.5 + 0.5;

    if (frog.stateTimer <= 0) {
      frog.state = 'anticipating';
      frog.stateTimer = this.ANTICIPATION_DURATION;
      frog.anticipationProgress = 0;
    }
  }

  private static updateAnticipatingState(frog: Frog): void {
    frog.velocity = { x: 0, y: 0 };
    frog.anticipationProgress = 1 - frog.stateTimer / this.ANTICIPATION_DURATION;
    frog.legExtension = -frog.anticipationProgress * 0.3;

    if (frog.stateTimer <= 0) {
      this.initiateJump(frog);
    }
  }

  private static initiateJump(frog: Frog): void {
    const horizontalDistance =
      this.JUMP_HORIZONTAL_MIN + Math.random() * (this.JUMP_HORIZONTAL_MAX - this.JUMP_HORIZONTAL_MIN);
    const verticalDistance =
      this.JUMP_VERTICAL_MIN + Math.random() * (this.JUMP_VERTICAL_MAX - this.JUMP_VERTICAL_MIN);

    const direction = Math.random() < 0.5 ? -1 : 1;

    const timeToApex = Math.sqrt((2 * verticalDistance) / this.GRAVITY);
    const horizontalVelocity = horizontalDistance / (2 * timeToApex) * direction;
    const verticalVelocity = -Math.sqrt(2 * this.GRAVITY * verticalDistance);

    frog.jumpVelocity = { x: horizontalVelocity, y: verticalVelocity };
    frog.velocity = { ...frog.jumpVelocity };
    frog.state = 'jumping';
    frog.isGrounded = false;
    frog.legExtension = 1;
  }

  private static updateJumpingState(frog: Frog, deltaTime: number, screenHeight: number): void {
    frog.velocity.y += this.GRAVITY * deltaTime;

    frog.position.x += frog.velocity.x * deltaTime;
    frog.position.y += frog.velocity.y * deltaTime;

    const groundLevel = screenHeight - this.BOUNDARY_MARGIN;
    if (frog.position.y >= groundLevel && frog.velocity.y > 0) {
      frog.position.y = groundLevel;
      frog.velocity = { x: 0, y: 0 };
      frog.isGrounded = true;
      frog.state = 'landing';
      frog.stateTimer = this.LANDING_DURATION;
    }
  }

  private static updateLandingState(frog: Frog): void {
    frog.velocity = { x: 0, y: 0 };
    frog.legExtension = frog.stateTimer / this.LANDING_DURATION;

    if (frog.stateTimer <= 0) {
      frog.state = 'idle';
      frog.idleDuration =
        this.IDLE_MIN_DURATION + Math.random() * (this.IDLE_MAX_DURATION - this.IDLE_MIN_DURATION);
      frog.stateTimer = frog.idleDuration;
      frog.legExtension = 0;
    }
  }

  private static updateFleeingState(frog: Frog, touchPosition: Vector2D | null): void {
    if (frog.isGrounded && frog.stateTimer <= 0) {
      if (touchPosition) {
        const dx = frog.position.x - touchPosition.x;
        const direction = dx > 0 ? 1 : -1;

        const horizontalVelocity = (this.JUMP_HORIZONTAL_MAX * 0.8) * direction;
        const verticalVelocity = -Math.sqrt(2 * this.GRAVITY * this.JUMP_VERTICAL_MIN);

        frog.jumpVelocity = { x: horizontalVelocity, y: verticalVelocity };
        frog.velocity = { ...frog.jumpVelocity };
        frog.state = 'jumping';
        frog.isGrounded = false;
        frog.legExtension = 1;
      }
    }
  }

  private static updateEyeTracking(frog: Frog, touchPosition: Vector2D): void {
    const dx = touchPosition.x - frog.position.x;
    const dy = touchPosition.y - frog.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0.1) {
      frog.eyeDirection = {
        x: (dx / dist) * 0.3,
        y: (dy / dist) * 0.3,
      };
    }
  }

  private static handleBoundaries(frog: Frog, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (frog.position.x < margin) {
      frog.position.x = margin;
      if (frog.velocity.x < 0) frog.velocity.x = 0;
    } else if (frog.position.x > screenWidth - margin) {
      frog.position.x = screenWidth - margin;
      if (frog.velocity.x > 0) frog.velocity.x = 0;
    }

    if (frog.position.y < margin) {
      frog.position.y = margin;
      if (frog.velocity.y < 0) frog.velocity.y = 0;
    }

    const groundLevel = screenHeight - margin;
    if (frog.position.y > groundLevel) {
      frog.position.y = groundLevel;
      frog.isGrounded = true;
    }
  }

  private static distance(a: Vector2D, b: Vector2D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
