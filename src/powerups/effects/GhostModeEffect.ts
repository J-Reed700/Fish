export class GhostModeEffect {
  static readonly GHOST_OPACITY = 0.5;

  static shouldPreventFlee(isActive: boolean): boolean {
    return isActive;
  }

  static getVisualOpacity(isActive: boolean): number {
    return isActive ? this.GHOST_OPACITY : 1.0;
  }

  static getVisualEffect(): {
    opacity: number;
    glowColor: string;
    glowIntensity: number;
  } {
    return {
      opacity: this.GHOST_OPACITY,
      glowColor: '#00E676',
      glowIntensity: 0.4,
    };
  }
}
