export interface VignetteConfig {
  intensity: number;
  duration: number;
  color?: string;
  fadeIn?: boolean;
  fadeOut?: boolean;
}

export class VignetteEffect {
  private maxIntensity: number = 0.4;
  private duration: number = 0;
  private elapsed: number = 0;
  private color: string = '#000000';
  private fadeIn: boolean = true;
  private fadeOut: boolean = true;
  private currentIntensity: number = 0;

  start(config: VignetteConfig): void {
    this.maxIntensity = config.intensity;
    this.duration = config.duration;
    this.color = config.color || '#000000';
    this.fadeIn = config.fadeIn !== undefined ? config.fadeIn : true;
    this.fadeOut = config.fadeOut !== undefined ? config.fadeOut : true;
    this.elapsed = 0;
    this.currentIntensity = this.fadeIn ? 0 : this.maxIntensity;
  }

  update(deltaTime: number): void {
    if (this.elapsed >= this.duration) {
      this.currentIntensity = 0;
      return;
    }

    this.elapsed += deltaTime;
    const progress = this.elapsed / this.duration;

    const fadeInTime = 0.3;
    const fadeOutTime = 0.3;

    if (this.fadeIn && progress < fadeInTime) {
      this.currentIntensity = this.maxIntensity * (progress / fadeInTime);
    } else if (this.fadeOut && progress > 1 - fadeOutTime) {
      const fadeOutProgress = (progress - (1 - fadeOutTime)) / fadeOutTime;
      this.currentIntensity = this.maxIntensity * (1 - fadeOutProgress);
    } else {
      this.currentIntensity = this.maxIntensity;
    }
  }

  getVignette(): { color: string; intensity: number } {
    return {
      color: this.color,
      intensity: Math.max(0, Math.min(1, this.currentIntensity)),
    };
  }

  isActive(): boolean {
    return this.elapsed < this.duration;
  }

  stop(): void {
    this.elapsed = this.duration;
    this.currentIntensity = 0;
  }
}
