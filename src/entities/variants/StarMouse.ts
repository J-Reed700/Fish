import type { Mouse, Vector2D, PowerUpType } from '../../types';

export class StarMouse {
  static readonly POINT_VALUE = 250;
  static readonly SPAWN_CHANCE = 0.003;
  static readonly COLOR = '#FFF59D';

  static create(id: string, position: Vector2D, baseMouse: Partial<Mouse>): Mouse {
    return {
      id,
      position,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: (baseMouse.size || 30) * 1.4,
      color: this.COLOR,
      type: 'mouse',
      state: 'scurrying',
      stateTimer: 0,
      wanderAngle: Math.random() * Math.PI * 2,
      maxSpeed: (baseMouse.maxSpeed || 120) * 1.2,
      lifetime: 0,
      maxLifetime: baseMouse.maxLifetime || 40000,
    };
  }

  static isStarMouse(mouse: Mouse): boolean {
    return mouse.color === this.COLOR;
  }

  static getRandomPowerUp(): PowerUpType {
    const powerUps: PowerUpType[] = [
      'double-points',
      'triple-points',
      'freeze-time',
      'magnet',
      'rapid-fire',
      'ghost-mode',
    ];

    return powerUps[Math.floor(Math.random() * powerUps.length)];
  }

  static getVisualEffect(): {
    glowColor: string;
    glowIntensity: number;
    starParticleCount: number;
    trailLength: number;
  } {
    return {
      glowColor: '#FFEB3B',
      glowIntensity: 1.0,
      starParticleCount: 20,
      trailLength: 15,
    };
  }
}
