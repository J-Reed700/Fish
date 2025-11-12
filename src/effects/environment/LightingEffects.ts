import { Vector2D } from '../../types';

export interface LightRay {
  id: string;
  position: Vector2D;
  angle: number;
  length: number;
  width: number;
  alpha: number;
  color: string;
}

export interface Caustic {
  offset: number;
  intensity: number;
  scale: number;
}

export class LightingEffects {
  private lightRays: LightRay[] = [];
  private causticOffset: number = 0;
  private causticIntensity: number = 0.3;
  private screenBounds: { width: number; height: number };
  private lightSourcePosition: Vector2D;

  constructor(screenBounds: { width: number; height: number }) {
    this.screenBounds = screenBounds;
    this.lightSourcePosition = {
      x: screenBounds.width * 0.7,
      y: -100,
    };
  }

  setLightSource(position: Vector2D): void {
    this.lightSourcePosition = position;
    this.updateLightRays();
  }

  createGodRays(count: number = 5): void {
    this.lightRays = [];

    const angleSpread = Math.PI / 3;
    const baseAngle = Math.PI / 2;

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const angle = baseAngle - angleSpread / 2 + angleSpread * t;

      const ray: LightRay = {
        id: `ray-${i}`,
        position: { ...this.lightSourcePosition },
        angle,
        length: this.screenBounds.height * 1.5,
        width: 40 + Math.random() * 60,
        alpha: 0.1 + Math.random() * 0.15,
        color: '#FFE082',
      };

      this.lightRays.push(ray);
    }
  }

  createUnderwaterGodRays(count: number = 7): void {
    this.lightRays = [];

    for (let i = 0; i < count; i++) {
      const x = (i / (count - 1)) * this.screenBounds.width;
      const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.3;

      const ray: LightRay = {
        id: `underwater-ray-${i}`,
        position: { x, y: -50 },
        angle,
        length: this.screenBounds.height + 100,
        width: 50 + Math.random() * 80,
        alpha: 0.08 + Math.random() * 0.12,
        color: '#4FC3F7',
      };

      this.lightRays.push(ray);
    }
  }

  private updateLightRays(): void {
    const count = this.lightRays.length;
    if (count === 0) return;

    const angleSpread = Math.PI / 3;
    const baseAngle = Math.PI / 2;

    this.lightRays.forEach((ray, i) => {
      const t = i / (count - 1);
      ray.position = { ...this.lightSourcePosition };
      ray.angle = baseAngle - angleSpread / 2 + angleSpread * t;
    });
  }

  update(deltaTime: number): void {
    this.causticOffset += deltaTime * 0.3;

    this.lightRays.forEach((ray, index) => {
      const wobble = Math.sin(this.causticOffset * 2 + index) * 0.05;
      ray.alpha = ray.alpha + wobble * 0.05;
    });
  }

  getCausticPattern(): Caustic {
    return {
      offset: this.causticOffset,
      intensity: this.causticIntensity,
      scale: 0.5,
    };
  }

  getLightRays(): LightRay[] {
    return this.lightRays;
  }

  setAmbientIntensity(intensity: number): void {
    this.lightRays.forEach((ray) => {
      ray.alpha = intensity * (0.1 + Math.random() * 0.15);
    });
  }

  setCausticIntensity(intensity: number): void {
    this.causticIntensity = Math.max(0, Math.min(1, intensity));
  }

  clear(): void {
    this.lightRays = [];
  }
}
