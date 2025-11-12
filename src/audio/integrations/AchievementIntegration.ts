import SoundManager, { SoundId } from '../SoundManager';
import HapticManager, { HapticPattern } from '../../haptics/HapticManager';

export class AchievementAudioIntegration {
  async onAchievementUnlock(achievementId: string): Promise<void> {
    await SoundManager.play(SoundId.ACHIEVEMENT_UNLOCK);
    await HapticManager.trigger(HapticPattern.ACHIEVEMENT);
  }

  async onLevelUp(newLevel: number): Promise<void> {
    await SoundManager.play(SoundId.LEVEL_UP);
    await HapticManager.trigger(HapticPattern.SUCCESS);
  }

  async onBadgeEarned(badgeId: string): Promise<void> {
    await SoundManager.play(SoundId.BADGE_EARNED);
    await HapticManager.trigger(HapticPattern.MEDIUM);
  }

  async onStreakMilestone(streakDays: number): Promise<void> {
    await SoundManager.play(SoundId.STREAK_MILESTONE);
    await HapticManager.trigger(HapticPattern.ACHIEVEMENT);
  }
}

export default new AchievementAudioIntegration();
