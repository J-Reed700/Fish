import SoundManager, { SoundId } from '../SoundManager';
import HapticManager, { HapticPattern } from '../../haptics/HapticManager';
import EnvironmentAudioManager from '../../environments/EnvironmentAudioManager';

export class BossAudioIntegration {
  private currentPhase = 1;
  private totalPhases = 3;

  async onBossAppear(): Promise<void> {
    await EnvironmentAudioManager.pauseAmbient();

    await SoundManager.play(SoundId.BOSS_APPEAR);
    await HapticManager.trigger(HapticPattern.HEAVY);

    this.currentPhase = 1;
  }

  async onBossDamage(remainingHP: number, maxHP: number): Promise<void> {
    await SoundManager.play(SoundId.BOSS_DAMAGE);
    await HapticManager.trigger(HapticPattern.BOSS_DAMAGE);

    const hpPercentage = remainingHP / maxHP;
    const newPhase = hpPercentage > 0.66 ? 1 : hpPercentage > 0.33 ? 2 : 3;

    if (newPhase > this.currentPhase) {
      await this.onPhaseChange(newPhase);
      this.currentPhase = newPhase;
    }
  }

  async onPhaseChange(phase: number): Promise<void> {
    await SoundManager.play(SoundId.BOSS_PHASE_CHANGE);
    await HapticManager.trigger(HapticPattern.HEAVY);
  }

  async onBossDefeated(): Promise<void> {
    await SoundManager.play(SoundId.BOSS_DEFEATED);
    await HapticManager.trigger(HapticPattern.BOSS_DEFEATED);

    await this.wait(3000);

    await EnvironmentAudioManager.resumeAmbient();
  }

  async onBossEscape(): Promise<void> {
    await SoundManager.play(SoundId.BOSS_ESCAPE);
    await HapticManager.trigger(HapticPattern.ERROR);

    await this.wait(2000);

    await EnvironmentAudioManager.resumeAmbient();
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new BossAudioIntegration();
