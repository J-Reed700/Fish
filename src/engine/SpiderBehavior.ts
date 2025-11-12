import type { Spider, Vector2D } from '../types';

export class SpiderBehavior {
  static readonly CLIMB_SPEED = 50;
  static readonly CRAWL_SPEED = 25;
  static readonly HANG_SPEED = 30;
  static readonly RETREAT_SPEED = 150;
  static readonly SPIN_DURATION = 1500;
  static readonly HANG_DURATION = 3000;
  static readonly CORNER_THRESHOLD = 80;
  static readonly RETREAT_DISTANCE = 200;
  static readonly LEG_ANIMATION_SPEED = 8;
  static readonly BOUNDARY_MARGIN = 20;

  static update(
    spider: Spider,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Spider {
    const updated = { ...spider };
    const dt = deltaTime;

    updated.stateTimer -= deltaTime * 1000;
    updated.lifetime += deltaTime;

    if (touchPosition && updated.state !== 'retreating') {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.RETREAT_DISTANCE) {
        updated.state = 'retreating';
        updated.targetCorner = this.findNearestCorner(updated.position, screenWidth, screenHeight);
        updated.stateTimer = 3000;
      }
    }

    switch (updated.state) {
      case 'climbing':
        this.updateClimbingState(updated, screenWidth, screenHeight);
        break;
      case 'spinning':
        this.updateSpinningState(updated);
        break;
      case 'hanging':
        this.updateHangingState(updated, screenHeight);
        break;
      case 'crawling':
        this.updateCrawlingState(updated, screenWidth, screenHeight);
        break;
      case 'retreating':
        this.updateRetreatingState(updated, screenWidth, screenHeight);
        break;
    }

    updated.position.x += updated.velocity.x * dt;
    updated.position.y += updated.velocity.y * dt;

    this.handleBoundaries(updated, screenWidth, screenHeight);
    this.updateLegAnimation(updated, dt);

    if (updated.velocity.x !== 0 || updated.velocity.y !== 0) {
      updated.rotation = Math.atan2(updated.velocity.y, updated.velocity.x);
    }

    return updated;
  }

  private static updateClimbingState(spider: Spider, screenWidth: number, screenHeight: number): void {
    if (!spider.targetCorner) {
      spider.targetCorner = this.findNearestCorner(spider.position, screenWidth, screenHeight);
    }

    const dx = spider.targetCorner.x - spider.position.x;
    const dy = spider.targetCorner.y - spider.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.CORNER_THRESHOLD) {
      spider.velocity = { x: 0, y: 0 };
      spider.state = 'spinning';
      spider.stateTimer = this.SPIN_DURATION;
      return;
    }

    const speed = spider.climbSpeed;
    spider.velocity = {
      x: (dx / distance) * speed,
      y: (dy / distance) * speed,
    };
  }

  private static updateSpinningState(spider: Spider): void {
    spider.velocity = { x: 0, y: 0 };
    spider.rotation += 0.05;

    if (spider.stateTimer <= 0) {
      spider.state = 'hanging';
      spider.silkAttachPoint = { ...spider.position };
      spider.silkLength = 0;
      spider.stateTimer = this.HANG_DURATION;
    }
  }

  private static updateHangingState(spider: Spider, screenHeight: number): void {
    const maxSilkLength = screenHeight * 0.4;

    if (spider.silkLength < maxSilkLength) {
      spider.velocity = { x: 0, y: this.HANG_SPEED };
      spider.silkLength += this.HANG_SPEED * 0.016;
    } else {
      spider.velocity = { x: 0, y: 0 };
    }

    if (spider.stateTimer <= 0) {
      spider.state = 'crawling';
      spider.silkAttachPoint = null;
      spider.silkLength = 0;
      spider.stateTimer = 4000;
    }
  }

  private static updateCrawlingState(spider: Spider, screenWidth: number, screenHeight: number): void {
    if (spider.stateTimer <= 0 || Math.random() < 0.001) {
      spider.state = 'climbing';
      spider.targetCorner = this.selectRandomCorner(screenWidth, screenHeight);
      spider.stateTimer = 5000;
      return;
    }

    const angle = Math.random() * Math.PI * 2;
    spider.velocity = {
      x: Math.cos(angle) * this.CRAWL_SPEED,
      y: Math.sin(angle) * this.CRAWL_SPEED,
    };
  }

  private static updateRetreatingState(spider: Spider, screenWidth: number, screenHeight: number): void {
    if (!spider.targetCorner) {
      spider.targetCorner = this.findNearestCorner(spider.position, screenWidth, screenHeight);
    }

    const dx = spider.targetCorner.x - spider.position.x;
    const dy = spider.targetCorner.y - spider.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.CORNER_THRESHOLD) {
      spider.velocity = { x: 0, y: 0 };
      spider.state = 'spinning';
      spider.stateTimer = this.SPIN_DURATION;
      return;
    }

    spider.velocity = {
      x: (dx / distance) * this.RETREAT_SPEED,
      y: (dy / distance) * this.RETREAT_SPEED,
    };
  }

  private static findNearestCorner(position: Vector2D, screenWidth: number, screenHeight: number): Vector2D {
    const margin = this.BOUNDARY_MARGIN;
    const corners = [
      { x: margin, y: margin },
      { x: screenWidth - margin, y: margin },
      { x: margin, y: screenHeight - margin },
      { x: screenWidth - margin, y: screenHeight - margin },
    ];

    let nearest = corners[0];
    let minDist = this.distance(position, nearest);

    for (const corner of corners) {
      const dist = this.distance(position, corner);
      if (dist < minDist) {
        minDist = dist;
        nearest = corner;
      }
    }

    return nearest;
  }

  private static selectRandomCorner(screenWidth: number, screenHeight: number): Vector2D {
    const margin = this.BOUNDARY_MARGIN;
    const corners = [
      { x: margin, y: margin },
      { x: screenWidth - margin, y: margin },
      { x: margin, y: screenHeight - margin },
      { x: screenWidth - margin, y: screenHeight - margin },
    ];

    return corners[Math.floor(Math.random() * corners.length)];
  }

  private static updateLegAnimation(spider: Spider, deltaTime: number): void {
    const speed = Math.sqrt(spider.velocity.x ** 2 + spider.velocity.y ** 2);
    const animSpeed = speed > 1 ? this.LEG_ANIMATION_SPEED : 2;

    for (let i = 0; i < spider.legPhases.length; i++) {
      spider.legPhases[i] += deltaTime * animSpeed + i * 0.5;
    }
  }

  private static handleBoundaries(spider: Spider, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (spider.position.x < margin) {
      spider.position.x = margin;
      if (spider.state === 'crawling') spider.velocity.x = Math.abs(spider.velocity.x);
    } else if (spider.position.x > screenWidth - margin) {
      spider.position.x = screenWidth - margin;
      if (spider.state === 'crawling') spider.velocity.x = -Math.abs(spider.velocity.x);
    }

    if (spider.position.y < margin) {
      spider.position.y = margin;
      if (spider.state === 'crawling') spider.velocity.y = Math.abs(spider.velocity.y);
    } else if (spider.position.y > screenHeight - margin) {
      spider.position.y = screenHeight - margin;
      if (spider.state === 'crawling') spider.velocity.y = -Math.abs(spider.velocity.y);
    }
  }

  private static distance(a: Vector2D, b: Vector2D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
