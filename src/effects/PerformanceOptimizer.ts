import { VisualEffectConfig } from '../types';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  particleCount: number;
  activeEffects: number;
  memoryUsage?: number;
}

export interface QualitySettings {
  particleQuality: 'low' | 'medium' | 'high';
  enableMotionBlur: boolean;
  enableBloom: boolean;
  enableShadows: boolean;
  maxParticles: number;
  particleRenderBatchSize: number;
}

export class PerformanceOptimizer {
  private targetFPS: number = 60;
  private currentFPS: number = 60;
  private frameTimeSamples: number[] = [];
  private maxSamples: number = 60;
  private qualitySettings: QualitySettings;
  private adaptiveQuality: boolean;
  private lastQualityAdjustment: number = 0;
  private qualityAdjustmentCooldown: number = 3000;
  private lowFPSThreshold: number = 50;
  private criticalFPSThreshold: number = 40;

  constructor(
    config: VisualEffectConfig,
    targetFPS: number = 60,
    adaptiveQuality: boolean = true
  ) {
    this.targetFPS = targetFPS;
    this.adaptiveQuality = adaptiveQuality;
    this.qualitySettings = {
      particleQuality: config.performance.particleQuality,
      enableMotionBlur: config.performance.enableMotionBlur,
      enableBloom: config.performance.enableBloom,
      enableShadows: config.performance.enableShadows,
      maxParticles: config.particles.maxParticles,
      particleRenderBatchSize: config.particles.renderBatchSize,
    };
  }

  updateMetrics(metrics: PerformanceMetrics): void {
    this.currentFPS = metrics.fps;

    this.frameTimeSamples.push(metrics.frameTime);
    if (this.frameTimeSamples.length > this.maxSamples) {
      this.frameTimeSamples.shift();
    }

    if (this.adaptiveQuality) {
      this.checkAndAdjustQuality(metrics);
    }
  }

  private checkAndAdjustQuality(metrics: PerformanceMetrics): void {
    const now = Date.now();
    if (now - this.lastQualityAdjustment < this.qualityAdjustmentCooldown) {
      return;
    }

    const avgFPS = this.getAverageFPS();

    if (avgFPS < this.criticalFPSThreshold) {
      this.reduceQualityAggressively();
      this.lastQualityAdjustment = now;
    } else if (avgFPS < this.lowFPSThreshold) {
      this.reduceQuality();
      this.lastQualityAdjustment = now;
    } else if (avgFPS > this.targetFPS - 5) {
      this.increaseQuality();
      this.lastQualityAdjustment = now;
    }
  }

  private reduceQualityAggressively(): void {
    if (this.qualitySettings.particleQuality !== 'low') {
      this.qualitySettings.particleQuality = 'low';
      this.qualitySettings.maxParticles = 200;
    }
    this.qualitySettings.enableMotionBlur = false;
    this.qualitySettings.enableBloom = false;
    this.qualitySettings.enableShadows = false;
  }

  private reduceQuality(): void {
    if (this.qualitySettings.particleQuality === 'high') {
      this.qualitySettings.particleQuality = 'medium';
      this.qualitySettings.maxParticles = 350;
    } else if (this.qualitySettings.particleQuality === 'medium') {
      this.qualitySettings.particleQuality = 'low';
      this.qualitySettings.maxParticles = 250;
    }

    if (this.qualitySettings.enableMotionBlur) {
      this.qualitySettings.enableMotionBlur = false;
    } else if (this.qualitySettings.enableBloom) {
      this.qualitySettings.enableBloom = false;
    } else if (this.qualitySettings.enableShadows) {
      this.qualitySettings.enableShadows = false;
    }
  }

  private increaseQuality(): void {
    if (this.qualitySettings.particleQuality === 'low') {
      this.qualitySettings.particleQuality = 'medium';
      this.qualitySettings.maxParticles = 350;
    } else if (this.qualitySettings.particleQuality === 'medium') {
      this.qualitySettings.particleQuality = 'high';
      this.qualitySettings.maxParticles = 500;
    }

    if (!this.qualitySettings.enableShadows) {
      this.qualitySettings.enableShadows = true;
    } else if (!this.qualitySettings.enableBloom) {
      this.qualitySettings.enableBloom = true;
    } else if (!this.qualitySettings.enableMotionBlur) {
      this.qualitySettings.enableMotionBlur = true;
    }
  }

  getAverageFPS(): number {
    if (this.frameTimeSamples.length === 0) return this.targetFPS;

    const avgFrameTime =
      this.frameTimeSamples.reduce((a, b) => a + b, 0) /
      this.frameTimeSamples.length;

    return 1000 / avgFrameTime;
  }

  getQualitySettings(): QualitySettings {
    return { ...this.qualitySettings };
  }

  setQualityPreset(preset: 'low' | 'medium' | 'high'): void {
    switch (preset) {
      case 'low':
        this.qualitySettings = {
          particleQuality: 'low',
          enableMotionBlur: false,
          enableBloom: false,
          enableShadows: false,
          maxParticles: 200,
          particleRenderBatchSize: 50,
        };
        break;
      case 'medium':
        this.qualitySettings = {
          particleQuality: 'medium',
          enableMotionBlur: false,
          enableBloom: true,
          enableShadows: true,
          maxParticles: 350,
          particleRenderBatchSize: 75,
        };
        break;
      case 'high':
        this.qualitySettings = {
          particleQuality: 'high',
          enableMotionBlur: true,
          enableBloom: true,
          enableShadows: true,
          maxParticles: 500,
          particleRenderBatchSize: 100,
        };
        break;
    }
  }

  shouldCullParticle(
    particlePosition: { x: number; y: number },
    screenBounds: { width: number; height: number },
    margin: number = 100
  ): boolean {
    return (
      particlePosition.x < -margin ||
      particlePosition.x > screenBounds.width + margin ||
      particlePosition.y < -margin ||
      particlePosition.y > screenBounds.height + margin
    );
  }

  shouldRenderEffect(effectType: string): boolean {
    switch (effectType) {
      case 'motion-blur':
        return this.qualitySettings.enableMotionBlur;
      case 'bloom':
        return this.qualitySettings.enableBloom;
      case 'shadow':
        return this.qualitySettings.enableShadows;
      default:
        return true;
    }
  }

  getParticleLOD(
    distance: number,
    maxDistance: number = 1000
  ): 'high' | 'medium' | 'low' {
    const normalizedDistance = distance / maxDistance;

    if (this.qualitySettings.particleQuality === 'low') {
      return 'low';
    } else if (this.qualitySettings.particleQuality === 'medium') {
      return normalizedDistance < 0.5 ? 'medium' : 'low';
    } else {
      if (normalizedDistance < 0.3) return 'high';
      if (normalizedDistance < 0.7) return 'medium';
      return 'low';
    }
  }

  enableAdaptiveQuality(enable: boolean): void {
    this.adaptiveQuality = enable;
  }

  reset(): void {
    this.frameTimeSamples = [];
    this.currentFPS = this.targetFPS;
    this.lastQualityAdjustment = 0;
  }

  getPerformanceReport(): {
    avgFPS: number;
    quality: string;
    isOptimal: boolean;
    recommendations: string[];
  } {
    const avgFPS = this.getAverageFPS();
    const recommendations: string[] = [];

    if (avgFPS < this.lowFPSThreshold) {
      recommendations.push('Reduce particle count');
      recommendations.push('Disable motion blur');
      recommendations.push('Lower particle quality');
    }

    if (!this.qualitySettings.enableMotionBlur && avgFPS > this.targetFPS - 10) {
      recommendations.push('Can enable motion blur');
    }

    return {
      avgFPS,
      quality: this.qualitySettings.particleQuality,
      isOptimal: avgFPS >= this.targetFPS - 5,
      recommendations,
    };
  }
}
