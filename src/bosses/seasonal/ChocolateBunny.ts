import type { SeasonalBoss } from '../../types';

export class ChocolateBunny {
  static config: SeasonalBoss = {
    id: 'chocolate-bunny',
    name: 'Giant Chocolate Bunny',
    description: 'A massive chocolate bunny that hops around leaving eggs',
    appearance: {
      size: 160,
      colors: ['#3D1F1F', '#8B4513', '#D2691E'],
      specialEffects: ['chocolate-gloss', 'wrapper-foil', 'egg-trail'],
      spriteSheet: 'chocolate-bunny-boss',
    },
    hp: 10,
    phases: [
      {
        phaseNumber: 1,
        hpThreshold: 10,
        behaviorChanges: {
          speedMultiplier: 1.1,
          attackPattern: 'hopping',
          specialAbility: 'egg-bomb',
        },
      },
      {
        phaseNumber: 2,
        hpThreshold: 5,
        behaviorChanges: {
          speedMultiplier: 1.4,
          attackPattern: 'super-hop',
          specialAbility: 'chocolate-rain',
        },
      },
      {
        phaseNumber: 3,
        hpThreshold: 2,
        behaviorChanges: {
          speedMultiplier: 1.7,
          attackPattern: 'frenzy',
          specialAbility: 'sugar-overload',
        },
      },
    ],
    rewards: [
      {
        type: 'currency',
        itemId: 'easter-eggs',
        quantity: 1000,
        rarity: 'legendary',
      },
      {
        type: 'badge',
        itemId: 'bunny-buster',
        quantity: 1,
        rarity: 'legendary',
      },
      {
        type: 'cosmetic',
        itemId: 'chocolate-medal',
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
  private isHopping: boolean;
  private hopCooldown: number;

  constructor(x: number, y: number) {
    this.hp = ChocolateBunny.config.hp;
    this.currentPhase = 1;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.isHopping = false;
    this.hopCooldown = 0;
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;

    const phase = ChocolateBunny.config.phases.find(
      (p) => this.hp <= p.hpThreshold && p.phaseNumber > this.currentPhase
    );

    if (phase) {
      this.currentPhase = phase.phaseNumber;
      console.log(`[ChocolateBunny] Entering phase ${this.currentPhase}!`);
    }

    return this.hp <= 0;
  }

  update(deltaTime: number): void {
    const phase = ChocolateBunny.config.phases[this.currentPhase - 1];
    if (!phase) return;

    this.hopCooldown -= deltaTime;

    switch (phase.behaviorChanges.attackPattern) {
      case 'hopping':
        this.hopPattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
      case 'super-hop':
        this.superHopPattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
      case 'frenzy':
        this.frenzyPattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
    }

    if (this.isHopping) {
      this.velocity.y += 0.5;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      if (this.position.y >= 0) {
        this.position.y = 0;
        this.isHopping = false;
        this.velocity = { x: 0, y: 0 };
      }
    }
  }

  private hopPattern(deltaTime: number, speed: number): void {
    if (this.hopCooldown <= 0 && !this.isHopping) {
      this.velocity.x = (Math.random() - 0.5) * 4 * speed;
      this.velocity.y = -8 * speed;
      this.isHopping = true;
      this.hopCooldown = 1000;
    }
  }

  private superHopPattern(deltaTime: number, speed: number): void {
    if (this.hopCooldown <= 0 && !this.isHopping) {
      this.velocity.x = (Math.random() - 0.5) * 6 * speed;
      this.velocity.y = -12 * speed;
      this.isHopping = true;
      this.hopCooldown = 800;
    }
  }

  private frenzyPattern(deltaTime: number, speed: number): void {
    if (this.hopCooldown <= 0 && !this.isHopping) {
      this.velocity.x = (Math.random() - 0.5) * 8 * speed;
      this.velocity.y = -15 * speed;
      this.isHopping = true;
      this.hopCooldown = 500;
    }
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

  isCurrentlyHopping(): boolean {
    return this.isHopping;
  }
}
