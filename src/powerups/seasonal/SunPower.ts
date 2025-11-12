import type { SeasonalPowerUp } from '../../types';

export class SunPower {
  static config: SeasonalPowerUp = {
    id: 'sun-power',
    name: 'Sun Power',
    description: '3x points in sunlight areas',
    icon: 'sun',
    effect: 'sun-power',
    duration: 12000,
    spawnChance: 0.12,
    eventExclusive: true,
  };

  static apply(): { multiplier: number; areaBonus: boolean } {
    return {
      multiplier: 3.0,
      areaBonus: true,
    };
  }

  static isInSunlight(x: number, y: number, screenWidth: number, screenHeight: number): boolean {
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 3;
    const radius = screenWidth / 3;

    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    return distance <= radius;
  }

  static onCollect(): void {
    console.log('[SunPower] 3x points in sunlight areas!');
  }
}
