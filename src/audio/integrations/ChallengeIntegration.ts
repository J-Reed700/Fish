import SoundManager, { SoundId } from '../SoundManager';
import HapticManager, { HapticPattern } from '../../haptics/HapticManager';

export class ChallengeAudioIntegration {
  async onChallengeComplete(challengeId: string): Promise<void> {
    await SoundManager.play(SoundId.CHALLENGE_COMPLETE);
    await HapticManager.trigger(HapticPattern.SUCCESS);
  }

  async onChallengeProgress(percentage: number): Promise<void> {
    if (percentage >= 50 && percentage < 55) {
      await HapticManager.trigger(HapticPattern.LIGHT);
    } else if (percentage >= 75 && percentage < 80) {
      await HapticManager.trigger(HapticPattern.LIGHT);
    }
  }

  async onXPGained(amount: number): Promise<void> {
    if (amount >= 100) {
      await SoundManager.play(SoundId.SUCCESS, 0.6);
    }
  }
}

export default new ChallengeAudioIntegration();
