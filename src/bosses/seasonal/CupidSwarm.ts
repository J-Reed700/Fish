import type { SeasonalBoss } from '../../types';

export class CupidSwarm {
  static config: SeasonalBoss = {
    id: 'cupid-swarm',
    name: 'Cupid Swarm',
    description: 'A swarm of flying hearts controlled by Cupid',
    appearance: {
      size: 120,
      colors: ['#FF69B4', '#FF1493', '#FFD700'],
      specialEffects: ['heart-formation', 'love-arrows', 'golden-glow'],
      spriteSheet: 'cupid-swarm-boss',
    },
    hp: 8,
    phases: [
      {
        phaseNumber: 1,
        hpThreshold: 8,
        behaviorChanges: {
          speedMultiplier: 1.0,
          attackPattern: 'heart-formation',
          specialAbility: 'arrow-rain',
        },
      },
      {
        phaseNumber: 2,
        hpThreshold: 4,
        behaviorChanges: {
          speedMultiplier: 1.4,
          attackPattern: 'spiral',
          specialAbility: 'love-explosion',
        },
      },
    ],
    rewards: [
      {
        type: 'currency',
        itemId: 'love-tokens',
        quantity: 800,
        rarity: 'legendary',
      },
      {
        type: 'badge',
        itemId: 'cupid-conqueror',
        quantity: 1,
        rarity: 'legendary',
      },
      {
        type: 'cosmetic',
        itemId: 'cupid-wings',
        quantity: 1,
        rarity: 'legendary',
      },
    ],
    spawnSchedule: 'daily',
  };

  private hp: number;
  private currentPhase: number;
  private hearts: Array<{ x: number; y: number; angle: number }>;

  constructor(x: number, y: number) {
    this.hp = CupidSwarm.config.hp;
    this.currentPhase = 1;
    this.hearts = [];

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.hearts.push({
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        angle,
      });
    }
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;

    const phase = CupidSwarm.config.phases.find(
      (p) => this.hp <= p.hpThreshold && p.phaseNumber > this.currentPhase
    );

    if (phase) {
      this.currentPhase = phase.phaseNumber;
      console.log(`[CupidSwarm] Entering phase ${this.currentPhase}!`);
    }

    return this.hp <= 0;
  }

  update(deltaTime: number): void {
    const phase = CupidSwarm.config.phases[this.currentPhase - 1];
    if (!phase) return;

    switch (phase.behaviorChanges.attackPattern) {
      case 'heart-formation':
        this.heartFormation(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
      case 'spiral':
        this.spiralPattern(deltaTime, phase.behaviorChanges.speedMultiplier || 1.0);
        break;
    }
  }

  private heartFormation(deltaTime: number, speed: number): void {
    const time = Date.now() * 0.001 * speed;

    this.hearts.forEach((heart, i) => {
      const baseAngle = (i / this.hearts.length) * Math.PI * 2;
      const angle = baseAngle + time;
      const radius = 80;

      heart.x = Math.cos(angle) * radius;
      heart.y = Math.sin(angle) * radius;
      heart.angle = angle;
    });
  }

  private spiralPattern(deltaTime: number, speed: number): void {
    const time = Date.now() * 0.002 * speed;

    this.hearts.forEach((heart, i) => {
      const baseAngle = (i / this.hearts.length) * Math.PI * 2;
      const angle = baseAngle + time;
      const radius = 80 + Math.sin(time + i) * 30;

      heart.x = Math.cos(angle) * radius;
      heart.y = Math.sin(angle) * radius;
      heart.angle = angle;
    });
  }

  getHearts(): Array<{ x: number; y: number; angle: number }> {
    return [...this.hearts];
  }

  getHP(): number {
    return this.hp;
  }

  getCurrentPhase(): number {
    return this.currentPhase;
  }
}
