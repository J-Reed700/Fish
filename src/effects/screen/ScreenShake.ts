import { Vector2D } from '../../types';

export interface ShakeConfig {
  amplitude: number;
  frequency: number;
  duration: number;
  damping?: boolean;
}

export class ScreenShake {
  private amplitude: number = 0;
  private frequency: number = 30;
  private duration: number = 0;
  private elapsed: number = 0;
  private damping: boolean = true;
  private offset: Vector2D = { x: 0, y: 0 };
  private time: number = 0;

  start(config: ShakeConfig): void {
    this.amplitude = config.amplitude;
    this.frequency = config.frequency;
    this.duration = config.duration;
    this.damping = config.damping !== undefined ? config.damping : true;
    this.elapsed = 0;
    this.time = 0;
  }

  update(deltaTime: number): void {
    if (this.elapsed >= this.duration) {
      this.offset = { x: 0, y: 0 };
      return;
    }

    this.elapsed += deltaTime;
    this.time += deltaTime * this.frequency;

    let dampingFactor = 1;
    if (this.damping) {
      dampingFactor = 1 - this.elapsed / this.duration;
    }

    const shake = this.amplitude * dampingFactor;

    this.offset.x = (Math.random() - 0.5) * 2 * shake;
    this.offset.y = (Math.random() - 0.5) * 2 * shake;
  }

  getOffset(): Vector2D {
    return { ...this.offset };
  }

  isActive(): boolean {
    return this.elapsed < this.duration;
  }

  stop(): void {
    this.elapsed = this.duration;
    this.offset = { x: 0, y: 0 };
  }
}
