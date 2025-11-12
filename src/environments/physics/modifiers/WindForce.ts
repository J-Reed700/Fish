import { PhysicsModifier, Vector2D } from '../../types';
import { Vector } from '../../../engine/Vector';

export class WindForceModifier {
  private modifier: PhysicsModifier;
  private time: number = 0;

  constructor(modifier: PhysicsModifier) {
    this.modifier = modifier;
  }

  apply(position: Vector2D, velocity: Vector2D, deltaTime: number): Vector2D {
    this.time += deltaTime * (this.modifier.timeScale || 1);

    const baseDirection = this.modifier.direction || { x: 1, y: 0 };
    const normalizedBase = Vector.normalize(baseDirection);

    const frequency = this.modifier.frequency || 1;
    const turbulence = this.modifier.turbulence || 0;

    const gustFactor = 1 + Math.sin(this.time * 0.001 * frequency) * 0.3;

    let windDirection = Vector.multiply(normalizedBase, gustFactor);

    if (turbulence > 0) {
      const noiseScale = this.modifier.noiseScale || 0.01;
      const turbulenceX = (Math.sin(position.x * noiseScale + this.time * 0.0005) * turbulence);
      const turbulenceY = (Math.cos(position.y * noiseScale + this.time * 0.0005) * turbulence);

      windDirection = {
        x: windDirection.x + turbulenceX,
        y: windDirection.y + turbulenceY,
      };
    }

    const force = Vector.multiply(windDirection, this.modifier.strength);

    return force;
  }
}
