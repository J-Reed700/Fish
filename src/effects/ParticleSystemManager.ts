import {
  ParticleEmitter,
  EffectParticle,
  ParticleEmitterConfig,
  Vector2D,
} from '../types';

export class ParticleSystemManager {
  private emitters: Map<string, ParticleEmitter> = new Map();
  private particlePool: EffectParticle[] = [];
  private activeParticles: EffectParticle[] = [];
  private maxParticles: number;
  private poolSize: number;
  private screenBounds: { width: number; height: number };

  constructor(
    maxParticles: number = 500,
    poolSize: number = 1000,
    screenBounds: { width: number; height: number }
  ) {
    this.maxParticles = maxParticles;
    this.poolSize = poolSize;
    this.screenBounds = screenBounds;
    this.initializePool();
  }

  private initializePool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.particlePool.push(this.createEmptyParticle());
    }
  }

  private createEmptyParticle(): EffectParticle {
    return {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      color: '#FFFFFF',
      size: 0,
      alpha: 0,
      lifetime: 0,
      maxLifetime: 0,
      rotation: 0,
      rotationSpeed: 0,
    };
  }

  private acquireParticle(): EffectParticle | null {
    if (this.activeParticles.length >= this.maxParticles) {
      return null;
    }
    return this.particlePool.pop() || this.createEmptyParticle();
  }

  private releaseParticle(particle: EffectParticle): void {
    if (this.particlePool.length < this.poolSize) {
      particle.lifetime = 0;
      particle.alpha = 0;
      this.particlePool.push(particle);
    }
  }

  createEmitter(
    id: string,
    position: Vector2D,
    config: ParticleEmitterConfig
  ): string {
    const emitter: ParticleEmitter = {
      id,
      position,
      particles: [],
      emissionRate: config.type === 'burst' ? 0 : 60,
      lifetime: config.type === 'burst' ? 0.5 : Infinity,
      isActive: true,
      config,
    };

    this.emitters.set(id, emitter);

    if (config.type === 'burst') {
      this.emitBurst(emitter);
    }

    return id;
  }

  private emitBurst(emitter: ParticleEmitter): void {
    const { config } = emitter;
    const count = Math.min(
      config.particleCount,
      this.maxParticles - this.activeParticles.length
    );

    for (let i = 0; i < count; i++) {
      const particle = this.acquireParticle();
      if (!particle) break;

      this.initializeParticle(particle, emitter, i / count);
      emitter.particles.push(particle);
      this.activeParticles.push(particle);
    }
  }

  private emitContinuous(emitter: ParticleEmitter, deltaTime: number): void {
    const particlesToEmit = Math.floor(emitter.emissionRate * deltaTime);

    for (let i = 0; i < particlesToEmit; i++) {
      if (this.activeParticles.length >= this.maxParticles) break;

      const particle = this.acquireParticle();
      if (!particle) break;

      this.initializeParticle(particle, emitter, Math.random());
      emitter.particles.push(particle);
      this.activeParticles.push(particle);
    }
  }

  private initializeParticle(
    particle: EffectParticle,
    emitter: ParticleEmitter,
    t: number
  ): void {
    const { config, position } = emitter;

    particle.position = { ...position };

    if (config.type === 'burst') {
      const angle = (t * Math.PI * 2) + (Math.random() - 0.5) * 0.5;
      const speed = this.lerp(
        Math.hypot(config.velocity.min.x, config.velocity.min.y),
        Math.hypot(config.velocity.max.x, config.velocity.max.y),
        Math.random()
      );
      particle.velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      };
    } else {
      particle.velocity = {
        x: this.lerp(config.velocity.min.x, config.velocity.max.x, Math.random()),
        y: this.lerp(config.velocity.min.y, config.velocity.max.y, Math.random()),
      };
    }

    particle.acceleration = { ...config.acceleration };
    particle.color =
      config.colors[Math.floor(Math.random() * config.colors.length)];
    particle.size = this.lerp(
      config.particleSize.min,
      config.particleSize.max,
      Math.random()
    );
    particle.alpha = 1;
    particle.maxLifetime = this.lerp(
      config.particleLifetime.min,
      config.particleLifetime.max,
      Math.random()
    );
    particle.lifetime = particle.maxLifetime;
    particle.rotation = Math.random() * Math.PI * 2;
    particle.rotationSpeed = config.rotate
      ? (Math.random() - 0.5) * 10
      : 0;
  }

  updateEmitterPosition(id: string, position: Vector2D): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.position = position;
    }
  }

  removeEmitter(id: string): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.particles.forEach((particle) => {
        const index = this.activeParticles.indexOf(particle);
        if (index !== -1) {
          this.activeParticles.splice(index, 1);
        }
        this.releaseParticle(particle);
      });
      this.emitters.delete(id);
    }
  }

  update(deltaTime: number): void {
    this.emitters.forEach((emitter) => {
      if (!emitter.isActive) return;

      if (emitter.config.type === 'continuous') {
        this.emitContinuous(emitter, deltaTime);
      }

      if (emitter.lifetime !== Infinity) {
        emitter.lifetime -= deltaTime;
        if (emitter.lifetime <= 0) {
          emitter.isActive = false;
        }
      }

      const deadParticles: EffectParticle[] = [];

      emitter.particles.forEach((particle) => {
        particle.velocity.x += particle.acceleration.x * deltaTime;
        particle.velocity.y += particle.acceleration.y * deltaTime;

        particle.position.x += particle.velocity.x * deltaTime;
        particle.position.y += particle.velocity.y * deltaTime;

        particle.lifetime -= deltaTime;

        if (emitter.config.fadeOut) {
          particle.alpha = Math.max(0, particle.lifetime / particle.maxLifetime);
        }

        if (emitter.config.shrink) {
          const initialSize = this.lerp(
            emitter.config.particleSize.min,
            emitter.config.particleSize.max,
            0.5
          );
          particle.size =
            initialSize * (particle.lifetime / particle.maxLifetime);
        }

        if (emitter.config.rotate) {
          particle.rotation += particle.rotationSpeed * deltaTime;
        }

        if (
          particle.lifetime <= 0 ||
          !this.isParticleInBounds(particle)
        ) {
          deadParticles.push(particle);
        }
      });

      deadParticles.forEach((particle) => {
        const emitterIndex = emitter.particles.indexOf(particle);
        if (emitterIndex !== -1) {
          emitter.particles.splice(emitterIndex, 1);
        }

        const activeIndex = this.activeParticles.indexOf(particle);
        if (activeIndex !== -1) {
          this.activeParticles.splice(activeIndex, 1);
        }

        this.releaseParticle(particle);
      });

      if (!emitter.isActive && emitter.particles.length === 0) {
        this.emitters.delete(emitter.id);
      }
    });
  }

  private isParticleInBounds(particle: EffectParticle): boolean {
    const margin = 100;
    return (
      particle.position.x >= -margin &&
      particle.position.x <= this.screenBounds.width + margin &&
      particle.position.y >= -margin &&
      particle.position.y <= this.screenBounds.height + margin
    );
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  getActiveParticles(): EffectParticle[] {
    return this.activeParticles;
  }

  getEmitter(id: string): ParticleEmitter | undefined {
    return this.emitters.get(id);
  }

  clear(): void {
    this.emitters.forEach((emitter) => {
      emitter.particles.forEach((particle) => {
        this.releaseParticle(particle);
      });
    });
    this.emitters.clear();
    this.activeParticles = [];
  }

  getStats() {
    return {
      activeEmitters: this.emitters.size,
      activeParticles: this.activeParticles.length,
      poolSize: this.particlePool.length,
      maxParticles: this.maxParticles,
    };
  }
}
