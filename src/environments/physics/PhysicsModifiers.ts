import { PhysicsModifier, Vector2D, PhysicsForce } from '../types';
import {
  WaterCurrentModifier,
  WindForceModifier,
  HumidAirModifier,
  StrongWindModifier,
  ZeroGravityModifier,
  DrippingWaterModifier,
  SavannaWindModifier
} from './modifiers';
import { Vector } from '../../engine/Vector';

export class PhysicsModifierEngine {
  private modifiers: Map<string, any> = new Map();
  private physicsModifiers: PhysicsModifier[];

  constructor(physicsModifiers: PhysicsModifier[]) {
    this.physicsModifiers = physicsModifiers;
    this.initializeModifiers();
  }

  private initializeModifiers(): void {
    for (const modifier of this.physicsModifiers) {
      const key = `${modifier.type}_${modifier.strength}`;

      switch (modifier.type) {
        case 'waterCurrent':
          this.modifiers.set(key, new WaterCurrentModifier(modifier));
          break;
        case 'windForce':
          this.modifiers.set(key, new WindForceModifier(modifier));
          break;
        case 'humidAir':
          this.modifiers.set(key, new HumidAirModifier(modifier));
          break;
        case 'strongWind':
          this.modifiers.set(key, new StrongWindModifier(modifier));
          break;
        case 'zeroGravity':
          this.modifiers.set(key, new ZeroGravityModifier(modifier));
          break;
        case 'drippingWater':
          this.modifiers.set(key, new DrippingWaterModifier(modifier));
          break;
        case 'savannaWind':
          this.modifiers.set(key, new SavannaWindModifier(modifier));
          break;
        case 'drift':
        case 'gravity':
        case 'turbulence':
          this.modifiers.set(key, modifier);
          break;
      }
    }
  }

  applyToFish(position: Vector2D, velocity: Vector2D, deltaTime: number): Vector2D {
    let totalForce: Vector2D = { x: 0, y: 0 };

    for (const modifier of this.physicsModifiers) {
      if (!modifier.affectsFish) continue;

      const force = this.calculateForce(modifier, position, velocity, deltaTime);
      totalForce = Vector.add(totalForce, force);
    }

    return totalForce;
  }

  applyToParticle(position: Vector2D, velocity: Vector2D, deltaTime: number): Vector2D {
    let totalForce: Vector2D = { x: 0, y: 0 };

    for (const modifier of this.physicsModifiers) {
      if (!modifier.affectsParticles) continue;

      const force = this.calculateForce(modifier, position, velocity, deltaTime);
      totalForce = Vector.add(totalForce, force);
    }

    return totalForce;
  }

  calculateForce(
    modifier: PhysicsModifier,
    position: Vector2D,
    velocity: Vector2D,
    deltaTime: number
  ): Vector2D {
    const key = `${modifier.type}_${modifier.strength}`;
    const modifierInstance = this.modifiers.get(key);

    if (modifierInstance && typeof modifierInstance.apply === 'function') {
      return modifierInstance.apply(position, velocity, deltaTime);
    }

    switch (modifier.type) {
      case 'drift': {
        const direction = modifier.direction || { x: 1, y: 0 };
        const normalizedDirection = Vector.normalize(direction);
        return Vector.multiply(normalizedDirection, modifier.strength);
      }

      case 'gravity': {
        const direction = modifier.direction || { x: 0, y: 1 };
        const normalizedDirection = Vector.normalize(direction);
        return Vector.multiply(normalizedDirection, modifier.strength);
      }

      case 'turbulence': {
        const randomAngle = Math.random() * Math.PI * 2;
        const randomForce = Vector.fromAngle(randomAngle, modifier.strength);
        return randomForce;
      }

      default:
        return { x: 0, y: 0 };
    }
  }

  getAllForces(position: Vector2D, velocity: Vector2D, deltaTime: number, affectsFish: boolean): PhysicsForce[] {
    const forces: PhysicsForce[] = [];

    for (const modifier of this.physicsModifiers) {
      const shouldApply = affectsFish ? modifier.affectsFish : modifier.affectsParticles;
      if (!shouldApply) continue;

      const force = this.calculateForce(modifier, position, velocity, deltaTime);
      forces.push({
        force,
        type: modifier.type,
        priority: this.getPriority(modifier.type),
      });
    }

    return forces.sort((a, b) => b.priority - a.priority);
  }

  private getPriority(type: string): number {
    switch (type) {
      case 'gravity': return 10;
      case 'waterCurrent': return 8;
      case 'windForce': return 7;
      case 'strongWind': return 7;
      case 'savannaWind': return 6;
      case 'humidAir': return 5;
      case 'drift': return 5;
      case 'zeroGravity': return 4;
      case 'drippingWater': return 4;
      case 'turbulence': return 3;
      default: return 1;
    }
  }

  updateModifiers(newModifiers: PhysicsModifier[]): void {
    this.physicsModifiers = newModifiers;
    this.modifiers.clear();
    this.initializeModifiers();
  }
}
