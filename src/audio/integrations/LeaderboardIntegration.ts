import SoundManager, { SoundId } from '../SoundManager';
import HapticManager, { HapticPattern } from '../../haptics/HapticManager';

export class LeaderboardAudioIntegration {
  async onRankUp(previousRank: number, newRank: number): Promise<void> {
    if (newRank < previousRank) {
      await SoundManager.play(SoundId.RANK_UP);
      await HapticManager.trigger(HapticPattern.SUCCESS);
    }
  }

  async onHighScore(category: string): Promise<void> {
    await SoundManager.play(SoundId.HIGH_SCORE);
    await HapticManager.trigger(HapticPattern.BOSS_DEFEATED);
  }

  async onPersonalBest(category: string): Promise<void> {
    await SoundManager.play(SoundId.SUCCESS);
    await HapticManager.trigger(HapticPattern.HEAVY);
  }
}

export default new LeaderboardAudioIntegration();
