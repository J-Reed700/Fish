import type { Cockroach, Vector2D } from '../types';

export class CockroachFactory {
  private static readonly COLORS = ['#3D2817', '#2C1810', '#4A3424'];

  private static readonly SIZE_MIN = 30;
  private static readonly SIZE_MAX = 40;

  static create(
    x: number,
    y: number,
    color?: string,
    size?: number
  ): Cockroach {
    const selectedColor = color || this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
    const selectedSize = size || this.SIZE_MIN + Math.random() * (this.SIZE_MAX - this.SIZE_MIN);

    const initialAngle = Math.random() * Math.PI * 2;

    return {
      id: `cockroach-${Date.now()}-${Math.random()}`,
      position: { x, y },
      velocity: { x: 0, y: 0 },
      rotation: initialAngle,
      size: selectedSize,
      color: selectedColor,
      type: 'cockroach',
      state: 'scurrying',
      stateTimer: 0.8 + Math.random() * 0.4,
      targetEdge: null,
      panicLevel: 0,
      acceleration: { x: 0, y: 0 },
      maxSpeed: 80,
      antennaPhase: Math.random() * Math.PI * 2,
      legPhase: Math.random() * Math.PI * 2,
      dashDirection: null,
    };
  }

  static createRandom(screenWidth: number, screenHeight: number): Cockroach {
    const margin = 50;
    const x = margin + Math.random() * (screenWidth - margin * 2);
    const y = margin + Math.random() * (screenHeight - margin * 2);

    return this.create(x, y);
  }

  static createAtEdge(
    screenWidth: number,
    screenHeight: number,
    edge?: 'top' | 'bottom' | 'left' | 'right'
  ): Cockroach {
    const selectedEdge = edge || this.randomEdge();
    let x = 0;
    let y = 0;

    switch (selectedEdge) {
      case 'top':
        x = Math.random() * screenWidth;
        y = 5 + Math.random() * 10;
        break;
      case 'bottom':
        x = Math.random() * screenWidth;
        y = screenHeight - 5 - Math.random() * 10;
        break;
      case 'left':
        x = 5 + Math.random() * 10;
        y = Math.random() * screenHeight;
        break;
      case 'right':
        x = screenWidth - 5 - Math.random() * 10;
        y = Math.random() * screenHeight;
        break;
    }

    const cockroach = this.create(x, y);

    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    const dx = centerX - x;
    const dy = centerY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      cockroach.rotation = Math.atan2(dy, dx);
    }

    cockroach.state = 'hiding';
    cockroach.stateTimer = 1.0 + Math.random() * 2.0;
    cockroach.targetEdge = selectedEdge;

    return cockroach;
  }

  static createMany(
    count: number,
    screenWidth: number,
    screenHeight: number,
    spawnFromEdges: boolean = true
  ): Cockroach[] {
    const cockroaches: Cockroach[] = [];

    for (let i = 0; i < count; i++) {
      const cockroach = spawnFromEdges
        ? this.createAtEdge(screenWidth, screenHeight)
        : this.createRandom(screenWidth, screenHeight);

      cockroaches.push(cockroach);
    }

    return cockroaches;
  }

  static createSpreadAcrossEdges(
    count: number,
    screenWidth: number,
    screenHeight: number
  ): Cockroach[] {
    const cockroaches: Cockroach[] = [];
    const edges: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];

    for (let i = 0; i < count; i++) {
      const edge = edges[i % edges.length];
      const cockroach = this.createAtEdge(screenWidth, screenHeight, edge);
      cockroaches.push(cockroach);
    }

    return cockroaches;
  }

  static respawn(
    cockroach: Cockroach,
    screenWidth: number,
    screenHeight: number,
    spawnFromEdge: boolean = true
  ): void {
    if (spawnFromEdge) {
      const edge = this.randomEdge();
      let x = 0;
      let y = 0;

      switch (edge) {
        case 'top':
          x = Math.random() * screenWidth;
          y = 5 + Math.random() * 10;
          break;
        case 'bottom':
          x = Math.random() * screenWidth;
          y = screenHeight - 5 - Math.random() * 10;
          break;
        case 'left':
          x = 5 + Math.random() * 10;
          y = Math.random() * screenHeight;
          break;
        case 'right':
          x = screenWidth - 5 - Math.random() * 10;
          y = Math.random() * screenHeight;
          break;
      }

      cockroach.position.x = x;
      cockroach.position.y = y;
      cockroach.state = 'hiding';
      cockroach.stateTimer = 1.0 + Math.random() * 2.0;
      cockroach.targetEdge = edge;

      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;
      const dx = centerX - x;
      const dy = centerY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        cockroach.rotation = Math.atan2(dy, dx);
      }
    } else {
      const margin = 50;
      cockroach.position.x = margin + Math.random() * (screenWidth - margin * 2);
      cockroach.position.y = margin + Math.random() * (screenHeight - margin * 2);
      cockroach.state = 'scurrying';
      cockroach.stateTimer = 0.8 + Math.random() * 0.4;
      cockroach.targetEdge = null;
    }

    cockroach.velocity.x = 0;
    cockroach.velocity.y = 0;
    cockroach.acceleration.x = 0;
    cockroach.acceleration.y = 0;
    cockroach.panicLevel = 0;
    cockroach.dashDirection = null;
  }

  private static randomEdge(): 'top' | 'bottom' | 'left' | 'right' {
    const edges: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];
    return edges[Math.floor(Math.random() * edges.length)];
  }
}
