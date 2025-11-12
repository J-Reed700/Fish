export class InvisibilityEffect {
  static readonly INVISIBILITY_CHANCE = 0.3;
  static readonly FADE_DURATION = 1000;

  static shouldBeInvisible(time: number, preyId: string): boolean {
    const hash = this.hashString(preyId);
    const offset = hash % 1000;
    const cycle = ((time + offset) % 3000) / 3000;

    return cycle < this.INVISIBILITY_CHANCE;
  }

  static getOpacity(time: number, preyId: string): number {
    const hash = this.hashString(preyId);
    const offset = hash % 1000;
    const cycle = ((time + offset) % 3000) / 3000;

    if (cycle < this.INVISIBILITY_CHANCE) {
      const fadeProgress = Math.min(cycle / (this.FADE_DURATION / 3000), 1);
      return Math.max(0.1, 1 - fadeProgress * 0.9);
    } else {
      const fadeInProgress = Math.min(
        (cycle - this.INVISIBILITY_CHANCE) / (this.FADE_DURATION / 3000),
        1
      );
      return Math.min(1, 0.1 + fadeInProgress * 0.9);
    }
  }

  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  static getVisualEffect(): {
    color: string;
    intensity: number;
  } {
    return {
      color: '#3F51B5',
      intensity: 0.3,
    };
  }
}
