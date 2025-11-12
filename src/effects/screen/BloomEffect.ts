export interface BloomConfig {
  threshold: number;
  intensity: number;
  radius: number;
  duration?: number;
}

export class BloomEffect {
  private threshold: number = 0.8;
  private intensity: number = 0.5;
  private radius: number = 10;
  private duration: number = Infinity;
  private elapsed: number = 0;
  private currentIntensity: number = 0;

  start(config: BloomConfig): void {
    this.threshold = config.threshold;
    this.intensity = config.intensity;
    this.radius = config.radius;
    this.duration = config.duration || Infinity;
    this.elapsed = 0;
    this.currentIntensity = this.intensity;
  }

  update(deltaTime: number): void {
    if (this.duration === Infinity) {
      this.currentIntensity = this.intensity;
      return;
    }

    if (this.elapsed >= this.duration) {
      this.currentIntensity = 0;
      return;
    }

    this.elapsed += deltaTime;
    const progress = this.elapsed / this.duration;

    const fadeOutStart = 0.7;
    if (progress < fadeOutStart) {
      this.currentIntensity = this.intensity;
    } else {
      const fadeProgress = (progress - fadeOutStart) / (1 - fadeOutStart);
      this.currentIntensity = this.intensity * (1 - fadeProgress);
    }
  }

  getBloom(): { threshold: number; intensity: number; radius: number } {
    return {
      threshold: this.threshold,
      intensity: Math.max(0, this.currentIntensity),
      radius: this.radius,
    };
  }

  isActive(): boolean {
    return this.duration === Infinity || this.elapsed < this.duration;
  }

  stop(): void {
    this.duration = 0;
    this.elapsed = 0;
    this.currentIntensity = 0;
  }

  setPermanent(): void {
    this.duration = Infinity;
  }
}
