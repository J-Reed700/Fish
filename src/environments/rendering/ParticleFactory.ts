import { ParticleConfig, ParticleInstance, Vector2D, PhysicsModifier } from '../types';
import { PhysicsModifierEngine } from '../physics/PhysicsModifiers';
import { Vector } from '../../engine/Vector';

export class EnvironmentParticleFactory {
  private particles: ParticleInstance[] = [];
  private physicsEngine: PhysicsModifierEngine;
  private particleConfigs: ParticleConfig[];
  private width: number;
  private height: number;
  private timeSinceLastSpawn: Map<string, number> = new Map();

  constructor(
    particleConfigs: ParticleConfig[],
    physicsModifiers: PhysicsModifier[],
    width: number,
    height: number
  ) {
    this.particleConfigs = particleConfigs;
    this.physicsEngine = new PhysicsModifierEngine(physicsModifiers);
    this.width = width;
    this.height = height;

    this.initializeParticles();
  }

  private initializeParticles(): void {
    for (const config of this.particleConfigs) {
      const count = Math.floor(config.density * 100);
      for (let i = 0; i < count; i++) {
        this.spawnParticle(config);
      }
    }
  }

  private spawnParticle(config: ParticleConfig): void {
    const currentCount = this.particles.filter(p => p.type === config.type).length;
    if (config.maxCount && currentCount >= config.maxCount) {
      return;
    }

    const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
    const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Vector.fromAngle(angle, speed);

    const particle: ParticleInstance = {
      id: `${config.type}_${Date.now()}_${Math.random()}`,
      type: config.type,
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: velocity.x,
      vy: velocity.y,
      size,
      color: config.color,
      opacity: config.opacity,
      rotation: config.rotation ? Math.random() * Math.PI * 2 : 0,
      rotationSpeed: config.rotation ? (Math.random() - 0.5) * 0.05 : 0,
      lifetime: config.lifetime || Infinity,
      age: 0,
    };

    this.particles.push(particle);
  }

  updateParticles(deltaTime: number): ParticleInstance[] {
    const deltaSeconds = deltaTime / 1000;

    for (const config of this.particleConfigs) {
      const timeSince = this.timeSinceLastSpawn.get(config.type) || 0;
      const spawnRate = config.spawnRate || 1;
      const spawnInterval = 1000 / spawnRate;

      if (timeSince >= spawnInterval) {
        this.spawnParticle(config);
        this.timeSinceLastSpawn.set(config.type, 0);
      } else {
        this.timeSinceLastSpawn.set(config.type, timeSince + deltaTime);
      }
    }

    this.particles = this.particles.filter(particle => {
      particle.age += deltaTime;

      if (particle.age >= particle.lifetime) {
        return false;
      }

      const position: Vector2D = { x: particle.x, y: particle.y };
      const velocity: Vector2D = { x: particle.vx, y: particle.vy };

      const environmentForce = this.physicsEngine.applyToParticle(
        position,
        velocity,
        deltaTime
      );

      const config = this.particleConfigs.find(c => c.type === particle.type);
      if (config && config.acceleration) {
        const accel = Vector.multiply(config.acceleration, deltaSeconds);
        particle.vx += accel.x + environmentForce.x * deltaSeconds;
        particle.vy += accel.y + environmentForce.y * deltaSeconds;
      } else {
        particle.vx += environmentForce.x * deltaSeconds;
        particle.vy += environmentForce.y * deltaSeconds;
      }

      particle.x += particle.vx * deltaSeconds;
      particle.y += particle.vy * deltaSeconds;

      if (particle.rotation !== 0) {
        particle.rotation += particle.rotationSpeed;
      }

      if (particle.x < -50 || particle.x > this.width + 50 ||
          particle.y < -50 || particle.y > this.height + 50) {
        return false;
      }

      return true;
    });

    return this.particles;
  }

  getParticles(): ParticleInstance[] {
    return this.particles;
  }

  clear(): void {
    this.particles = [];
    this.timeSinceLastSpawn.clear();
  }

  updateDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  updatePhysics(physicsModifiers: PhysicsModifier[]): void {
    this.physicsEngine.updateModifiers(physicsModifiers);
  }
}
