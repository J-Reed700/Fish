import type { Ant, Vector2D } from '../types';
import { AntBehavior } from '../engine/AntBehavior';

export class AntFactory {
  private static readonly COLORS = ['#212121', '#D32F2F'];
  private static readonly MIN_SIZE = 8;
  private static readonly MAX_SIZE = 12;
  private static readonly DEFAULT_LIFETIME = 40;

  static create(position: Vector2D, groupId?: string, leaderId?: string): Ant {
    return {
      id: this.generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: this.randomInRange(this.MIN_SIZE, this.MAX_SIZE),
      color: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
      type: 'ant',
      state: 'marching',
      stateTimer: 300,
      trailPath: [],
      pathIndex: 0,
      groupId: groupId ?? `group-${Date.now()}`,
      leaderId: leaderId ?? null,
      carryingFood: false,
      legPhase: Math.random() * Math.PI * 2,
      lifetime: 0,
      maxLifetime: this.DEFAULT_LIFETIME,
    };
  }

  static createGroup(count: number, screenWidth: number, screenHeight: number): Ant[] {
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trailPath = AntBehavior.generateTrailPath(screenWidth, screenHeight);
    const startX = Math.random() < 0.5 ? 20 : screenWidth - 20;
    const groundY = screenHeight * 0.85;

    const ants: Ant[] = [];
    let leaderId: string | null = null;

    for (let i = 0; i < count; i++) {
      const position: Vector2D = {
        x: startX - i * 12,
        y: groundY + this.randomInRange(-5, 5),
      };

      const ant = this.create(position, groupId, leaderId);
      ant.trailPath = trailPath;

      if (i === 0) {
        leaderId = ant.id;
      }

      ants.push(ant);
    }

    return ants;
  }

  static createMany(count: number, screenWidth: number, screenHeight: number): Ant[] {
    const ants: Ant[] = [];
    const groupCount = Math.ceil(count / 7);

    for (let i = 0; i < groupCount; i++) {
      const groupSize = Math.min(7, count - ants.length);
      ants.push(...this.createGroup(groupSize, screenWidth, screenHeight));
    }

    return ants;
  }

  private static generateId(): string {
    return `ant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
