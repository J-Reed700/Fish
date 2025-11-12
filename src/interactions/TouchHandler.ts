import { Fish, Mouse, LaserPointer, Insect, Particle, Vector2D } from '../types';
import { Vector } from '../engine/Vector';
import { ParticleSystem } from '../entities/ParticleSystem';
import { CAT_PAW_MULTIPLIER } from '../config/GameConfig';
import * as Haptics from 'expo-haptics';

export class TouchHandler {
  static async handleTouch(
    touchPoint: Vector2D,
    fish: Fish[],
    fishRadius?: number
  ): Promise<{
    hitFish: Fish[];
    particles: Particle[];
  }> {
    const hitFish: Fish[] = [];

    for (const f of fish) {
      const distance = Vector.distance(touchPoint, f.position);
      const hitRadius = fishRadius ?? (f.size * CAT_PAW_MULTIPLIER);

      if (distance < hitRadius) {
        hitFish.push(f);
      }
    }

    if (hitFish.length > 0) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not supported on this platform
      }
    }

    const particles = ParticleSystem.createSplash(touchPoint, 10);

    return { hitFish, particles };
  }

  static async handleMouseTouch(
    touchPoint: Vector2D,
    mice: Mouse[]
  ): Promise<{
    hitMice: Mouse[];
    particles: Particle[];
  }> {
    const hitMice: Mouse[] = [];

    for (const m of mice) {
      const distance = Vector.distance(touchPoint, m.position);
      const hitRadius = m.size * CAT_PAW_MULTIPLIER;

      if (distance < hitRadius) {
        hitMice.push(m);
      }
    }

    if (hitMice.length > 0) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not supported on this platform
      }
    }

    const particles = ParticleSystem.createSplash(touchPoint, 5);

    return { hitMice, particles };
  }

  static async handleLaserTouch(
    touchPoint: Vector2D,
    lasers: LaserPointer[]
  ): Promise<{
    hitLasers: LaserPointer[];
    particles: Particle[];
  }> {
    const hitLasers: LaserPointer[] = [];

    for (const laser of lasers) {
      const distance = Vector.distance(touchPoint, laser.position);
      const hitRadius = laser.size * 2;

      if (distance < hitRadius) {
        hitLasers.push(laser);
      }
    }

    if (hitLasers.length > 0) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not supported on this platform
      }
    }

    const particles = ParticleSystem.createSplash(touchPoint, 3);

    return { hitLasers, particles };
  }

  static async handleInsectTouch(
    touchPoint: Vector2D,
    insects: Insect[]
  ): Promise<{
    hitInsects: Insect[];
    particles: Particle[];
  }> {
    const hitInsects: Insect[] = [];

    for (const insect of insects) {
      const distance = Vector.distance(touchPoint, insect.position);
      const hitRadius = insect.size * CAT_PAW_MULTIPLIER;

      if (distance < hitRadius) {
        hitInsects.push(insect);
      }
    }

    if (hitInsects.length > 0) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not supported on this platform
      }
    }

    const particles = ParticleSystem.createSplash(touchPoint, 3);

    return { hitInsects, particles };
  }

  static applyTouchForce(
    fish: Fish,
    touchPoint: Vector2D,
    force: number
  ): Fish {
    const direction = Vector.subtract(fish.position, touchPoint);
    const normalizedDirection = Vector.normalize(direction);
    const forceVec = Vector.multiply(normalizedDirection, force);
    const newAcceleration = Vector.add(fish.acceleration, forceVec);

    return {
      ...fish,
      acceleration: newAcceleration,
    };
  }
}
