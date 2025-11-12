import { Fish, BoidsConfig, Vector2D } from '../types';
import { Vector } from './Vector';
import { createNoise2D } from 'simplex-noise';
import { SpatialHash } from '../optimization/SpatialHash';
import { Environment } from '../environments/types';
import { PhysicsModifierEngine } from '../environments/physics/PhysicsModifiers';

export class BoidsEngine {
  private static simplex = createNoise2D();
  private static elapsedTime = 0;
  private static spatialHash = new SpatialHash<Fish>(50);
  private static physicsEngine: PhysicsModifierEngine | null = null;

  static setEnvironment(environment: Environment | null): void {
    if (environment && environment.physicsModifiers.length > 0) {
      this.physicsEngine = new PhysicsModifierEngine(environment.physicsModifiers);
    } else {
      this.physicsEngine = null;
    }
  }

  static updateWithEnvironment(
    fish: Fish[],
    config: BoidsConfig,
    bounds: { width: number; height: number },
    deltaTime: number,
    touchPoint: Vector2D | null,
    environment: Environment | null
  ): Fish[] {
    if (this.physicsEngine === null && environment) {
      this.setEnvironment(environment);
    }

    return this.updateWithTouch(fish, config, bounds, deltaTime, touchPoint);
  }

  static updateWithTouch(
    fish: Fish[],
    config: BoidsConfig,
    bounds: { width: number; height: number },
    deltaTime: number,
    touchPoint: Vector2D | null
  ): Fish[] {
    if (!touchPoint) {
      return this.update(fish, config, bounds, deltaTime);
    }

    const FLEE_DISTANCE = 150;
    const RIPPLE_DISTANCE = 150;
    const RIPPLE_EXTENDED_DISTANCE = 250;
    const DIRECT_FLEE_FORCE = 5.0;
    const RIPPLE_STRONG_FORCE = 2.0;
    const RIPPLE_WEAK_FORCE = 1.0;

    const RIPPLE_DISTANCE_SQ = RIPPLE_DISTANCE * RIPPLE_DISTANCE;
    const RIPPLE_EXTENDED_DISTANCE_SQ = RIPPLE_EXTENDED_DISTANCE * RIPPLE_EXTENDED_DISTANCE;

    const affectedFishIds = new Set<string>();
    const fleeForces = new Map<string, Vector2D>();

    this.spatialHash.clear();
    fish.forEach((f) => this.spatialHash.insert(f));

    for (const f of fish) {
      const distToTouch = Vector.distance(f.position, touchPoint);

      if (distToTouch < FLEE_DISTANCE) {
        const fleeDirection = Vector.subtract(f.position, touchPoint);
        const normalized = Vector.normalize(fleeDirection);
        const fleeForce = Vector.multiply(normalized, f.maxForce * DIRECT_FLEE_FORCE);
        fleeForces.set(f.id, fleeForce);
        affectedFishIds.add(f.id);

        const candidates = this.spatialHash.getNearby(f.position, RIPPLE_EXTENDED_DISTANCE);
        for (const neighbor of candidates) {
          if (neighbor.id === f.id || affectedFishIds.has(neighbor.id)) continue;

          const dx = neighbor.position.x - f.position.x;
          const dy = neighbor.position.y - f.position.y;
          const distToNeighborSq = dx * dx + dy * dy;

          if (distToNeighborSq < RIPPLE_DISTANCE_SQ) {
            const rippleDirection = Vector.subtract(neighbor.position, touchPoint);
            const normalizedRipple = Vector.normalize(rippleDirection);
            const rippleForce = Vector.multiply(
              normalizedRipple,
              neighbor.maxForce * RIPPLE_STRONG_FORCE
            );
            fleeForces.set(neighbor.id, rippleForce);
            affectedFishIds.add(neighbor.id);
          } else if (distToNeighborSq < RIPPLE_EXTENDED_DISTANCE_SQ) {
            const rippleDirection = Vector.subtract(neighbor.position, touchPoint);
            const normalizedRipple = Vector.normalize(rippleDirection);
            const rippleForce = Vector.multiply(
              normalizedRipple,
              neighbor.maxForce * RIPPLE_WEAK_FORCE
            );
            if (!fleeForces.has(neighbor.id)) {
              fleeForces.set(neighbor.id, rippleForce);
            }
          }
        }
      }
    }

    this.elapsedTime += deltaTime;

    const perceptionRadius = Math.max(
      config.separationDistance,
      config.alignmentDistance,
      config.cohesionDistance
    );

    return fish.map((currentFish, index) => {
      const neighbors = this.findNeighbors(
        currentFish,
        this.spatialHash,
        perceptionRadius
      );

      const fleeForce = fleeForces.get(currentFish.id) || { x: 0, y: 0 };
      const hasFleeForce = Vector.magnitude(fleeForce) > 0;

      const separationForce = this.calculateSeparation(
        currentFish,
        neighbors,
        config
      );
      const alignmentForce = hasFleeForce
        ? { x: 0, y: 0 }
        : this.calculateAlignment(currentFish, neighbors, config);
      const cohesionForce = hasFleeForce
        ? { x: 0, y: 0 }
        : this.calculateCohesion(currentFish, neighbors, config);
      const edgeForce = this.calculateEdgeAvoidance(
        currentFish,
        bounds,
        config
      );

      let acceleration = Vector.add(currentFish.acceleration, separationForce);
      acceleration = Vector.add(acceleration, alignmentForce);
      acceleration = Vector.add(acceleration, cohesionForce);
      acceleration = Vector.add(acceleration, edgeForce);
      acceleration = Vector.add(acceleration, fleeForce);

      let velocity = Vector.add(
        currentFish.velocity,
        Vector.multiply(acceleration, deltaTime)
      );
      velocity = Vector.limit(velocity, currentFish.maxSpeed);

      let position = Vector.add(
        currentFish.position,
        Vector.multiply(velocity, deltaTime)
      );

      const noiseTime = this.elapsedTime * 0.02;
      const noiseSeed = currentFish.id.charCodeAt(0) * index;
      const driftX = this.simplex(noiseTime, noiseSeed) * 25;
      const driftY = this.simplex(noiseTime, noiseSeed + 1000) * 25;

      position = Vector.add(position, { x: driftX * deltaTime, y: driftY * deltaTime });

      if (this.physicsEngine) {
        const environmentForce = this.physicsEngine.applyToFish(
          position,
          velocity,
          deltaTime
        );
        velocity = Vector.add(velocity, Vector.multiply(environmentForce, deltaTime));
        velocity = Vector.limit(velocity, currentFish.maxSpeed);
      }

      const rotation = Math.atan2(velocity.y, velocity.x);

      return {
        ...currentFish,
        position,
        velocity,
        acceleration: { x: 0, y: 0 },
        rotation,
      };
    });
  }

  static update(
    fish: Fish[],
    config: BoidsConfig,
    bounds: { width: number; height: number },
    deltaTime: number
  ): Fish[] {
    this.elapsedTime += deltaTime;

    const perceptionRadius = Math.max(
      config.separationDistance,
      config.alignmentDistance,
      config.cohesionDistance
    );

    this.spatialHash.clear();
    fish.forEach((f) => this.spatialHash.insert(f));

    return fish.map((currentFish, index) => {
      const neighbors = this.findNeighbors(
        currentFish,
        this.spatialHash,
        perceptionRadius
      );

      const separationForce = this.calculateSeparation(
        currentFish,
        neighbors,
        config
      );
      const alignmentForce = this.calculateAlignment(
        currentFish,
        neighbors,
        config
      );
      const cohesionForce = this.calculateCohesion(
        currentFish,
        neighbors,
        config
      );
      const edgeForce = this.calculateEdgeAvoidance(
        currentFish,
        bounds,
        config
      );

      let acceleration = Vector.add(currentFish.acceleration, separationForce);
      acceleration = Vector.add(acceleration, alignmentForce);
      acceleration = Vector.add(acceleration, cohesionForce);
      acceleration = Vector.add(acceleration, edgeForce);

      let velocity = Vector.add(
        currentFish.velocity,
        Vector.multiply(acceleration, deltaTime)
      );
      velocity = Vector.limit(velocity, currentFish.maxSpeed);

      let position = Vector.add(
        currentFish.position,
        Vector.multiply(velocity, deltaTime)
      );

      const noiseTime = this.elapsedTime * 0.02;
      const noiseSeed = currentFish.id.charCodeAt(0) * index;
      const driftX = this.simplex(noiseTime, noiseSeed) * 25;
      const driftY = this.simplex(noiseTime, noiseSeed + 1000) * 25;

      position = Vector.add(position, { x: driftX * deltaTime, y: driftY * deltaTime });

      if (this.physicsEngine) {
        const environmentForce = this.physicsEngine.applyToFish(
          position,
          velocity,
          deltaTime
        );
        velocity = Vector.add(velocity, Vector.multiply(environmentForce, deltaTime));
        velocity = Vector.limit(velocity, currentFish.maxSpeed);
      }

      const rotation = Math.atan2(velocity.y, velocity.x);

      return {
        ...currentFish,
        position,
        velocity,
        acceleration: { x: 0, y: 0 },
        rotation,
      };
    });
  }

  private static findNeighbors(
    fish: Fish,
    spatialHash: SpatialHash<Fish>,
    perceptionRadius: number
  ): Fish[] {
    const candidates = spatialHash.getNearby(fish.position, perceptionRadius);
    const neighbors: Fish[] = [];
    const radiusSquared = perceptionRadius * perceptionRadius;

    for (const other of candidates) {
      if (other.id === fish.id) continue;

      const dx = other.position.x - fish.position.x;
      const dy = other.position.y - fish.position.y;
      const distSquared = dx * dx + dy * dy;

      if (distSquared < radiusSquared) {
        neighbors.push(other);
      }
    }

    return neighbors;
  }

  private static calculateSeparation(
    fish: Fish,
    neighbors: Fish[],
    config: BoidsConfig
  ): Vector2D {
    if (neighbors.length === 0) {
      return { x: 0, y: 0 };
    }

    let steer: Vector2D = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const distance = Vector.distance(fish.position, neighbor.position);

      if (distance < config.separationDistance && distance > 0) {
        const diff = Vector.subtract(fish.position, neighbor.position);
        const normalized = Vector.normalize(diff);
        const weighted = Vector.divide(normalized, distance);
        steer = Vector.add(steer, weighted);
        count++;
      }
    }

    if (count === 0) {
      return { x: 0, y: 0 };
    }

    steer = Vector.divide(steer, count);

    if (Vector.magnitude(steer) > 0) {
      steer = Vector.setMagnitude(steer, fish.maxSpeed);
      steer = Vector.subtract(steer, fish.velocity);
      steer = Vector.limit(steer, fish.maxForce);
    }

    return Vector.multiply(steer, config.separationWeight);
  }

  private static calculateAlignment(
    fish: Fish,
    neighbors: Fish[],
    config: BoidsConfig
  ): Vector2D {
    if (neighbors.length === 0) {
      return { x: 0, y: 0 };
    }

    let avgVelocity: Vector2D = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const distance = Vector.distance(fish.position, neighbor.position);

      if (distance < config.alignmentDistance) {
        avgVelocity = Vector.add(avgVelocity, neighbor.velocity);
        count++;
      }
    }

    if (count === 0) {
      return { x: 0, y: 0 };
    }

    avgVelocity = Vector.divide(avgVelocity, count);

    let steer = Vector.subtract(avgVelocity, fish.velocity);
    steer = Vector.limit(steer, fish.maxForce);

    return Vector.multiply(steer, config.alignmentWeight);
  }

  private static calculateCohesion(
    fish: Fish,
    neighbors: Fish[],
    config: BoidsConfig
  ): Vector2D {
    if (neighbors.length === 0) {
      return { x: 0, y: 0 };
    }

    let centerOfMass: Vector2D = { x: 0, y: 0 };
    let count = 0;

    for (const neighbor of neighbors) {
      const distance = Vector.distance(fish.position, neighbor.position);

      if (distance < config.cohesionDistance) {
        centerOfMass = Vector.add(centerOfMass, neighbor.position);
        count++;
      }
    }

    if (count === 0) {
      return { x: 0, y: 0 };
    }

    centerOfMass = Vector.divide(centerOfMass, count);

    const desired = Vector.subtract(centerOfMass, fish.position);
    const desiredWithSpeed = Vector.setMagnitude(desired, fish.maxSpeed);

    let steer = Vector.subtract(desiredWithSpeed, fish.velocity);
    steer = Vector.limit(steer, fish.maxForce);

    return Vector.multiply(steer, config.cohesionWeight);
  }

  private static calculateEdgeAvoidance(
    fish: Fish,
    bounds: { width: number; height: number },
    config: BoidsConfig
  ): Vector2D {
    let force: Vector2D = { x: 0, y: 0 };

    if (fish.position.x < config.edgeMargin) {
      force.x = (config.edgeMargin - fish.position.x) / config.edgeMargin;
    } else if (fish.position.x > bounds.width - config.edgeMargin) {
      force.x =
        -(fish.position.x - (bounds.width - config.edgeMargin)) /
        config.edgeMargin;
    }

    if (fish.position.y < config.edgeMargin) {
      force.y = (config.edgeMargin - fish.position.y) / config.edgeMargin;
    } else if (fish.position.y > bounds.height - config.edgeMargin) {
      force.y =
        -(fish.position.y - (bounds.height - config.edgeMargin)) /
        config.edgeMargin;
    }

    return Vector.multiply(force, fish.maxForce);
  }
}
