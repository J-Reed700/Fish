export * from './types';
export { EnvironmentManager } from './EnvironmentManager';
export { PhysicsModifierEngine } from './physics/PhysicsModifiers';
export { LayerRenderer, MemoizedLayerRenderer, EnvironmentParticleFactory, EnvironmentCanvas } from './rendering';
export { oceanEnvironment, gardenEnvironment, koiPondEnvironment, nightSkyEnvironment, kitchenEnvironment, coralReefEnvironment, arcticEnvironment } from './definitions';
export { EnvironmentIntegration } from './EnvironmentIntegration';

import { Environment } from './types';
import { oceanEnvironment, gardenEnvironment, koiPondEnvironment, nightSkyEnvironment, kitchenEnvironment, coralReefEnvironment, arcticEnvironment } from './definitions';

export class EnvironmentRegistry {
  private static instance: EnvironmentRegistry;
  private environments: Map<string, Environment> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  static getInstance(): EnvironmentRegistry {
    if (!EnvironmentRegistry.instance) {
      EnvironmentRegistry.instance = new EnvironmentRegistry();
    }
    return EnvironmentRegistry.instance;
  }

  private registerDefaults(): void {
    this.register(oceanEnvironment);
    this.register(gardenEnvironment);
    this.register(koiPondEnvironment);
    this.register(nightSkyEnvironment);
    this.register(kitchenEnvironment);
    this.register(coralReefEnvironment);
    this.register(arcticEnvironment);
  }

  register(environment: Environment): void {
    this.environments.set(environment.id, environment);
  }

  get(id: string): Environment | undefined {
    return this.environments.get(id);
  }

  getAll(): Environment[] {
    return Array.from(this.environments.values());
  }

  has(id: string): boolean {
    return this.environments.has(id);
  }

  unregister(id: string): boolean {
    return this.environments.delete(id);
  }

  clear(): void {
    this.environments.clear();
    this.registerDefaults();
  }
}
