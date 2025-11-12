import { BoidsEngine } from '../engine/BoidsEngine';
import { EnvironmentManager } from './EnvironmentManager';
import { EnvironmentRegistry } from './index';

export class EnvironmentIntegration {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    const registry = EnvironmentRegistry.getInstance();
    const environments = registry.getAll();

    await EnvironmentManager.initialize(environments);

    const currentEnv = EnvironmentManager.getCurrent();
    if (currentEnv) {
      BoidsEngine.setEnvironment(currentEnv);
    }

    this.initialized = true;
  }

  static updateTime(deltaTime: number): void {
    EnvironmentManager.incrementTime(deltaTime);
  }

  static getCurrentEnvironment() {
    return EnvironmentManager.getCurrent();
  }

  static async switchEnvironment(environmentId: string): Promise<boolean> {
    const result = await EnvironmentManager.switchTo(environmentId as any);
    if (result) {
      const newEnv = EnvironmentManager.getCurrent();
      BoidsEngine.setEnvironment(newEnv);
    }
    return result;
  }
}
