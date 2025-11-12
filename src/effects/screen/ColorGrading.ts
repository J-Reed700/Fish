export type ColorGradeFilter =
  | 'warm'
  | 'cool'
  | 'vibrant'
  | 'desaturated'
  | 'sepia'
  | 'noir'
  | 'vintage'
  | 'cyberpunk';

export interface ColorGradeConfig {
  filter: ColorGradeFilter;
  intensity: number;
  duration?: number;
}

export interface ColorMatrix {
  r: [number, number, number, number, number];
  g: [number, number, number, number, number];
  b: [number, number, number, number, number];
  a: [number, number, number, number, number];
}

export class ColorGrading {
  private filter: ColorGradeFilter = 'warm';
  private intensity: number = 1;
  private duration: number = Infinity;
  private elapsed: number = 0;
  private currentIntensity: number = 0;

  start(config: ColorGradeConfig): void {
    this.filter = config.filter;
    this.intensity = config.intensity;
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

    const fadeInDuration = 0.2;
    const fadeOutStart = 0.8;

    if (progress < fadeInDuration) {
      this.currentIntensity = this.intensity * (progress / fadeInDuration);
    } else if (progress > fadeOutStart) {
      const fadeProgress = (progress - fadeOutStart) / (1 - fadeOutStart);
      this.currentIntensity = this.intensity * (1 - fadeProgress);
    } else {
      this.currentIntensity = this.intensity;
    }
  }

  getColorMatrix(): ColorMatrix | null {
    if (this.currentIntensity <= 0) return null;

    const baseMatrix = this.getFilterMatrix(this.filter);
    return this.interpolateMatrix(this.identityMatrix(), baseMatrix, this.currentIntensity);
  }

  private identityMatrix(): ColorMatrix {
    return {
      r: [1, 0, 0, 0, 0],
      g: [0, 1, 0, 0, 0],
      b: [0, 0, 1, 0, 0],
      a: [0, 0, 0, 1, 0],
    };
  }

  private getFilterMatrix(filter: ColorGradeFilter): ColorMatrix {
    switch (filter) {
      case 'warm':
        return {
          r: [1.1, 0, 0, 0, 0.05],
          g: [0, 1.0, 0, 0, 0.02],
          b: [0, 0, 0.9, 0, 0],
          a: [0, 0, 0, 1, 0],
        };
      case 'cool':
        return {
          r: [0.9, 0, 0, 0, 0],
          g: [0, 1.0, 0, 0, 0.02],
          b: [0, 0, 1.1, 0, 0.05],
          a: [0, 0, 0, 1, 0],
        };
      case 'vibrant':
        return {
          r: [1.3, 0, 0, 0, 0],
          g: [0, 1.3, 0, 0, 0],
          b: [0, 0, 1.3, 0, 0],
          a: [0, 0, 0, 1, 0],
        };
      case 'desaturated':
        return {
          r: [0.5, 0.3, 0.2, 0, 0],
          g: [0.3, 0.5, 0.2, 0, 0],
          b: [0.3, 0.3, 0.4, 0, 0],
          a: [0, 0, 0, 1, 0],
        };
      case 'sepia':
        return {
          r: [0.393, 0.769, 0.189, 0, 0],
          g: [0.349, 0.686, 0.168, 0, 0],
          b: [0.272, 0.534, 0.131, 0, 0],
          a: [0, 0, 0, 1, 0],
        };
      case 'noir':
        return {
          r: [0.3, 0.59, 0.11, 0, 0],
          g: [0.3, 0.59, 0.11, 0, 0],
          b: [0.3, 0.59, 0.11, 0, 0],
          a: [0, 0, 0, 1, 0],
        };
      case 'vintage':
        return {
          r: [1.0, 0.1, 0.1, 0, 0.05],
          g: [0.1, 0.9, 0.1, 0, 0.03],
          b: [0.1, 0.1, 0.8, 0, 0.02],
          a: [0, 0, 0, 0.95, 0],
        };
      case 'cyberpunk':
        return {
          r: [1.2, 0, 0.2, 0, 0],
          g: [0, 0.8, 0, 0, 0],
          b: [0.2, 0, 1.3, 0, 0.1],
          a: [0, 0, 0, 1, 0],
        };
      default:
        return this.identityMatrix();
    }
  }

  private interpolateMatrix(a: ColorMatrix, b: ColorMatrix, t: number): ColorMatrix {
    return {
      r: this.lerpArray(a.r, b.r, t),
      g: this.lerpArray(a.g, b.g, t),
      b: this.lerpArray(a.b, b.b, t),
      a: this.lerpArray(a.a, b.a, t),
    };
  }

  private lerpArray(
    a: [number, number, number, number, number],
    b: [number, number, number, number, number],
    t: number
  ): [number, number, number, number, number] {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
      a[3] + (b[3] - a[3]) * t,
      a[4] + (b[4] - a[4]) * t,
    ];
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
