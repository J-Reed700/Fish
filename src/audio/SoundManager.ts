import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum SoundId {
  CATCH = 'catch',
  MISS = 'miss',
  COMBO_3 = 'combo_3',
  COMBO_5 = 'combo_5',
  COMBO_10 = 'combo_10',

  BUTTON_TAP = 'button_tap',
  SCREEN_TRANSITION = 'screen_transition',
  MODAL_OPEN = 'modal_open',
  MODAL_CLOSE = 'modal_close',
  SUCCESS = 'success',
  ERROR = 'error',
  PULL_REFRESH = 'pull_refresh',

  ACHIEVEMENT_UNLOCK = 'achievement_unlock',
  LEVEL_UP = 'level_up',
  CHALLENGE_COMPLETE = 'challenge_complete',
  BADGE_EARNED = 'badge_earned',
  STREAK_MILESTONE = 'streak_milestone',

  BOSS_APPEAR = 'boss_appear',
  BOSS_DAMAGE = 'boss_damage',
  BOSS_PHASE_CHANGE = 'boss_phase_change',
  BOSS_DEFEATED = 'boss_defeated',
  BOSS_ESCAPE = 'boss_escape',

  WHACK_BONK = 'whack_bonk',
  WHACK_POPUP = 'whack_popup',
  MEMORY_FLIP = 'memory_flip',
  MEMORY_MATCH = 'memory_match',
  MEMORY_MISMATCH = 'memory_mismatch',
  LEADER_CHECKPOINT = 'leader_checkpoint',
  LEADER_COMPLETE = 'leader_complete',
  BUBBLE_POP = 'bubble_pop',
  BUBBLE_GOLDEN = 'bubble_golden',
  BUBBLE_BOMB = 'bubble_bomb',
  TIMER_TICK = 'timer_tick',
  COUNTDOWN_BEEP = 'countdown_beep',

  SHARE_SHUTTER = 'share_shutter',
  SHARE_WHOOSH = 'share_whoosh',
  RANK_UP = 'rank_up',
  HIGH_SCORE = 'high_score',
  PROFILE_SWITCH = 'profile_switch',

  PREY_FISH = 'prey_fish',
  PREY_MOUSE = 'prey_mouse',
  PREY_BUTTERFLY = 'prey_butterfly',
  PREY_LADYBUG = 'prey_ladybug',
  PREY_COCKROACH = 'prey_cockroach',
  PREY_BIRD = 'prey_bird',
  PREY_CRICKET = 'prey_cricket',
  PREY_FROG = 'prey_frog',
  PREY_SPIDER = 'prey_spider',
  PREY_WORM = 'prey_worm',
}

export enum AmbientSoundId {
  OCEAN = 'ocean',
  GARDEN = 'garden',
  KOI_POND = 'koi_pond',
  NIGHT_SKY = 'night_sky',
  KITCHEN = 'kitchen',
  CORAL_REEF = 'coral_reef',
  ARCTIC = 'arctic',
}

interface SoundConfig {
  masterVolume: number;
  soundEffectsVolume: number;
  ambientVolume: number;
  enableSounds: boolean;
  respectSilentMode: boolean;
}

interface SoundPoolItem {
  sound: Sound;
  isPlaying: boolean;
}

const SOUND_PATHS: Record<SoundId, any> = {
  [SoundId.CATCH]: require('../../assets/sounds/game/catch.mp3'),
  [SoundId.MISS]: require('../../assets/sounds/game/miss.mp3'),
  [SoundId.COMBO_3]: require('../../assets/sounds/game/combo_3.mp3'),
  [SoundId.COMBO_5]: require('../../assets/sounds/game/combo_5.mp3'),
  [SoundId.COMBO_10]: require('../../assets/sounds/game/combo_10.mp3'),

  [SoundId.BUTTON_TAP]: require('../../assets/sounds/ui/button_tap.mp3'),
  [SoundId.SCREEN_TRANSITION]: require('../../assets/sounds/ui/screen_transition.mp3'),
  [SoundId.MODAL_OPEN]: require('../../assets/sounds/ui/modal_open.mp3'),
  [SoundId.MODAL_CLOSE]: require('../../assets/sounds/ui/modal_close.mp3'),
  [SoundId.SUCCESS]: require('../../assets/sounds/ui/success.mp3'),
  [SoundId.ERROR]: require('../../assets/sounds/ui/error.mp3'),
  [SoundId.PULL_REFRESH]: require('../../assets/sounds/ui/pull_refresh.mp3'),

  [SoundId.ACHIEVEMENT_UNLOCK]: require('../../assets/sounds/achievements/unlock.mp3'),
  [SoundId.LEVEL_UP]: require('../../assets/sounds/achievements/level_up.mp3'),
  [SoundId.CHALLENGE_COMPLETE]: require('../../assets/sounds/achievements/challenge_complete.mp3'),
  [SoundId.BADGE_EARNED]: require('../../assets/sounds/achievements/badge_earned.mp3'),
  [SoundId.STREAK_MILESTONE]: require('../../assets/sounds/achievements/streak_milestone.mp3'),

  [SoundId.BOSS_APPEAR]: require('../../assets/sounds/boss/appear.mp3'),
  [SoundId.BOSS_DAMAGE]: require('../../assets/sounds/boss/damage.mp3'),
  [SoundId.BOSS_PHASE_CHANGE]: require('../../assets/sounds/boss/phase_change.mp3'),
  [SoundId.BOSS_DEFEATED]: require('../../assets/sounds/boss/defeated.mp3'),
  [SoundId.BOSS_ESCAPE]: require('../../assets/sounds/boss/escape.mp3'),

  [SoundId.WHACK_BONK]: require('../../assets/sounds/minigames/whack_bonk.mp3'),
  [SoundId.WHACK_POPUP]: require('../../assets/sounds/minigames/whack_popup.mp3'),
  [SoundId.MEMORY_FLIP]: require('../../assets/sounds/minigames/memory_flip.mp3'),
  [SoundId.MEMORY_MATCH]: require('../../assets/sounds/minigames/memory_match.mp3'),
  [SoundId.MEMORY_MISMATCH]: require('../../assets/sounds/minigames/memory_mismatch.mp3'),
  [SoundId.LEADER_CHECKPOINT]: require('../../assets/sounds/minigames/leader_checkpoint.mp3'),
  [SoundId.LEADER_COMPLETE]: require('../../assets/sounds/minigames/leader_complete.mp3'),
  [SoundId.BUBBLE_POP]: require('../../assets/sounds/minigames/bubble_pop.mp3'),
  [SoundId.BUBBLE_GOLDEN]: require('../../assets/sounds/minigames/bubble_golden.mp3'),
  [SoundId.BUBBLE_BOMB]: require('../../assets/sounds/minigames/bubble_bomb.mp3'),
  [SoundId.TIMER_TICK]: require('../../assets/sounds/minigames/timer_tick.mp3'),
  [SoundId.COUNTDOWN_BEEP]: require('../../assets/sounds/minigames/countdown_beep.mp3'),

  [SoundId.SHARE_SHUTTER]: require('../../assets/sounds/social/share_shutter.mp3'),
  [SoundId.SHARE_WHOOSH]: require('../../assets/sounds/social/share_whoosh.mp3'),
  [SoundId.RANK_UP]: require('../../assets/sounds/social/rank_up.mp3'),
  [SoundId.HIGH_SCORE]: require('../../assets/sounds/social/high_score.mp3'),
  [SoundId.PROFILE_SWITCH]: require('../../assets/sounds/social/profile_switch.mp3'),

  [SoundId.PREY_FISH]: require('../../assets/sounds/prey/fish.mp3'),
  [SoundId.PREY_MOUSE]: require('../../assets/sounds/prey/mouse.mp3'),
  [SoundId.PREY_BUTTERFLY]: require('../../assets/sounds/prey/butterfly.mp3'),
  [SoundId.PREY_LADYBUG]: require('../../assets/sounds/prey/ladybug.mp3'),
  [SoundId.PREY_COCKROACH]: require('../../assets/sounds/prey/cockroach.mp3'),
  [SoundId.PREY_BIRD]: require('../../assets/sounds/prey/bird.mp3'),
  [SoundId.PREY_CRICKET]: require('../../assets/sounds/prey/cricket.mp3'),
  [SoundId.PREY_FROG]: require('../../assets/sounds/prey/frog.mp3'),
  [SoundId.PREY_SPIDER]: require('../../assets/sounds/prey/spider.mp3'),
  [SoundId.PREY_WORM]: require('../../assets/sounds/prey/worm.mp3'),
};

const AMBIENT_PATHS: Record<AmbientSoundId, any> = {
  [AmbientSoundId.OCEAN]: require('../../assets/sounds/ambient/ocean.mp3'),
  [AmbientSoundId.GARDEN]: require('../../assets/sounds/ambient/garden.mp3'),
  [AmbientSoundId.KOI_POND]: require('../../assets/sounds/ambient/koi_pond.mp3'),
  [AmbientSoundId.NIGHT_SKY]: require('../../assets/sounds/ambient/night_sky.mp3'),
  [AmbientSoundId.KITCHEN]: require('../../assets/sounds/ambient/kitchen.mp3'),
  [AmbientSoundId.CORAL_REEF]: require('../../assets/sounds/ambient/coral_reef.mp3'),
  [AmbientSoundId.ARCTIC]: require('../../assets/sounds/ambient/arctic.mp3'),
};

const STORAGE_KEY = 'sound_config';
const POOL_SIZE = 5;

class SoundManager {
  private static instance: SoundManager;
  private config: SoundConfig = {
    masterVolume: 0.7,
    soundEffectsVolume: 0.8,
    ambientVolume: 0.3,
    enableSounds: true,
    respectSilentMode: true,
  };

  private soundPools: Map<SoundId, SoundPoolItem[]> = new Map();
  private ambientSounds: Map<AmbientSoundId, Sound> = new Map();
  private initialized = false;
  private currentAmbient: AmbientSoundId | null = null;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: !this.config.respectSilentMode,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      await this.loadConfig();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize SoundManager:', error);
    }
  }

  async loadConfig(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load sound config:', error);
    }
  }

  async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save sound config:', error);
    }
  }

  async preloadSounds(soundIds: SoundId[]): Promise<void> {
    const promises = soundIds.map(id => this.createSoundPool(id));
    await Promise.all(promises);
  }

  private async createSoundPool(soundId: SoundId): Promise<void> {
    if (this.soundPools.has(soundId)) return;

    const pool: SoundPoolItem[] = [];
    const soundPath = SOUND_PATHS[soundId];

    for (let i = 0; i < POOL_SIZE; i++) {
      try {
        const { sound } = await Audio.Sound.createAsync(soundPath, {
          shouldPlay: false,
          volume: this.getEffectiveVolume(),
        });

        pool.push({ sound, isPlaying: false });

        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) {
            const item = pool.find(p => p.sound === sound);
            if (item) item.isPlaying = false;
          }
        });
      } catch (error) {
        console.error(`Failed to create sound pool for ${soundId}:`, error);
      }
    }

    this.soundPools.set(soundId, pool);
  }

  async play(soundId: SoundId, volumeMultiplier = 1.0): Promise<void> {
    if (!this.config.enableSounds || !this.initialized) return;

    try {
      let pool = this.soundPools.get(soundId);

      if (!pool) {
        await this.createSoundPool(soundId);
        pool = this.soundPools.get(soundId);
      }

      if (!pool || pool.length === 0) return;

      const availableItem = pool.find(item => !item.isPlaying) || pool[0];

      await availableItem.sound.setPositionAsync(0);
      await availableItem.sound.setVolumeAsync(this.getEffectiveVolume() * volumeMultiplier);
      await availableItem.sound.playAsync();
      availableItem.isPlaying = true;
    } catch (error) {
      console.error(`Failed to play sound ${soundId}:`, error);
    }
  }

  async playAmbient(ambientId: AmbientSoundId): Promise<void> {
    if (!this.config.enableSounds || !this.initialized) return;

    if (this.currentAmbient === ambientId) return;

    try {
      if (this.currentAmbient) {
        await this.stopAmbient();
      }

      let ambientSound = this.ambientSounds.get(ambientId);

      if (!ambientSound) {
        const { sound } = await Audio.Sound.createAsync(AMBIENT_PATHS[ambientId], {
          shouldPlay: false,
          isLooping: true,
          volume: this.config.masterVolume * this.config.ambientVolume,
        });
        ambientSound = sound;
        this.ambientSounds.set(ambientId, sound);
      }

      await ambientSound.setVolumeAsync(this.config.masterVolume * this.config.ambientVolume);
      await ambientSound.playAsync();
      this.currentAmbient = ambientId;
    } catch (error) {
      console.error(`Failed to play ambient ${ambientId}:`, error);
    }
  }

  async stopAmbient(): Promise<void> {
    if (!this.currentAmbient) return;

    try {
      const sound = this.ambientSounds.get(this.currentAmbient);
      if (sound) {
        await sound.stopAsync();
      }
      this.currentAmbient = null;
    } catch (error) {
      console.error('Failed to stop ambient:', error);
    }
  }

  async fadeAmbient(targetVolume: number, duration = 2000): Promise<void> {
    if (!this.currentAmbient) return;

    try {
      const sound = this.ambientSounds.get(this.currentAmbient);
      if (!sound) return;

      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;

      const startVolume = status.volume || 0;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = (targetVolume - startVolume) / steps;

      for (let i = 0; i <= steps; i++) {
        await sound.setVolumeAsync(startVolume + volumeStep * i);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    } catch (error) {
      console.error('Failed to fade ambient:', error);
    }
  }

  async setMasterVolume(volume: number): Promise<void> {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    await this.updateAllVolumes();
    await this.saveConfig();
  }

  async setSoundEffectsVolume(volume: number): Promise<void> {
    this.config.soundEffectsVolume = Math.max(0, Math.min(1, volume));
    await this.updateAllVolumes();
    await this.saveConfig();
  }

  async setAmbientVolume(volume: number): Promise<void> {
    this.config.ambientVolume = Math.max(0, Math.min(1, volume));

    if (this.currentAmbient) {
      const sound = this.ambientSounds.get(this.currentAmbient);
      if (sound) {
        await sound.setVolumeAsync(this.config.masterVolume * this.config.ambientVolume);
      }
    }

    await this.saveConfig();
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.config.enableSounds = enabled;

    if (!enabled) {
      await this.stopAll();
    }

    await this.saveConfig();
  }

  async toggleMute(): Promise<void> {
    await this.setEnabled(!this.config.enableSounds);
  }

  private async updateAllVolumes(): Promise<void> {
    const effectiveVolume = this.getEffectiveVolume();

    for (const pool of this.soundPools.values()) {
      for (const item of pool) {
        try {
          await item.sound.setVolumeAsync(effectiveVolume);
        } catch (error) {
          console.error('Failed to update volume:', error);
        }
      }
    }

    if (this.currentAmbient) {
      const sound = this.ambientSounds.get(this.currentAmbient);
      if (sound) {
        await sound.setVolumeAsync(this.config.masterVolume * this.config.ambientVolume);
      }
    }
  }

  private getEffectiveVolume(): number {
    return this.config.masterVolume * this.config.soundEffectsVolume;
  }

  async stopAll(): Promise<void> {
    for (const pool of this.soundPools.values()) {
      for (const item of pool) {
        try {
          await item.sound.stopAsync();
          item.isPlaying = false;
        } catch (error) {
          console.error('Failed to stop sound:', error);
        }
      }
    }

    await this.stopAmbient();
  }

  async cleanup(): Promise<void> {
    await this.stopAll();

    for (const pool of this.soundPools.values()) {
      for (const item of pool) {
        try {
          await item.sound.unloadAsync();
        } catch (error) {
          console.error('Failed to unload sound:', error);
        }
      }
    }

    for (const sound of this.ambientSounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Failed to unload ambient:', error);
      }
    }

    this.soundPools.clear();
    this.ambientSounds.clear();
    this.initialized = false;
  }

  getConfig(): SoundConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enableSounds;
  }

  getCurrentAmbient(): AmbientSoundId | null {
    return this.currentAmbient;
  }
}

export default SoundManager.getInstance();
