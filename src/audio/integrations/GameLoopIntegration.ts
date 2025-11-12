import SoundManager, { SoundId } from '../SoundManager';
import HapticManager, { HapticPattern } from '../../haptics/HapticManager';

export class GameLoopAudioIntegration {
  private comboCount = 0;
  private lastCatchTime = 0;
  private readonly COMBO_WINDOW = 2000;

  async onPreyCatch(preyType: string): Promise<void> {
    const now = Date.now();

    if (now - this.lastCatchTime < this.COMBO_WINDOW) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }

    this.lastCatchTime = now;

    const preySound = this.getPreySoundId(preyType);
    if (preySound) {
      await SoundManager.play(preySound);
    } else {
      await SoundManager.play(SoundId.CATCH);
    }

    await HapticManager.trigger(HapticPattern.CATCH);

    if (this.comboCount === 3) {
      await SoundManager.play(SoundId.COMBO_3);
      await HapticManager.trigger(HapticPattern.COMBO);
    } else if (this.comboCount === 5) {
      await SoundManager.play(SoundId.COMBO_5);
      await HapticManager.trigger(HapticPattern.COMBO);
    } else if (this.comboCount >= 10) {
      await SoundManager.play(SoundId.COMBO_10);
      await HapticManager.trigger(HapticPattern.COMBO);
    }
  }

  async onMiss(): Promise<void> {
    await SoundManager.play(SoundId.MISS);
    await HapticManager.trigger(HapticPattern.LIGHT);
  }

  resetCombo(): void {
    this.comboCount = 0;
  }

  private getPreySoundId(preyType: string): SoundId | null {
    const preyMap: Record<string, SoundId> = {
      fish: SoundId.PREY_FISH,
      mouse: SoundId.PREY_MOUSE,
      butterfly: SoundId.PREY_BUTTERFLY,
      ladybug: SoundId.PREY_LADYBUG,
      cockroach: SoundId.PREY_COCKROACH,
      bird: SoundId.PREY_BIRD,
      cricket: SoundId.PREY_CRICKET,
      frog: SoundId.PREY_FROG,
      spider: SoundId.PREY_SPIDER,
      worm: SoundId.PREY_WORM,
    };

    return preyMap[preyType.toLowerCase()] || null;
  }
}

export default new GameLoopAudioIntegration();
