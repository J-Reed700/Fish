import { Vector2D } from '../../types';

export interface MotionBlurConfig {
  intensity: number;
  samples: number;
  velocityThreshold: number;
}

export class MotionBlur {
  private intensity: number = 0.5;
  private samples: number = 5;
  private velocityThreshold: number = 200;
  private isEnabled: boolean = false;

  configure(config: Partial<MotionBlurConfig>): void {
    if (config.intensity !== undefined) this.intensity = config.intensity;
    if (config.samples !== undefined) this.samples = config.samples;
    if (config.velocityThreshold !== undefined)
      this.velocityThreshold = config.velocityThreshold;
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  shouldApplyBlur(velocity: Vector2D): boolean {
    if (!this.isEnabled) return false;

    const speed = Math.hypot(velocity.x, velocity.y);
    return speed >= this.velocityThreshold;
  }

  getBlurParams(velocity: Vector2D): {
    direction: Vector2D;
    intensity: number;
    samples: number;
  } | null {
    if (!this.shouldApplyBlur(velocity)) return null;

    const speed = Math.hypot(velocity.x, velocity.y);
    const normalizedVelocity = {
      x: velocity.x / speed,
      y: velocity.y / speed,
    };

    const blurIntensity = Math.min(
      1,
      (speed - this.velocityThreshold) / this.velocityThreshold
    );

    return {
      direction: normalizedVelocity,
      intensity: this.intensity * blurIntensity,
      samples: this.samples,
    };
  }

  getSettings(): MotionBlurConfig {
    return {
      intensity: this.intensity,
      samples: this.samples,
      velocityThreshold: this.velocityThreshold,
    };
  }
}
