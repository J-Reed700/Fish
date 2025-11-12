import { ParticleSystemManager } from '../ParticleSystemManager';
import { createWeatherEmitter, WeatherType } from '../emitters/WeatherEmitter';
import { Vector2D } from '../../types';

export interface WeatherConfig {
  type: WeatherType;
  intensity: 'light' | 'medium' | 'heavy';
  windDirection?: Vector2D;
  windStrength?: number;
}

export class WeatherSystem {
  private particleManager: ParticleSystemManager;
  private currentWeather: WeatherType = 'clear';
  private weatherEmitterId: string | null = null;
  private windDirection: Vector2D = { x: 0, y: 0 };
  private windStrength: number = 0;
  private lightningTimer: number = 0;
  private lightningInterval: number = 0;

  constructor(particleManager: ParticleSystemManager) {
    this.particleManager = particleManager;
  }

  setWeather(config: WeatherConfig): void {
    if (this.weatherEmitterId) {
      this.particleManager.removeEmitter(this.weatherEmitterId);
      this.weatherEmitterId = null;
    }

    this.currentWeather = config.type;
    this.windDirection = config.windDirection || { x: 0, y: 0 };
    this.windStrength = config.windStrength || 0;

    if (config.type === 'clear') {
      return;
    }

    const emitterConfig = createWeatherEmitter(config.type, config.intensity);

    if (this.windStrength > 0) {
      emitterConfig.acceleration.x += this.windDirection.x * this.windStrength;
      emitterConfig.acceleration.y += this.windDirection.y * this.windStrength;
    }

    const screenCenter = {
      x: this.particleManager['screenBounds'].width / 2,
      y: -50,
    };

    this.weatherEmitterId = `weather-${config.type}-${Date.now()}`;
    this.particleManager.createEmitter(
      this.weatherEmitterId,
      screenCenter,
      emitterConfig
    );

    if (config.type === 'storm') {
      this.lightningInterval = config.intensity === 'heavy' ? 3 : 5;
      this.lightningTimer = Math.random() * this.lightningInterval;
    } else {
      this.lightningInterval = 0;
    }
  }

  update(deltaTime: number): { lightning: boolean } {
    let lightning = false;

    if (this.currentWeather === 'storm' && this.lightningInterval > 0) {
      this.lightningTimer -= deltaTime;

      if (this.lightningTimer <= 0) {
        lightning = true;
        this.lightningTimer = this.lightningInterval + Math.random() * 2;
      }
    }

    return { lightning };
  }

  getCurrentWeather(): WeatherType {
    return this.currentWeather;
  }

  getWindEffect(): { direction: Vector2D; strength: number } {
    return {
      direction: this.windDirection,
      strength: this.windStrength,
    };
  }

  clearWeather(): void {
    this.setWeather({ type: 'clear', intensity: 'medium' });
  }
}
