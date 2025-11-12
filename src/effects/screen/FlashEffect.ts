export interface FlashConfig {
  color: string;
  intensity: number;
  duration: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
}

export class FlashEffect {
  private color: string = '#FFFFFF';
  private maxIntensity: number = 0.5;
  private duration: number = 0;
  private elapsed: number = 0;
  private fadeIn: boolean = false;
  private fadeOut: boolean = true;
  private currentAlpha: number = 0;

  start(config: FlashConfig): void {
    this.color = config.color;
    this.maxIntensity = config.intensity;
    this.duration = config.duration;
    this.fadeIn = config.fadeIn || false;
    this.fadeOut = config.fadeOut !== undefined ? config.fadeOut : true;
    this.elapsed = 0;
    this.currentAlpha = this.fadeIn ? 0 : this.maxIntensity;
  }

  update(deltaTime: number): void {
    if (this.elapsed >= this.duration) {
      this.currentAlpha = 0;
      return;
    }

    this.elapsed += deltaTime;
    const progress = this.elapsed / this.duration;

    if (this.fadeIn && this.fadeOut) {
      if (progress < 0.5) {
        this.currentAlpha = this.maxIntensity * (progress * 2);
      } else {
        this.currentAlpha = this.maxIntensity * (2 - progress * 2);
      }
    } else if (this.fadeIn) {
      this.currentAlpha = this.maxIntensity * progress;
    } else if (this.fadeOut) {
      this.currentAlpha = this.maxIntensity * (1 - progress);
    } else {
      this.currentAlpha = this.maxIntensity;
    }
  }

  getFlash(): { color: string; alpha: number } {
    return {
      color: this.color,
      alpha: Math.max(0, Math.min(1, this.currentAlpha)),
    };
  }

  isActive(): boolean {
    return this.elapsed < this.duration;
  }

  stop(): void {
    this.elapsed = this.duration;
    this.currentAlpha = 0;
  }
}
