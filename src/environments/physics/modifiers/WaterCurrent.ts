import { PhysicsModifier, Vector2D } from '../../types';
import { Vector } from '../../../engine/Vector';

export class WaterCurrentModifier {
  private modifier: PhysicsModifier;
  private time: number = 0;

  constructor(modifier: PhysicsModifier) {
    this.modifier = modifier;
  }

  apply(position: Vector2D, velocity: Vector2D, deltaTime: number): Vector2D {
    this.time += deltaTime * (this.modifier.timeScale || 1);

    const noiseScale = this.modifier.noiseScale || 0.01;
    const turbulence = this.modifier.turbulence || 0.2;

    const noiseX = this.simplexNoise(
      position.x * noiseScale,
      position.y * noiseScale,
      this.time * 0.001
    );
    const noiseY = this.simplexNoise(
      position.x * noiseScale + 100,
      position.y * noiseScale + 100,
      this.time * 0.001
    );

    const baseDirection = this.modifier.direction || { x: 1, y: 0 };
    const normalizedBase = Vector.normalize(baseDirection);

    const flowDirection = {
      x: normalizedBase.x + noiseX * turbulence,
      y: normalizedBase.y + noiseY * turbulence,
    };

    const normalizedFlow = Vector.normalize(flowDirection);

    const force = Vector.multiply(normalizedFlow, this.modifier.strength);

    return force;
  }

  private simplexNoise(x: number, y: number, z: number): number {
    const X = Math.floor(x);
    const Y = Math.floor(y);
    const Z = Math.floor(z);

    const xf = x - X;
    const yf = y - Y;
    const zf = z - Z;

    const u = this.fade(xf);
    const v = this.fade(yf);
    const w = this.fade(zf);

    const a = this.hash(X) + Y;
    const aa = this.hash(a) + Z;
    const ab = this.hash(a + 1) + Z;
    const b = this.hash(X + 1) + Y;
    const ba = this.hash(b) + Z;
    const bb = this.hash(b + 1) + Z;

    const x1 = this.lerp(
      this.grad(this.hash(aa), xf, yf, zf),
      this.grad(this.hash(ba), xf - 1, yf, zf),
      u
    );
    const x2 = this.lerp(
      this.grad(this.hash(ab), xf, yf - 1, zf),
      this.grad(this.hash(bb), xf - 1, yf - 1, zf),
      u
    );

    const y1 = this.lerp(x1, x2, v);

    const x3 = this.lerp(
      this.grad(this.hash(aa + 1), xf, yf, zf - 1),
      this.grad(this.hash(ba + 1), xf - 1, yf, zf - 1),
      u
    );
    const x4 = this.lerp(
      this.grad(this.hash(ab + 1), xf, yf - 1, zf - 1),
      this.grad(this.hash(bb + 1), xf - 1, yf - 1, zf - 1),
      u
    );

    const y2 = this.lerp(x3, x4, v);

    return this.lerp(y1, y2, w);
  }

  private hash(n: number): number {
    n = (n << 13) ^ n;
    return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
}
