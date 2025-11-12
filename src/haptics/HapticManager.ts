import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export enum HapticPattern {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  CATCH = 'catch',
  COMBO = 'combo',
  BOSS_DAMAGE = 'boss_damage',
  BOSS_DEFEATED = 'boss_defeated',
  ACHIEVEMENT = 'achievement',
  COUNTDOWN = 'countdown',
}

interface HapticConfig {
  enabled: boolean;
  intensity: number;
}

const STORAGE_KEY = 'haptic_config';

class HapticManager {
  private static instance: HapticManager;
  private config: HapticConfig = {
    enabled: true,
    intensity: 0.8,
  };

  private hasHapticSupport = false;

  private constructor() {
    this.checkHapticSupport();
  }

  static getInstance(): HapticManager {
    if (!HapticManager.instance) {
      HapticManager.instance = new HapticManager();
    }
    return HapticManager.instance;
  }

  async initialize(): Promise<void> {
    await this.loadConfig();
  }

  private checkHapticSupport(): void {
    this.hasHapticSupport = Platform.OS === 'ios' || Platform.OS === 'android';
  }

  async loadConfig(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load haptic config:', error);
    }
  }

  async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save haptic config:', error);
    }
  }

  async trigger(pattern: HapticPattern): Promise<void> {
    if (!this.config.enabled || !this.hasHapticSupport) return;

    try {
      switch (pattern) {
        case HapticPattern.LIGHT:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case HapticPattern.MEDIUM:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case HapticPattern.HEAVY:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;

        case HapticPattern.SUCCESS:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;

        case HapticPattern.WARNING:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;

        case HapticPattern.ERROR:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;

        case HapticPattern.CATCH:
          await this.catchPattern();
          break;

        case HapticPattern.COMBO:
          await this.comboPattern();
          break;

        case HapticPattern.BOSS_DAMAGE:
          await this.bossDamagePattern();
          break;

        case HapticPattern.BOSS_DEFEATED:
          await this.bossDefeatedPattern();
          break;

        case HapticPattern.ACHIEVEMENT:
          await this.achievementPattern();
          break;

        case HapticPattern.COUNTDOWN:
          await this.countdownPattern();
          break;

        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error(`Failed to trigger haptic ${pattern}:`, error);
    }
  }

  private async catchPattern(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  private async comboPattern(): Promise<void> {
    const count = 3;
    for (let i = 0; i < count; i++) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await this.wait(50);
    }
  }

  private async bossDamagePattern(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  private async bossDefeatedPattern(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await this.wait(200);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await this.wait(200);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  private async achievementPattern(): Promise<void> {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await this.wait(100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  private async countdownPattern(): Promise<void> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async selection(): Promise<void> {
    if (!this.config.enabled || !this.hasHapticSupport) return;
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.error('Failed to trigger selection haptic:', error);
    }
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.config.enabled = enabled;
    await this.saveConfig();
  }

  async setIntensity(intensity: number): Promise<void> {
    this.config.intensity = Math.max(0, Math.min(1, intensity));
    await this.saveConfig();
  }

  getConfig(): HapticConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled && this.hasHapticSupport;
  }

  hasSupport(): boolean {
    return this.hasHapticSupport;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default HapticManager.getInstance();
