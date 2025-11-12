import type { Vector2D } from '../../types';

export class ChainReactionEffect {
  static readonly STUN_RADIUS = 150;
  static readonly STUN_DURATION = 2000;

  static createShockwave(
    epicenter: Vector2D,
    preyPositions: Vector2D[]
  ): { position: Vector2D; isStunned: boolean }[] {
    return preyPositions.map((preyPos) => {
      const dx = preyPos.x - epicenter.x;
      const dy = preyPos.y - epicenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return {
        position: preyPos,
        isStunned: distance < this.STUN_RADIUS,
      };
    });
  }

  static getShockwaveVisual(epicenter: Vector2D, expansionProgress: number): {
    center: Vector2D;
    radius: number;
    opacity: number;
    color: string;
  } {
    return {
      center: epicenter,
      radius: this.STUN_RADIUS * expansionProgress,
      opacity: 1 - expansionProgress,
      color: '#FFC107',
    };
  }

  static shouldApplyStun(
    preyPosition: Vector2D,
    shockwaveCenter: Vector2D,
    shockwaveRadius: number
  ): boolean {
    const dx = preyPosition.x - shockwaveCenter.x;
    const dy = preyPosition.y - shockwaveCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < shockwaveRadius;
  }
}
