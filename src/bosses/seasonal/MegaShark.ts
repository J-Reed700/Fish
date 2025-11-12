import type { SeasonalBoss } from '../../types';

export class MegaShark {
  static config: SeasonalBoss = {
    id: 'mega-shark',
    name: 'Mega Shark',
    description: 'A massive great white shark prowling the waters',
    appearance: {
      size: 200,
      colors: ['#708090', '#FFFFFF', '#2F4F4F'],
      specialEffects: ['sharp-teeth', 'fin-ripples', 'water-splash'],
      spriteSheet: 'mega-shark-boss',
    },
    hp: 15,
    phases: [
      {
        phaseNumber: 1,
        hpThreshold: 15,
        behaviorChanges: {
          speedMultiplier: 1.2,
          attackPattern: 'patrol',
          specialAbility: 'bite',
        },
      },
      {
        phaseNumber: 2,
        hpThreshold: 10,
        behaviorChanges: {
          speedMultiplier: 1.5,
          attackPattern: 'aggressive-chase',
          specialAbility: 'tail-whip',
        },
      },
      {
        phaseNumber: 3,
        hpThreshold: 5,
        behaviorChanges: {
          speedMultiplier: 1.8,
          attackPattern: 'frenzy',
          specialAbility: 'mega-chomp',
        },
      },
    ],
    rewards: [
      {
        type: 'currency',
        itemId: 'seashells',
        quantity: 1500,
        rarity: 'legendary',
      },
      {
        type: 'badge',
        itemId: 'shark-slayer',
        quantity: 1,
        rarity: 'legendary',
      },
      {
        type: 'cosmetic',
        itemId: 'shark-tooth-necklace',
        quantity: 1,
        rarity: 'legendary',
      },
    ],
    spawnSchedule: 'weekly',
  };

  private hp: number;
  private currentPhase: number;
  private position: { x: number; y: number };
  private velocity: { x: number; y: number };
  private direction: number;
  private patrolPoints: Array<{ x: number; y: number }>;
  private currentPatrolTarget: number;

  constructor(x: number, y: number) {
    this.hp = MegaShark.config.hp;
    this.currentPhase = 1;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.direction = 1;
    this.patrolPoints = [
      { x: -100, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: -100, y: 100 },
    ];
    this.currentPatrolTarget = 0;
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;

    const phase = MegaShark.config.phases.find(
      (p) => this.hp <= p.hpThreshold && p.phaseNumber > this.currentPhase
    );

    if (phase) {
      this.currentPhase = phase.phaseNumber;
      console.log(`[MegaShark] Entering phase ${this.currentPhase}!`);
    }

    return this.hp <= 0;
  }

  update(deltaTime: number): void {
    const phase = MegaShark.config.phases[this.currentPhase - 1];
    if (!phase) return;

    switch (phase.behaviorChanges.attackPattern) {
      case 'patrol':
        this.patrolPattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
      case 'aggressive-chase':
        this.aggressiveChase(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
      case 'frenzy':
        this.frenzyPattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
    }
  }

  private patrolPattern(deltaTime: number, speed: number): void {
    const target = this.patrolPoints[this.currentPatrolTarget];
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      this.currentPatrolTarget = (this.currentPatrolTarget + 1) % this.patrolPoints.length;
    } else {
      this.velocity.x = (dx / distance) * 2 * speed;
      this.velocity.y = (dy / distance) * 2 * speed;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }

  private aggressiveChase(deltaTime: number, speed: number): void {
    const targetX = 0;
    const targetY = 0;

    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      this.velocity.x = (dx / distance) * 4 * speed;
      this.velocity.y = (dy / distance) * 4 * speed;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }

  private frenzyPattern(deltaTime: number, speed: number): void {
    if (Math.random() < 0.1) {
      this.velocity.x = (Math.random() - 0.5) * 10 * speed;
      this.velocity.y = (Math.random() - 0.5) * 10 * speed;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.x *= 0.98;
    this.velocity.y *= 0.98;
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

  getDirection(): number {
    return this.direction;
  }
}
