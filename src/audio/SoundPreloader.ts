import SoundManager, { SoundId } from './SoundManager';
import HapticManager from '../haptics/HapticManager';

const CRITICAL_SOUNDS = [
  SoundId.CATCH,
  SoundId.MISS,
  SoundId.BUTTON_TAP,
  SoundId.SUCCESS,
  SoundId.ERROR,
  SoundId.ACHIEVEMENT_UNLOCK,
  SoundId.LEVEL_UP,
  SoundId.BOSS_APPEAR,
  SoundId.BOSS_DAMAGE,
];

const UI_SOUNDS = [
  SoundId.SCREEN_TRANSITION,
  SoundId.MODAL_OPEN,
  SoundId.MODAL_CLOSE,
  SoundId.PULL_REFRESH,
];

const GAME_SOUNDS = [
  SoundId.COMBO_3,
  SoundId.COMBO_5,
  SoundId.COMBO_10,
];

export interface PreloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  stage: 'initializing' | 'critical' | 'ui' | 'game' | 'complete';
}

export type ProgressCallback = (progress: PreloadProgress) => void;

class SoundPreloader {
  private static instance: SoundPreloader;

  private constructor() {}

  static getInstance(): SoundPreloader {
    if (!SoundPreloader.instance) {
      SoundPreloader.instance = new SoundPreloader();
    }
    return SoundPreloader.instance;
  }

  async preloadAll(onProgress?: ProgressCallback): Promise<void> {
    const totalSounds = CRITICAL_SOUNDS.length + UI_SOUNDS.length + GAME_SOUNDS.length;
    let loadedSounds = 0;

    const updateProgress = (stage: PreloadProgress['stage']) => {
      if (onProgress) {
        onProgress({
          loaded: loadedSounds,
          total: totalSounds,
          percentage: (loadedSounds / totalSounds) * 100,
          stage,
        });
      }
    };

    try {
      updateProgress('initializing');
      await SoundManager.initialize();
      await HapticManager.initialize();

      updateProgress('critical');
      await SoundManager.preloadSounds(CRITICAL_SOUNDS);
      loadedSounds += CRITICAL_SOUNDS.length;
      updateProgress('critical');

      updateProgress('ui');
      await SoundManager.preloadSounds(UI_SOUNDS);
      loadedSounds += UI_SOUNDS.length;
      updateProgress('ui');

      updateProgress('game');
      await SoundManager.preloadSounds(GAME_SOUNDS);
      loadedSounds += GAME_SOUNDS.length;
      updateProgress('game');

      updateProgress('complete');
    } catch (error) {
      console.error('Failed to preload sounds:', error);
      throw error;
    }
  }

  async preloadCritical(onProgress?: ProgressCallback): Promise<void> {
    const totalSounds = CRITICAL_SOUNDS.length;

    try {
      if (onProgress) {
        onProgress({
          loaded: 0,
          total: totalSounds,
          percentage: 0,
          stage: 'initializing',
        });
      }

      await SoundManager.initialize();
      await HapticManager.initialize();

      if (onProgress) {
        onProgress({
          loaded: 0,
          total: totalSounds,
          percentage: 0,
          stage: 'critical',
        });
      }

      await SoundManager.preloadSounds(CRITICAL_SOUNDS);

      if (onProgress) {
        onProgress({
          loaded: totalSounds,
          total: totalSounds,
          percentage: 100,
          stage: 'complete',
        });
      }
    } catch (error) {
      console.error('Failed to preload critical sounds:', error);
      throw error;
    }
  }

  async lazyLoadRemaining(): Promise<void> {
    try {
      await SoundManager.preloadSounds(UI_SOUNDS);
      await SoundManager.preloadSounds(GAME_SOUNDS);
    } catch (error) {
      console.error('Failed to lazy load sounds:', error);
    }
  }
}

export default SoundPreloader.getInstance();
