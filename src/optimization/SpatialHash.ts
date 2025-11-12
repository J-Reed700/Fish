import { Vector2D } from '../types';

export interface HasPosition {
  id: string;
  position: Vector2D;
}

export class SpatialHash<T extends HasPosition> {
  private cellSize: number;
  private cells: Map<string, T[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  private hash(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  clear(): void {
    this.cells.clear();
  }

  insert(entity: T): void {
    const key = this.hash(entity.position.x, entity.position.y);
    if (!this.cells.has(key)) {
      this.cells.set(key, []);
    }
    this.cells.get(key)!.push(entity);
  }

  getNearby(position: Vector2D, radius: number): T[] {
    const nearby: T[] = [];
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerCellX = Math.floor(position.x / this.cellSize);
    const centerCellY = Math.floor(position.y / this.cellSize);

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerCellX + dx},${centerCellY + dy}`;
        const cellEntities = this.cells.get(key);
        if (cellEntities) {
          nearby.push(...cellEntities);
        }
      }
    }

    return nearby;
  }
}
