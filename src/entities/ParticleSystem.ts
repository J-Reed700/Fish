import { Particle, Vector2D, AmbientParticle, Theme } from '../types';
import { Vector } from '../engine/Vector';

let particleIdCounter = 0;
let ambientParticleIdCounter = 0;

export class ParticleSystem {
  static update(
    particles: Particle[],
    deltaTime: number,
    bounds: { width: number; height: number }
  ): Particle[] {
    return particles
      .map((particle) => {
        const newLifetime = particle.lifetime + deltaTime;

        let velocity = particle.velocity;
        if (particle.type === 'bubble') {
          velocity = Vector.add(velocity, { x: 0, y: -10 * deltaTime });
        } else if (particle.type === 'splash') {
          velocity = Vector.add(velocity, { x: 0, y: 50 * deltaTime });
        }

        const position = Vector.add(particle.position, Vector.multiply(velocity, deltaTime));

        return {
          ...particle,
          position,
          velocity,
          lifetime: newLifetime,
        };
      })
      .filter((particle) => particle.lifetime < particle.maxLifetime);
  }

  static createBubble(position: Vector2D): Particle {
    const vx = (Math.random() - 0.5) * 10;
    const vy = -20 - Math.random() * 20;
    const lifetime = 2 + Math.random() * 2;
    const size = 3 + Math.random() * 5;

    return {
      id: `particle-${particleIdCounter++}`,
      position: { x: position.x, y: position.y },
      velocity: { x: vx, y: vy },
      lifetime: 0,
      maxLifetime: lifetime,
      size,
      type: 'bubble',
    };
  }

  static createSplash(position: Vector2D, count: number = 8): Particle[] {
    const particles: Particle[] = [];
    const particleCount = count + Math.floor(Math.random() * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 100 + Math.random() * 100;
      const velocity = Vector.fromAngle(angle, speed);

      particles.push({
        id: `particle-${particleIdCounter++}`,
        position: { x: position.x, y: position.y },
        velocity,
        lifetime: 0,
        maxLifetime: 0.3 + Math.random() * 0.3,
        size: 4 + Math.random() * 2,
        type: 'splash',
      });
    }

    return particles;
  }

  static createAmbientParticles(
    theme: Theme,
    bounds: { width: number; height: number }
  ): AmbientParticle[] {
    const particles: AmbientParticle[] = [];

    theme.particles.forEach((config) => {
      for (let i = 0; i < config.count; i++) {
        particles.push({
          id: `ambient-${ambientParticleIdCounter++}`,
          position: {
            x: Math.random() * bounds.width,
            y: Math.random() * bounds.height,
          },
          velocity: this.getVelocityForType(config.type),
          size: config.size,
          color: config.color,
          opacity: 0.3 + Math.random() * 0.4,
          type: config.type,
        });
      }
    });

    return particles;
  }

  static updateAmbientParticles(
    particles: AmbientParticle[],
    deltaTime: number,
    bounds: { width: number; height: number }
  ): AmbientParticle[] {
    return particles.map((particle) => {
      let position = {
        x: particle.position.x + particle.velocity.x * deltaTime,
        y: particle.position.y + particle.velocity.y * deltaTime,
      };

      if (particle.type === 'bubbles') {
        if (position.y < -10) {
          position.y = bounds.height + 10;
          position.x = Math.random() * bounds.width;
        }
      } else if (particle.type === 'leaves') {
        if (position.y > bounds.height + 10) {
          position.y = -10;
          position.x = Math.random() * bounds.width;
        }
      } else {
        position = particle.position;
      }

      const opacity =
        particle.type === 'sparkles'
          ? 0.2 + Math.sin(Date.now() / 500 + particle.position.x) * 0.5
          : particle.opacity;

      return {
        ...particle,
        position,
        opacity: Math.max(0, Math.min(1, opacity)),
      };
    });
  }

  private static getVelocityForType(type: 'bubbles' | 'sparkles' | 'leaves'): Vector2D {
    switch (type) {
      case 'bubbles':
        return { x: (Math.random() - 0.5) * 10, y: -20 };
      case 'leaves':
        return { x: (Math.random() - 0.5) * 15, y: 15 };
      case 'sparkles':
        return { x: 0, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  }
}
