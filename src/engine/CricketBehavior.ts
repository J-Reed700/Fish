import type { Cricket, Vector2D } from '../types';

export class CricketBehavior {
  static readonly CRAWL_SPEED = 30;
  static readonly JUMP_SPEED_HORIZONTAL_MIN = 150;
  static readonly JUMP_SPEED_HORIZONTAL_MAX = 250;
  static readonly JUMP_SPEED_VERTICAL_MIN = 100;
  static readonly JUMP_SPEED_VERTICAL_MAX = 180;
  static readonly GRAVITY = 500;
  static readonly PREPARE_DURATION = 0.2;
  static readonly LANDING_DURATION = 0.1;
  static readonly JUMP_INTERVAL_MIN = 1.5;
  static readonly JUMP_INTERVAL_MAX = 4.0;
  static readonly LEG_ANIMATION_SPEED = 10;
  static readonly ANTENNA_ANIMATION_SPEED = 8;
  static readonly FLEE_JUMP_COUNT = 3;
  static readonly FLEE_DISTANCE = 100;
  static readonly GROUND_THRESHOLD = 10;

  static update(
    cricket: Cricket,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null
  ): Cricket {
    const updated = { ...cricket };

    updated.stateTimer -= deltaTime;

    const groundY = screenHeight - 20;
    updated.isGrounded = Math.abs(updated.position.y - groundY) < this.GROUND_THRESHOLD;

    if (touchPosition && updated.state !== 'fleeing') {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE) {
        updated.state = 'fleeing';
        updated.stateTimer = this.FLEE_JUMP_COUNT;
      }
    }

    switch (updated.state) {
      case 'crawling':
        this.updateCrawling(updated, deltaTime, screenWidth, screenHeight);
        break;
      case 'preparing':
        this.updatePreparing(updated, deltaTime, screenWidth, screenHeight);
        break;
      case 'jumping':
        this.updateJumping(updated, deltaTime, screenWidth, screenHeight);
        break;
      case 'landing':
        this.updateLanding(updated, deltaTime, screenWidth, screenHeight);
        break;
      case 'fleeing':
        this.updateFleeing(updated, deltaTime, screenWidth, screenHeight, touchPosition);
        break;
    }

    this.updateAnimations(updated, deltaTime);
    this.constrainToBounds(updated, screenWidth, screenHeight);

    updated.lifetime += deltaTime;

    return updated;
  }

  private static updateCrawling(
    cricket: Cricket,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    if (cricket.stateTimer <= 0) {
      cricket.state = 'preparing';
      cricket.stateTimer = this.PREPARE_DURATION;

      const angle = -Math.PI / 4 - Math.random() * Math.PI / 4;
      cricket.targetJumpDirection = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };

      cricket.stateTimer =
        this.JUMP_INTERVAL_MIN +
        Math.random() * (this.JUMP_INTERVAL_MAX - this.JUMP_INTERVAL_MIN);
    }

    const direction = Math.random() > 0.5 ? 1 : -1;
    cricket.velocity = {
      x: direction * this.CRAWL_SPEED,
      y: 0,
    };

    cricket.position.x += cricket.velocity.x * deltaTime;

    const groundY = screenHeight - 20;
    cricket.position.y = groundY;

    if (cricket.velocity.x !== 0) {
      cricket.rotation = cricket.velocity.x > 0 ? 0 : Math.PI;
    }
  }

  private static updatePreparing(
    cricket: Cricket,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    cricket.velocity = { x: 0, y: 0 };

    if (cricket.stateTimer <= 0) {
      cricket.state = 'jumping';

      const horizontalSpeed =
        this.JUMP_SPEED_HORIZONTAL_MIN +
        Math.random() * (this.JUMP_SPEED_HORIZONTAL_MAX - this.JUMP_SPEED_HORIZONTAL_MIN);

      const verticalSpeed =
        this.JUMP_SPEED_VERTICAL_MIN +
        Math.random() * (this.JUMP_SPEED_VERTICAL_MAX - this.JUMP_SPEED_VERTICAL_MIN);

      const direction = cricket.targetJumpDirection || { x: 1, y: -1 };

      cricket.jumpVelocity = {
        x: direction.x * horizontalSpeed,
        y: -verticalSpeed,
      };

      cricket.velocity = { ...cricket.jumpVelocity };
      cricket.isGrounded = false;
    }
  }

  private static updateJumping(
    cricket: Cricket,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    cricket.velocity.y += cricket.gravity * deltaTime;

    cricket.position.x += cricket.velocity.x * deltaTime;
    cricket.position.y += cricket.velocity.y * deltaTime;

    const groundY = screenHeight - 20;
    if (cricket.position.y >= groundY) {
      cricket.position.y = groundY;
      cricket.velocity = { x: 0, y: 0 };
      cricket.isGrounded = true;
      cricket.state = 'landing';
      cricket.stateTimer = this.LANDING_DURATION;
    }

    const angle = Math.atan2(cricket.velocity.y, cricket.velocity.x);
    cricket.rotation = angle;
  }

  private static updateLanding(
    cricket: Cricket,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    cricket.velocity = { x: 0, y: 0 };

    if (cricket.stateTimer <= 0) {
      cricket.state = 'crawling';
      cricket.stateTimer =
        this.JUMP_INTERVAL_MIN +
        Math.random() * (this.JUMP_INTERVAL_MAX - this.JUMP_INTERVAL_MIN);
    }

    cricket.rotation = 0;
  }

  private static updateFleeing(
    cricket: Cricket,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null
  ): void {
    if (cricket.isGrounded && cricket.stateTimer > 0) {
      cricket.state = 'preparing';
      cricket.stateTimer = this.PREPARE_DURATION * 0.5;

      if (touchPosition) {
        const dx = cricket.position.x - touchPosition.x;
        const dy = cricket.position.y - touchPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.1) {
          const normalizedX = dx / dist;
          const normalizedY = dy / dist;

          cricket.targetJumpDirection = {
            x: normalizedX,
            y: Math.min(-0.5, normalizedY),
          };
        }
      } else {
        const direction = Math.random() > 0.5 ? 1 : -1;
        cricket.targetJumpDirection = {
          x: direction,
          y: -1,
        };
      }

      cricket.stateTimer -= 1;
    } else if (!cricket.isGrounded) {
      this.updateJumping(cricket, deltaTime, screenWidth, screenHeight);
    } else if (cricket.stateTimer <= 0) {
      cricket.state = 'crawling';
      cricket.stateTimer =
        this.JUMP_INTERVAL_MIN +
        Math.random() * (this.JUMP_INTERVAL_MAX - this.JUMP_INTERVAL_MIN);
    }
  }

  private static updateAnimations(cricket: Cricket, deltaTime: number): void {
    if (cricket.state === 'crawling') {
      cricket.legPhase += deltaTime * this.LEG_ANIMATION_SPEED;
    } else if (cricket.state === 'jumping') {
      cricket.legPhase = 0;
    }

    cricket.antennaPhase += deltaTime * this.ANTENNA_ANIMATION_SPEED;
  }

  private static constrainToBounds(
    cricket: Cricket,
    screenWidth: number,
    screenHeight: number
  ): void {
    if (cricket.position.x < 20) {
      cricket.position.x = 20;
      if (cricket.state === 'jumping') {
        cricket.velocity.x = Math.abs(cricket.velocity.x);
      }
    }

    if (cricket.position.x > screenWidth - 20) {
      cricket.position.x = screenWidth - 20;
      if (cricket.state === 'jumping') {
        cricket.velocity.x = -Math.abs(cricket.velocity.x);
      }
    }

    const groundY = screenHeight - 20;
    if (cricket.position.y > groundY) {
      cricket.position.y = groundY;
    }

    if (cricket.position.y < 20) {
      cricket.position.y = 20;
      if (cricket.state === 'jumping') {
        cricket.velocity.y = Math.abs(cricket.velocity.y);
      }
    }
  }

  private static distance(a: Vector2D, b: Vector2D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
