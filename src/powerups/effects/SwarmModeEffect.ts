export class SwarmModeEffect {
  static readonly SPAWN_RATE_MULTIPLIER = 2.0;

  static applySpawnMultiplier(baseSpawnRate: number): number {
    return baseSpawnRate * this.SPAWN_RATE_MULTIPLIER;
  }

  static shouldSpawnExtra(): boolean {
    return Math.random() < 0.5;
  }

  static getVisualEffect(): {
    color: string;
    intensity: number;
  } {
    return {
      color: '#4CAF50',
      intensity: 0.4,
    };
  }
}
