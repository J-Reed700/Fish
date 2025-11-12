import SoundManager, { SoundId } from '../SoundManager';
import HapticManager, { HapticPattern } from '../../haptics/HapticManager';

export class UIAudioIntegration {
  async onButtonTap(): Promise<void> {
    await SoundManager.play(SoundId.BUTTON_TAP);
    await HapticManager.trigger(HapticPattern.LIGHT);
  }

  async onScreenTransition(): Promise<void> {
    await SoundManager.play(SoundId.SCREEN_TRANSITION);
  }

  async onModalOpen(): Promise<void> {
    await SoundManager.play(SoundId.MODAL_OPEN);
    await HapticManager.trigger(HapticPattern.LIGHT);
  }

  async onModalClose(): Promise<void> {
    await SoundManager.play(SoundId.MODAL_CLOSE);
    await HapticManager.trigger(HapticPattern.LIGHT);
  }

  async onSuccess(message?: string): Promise<void> {
    await SoundManager.play(SoundId.SUCCESS);
    await HapticManager.trigger(HapticPattern.SUCCESS);
  }

  async onError(message?: string): Promise<void> {
    await SoundManager.play(SoundId.ERROR);
    await HapticManager.trigger(HapticPattern.ERROR);
  }

  async onPullRefresh(): Promise<void> {
    await SoundManager.play(SoundId.PULL_REFRESH);
    await HapticManager.trigger(HapticPattern.MEDIUM);
  }

  async onProfileSwitch(): Promise<void> {
    await SoundManager.play(SoundId.PROFILE_SWITCH);
    await HapticManager.trigger(HapticPattern.LIGHT);
  }

  async onShare(): Promise<void> {
    await SoundManager.play(SoundId.SHARE_SHUTTER);
    await this.wait(100);
    await SoundManager.play(SoundId.SHARE_WHOOSH);
    await HapticManager.trigger(HapticPattern.MEDIUM);
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new UIAudioIntegration();
