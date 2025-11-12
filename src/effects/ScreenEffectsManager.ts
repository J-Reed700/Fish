import { ScreenEffect, Vector2D } from '../types';

export class ScreenEffectsManager {
  private effects: ScreenEffect[] = [];
  private maxActiveEffects: number;
  private shakeOffset: Vector2D = { x: 0, y: 0 };
  private flashAlpha: number = 0;
  private flashColor: string = '#FFFFFF';
  private vignetteIntensity: number = 0;
  private blurAmount: number = 0;

  constructor(maxActiveEffects: number = 5) {
    this.maxActiveEffects = maxActiveEffects;
  }

  addEffect(
    type: ScreenEffect['type'],
    intensity: number,
    duration: number,
    params: Record<string, any> = {}
  ): void {
    if (this.effects.length >= this.maxActiveEffects) {
      this.effects.shift();
    }

    this.effects.push({
      type,
      intensity,
      duration,
      remainingTime: duration,
      params,
    });
  }

  shake(intensity: number = 10, duration: number = 0.3): void {
    this.addEffect('shake', intensity, duration, {
      amplitude: intensity,
      frequency: 30,
    });
  }

  flash(color: string = '#FFFFFF', intensity: number = 0.5, duration: number = 0.2): void {
    this.addEffect('flash', intensity, duration, { color });
  }

  vignette(intensity: number = 0.4, duration: number = 1, color: string = '#000000'): void {
    this.addEffect('vignette', intensity, duration, { color });
  }

  blur(amount: number = 10, duration: number = 0.5): void {
    this.addEffect('blur', amount, duration, {});
  }

  colorGrade(filter: string, intensity: number = 1, duration: number = 2): void {
    this.addEffect('color-grade', intensity, duration, { filter });
  }

  update(deltaTime: number): void {
    this.shakeOffset = { x: 0, y: 0 };
    this.flashAlpha = 0;
    this.vignetteIntensity = 0;
    this.blurAmount = 0;

    const deadEffects: ScreenEffect[] = [];

    this.effects.forEach((effect) => {
      effect.remainingTime -= deltaTime;

      const progress = 1 - effect.remainingTime / effect.duration;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      switch (effect.type) {
        case 'shake':
          this.updateShake(effect, deltaTime);
          break;
        case 'flash':
          this.updateFlash(effect, easeOut);
          break;
        case 'vignette':
          this.updateVignette(effect);
          break;
        case 'blur':
          this.updateBlur(effect, easeOut);
          break;
      }

      if (effect.remainingTime <= 0) {
        deadEffects.push(effect);
      }
    });

    deadEffects.forEach((effect) => {
      const index = this.effects.indexOf(effect);
      if (index !== -1) {
        this.effects.splice(index, 1);
      }
    });
  }

  private updateShake(effect: ScreenEffect, deltaTime: number): void {
    const amplitude = effect.params.amplitude || effect.intensity;
    const frequency = effect.params.frequency || 30;

    const damping = effect.remainingTime / effect.duration;
    const shake = amplitude * damping;

    const angle = Math.random() * Math.PI * 2;
    this.shakeOffset.x += Math.cos(angle) * shake;
    this.shakeOffset.y += Math.sin(angle) * shake;
  }

  private updateFlash(effect: ScreenEffect, easeOut: number): void {
    this.flashColor = effect.params.color || '#FFFFFF';

    if (easeOut < 0.5) {
      this.flashAlpha = effect.intensity * (easeOut * 2);
    } else {
      this.flashAlpha = effect.intensity * (2 - easeOut * 2);
    }
  }

  private updateVignette(effect: ScreenEffect): void {
    const fadeIn = Math.min(1, (effect.duration - effect.remainingTime) * 3);
    const fadeOut = Math.min(1, effect.remainingTime * 3);
    const fade = Math.min(fadeIn, fadeOut);

    this.vignetteIntensity = Math.max(
      this.vignetteIntensity,
      effect.intensity * fade
    );
  }

  private updateBlur(effect: ScreenEffect, easeOut: number): void {
    const fade = 1 - easeOut;
    this.blurAmount = Math.max(this.blurAmount, effect.intensity * fade);
  }

  getShakeOffset(): Vector2D {
    return this.shakeOffset;
  }

  getFlash(): { alpha: number; color: string } {
    return { alpha: this.flashAlpha, color: this.flashColor };
  }

  getVignetteIntensity(): number {
    return this.vignetteIntensity;
  }

  getBlurAmount(): number {
    return this.blurAmount;
  }

  clearEffects(): void {
    this.effects = [];
    this.shakeOffset = { x: 0, y: 0 };
    this.flashAlpha = 0;
    this.vignetteIntensity = 0;
    this.blurAmount = 0;
  }

  hasActiveEffects(): boolean {
    return this.effects.length > 0;
  }

  getActiveEffects(): ScreenEffect[] {
    return [...this.effects];
  }
}
