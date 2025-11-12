import type { Cockroach, Vector2D } from '../types';

export class CockroachBehavior {
  static readonly BASE_SPEED = 80;
  static readonly MAX_SPEED = 200;
  static readonly DASH_SPEED = 300;
  static readonly DASH_PROBABILITY = 0.3;
  static readonly FREEZE_DURATION = 0.1;
  static readonly MIN_HIDE_DURATION = 2.0;
  static readonly MAX_HIDE_DURATION = 5.0;
  static readonly SCURRY_TURN_RATE = Math.PI * 2;
  static readonly DASH_TURN_RATE = Math.PI * 4;
  static readonly DIRECTION_CHANGE_INTERVAL = 0.8;
  static readonly PANIC_THRESHOLD = 0.5;
  static readonly PANIC_INCREASE_RATE = 2.0;
  static readonly PANIC_DECREASE_RATE = 0.5;
  static readonly THREAT_DISTANCE_IMMEDIATE = 50;
  static readonly THREAT_DISTANCE_NEAR = 100;
  static readonly EDGE_DETECTION_THRESHOLD = 10;
  static readonly EDGE_SEEK_PROBABILITY = 0.4;

  static update(
    cockroach: Cockroach,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null
  ): void {
    this.updatePanicLevel(cockroach, deltaTime, touchPosition);
    this.updateAntennaAndLegPhase(cockroach, deltaTime);

    cockroach.stateTimer -= deltaTime;

    switch (cockroach.state) {
      case 'scurrying':
        this.updateScurrying(cockroach, deltaTime, screenWidth, screenHeight, touchPosition);
        break;
      case 'frozen':
        this.updateFrozen(cockroach, deltaTime, screenWidth, screenHeight);
        break;
      case 'dashing':
        this.updateDashing(cockroach, deltaTime, screenWidth, screenHeight, touchPosition);
        break;
      case 'hiding':
        this.updateHiding(cockroach, deltaTime, screenWidth, screenHeight, touchPosition);
        break;
    }

    this.applyPhysics(cockroach, deltaTime);
    this.constrainToBounds(cockroach, screenWidth, screenHeight);
  }

  private static updateScurrying(
    cockroach: Cockroach,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null
  ): void {
    const threatDistance = touchPosition
      ? this.getDistance(cockroach.position, touchPosition)
      : Infinity;

    if (threatDistance < this.THREAT_DISTANCE_IMMEDIATE) {
      cockroach.state = 'frozen';
      cockroach.stateTimer = this.FREEZE_DURATION;
      cockroach.velocity.x = 0;
      cockroach.velocity.y = 0;
      return;
    }

    if (
      cockroach.panicLevel > this.PANIC_THRESHOLD &&
      Math.random() < this.EDGE_SEEK_PROBABILITY * deltaTime * 10
    ) {
      cockroach.state = 'dashing';
      cockroach.targetEdge = this.findNearestEdge(cockroach.position, screenWidth, screenHeight);
      cockroach.dashDirection = this.calculateDashDirection(
        cockroach.position,
        screenWidth,
        screenHeight,
        touchPosition,
        cockroach.targetEdge
      );
      cockroach.stateTimer = 3.0;
      return;
    }

    if (cockroach.stateTimer <= 0) {
      const direction = this.calculateScurryDirection(cockroach);
      const speedMultiplier = 1.0 + cockroach.panicLevel * 0.5;
      const targetSpeed = this.BASE_SPEED * speedMultiplier;

      cockroach.acceleration.x = direction.x * targetSpeed * 5;
      cockroach.acceleration.y = direction.y * targetSpeed * 5;

      cockroach.stateTimer = this.DIRECTION_CHANGE_INTERVAL * (0.8 + Math.random() * 0.4);
    }

    const currentSpeed = Math.sqrt(
      cockroach.velocity.x * cockroach.velocity.x + cockroach.velocity.y * cockroach.velocity.y
    );
    const speedMultiplier = 1.0 + cockroach.panicLevel * 0.5;
    cockroach.maxSpeed = this.BASE_SPEED * speedMultiplier;

    if (currentSpeed > 0) {
      cockroach.rotation = Math.atan2(cockroach.velocity.y, cockroach.velocity.x);
    }
  }

  private static updateFrozen(
    cockroach: Cockroach,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    if (cockroach.stateTimer <= 0) {
      cockroach.state = 'dashing';
      cockroach.targetEdge = this.findNearestEdge(cockroach.position, screenWidth, screenHeight);
      cockroach.dashDirection = this.calculateDashDirection(
        cockroach.position,
        screenWidth,
        screenHeight,
        null,
        cockroach.targetEdge
      );
      cockroach.stateTimer = 3.0;
    }
  }

  private static updateDashing(
    cockroach: Cockroach,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null
  ): void {
    if (!cockroach.dashDirection) {
      cockroach.dashDirection = this.calculateDashDirection(
        cockroach.position,
        screenWidth,
        screenHeight,
        touchPosition,
        cockroach.targetEdge
      );
    }

    if (
      cockroach.targetEdge &&
      this.isAtEdge(cockroach.position, cockroach.targetEdge, screenWidth, screenHeight)
    ) {
      this.snapToEdge(cockroach, cockroach.targetEdge, screenWidth, screenHeight);
      cockroach.state = 'hiding';
      cockroach.stateTimer =
        this.MIN_HIDE_DURATION +
        Math.random() * (this.MAX_HIDE_DURATION - this.MIN_HIDE_DURATION);
      cockroach.velocity.x = 0;
      cockroach.velocity.y = 0;
      cockroach.acceleration.x = 0;
      cockroach.acceleration.y = 0;
      return;
    }

    const speedMultiplier = 1.0 + cockroach.panicLevel * 0.8;
    const targetSpeed = this.DASH_SPEED * speedMultiplier;

    cockroach.acceleration.x = cockroach.dashDirection.x * targetSpeed * 8;
    cockroach.acceleration.y = cockroach.dashDirection.y * targetSpeed * 8;
    cockroach.maxSpeed = targetSpeed;

    if (cockroach.stateTimer <= 0) {
      cockroach.state = 'scurrying';
      cockroach.stateTimer = this.DIRECTION_CHANGE_INTERVAL;
      cockroach.dashDirection = null;
      cockroach.targetEdge = null;
    } else if (cockroach.dashDirection) {
      cockroach.rotation = Math.atan2(cockroach.dashDirection.y, cockroach.dashDirection.x);
    }
  }

  private static updateHiding(
    cockroach: Cockroach,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null
  ): void {
    const threatDistance = touchPosition
      ? this.getDistance(cockroach.position, touchPosition)
      : Infinity;

    if (threatDistance < 150) {
      cockroach.state = 'dashing';
      cockroach.dashDirection = this.calculateDashDirection(
        cockroach.position,
        screenWidth,
        screenHeight,
        touchPosition,
        null
      );
      cockroach.stateTimer = 2.0;
      cockroach.targetEdge = null;
      return;
    }

    if (cockroach.stateTimer <= 0) {
      cockroach.state = 'dashing';
      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;
      const dx = centerX - cockroach.position.x;
      const dy = centerY - cockroach.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      cockroach.dashDirection = { x: dx / dist, y: dy / dist };
      cockroach.stateTimer = 2.0;
      cockroach.targetEdge = null;
    }
  }

  private static calculateScurryDirection(cockroach: Cockroach): Vector2D {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }

  private static calculateDashDirection(
    position: Vector2D,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    targetEdge: 'top' | 'bottom' | 'left' | 'right' | null
  ): Vector2D {
    let dx = 0;
    let dy = 0;

    if (touchPosition) {
      dx = position.x - touchPosition.x;
      dy = position.y - touchPosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        dx /= dist;
        dy /= dist;
      }
    }

    if (targetEdge) {
      let targetX = position.x;
      let targetY = position.y;

      switch (targetEdge) {
        case 'top':
          targetY = 0;
          break;
        case 'bottom':
          targetY = screenHeight;
          break;
        case 'left':
          targetX = 0;
          break;
        case 'right':
          targetX = screenWidth;
          break;
      }

      const edgeDx = targetX - position.x;
      const edgeDy = targetY - position.y;
      const edgeDist = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);

      if (edgeDist > 0) {
        if (touchPosition) {
          dx = (dx * 0.3 + (edgeDx / edgeDist) * 0.7);
          dy = (dy * 0.3 + (edgeDy / edgeDist) * 0.7);
        } else {
          dx = edgeDx / edgeDist;
          dy = edgeDy / edgeDist;
        }
      }
    }

    const finalDist = Math.sqrt(dx * dx + dy * dy);
    if (finalDist > 0) {
      dx /= finalDist;
      dy /= finalDist;
    } else {
      const randomAngle = Math.random() * Math.PI * 2;
      dx = Math.cos(randomAngle);
      dy = Math.sin(randomAngle);
    }

    return { x: dx, y: dy };
  }

  private static findNearestEdge(
    position: Vector2D,
    screenWidth: number,
    screenHeight: number
  ): 'top' | 'bottom' | 'left' | 'right' {
    const distToTop = position.y;
    const distToBottom = screenHeight - position.y;
    const distToLeft = position.x;
    const distToRight = screenWidth - position.x;

    const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);

    if (minDist === distToTop) return 'top';
    if (minDist === distToBottom) return 'bottom';
    if (minDist === distToLeft) return 'left';
    return 'right';
  }

  private static updatePanicLevel(
    cockroach: Cockroach,
    deltaTime: number,
    touchPosition: Vector2D | null
  ): void {
    if (touchPosition) {
      const distance = this.getDistance(cockroach.position, touchPosition);
      if (distance < this.THREAT_DISTANCE_NEAR) {
        const threatLevel = 1.0 - distance / this.THREAT_DISTANCE_NEAR;
        cockroach.panicLevel += this.PANIC_INCREASE_RATE * threatLevel * deltaTime;
      }
    }

    cockroach.panicLevel -= this.PANIC_DECREASE_RATE * deltaTime;
    cockroach.panicLevel = Math.max(0, Math.min(1, cockroach.panicLevel));
  }

  private static isAtEdge(
    position: Vector2D,
    edge: 'top' | 'bottom' | 'left' | 'right',
    screenWidth: number,
    screenHeight: number
  ): boolean {
    switch (edge) {
      case 'top':
        return position.y < this.EDGE_DETECTION_THRESHOLD;
      case 'bottom':
        return position.y > screenHeight - this.EDGE_DETECTION_THRESHOLD;
      case 'left':
        return position.x < this.EDGE_DETECTION_THRESHOLD;
      case 'right':
        return position.x > screenWidth - this.EDGE_DETECTION_THRESHOLD;
    }
  }

  private static snapToEdge(
    cockroach: Cockroach,
    edge: 'top' | 'bottom' | 'left' | 'right',
    screenWidth: number,
    screenHeight: number
  ): void {
    switch (edge) {
      case 'top':
        cockroach.position.y = 5;
        break;
      case 'bottom':
        cockroach.position.y = screenHeight - 5;
        break;
      case 'left':
        cockroach.position.x = 5;
        break;
      case 'right':
        cockroach.position.x = screenWidth - 5;
        break;
    }
  }

  private static applyPhysics(cockroach: Cockroach, deltaTime: number): void {
    cockroach.velocity.x += cockroach.acceleration.x * deltaTime;
    cockroach.velocity.y += cockroach.acceleration.y * deltaTime;

    const speed = Math.sqrt(
      cockroach.velocity.x * cockroach.velocity.x + cockroach.velocity.y * cockroach.velocity.y
    );

    if (speed > cockroach.maxSpeed) {
      const scale = cockroach.maxSpeed / speed;
      cockroach.velocity.x *= scale;
      cockroach.velocity.y *= scale;
    }

    cockroach.position.x += cockroach.velocity.x * deltaTime;
    cockroach.position.y += cockroach.velocity.y * deltaTime;

    const friction = cockroach.state === 'scurrying' ? 0.9 : 0.95;
    cockroach.velocity.x *= Math.pow(friction, deltaTime * 60);
    cockroach.velocity.y *= Math.pow(friction, deltaTime * 60);

    cockroach.acceleration.x = 0;
    cockroach.acceleration.y = 0;
  }

  private static constrainToBounds(
    cockroach: Cockroach,
    screenWidth: number,
    screenHeight: number
  ): void {
    if (cockroach.state !== 'hiding') {
      if (cockroach.position.x < 0) {
        cockroach.position.x = 0;
        cockroach.velocity.x = Math.abs(cockroach.velocity.x);
      }
      if (cockroach.position.x > screenWidth) {
        cockroach.position.x = screenWidth;
        cockroach.velocity.x = -Math.abs(cockroach.velocity.x);
      }
      if (cockroach.position.y < 0) {
        cockroach.position.y = 0;
        cockroach.velocity.y = Math.abs(cockroach.velocity.y);
      }
      if (cockroach.position.y > screenHeight) {
        cockroach.position.y = screenHeight;
        cockroach.velocity.y = -Math.abs(cockroach.velocity.y);
      }
    }
  }

  private static updateAntennaAndLegPhase(cockroach: Cockroach, deltaTime: number): void {
    const baseFrequency = cockroach.state === 'dashing' ? 15 : 8;
    cockroach.antennaPhase += deltaTime * baseFrequency;
    cockroach.legPhase += deltaTime * baseFrequency;
  }

  private static getDistance(a: Vector2D, b: Vector2D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
