import SoundManager, { AmbientSoundId } from '../audio/SoundManager';

export enum Environment {
  OCEAN = 'ocean',
  GARDEN = 'garden',
  KOI_POND = 'koi_pond',
  NIGHT_SKY = 'night_sky',
  KITCHEN = 'kitchen',
  CORAL_REEF = 'coral_reef',
  ARCTIC = 'arctic',
}

const ENVIRONMENT_SOUND_MAP: Record<Environment, AmbientSoundId> = {
  [Environment.OCEAN]: AmbientSoundId.OCEAN,
  [Environment.GARDEN]: AmbientSoundId.GARDEN,
  [Environment.KOI_POND]: AmbientSoundId.KOI_POND,
  [Environment.NIGHT_SKY]: AmbientSoundId.NIGHT_SKY,
  [Environment.KITCHEN]: AmbientSoundId.KITCHEN,
  [Environment.CORAL_REEF]: AmbientSoundId.CORAL_REEF,
  [Environment.ARCTIC]: AmbientSoundId.ARCTIC,
};

class EnvironmentAudioManager {
  private static instance: EnvironmentAudioManager;
  private currentEnvironment: Environment | null = null;
  private isAmbientPaused = false;

  private constructor() {}

  static getInstance(): EnvironmentAudioManager {
    if (!EnvironmentAudioManager.instance) {
      EnvironmentAudioManager.instance = new EnvironmentAudioManager();
    }
    return EnvironmentAudioManager.instance;
  }

  async setEnvironment(environment: Environment): Promise<void> {
    if (this.currentEnvironment === environment && !this.isAmbientPaused) {
      return;
    }

    const ambientSound = ENVIRONMENT_SOUND_MAP[environment];
    if (!ambientSound) {
      console.warn(`No ambient sound mapped for environment: ${environment}`);
      return;
    }

    try {
      if (this.currentEnvironment && this.currentEnvironment !== environment) {
        await this.crossfadeEnvironment(ambientSound);
      } else {
        await SoundManager.playAmbient(ambientSound);
      }

      this.currentEnvironment = environment;
      this.isAmbientPaused = false;
    } catch (error) {
      console.error('Failed to set environment:', error);
    }
  }

  private async crossfadeEnvironment(newAmbient: AmbientSoundId): Promise<void> {
    const fadeDuration = 2000;

    await SoundManager.fadeAmbient(0, fadeDuration / 2);

    await SoundManager.stopAmbient();

    await SoundManager.playAmbient(newAmbient);

    const currentConfig = SoundManager.getConfig();
    const targetVolume = currentConfig.masterVolume * currentConfig.ambientVolume;
    await SoundManager.fadeAmbient(targetVolume, fadeDuration / 2);
  }

  async pauseAmbient(): Promise<void> {
    if (this.isAmbientPaused) return;

    try {
      await SoundManager.fadeAmbient(0, 1000);
      await SoundManager.stopAmbient();
      this.isAmbientPaused = true;
    } catch (error) {
      console.error('Failed to pause ambient:', error);
    }
  }

  async resumeAmbient(): Promise<void> {
    if (!this.isAmbientPaused || !this.currentEnvironment) return;

    try {
      const ambientSound = ENVIRONMENT_SOUND_MAP[this.currentEnvironment];
      if (ambientSound) {
        await SoundManager.playAmbient(ambientSound);
        const currentConfig = SoundManager.getConfig();
        const targetVolume = currentConfig.masterVolume * currentConfig.ambientVolume;
        await SoundManager.fadeAmbient(targetVolume, 1000);
        this.isAmbientPaused = false;
      }
    } catch (error) {
      console.error('Failed to resume ambient:', error);
    }
  }

  async stopAmbient(): Promise<void> {
    try {
      await SoundManager.fadeAmbient(0, 1000);
      await SoundManager.stopAmbient();
      this.currentEnvironment = null;
      this.isAmbientPaused = false;
    } catch (error) {
      console.error('Failed to stop ambient:', error);
    }
  }

  getCurrentEnvironment(): Environment | null {
    return this.currentEnvironment;
  }

  isAmbientPlaying(): boolean {
    return this.currentEnvironment !== null && !this.isAmbientPaused;
  }
}

export default EnvironmentAudioManager.getInstance();
