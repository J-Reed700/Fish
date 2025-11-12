import type { SeasonalBoss } from '../../types';

export class IceDragon {
  static config: SeasonalBoss = {
    id: 'ice-dragon',
    name: 'Ice Dragon',
    description: 'A majestic frozen dragon with crystalline wings',
    appearance: {
      size: 180,
      colors: ['#E0F7FF', '#87CEEB', '#4682B4'],
      specialEffects: ['ice-crystals', 'frost-breath', 'aurora-glow'],
      spriteSheet: 'ice-dragon-boss',
    },
    hp: 12,
    phases: [
      {
        phaseNumber: 1,
        hpThreshold: 12,
        behaviorChanges: {
          speedMultiplier: 0.8,
          attackPattern: 'swooping',
          specialAbility: 'ice-breath',
        },
      },
      {
        phaseNumber: 2,
        hpThreshold: 6,
        behaviorChanges: {
          speedMultiplier: 1.0,
          attackPattern: 'dive-bomb',
          specialAbility: 'freeze-wave',
        },
      },
      {
        phaseNumber: 3,
        hpThreshold: 3,
        behaviorChanges: {
          speedMultiplier: 1.3,
          attackPattern: 'erratic-flight',
          specialAbility: 'blizzard-storm',
        },
      },
    ],
    rewards: [
      {
        type: 'currency',
        itemId: 'snowflakes',
        quantity: 1200,
        rarity: 'legendary',
      },
      {
        type: 'badge',
        itemId: 'dragon-tamer',
        quantity: 1,
        rarity: 'legendary',
      },
      {
        type: 'cosmetic',
        itemId: 'ice-crown',
        quantity: 1,
        rarity: 'legendary',
      },
    ],
    spawnSchedule: 'daily',
  };

  private hp: number;
  private currentPhase: number;
  private position: { x: number; y: number };
  private velocity: { x: number; y: number };
  private isFlying: boolean;

  constructor(x: number, y: number) {
    this.hp = IceDragon.config.hp;
    this.currentPhase = 1;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.isFlying = true;
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;

    const phase = IceDragon.config.phases.find(
      (p) => this.hp <= p.hpThreshold && p.phaseNumber > this.currentPhase
    );

    if (phase) {
      this.currentPhase = phase.phaseNumber;
      console.log(`[IceDragon] Entering phase ${this.currentPhase}!`);
    }

    return this.hp <= 0;
  }

  update(deltaTime: number): void {
    const phase = IceDragon.config.phases[this.currentPhase - 1];
    if (!phase) return;

    switch (phase.behaviorChanges.attackPattern) {
      case 'swooping':
        this.swoopPattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
      case 'dive-bomb':
        this.diveBombPattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
      case 'erratic-flight':
        this.erraticPattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
    }
  }

  private swoopPattern(deltaTime: number, speed: number): void {
    const swoopAngle = Math.sin(Date.now() * 0.001) * Math.PI;
    this.velocity.x = Math.cos(swoopAngle) * 3 * speed;
    this.velocity.y = Math.abs(Math.sin(swoopAngle)) * 2 * speed;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  private diveBombPattern(deltaTime: number, speed: number): void {
    if (Math.random() < 0.01) {
      this.velocity.y = 10 * speed;
      this.velocity.x = (Math.random() - 0.5) * 2 * speed;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y *= 0.95;
  }

  private erraticPattern(deltaTime: number, speed: number): void {
    if (Math.random() < 0.05) {
      this.velocity.x = (Math.random() - 0.5) * 6 * speed;
      this.velocity.y = (Math.random() - 0.5) * 6 * speed;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  getHP(): number {
    return this.hp;
  }

  getCurrentPhase(): number {
    return this.currentPhase;
  }
}
