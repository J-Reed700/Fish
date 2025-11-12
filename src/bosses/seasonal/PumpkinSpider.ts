import type { SeasonalBoss } from '../../types';

export class PumpkinSpider {
  static config: SeasonalBoss = {
    id: 'pumpkin-spider',
    name: 'Giant Pumpkin Spider',
    description: 'A massive spider with a carved pumpkin body and glowing eyes',
    appearance: {
      size: 150,
      colors: ['#FF7518', '#000000', '#FFA500'],
      specialEffects: ['glowing-eyes', 'web-aura', 'pumpkin-particles'],
      spriteSheet: 'pumpkin-spider-boss',
    },
    hp: 10,
    phases: [
      {
        phaseNumber: 1,
        hpThreshold: 10,
        behaviorChanges: {
          speedMultiplier: 1.0,
          attackPattern: 'circle',
          specialAbility: 'web-shot',
        },
      },
      {
        phaseNumber: 2,
        hpThreshold: 5,
        behaviorChanges: {
          speedMultiplier: 1.3,
          attackPattern: 'zigzag',
          specialAbility: 'spider-swarm',
        },
      },
      {
        phaseNumber: 3,
        hpThreshold: 2,
        behaviorChanges: {
          speedMultiplier: 1.5,
          attackPattern: 'aggressive',
          specialAbility: 'poison-explosion',
        },
      },
    ],
    rewards: [
      {
        type: 'currency',
        itemId: 'pumpkin-coins',
        quantity: 1000,
        rarity: 'legendary',
      },
      {
        type: 'badge',
        itemId: 'spider-slayer',
        quantity: 1,
        rarity: 'legendary',
      },
      {
        type: 'cosmetic',
        itemId: 'pumpkin-crown',
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

  constructor(x: number, y: number) {
    this.hp = PumpkinSpider.config.hp;
    this.currentPhase = 1;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;

    const phase = PumpkinSpider.config.phases.find(
      (p) => this.hp <= p.hpThreshold && p.phaseNumber > this.currentPhase
    );

    if (phase) {
      this.currentPhase = phase.phaseNumber;
      console.log(`[PumpkinSpider] Entering phase ${this.currentPhase}!`);
    }

    return this.hp <= 0;
  }

  update(deltaTime: number): void {
    const phase = PumpkinSpider.config.phases[this.currentPhase - 1];
    if (!phase) return;

    switch (phase.behaviorChanges.attackPattern) {
      case 'circle':
        this.circlePattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
      case 'zigzag':
        this.zigzagPattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
      case 'aggressive':
        this.aggressivePattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
    }
  }

  private circlePattern(deltaTime: number, speed: number): void {
    const angle = Date.now() * 0.001 * speed;
    this.position.x += Math.cos(angle) * 2 * speed;
    this.position.y += Math.sin(angle) * 2 * speed;
  }

  private zigzagPattern(deltaTime: number, speed: number): void {
    this.velocity.x = Math.sin(Date.now() * 0.002) * 3 * speed;
    this.velocity.y = Math.cos(Date.now() * 0.003) * 3 * speed;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  private aggressivePattern(deltaTime: number, speed: number): void {
    this.velocity.x = (Math.random() - 0.5) * 5 * speed;
    this.velocity.y = (Math.random() - 0.5) * 5 * speed;
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
