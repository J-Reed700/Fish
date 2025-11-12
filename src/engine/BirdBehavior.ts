import type { Bird, Vector2D } from '../types';

export class BirdBehavior {
  static readonly BASE_SPEED = 100;
  static readonly FLEE_SPEED = 200;
  static readonly TAKEOFF_ACCELERATION = 300;
  static readonly PERCH_DURATION_MIN = 2000;
  static readonly PERCH_DURATION_MAX = 5000;
  static readonly TAKEOFF_DURATION = 0.3;
  static readonly BOB_FREQUENCY = 2;
  static readonly BOB_AMPLITUDE = 3;
  static readonly SINE_WAVE_AMPLITUDE = 30;
  static readonly SINE_WAVE_FREQUENCY = 0.02;
  static readonly DIRECTION_CHANGE_PROBABILITY = 0.01;
  static readonly FLEE_DISTANCE = 120;
  static readonly BOUNDARY_MARGIN = 50;
  static readonly TURN_SPEED = 0.08;
  static readonly WING_FLAP_FLYING = 12;
  static readonly WING_FLAP_FLEEING = 18;

  static update(
    bird: Bird,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Bird {
    const updated = { ...bird };

    updated.stateTimer -= deltaTime;

    if (touchPosition && updated.state !== 'fleeing') {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE) {
        updated.state = 'fleeing';
        updated.stateTimer = 3;
        updated.perchPosition = null;
      }
    }

    switch (updated.state) {
      case 'flying':
        this.updateFlying(updated, deltaTime, screenWidth, screenHeight, time);
        break;
      case 'perching':
        this.updatePerching(updated, deltaTime, screenWidth, screenHeight);
        break;
      case 'takeoff':
        this.updateTakeoff(updated, deltaTime, screenWidth, screenHeight);
        break;
      case 'fleeing':
        this.updateFleeing(updated, deltaTime, screenWidth, screenHeight, touchPosition);
        break;
    }

    this.handleBoundaries(updated, screenWidth, screenHeight);

    const speed = Math.sqrt(updated.velocity.x ** 2 + updated.velocity.y ** 2);
    if (speed > 0.1) {
      const targetRotation = Math.atan2(updated.velocity.y, updated.velocity.x);
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, this.TURN_SPEED);
    }

    const wingSpeedMultiplier =
      updated.state === 'fleeing' ? this.WING_FLAP_FLEEING :
      updated.state === 'perching' ? 0 :
      this.WING_FLAP_FLYING;

    updated.wingPhase += wingSpeedMultiplier * deltaTime;
    updated.bobPhase += deltaTime * this.BOB_FREQUENCY;

    updated.lifetime += deltaTime;

    return updated;
  }

  private static updateFlying(
    bird: Bird,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    time: number
  ): void {
    if (Math.random() < this.DIRECTION_CHANGE_PROBABILITY) {
      const angle = Math.random() * Math.PI * 2;
      bird.targetDirection = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };
    }

    const baseVelocity = {
      x: bird.targetDirection.x * this.BASE_SPEED,
      y: bird.targetDirection.y * this.BASE_SPEED,
    };

    const sineOffset = Math.sin(time * this.SINE_WAVE_FREQUENCY + bird.wingPhase) * this.SINE_WAVE_AMPLITUDE;
    const perpX = -bird.targetDirection.y;
    const perpY = bird.targetDirection.x;

    bird.velocity = {
      x: baseVelocity.x + perpX * sineOffset,
      y: baseVelocity.y + perpY * sineOffset,
    };

    bird.position.x += bird.velocity.x * deltaTime;
    bird.position.y += bird.velocity.y * deltaTime;

    if (Math.random() < 0.002 && this.isNearEdge(bird.position, screenWidth, screenHeight)) {
      this.initiatePerch(bird, screenWidth, screenHeight);
    }
  }

  private static updatePerching(
    bird: Bird,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    if (bird.perchPosition) {
      const bobOffset = Math.sin(bird.bobPhase) * this.BOB_AMPLITUDE;
      bird.position = {
        x: bird.perchPosition.x,
        y: bird.perchPosition.y + bobOffset,
      };
      bird.velocity = { x: 0, y: 0 };
    }

    if (bird.stateTimer <= 0) {
      bird.state = 'takeoff';
      bird.stateTimer = this.TAKEOFF_DURATION;

      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;
      const toCenterX = centerX - bird.position.x;
      const toCenterY = centerY - bird.position.y;
      const dist = Math.sqrt(toCenterX ** 2 + toCenterY ** 2);

      bird.targetDirection = dist > 0 ?
        { x: toCenterX / dist, y: toCenterY / dist } :
        { x: 1, y: 0 };
    }
  }

  private static updateTakeoff(
    bird: Bird,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    const progress = 1 - (bird.stateTimer / this.TAKEOFF_DURATION);
    const currentSpeed = this.BASE_SPEED + (this.TAKEOFF_ACCELERATION * progress);

    bird.velocity = {
      x: bird.targetDirection.x * currentSpeed,
      y: bird.targetDirection.y * currentSpeed,
    };

    bird.position.x += bird.velocity.x * deltaTime;
    bird.position.y += bird.velocity.y * deltaTime;

    if (bird.stateTimer <= 0) {
      bird.state = 'flying';
      bird.perchPosition = null;
    }
  }

  private static updateFleeing(
    bird: Bird,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null
  ): void {
    if (touchPosition) {
      const dx = bird.position.x - touchPosition.x;
      const dy = bird.position.y - touchPosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.1) {
        bird.targetDirection = {
          x: dx / dist,
          y: dy / dist,
        };
      }
    }

    const oppositeEdge = this.findOppositeEdge(bird.position, screenWidth, screenHeight);
    const edgeDx = oppositeEdge.x - bird.position.x;
    const edgeDy = oppositeEdge.y - bird.position.y;
    const edgeDist = Math.sqrt(edgeDx ** 2 + edgeDy ** 2);

    if (edgeDist > 0) {
      bird.targetDirection = {
        x: bird.targetDirection.x * 0.5 + (edgeDx / edgeDist) * 0.5,
        y: bird.targetDirection.y * 0.5 + (edgeDy / edgeDist) * 0.5,
      };

      const normDist = Math.sqrt(
        bird.targetDirection.x ** 2 + bird.targetDirection.y ** 2
      );
      if (normDist > 0) {
        bird.targetDirection.x /= normDist;
        bird.targetDirection.y /= normDist;
      }
    }

    bird.velocity = {
      x: bird.targetDirection.x * this.FLEE_SPEED,
      y: bird.targetDirection.y * this.FLEE_SPEED,
    };

    bird.position.x += bird.velocity.x * deltaTime;
    bird.position.y += bird.velocity.y * deltaTime;

    if (bird.stateTimer <= 0) {
      bird.state = 'flying';
    }
  }

  private static initiatePerch(bird: Bird, screenWidth: number, screenHeight: number): void {
    const edge = Math.floor(Math.random() * 3);

    switch (edge) {
      case 0:
        bird.perchPosition = {
          x: Math.random() * screenWidth,
          y: 20,
        };
        break;
      case 1:
        bird.perchPosition = {
          x: 20,
          y: Math.random() * screenHeight * 0.5,
        };
        break;
      case 2:
        bird.perchPosition = {
          x: screenWidth - 20,
          y: Math.random() * screenHeight * 0.5,
        };
        break;
    }

    bird.state = 'perching';
    bird.stateTimer =
      (this.PERCH_DURATION_MIN +
       Math.random() * (this.PERCH_DURATION_MAX - this.PERCH_DURATION_MIN)) / 1000;
  }

  private static isNearEdge(position: Vector2D, screenWidth: number, screenHeight: number): boolean {
    return (
      position.x < this.BOUNDARY_MARGIN ||
      position.x > screenWidth - this.BOUNDARY_MARGIN ||
      position.y < this.BOUNDARY_MARGIN ||
      position.y > screenHeight - this.BOUNDARY_MARGIN
    );
  }

  private static findOppositeEdge(
    position: Vector2D,
    screenWidth: number,
    screenHeight: number
  ): Vector2D {
    const toLeft = position.x;
    const toRight = screenWidth - position.x;
    const toTop = position.y;
    const toBottom = screenHeight - position.y;

    const minDist = Math.min(toLeft, toRight, toTop, toBottom);

    if (minDist === toLeft) return { x: screenWidth - 50, y: position.y };
    if (minDist === toRight) return { x: 50, y: position.y };
    if (minDist === toTop) return { x: position.x, y: screenHeight - 50 };
    return { x: position.x, y: 50 };
  }

  private static handleBoundaries(bird: Bird, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (bird.state !== 'perching') {
      if (bird.position.x < margin) {
        bird.position.x = margin;
        bird.velocity.x = Math.abs(bird.velocity.x);
      } else if (bird.position.x > screenWidth - margin) {
        bird.position.x = screenWidth - margin;
        bird.velocity.x = -Math.abs(bird.velocity.x);
      }

      if (bird.position.y < margin) {
        bird.position.y = margin;
        bird.velocity.y = Math.abs(bird.velocity.y);
      } else if (bird.position.y > screenHeight - margin) {
        bird.position.y = screenHeight - margin;
        bird.velocity.y = -Math.abs(bird.velocity.y);
      }
    }
  }

  private static lerpAngle(a: number, b: number, t: number): number {
    let diff = b - a;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return a + diff * t;
  }

  private static distance(a: Vector2D, b: Vector2D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
