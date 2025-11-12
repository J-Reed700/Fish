import { Vector2D } from '../../types';

export interface Ripple {
  id: string;
  position: Vector2D;
  radius: number;
  maxRadius: number;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
}

export interface Bubble {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  size: number;
  wobblePhase: number;
  lifetime: number;
}

export class WaterEffects {
  private ripples: Ripple[] = [];
  private bubbles: Bubble[] = [];
  private waveOffset: number = 0;
  private screenBounds: { width: number; height: number };

  constructor(screenBounds: { width: number; height: number }) {
    this.screenBounds = screenBounds;
  }

  createRipple(position: Vector2D, size: number = 50): void {
    const ripple: Ripple = {
      id: `ripple-${Date.now()}-${Math.random()}`,
      position,
      radius: 0,
      maxRadius: size,
      alpha: 0.6,
      lifetime: 1.5,
      maxLifetime: 1.5,
    };

    this.ripples.push(ripple);
  }

  createSplash(position: Vector2D, intensity: number = 1): void {
    const rippleCount = Math.floor(2 + intensity * 2);

    for (let i = 0; i < rippleCount; i++) {
      setTimeout(() => {
        this.createRipple(position, 40 + intensity * 20);
      }, i * 100);
    }

    const bubbleCount = Math.floor(5 + intensity * 10);
    for (let i = 0; i < bubbleCount; i++) {
      this.createBubble(position);
    }
  }

  createBubble(position: Vector2D): void {
    const bubble: Bubble = {
      id: `bubble-${Date.now()}-${Math.random()}`,
      position: { ...position },
      velocity: {
        x: (Math.random() - 0.5) * 50,
        y: -50 - Math.random() * 50,
      },
      size: 3 + Math.random() * 7,
      wobblePhase: Math.random() * Math.PI * 2,
      lifetime: 2 + Math.random() * 2,
    };

    this.bubbles.push(bubble);
  }

  spawnAmbientBubbles(count: number = 1): void {
    for (let i = 0; i < count; i++) {
      const position = {
        x: Math.random() * this.screenBounds.width,
        y: this.screenBounds.height + 20,
      };
      this.createBubble(position);
    }
  }

  update(deltaTime: number): void {
    this.waveOffset += deltaTime * 0.5;

    this.ripples = this.ripples.filter((ripple) => {
      ripple.lifetime -= deltaTime;
      ripple.radius = ripple.maxRadius * (1 - ripple.lifetime / ripple.maxLifetime);
      ripple.alpha = 0.6 * (ripple.lifetime / ripple.maxLifetime);

      return ripple.lifetime > 0;
    });

    this.bubbles = this.bubbles.filter((bubble) => {
      bubble.lifetime -= deltaTime;

      bubble.velocity.y += -30 * deltaTime;
      bubble.wobblePhase += deltaTime * 3;

      const wobble = Math.sin(bubble.wobblePhase) * 20;
      bubble.position.x += (bubble.velocity.x + wobble) * deltaTime;
      bubble.position.y += bubble.velocity.y * deltaTime;

      return (
        bubble.lifetime > 0 &&
        bubble.position.y > -20 &&
        bubble.position.x >= 0 &&
        bubble.position.x <= this.screenBounds.width
      );
    });
  }

  getRipples(): Ripple[] {
    return this.ripples;
  }

  getBubbles(): Bubble[] {
    return this.bubbles;
  }

  getWaveOffset(): number {
    return this.waveOffset;
  }

  getWaveHeight(x: number, baseY: number): number {
    const wave1 = Math.sin(x * 0.01 + this.waveOffset * 2) * 5;
    const wave2 = Math.sin(x * 0.02 + this.waveOffset * 3) * 3;
    const wave3 = Math.sin(x * 0.03 + this.waveOffset * 1.5) * 2;

    return baseY + wave1 + wave2 + wave3;
  }

  clear(): void {
    this.ripples = [];
    this.bubbles = [];
  }
}
