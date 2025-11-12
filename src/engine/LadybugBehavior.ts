import { Ladybug, Vector2D } from '../types';

export class LadybugBehavior {
  private static readonly BASE_SPEED = 30;
  private static readonly PATH_DURATION_MIN = 3000;
  private static readonly PATH_DURATION_MAX = 5000;
  private static readonly PAUSE_DURATION_MIN = 800;
  private static readonly PAUSE_DURATION_MAX = 2000;
  private static readonly PAUSE_PROBABILITY = 0.4;
  private static readonly EDGE_MARGIN = 50;
  private static readonly ROTATION_SPEED = 0.08;
  private static readonly LEG_SPEED = 0.15;

  public static update(ladybug: Ladybug, deltaTime: number, screenWidth: number, screenHeight: number): Ladybug {
    const dt = deltaTime / 1000;

    ladybug.stateTimer -= deltaTime;
    ladybug.legPhase += this.LEG_SPEED * deltaTime;

    if (ladybug.stateTimer <= 0) {
      ladybug = this.transitionState(ladybug, screenWidth, screenHeight);
    }

    switch (ladybug.state) {
      case 'crawling':
        ladybug = this.updateCrawling(ladybug, dt, screenWidth, screenHeight);
        break;
      case 'paused':
        ladybug = this.updatePaused(ladybug, dt);
        break;
      case 'climbing':
        ladybug = this.updateClimbing(ladybug, dt, screenWidth, screenHeight);
        break;
    }

    return ladybug;
  }

  private static transitionState(ladybug: Ladybug, screenWidth: number, screenHeight: number): Ladybug {
    if (ladybug.state === 'crawling' || ladybug.state === 'climbing') {
      if (this.isNearEdge(ladybug.position, screenWidth, screenHeight)) {
        ladybug.state = 'climbing';
        ladybug.pathPoints = this.generateEdgePath(ladybug.position, screenWidth, screenHeight);
        ladybug.pathProgress = 0;
        ladybug.pathDuration = this.PATH_DURATION_MIN + Math.random() * (this.PATH_DURATION_MAX - this.PATH_DURATION_MIN);
        ladybug.stateTimer = ladybug.pathDuration;
      } else if (Math.random() < this.PAUSE_PROBABILITY) {
        ladybug.state = 'paused';
        ladybug.stateTimer = this.PAUSE_DURATION_MIN + Math.random() * (this.PAUSE_DURATION_MAX - this.PAUSE_DURATION_MIN);
        ladybug.velocity = { x: 0, y: 0 };
      } else {
        ladybug.state = 'crawling';
        ladybug.pathPoints = this.generateBezierPath(ladybug.position, screenWidth, screenHeight);
        ladybug.pathProgress = 0;
        ladybug.pathDuration = this.PATH_DURATION_MIN + Math.random() * (this.PATH_DURATION_MAX - this.PATH_DURATION_MIN);
        ladybug.stateTimer = ladybug.pathDuration;
      }
    } else if (ladybug.state === 'paused') {
      ladybug.state = 'crawling';
      ladybug.pathPoints = this.generateBezierPath(ladybug.position, screenWidth, screenHeight);
      ladybug.pathProgress = 0;
      ladybug.pathDuration = this.PATH_DURATION_MIN + Math.random() * (this.PATH_DURATION_MAX - this.PATH_DURATION_MIN);
      ladybug.stateTimer = ladybug.pathDuration;
    }

    return ladybug;
  }

  private static updateCrawling(ladybug: Ladybug, dt: number, screenWidth: number, screenHeight: number): Ladybug {
    if (ladybug.pathPoints.length < 4) {
      return ladybug;
    }

    ladybug.pathProgress += dt * 1000;
    const t = Math.min(ladybug.pathProgress / ladybug.pathDuration, 1);

    const newPos = this.bezierCubic(ladybug.pathPoints, t);
    const derivative = this.bezierDerivative(ladybug.pathPoints, t);

    ladybug.velocity = {
      x: derivative.x * this.BASE_SPEED,
      y: derivative.y * this.BASE_SPEED
    };

    ladybug.position = newPos;

    const targetAngle = Math.atan2(derivative.y, derivative.x);
    ladybug.rotation = this.lerpRotation(ladybug.rotation, targetAngle, this.ROTATION_SPEED);

    return ladybug;
  }

  private static updatePaused(ladybug: Ladybug, dt: number): Ladybug {
    ladybug.rotation += (Math.random() - 0.5) * 0.02 * dt * 60;
    return ladybug;
  }

  private static updateClimbing(ladybug: Ladybug, dt: number, screenWidth: number, screenHeight: number): Ladybug {
    if (ladybug.pathPoints.length < 4) {
      return ladybug;
    }

    ladybug.pathProgress += dt * 1000;
    const t = Math.min(ladybug.pathProgress / ladybug.pathDuration, 1);

    const newPos = this.bezierCubic(ladybug.pathPoints, t);
    const derivative = this.bezierDerivative(ladybug.pathPoints, t);

    ladybug.velocity = {
      x: derivative.x * this.BASE_SPEED * 0.7,
      y: derivative.y * this.BASE_SPEED * 0.7
    };

    ladybug.position = newPos;

    const targetAngle = Math.atan2(derivative.y, derivative.x);
    ladybug.rotation = this.lerpRotation(ladybug.rotation, targetAngle, this.ROTATION_SPEED);

    return ladybug;
  }

  public static generateBezierPath(start: Vector2D, screenWidth: number, screenHeight: number): Vector2D[] {
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 150;

    const endX = Math.max(50, Math.min(screenWidth - 50, start.x + Math.cos(angle) * distance));
    const endY = Math.max(50, Math.min(screenHeight - 50, start.y + Math.sin(angle) * distance));

    const end: Vector2D = { x: endX, y: endY };

    const controlOffset1 = 50 + Math.random() * 100;
    const controlOffset2 = 50 + Math.random() * 100;
    const controlAngle1 = angle + (Math.random() - 0.5) * Math.PI * 0.5;
    const controlAngle2 = angle + (Math.random() - 0.5) * Math.PI * 0.5;

    const control1: Vector2D = {
      x: start.x + Math.cos(controlAngle1) * controlOffset1,
      y: start.y + Math.sin(controlAngle1) * controlOffset1
    };

    const control2: Vector2D = {
      x: end.x - Math.cos(controlAngle2) * controlOffset2,
      y: end.y - Math.sin(controlAngle2) * controlOffset2
    };

    return [start, control1, control2, end];
  }

  private static generateEdgePath(start: Vector2D, screenWidth: number, screenHeight: number): Vector2D[] {
    const margin = this.EDGE_MARGIN;

    let targetX = start.x;
    let targetY = start.y;

    if (start.x < margin) {
      targetX = margin;
      targetY = Math.max(margin, Math.min(screenHeight - margin, start.y + (Math.random() - 0.5) * 200));
    } else if (start.x > screenWidth - margin) {
      targetX = screenWidth - margin;
      targetY = Math.max(margin, Math.min(screenHeight - margin, start.y + (Math.random() - 0.5) * 200));
    } else if (start.y < margin) {
      targetY = margin;
      targetX = Math.max(margin, Math.min(screenWidth - margin, start.x + (Math.random() - 0.5) * 200));
    } else if (start.y > screenHeight - margin) {
      targetY = screenHeight - margin;
      targetX = Math.max(margin, Math.min(screenWidth - margin, start.x + (Math.random() - 0.5) * 200));
    }

    const end: Vector2D = { x: targetX, y: targetY };

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    const control1: Vector2D = {
      x: midX + (Math.random() - 0.5) * 50,
      y: midY + (Math.random() - 0.5) * 50
    };

    const control2: Vector2D = {
      x: midX + (Math.random() - 0.5) * 50,
      y: midY + (Math.random() - 0.5) * 50
    };

    return [start, control1, control2, end];
  }

  private static bezierCubic(points: Vector2D[], t: number): Vector2D {
    if (points.length !== 4) {
      return points[0] || { x: 0, y: 0 };
    }

    const [P0, P1, P2, P3] = points;
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;

    return {
      x: mt3 * P0.x + 3 * mt2 * t * P1.x + 3 * mt * t2 * P2.x + t3 * P3.x,
      y: mt3 * P0.y + 3 * mt2 * t * P1.y + 3 * mt * t2 * P2.y + t3 * P3.y,
    };
  }

  private static bezierDerivative(points: Vector2D[], t: number): Vector2D {
    if (points.length !== 4) {
      return { x: 0, y: 0 };
    }

    const [P0, P1, P2, P3] = points;
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;

    const dx = 3 * mt2 * (P1.x - P0.x) + 6 * mt * t * (P2.x - P1.x) + 3 * t2 * (P3.x - P2.x);
    const dy = 3 * mt2 * (P1.y - P0.y) + 6 * mt * t * (P2.y - P1.y) + 3 * t2 * (P3.y - P2.y);

    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude === 0) {
      return { x: 0, y: 0 };
    }

    return { x: dx / magnitude, y: dy / magnitude };
  }

  private static isNearEdge(position: Vector2D, screenWidth: number, screenHeight: number): boolean {
    const margin = this.EDGE_MARGIN;
    return (
      position.x < margin ||
      position.x > screenWidth - margin ||
      position.y < margin ||
      position.y > screenHeight - margin
    );
  }

  private static lerpRotation(current: number, target: number, factor: number): number {
    let diff = target - current;

    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    return current + diff * factor;
  }
}
