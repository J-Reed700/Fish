import AsyncStorage from '@react-native-async-storage/async-storage';
import { Environment, EnvironmentId, EnvironmentState } from './types';

const ENVIRONMENT_STATE_KEY = '@fish_environment_state';

export class EnvironmentManager {
  private static environments: Map<EnvironmentId, Environment> = new Map();
  private static currentState: EnvironmentState | null = null;
  private static initialized: boolean = false;

  static async initialize(environments: Environment[]): Promise<void> {
    if (this.initialized) {
      return;
    }

    for (const env of environments) {
      this.environments.set(env.id, env);
    }

    await this.loadState();

    if (!this.currentState) {
      this.currentState = {
        currentEnvironment: 'ocean',
        unlockedEnvironments: ['ocean'],
        timeInEnvironment: 0,
        weatherActive: false,
        dayNightCycle: false,
      };
      await this.saveState();
    }

    this.initialized = true;
  }

  static getCurrent(): Environment | null {
    if (!this.currentState) {
      return null;
    }

    return this.environments.get(this.currentState.currentEnvironment) || null;
  }

  static getEnvironment(id: EnvironmentId): Environment | null {
    return this.environments.get(id) || null;
  }

  static getAllEnvironments(): Environment[] {
    return Array.from(this.environments.values());
  }

  static getUnlockedEnvironments(): Environment[] {
    if (!this.currentState) {
      return [];
    }

    return this.currentState.unlockedEnvironments
      .map(id => this.environments.get(id))
      .filter((env): env is Environment => env !== undefined);
  }

  static async switchTo(environmentId: EnvironmentId): Promise<boolean> {
    if (!this.currentState) {
      return false;
    }

    if (!this.isUnlocked(environmentId)) {
      console.warn(`Environment ${environmentId} is not unlocked`);
      return false;
    }

    const environment = this.environments.get(environmentId);
    if (!environment) {
      console.error(`Environment ${environmentId} not found`);
      return false;
    }

    this.currentState.currentEnvironment = environmentId;
    this.currentState.timeInEnvironment = 0;

    await this.saveState();

    return true;
  }

  static isUnlocked(environmentId: EnvironmentId): boolean {
    if (!this.currentState) {
      return false;
    }

    return this.currentState.unlockedEnvironments.includes(environmentId);
  }

  static async unlock(environmentId: EnvironmentId): Promise<boolean> {
    if (!this.currentState) {
      return false;
    }

    if (this.isUnlocked(environmentId)) {
      return true;
    }

    const environment = this.environments.get(environmentId);
    if (!environment) {
      return false;
    }

    this.currentState.unlockedEnvironments.push(environmentId);
    await this.saveState();

    return true;
  }

  static canUnlock(environmentId: EnvironmentId, fishCount: number): boolean {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      return false;
    }

    if (this.isUnlocked(environmentId)) {
      return true;
    }

    const requirement = environment.unlockRequirement;

    if (requirement.fishCount !== undefined && fishCount < requirement.fishCount) {
      return false;
    }

    if (requirement.environmentsCompleted !== undefined) {
      const unlockedCount = this.currentState?.unlockedEnvironments.length || 0;
      if (unlockedCount < requirement.environmentsCompleted) {
        return false;
      }
    }

    return true;
  }

  static getState(): EnvironmentState | null {
    return this.currentState;
  }

  static async updateState(updates: Partial<EnvironmentState>): Promise<void> {
    if (!this.currentState) {
      return;
    }

    this.currentState = {
      ...this.currentState,
      ...updates,
    };

    await this.saveState();
  }

  static incrementTime(deltaTime: number): void {
    if (!this.currentState) {
      return;
    }

    this.currentState.timeInEnvironment += deltaTime;

    if (this.currentState.dayNightCycle && this.currentState.currentTime !== undefined) {
      this.currentState.currentTime += deltaTime / 1000;
      if (this.currentState.currentTime >= 86400) {
        this.currentState.currentTime = 0;
      }
    }
  }

  private static async loadState(): Promise<void> {
    try {
      const stateJson = await AsyncStorage.getItem(ENVIRONMENT_STATE_KEY);
      if (stateJson) {
        this.currentState = JSON.parse(stateJson);
      }
    } catch (error) {
      console.error('Failed to load environment state:', error);
      this.currentState = null;
    }
  }

  private static async saveState(): Promise<void> {
    try {
      if (this.currentState) {
        const stateJson = JSON.stringify(this.currentState);
        await AsyncStorage.setItem(ENVIRONMENT_STATE_KEY, stateJson);
      }
    } catch (error) {
      console.error('Failed to save environment state:', error);
    }
  }

  static async reset(): Promise<void> {
    this.currentState = {
      currentEnvironment: 'ocean',
      unlockedEnvironments: ['ocean'],
      timeInEnvironment: 0,
      weatherActive: false,
      dayNightCycle: false,
    };
    await this.saveState();
  }

  static isInitialized(): boolean {
    return this.initialized;
  }
}
