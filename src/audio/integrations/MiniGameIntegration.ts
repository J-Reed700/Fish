import SoundManager, { SoundId } from '../SoundManager';
import HapticManager, { HapticPattern } from '../../haptics/HapticManager';

export class MiniGameAudioIntegration {
  async onWhackHit(): Promise<void> {
    await SoundManager.play(SoundId.WHACK_BONK);
    await HapticManager.trigger(HapticPattern.MEDIUM);
  }

  async onWhackPopup(): Promise<void> {
    await SoundManager.play(SoundId.WHACK_POPUP);
    await HapticManager.trigger(HapticPattern.LIGHT);
  }

  async onMemoryFlip(): Promise<void> {
    await SoundManager.play(SoundId.MEMORY_FLIP);
    await HapticManager.trigger(HapticPattern.LIGHT);
  }

  async onMemoryMatch(): Promise<void> {
    await SoundManager.play(SoundId.MEMORY_MATCH);
    await HapticManager.trigger(HapticPattern.SUCCESS);
  }

  async onMemoryMismatch(): Promise<void> {
    await SoundManager.play(SoundId.MEMORY_MISMATCH);
    await HapticManager.trigger(HapticPattern.ERROR);
  }

  async onLeaderCheckpoint(): Promise<void> {
    await SoundManager.play(SoundId.LEADER_CHECKPOINT);
    await HapticManager.trigger(HapticPattern.MEDIUM);
  }

  async onLeaderComplete(): Promise<void> {
    await SoundManager.play(SoundId.LEADER_COMPLETE);
    await HapticManager.trigger(HapticPattern.SUCCESS);
  }

  async onBubblePop(isGolden: boolean = false): Promise<void> {
    if (isGolden) {
      await SoundManager.play(SoundId.BUBBLE_GOLDEN);
      await HapticManager.trigger(HapticPattern.MEDIUM);
    } else {
      await SoundManager.play(SoundId.BUBBLE_POP);
      await HapticManager.trigger(HapticPattern.LIGHT);
    }
  }

  async onBubbleBomb(): Promise<void> {
    await SoundManager.play(SoundId.BUBBLE_BOMB);
    await HapticManager.trigger(HapticPattern.ERROR);
  }

  async onTimerTick(): Promise<void> {
    await SoundManager.play(SoundId.TIMER_TICK, 0.5);
  }

  async onCountdownBeep(): Promise<void> {
    await SoundManager.play(SoundId.COUNTDOWN_BEEP);
    await HapticManager.trigger(HapticPattern.COUNTDOWN);
  }

  async onGameComplete(score: number): Promise<void> {
    await SoundManager.play(SoundId.SUCCESS);
    await HapticManager.trigger(HapticPattern.SUCCESS);
  }
}

export default new MiniGameAudioIntegration();
