import type { EnvironmentId } from '../types/Environment';
import type { SeasonalEvent, SeasonalEventConfig } from './types';

export interface EnvironmentOverlayData {
  environmentId: EnvironmentId;
  particles: string[];
  colorTint: string;
  backgroundOverlay?: string;
  music?: string;
  ambientEffects?: string[];
}

export class EnvironmentOverlayManager {
  private static instance: EnvironmentOverlayManager;
  private activeOverlays: Map<SeasonalEvent, Map<EnvironmentId, EnvironmentOverlayData>> = new Map();
  private eventThemes: Map<SeasonalEvent, {
    colors: { primary: string; secondary: string; accent: string; background: string };
    music: string;
    particles: string[];
    uiOverlay: string;
  }> = new Map();

  private constructor() {}

  static getInstance(): EnvironmentOverlayManager {
    if (!EnvironmentOverlayManager.instance) {
      EnvironmentOverlayManager.instance = new EnvironmentOverlayManager();
    }
    return EnvironmentOverlayManager.instance;
  }

  loadEventEnvironments(event: SeasonalEventConfig): void {
    const overlayMap = new Map<EnvironmentId, EnvironmentOverlayData>();

    if (event.environments && event.environments.length > 0) {
      for (const envId of event.environments) {
        const overlay: EnvironmentOverlayData = {
          environmentId: envId as EnvironmentId,
          particles: event.theme.particles,
          colorTint: event.theme.colors.primary + '30',
          music: event.theme.music,
        };
        overlayMap.set(envId as EnvironmentId, overlay);
      }
    }

    this.activeOverlays.set(event.id, overlayMap);
    this.eventThemes.set(event.id, event.theme);

    console.log(
      `[EnvironmentOverlayManager] Loaded ${overlayMap.size} environment overlays for ${event.name}`
    );
  }

  unloadEventEnvironments(eventId: SeasonalEvent): void {
    this.activeOverlays.delete(eventId);
    this.eventThemes.delete(eventId);
    console.log(`[EnvironmentOverlayManager] Unloaded environments for event: ${eventId}`);
  }

  getOverlay(environmentId: EnvironmentId, eventId?: SeasonalEvent): EnvironmentOverlayData | null {
    if (!eventId) {
      return null;
    }

    const overlays = this.activeOverlays.get(eventId);
    if (!overlays) {
      return null;
    }

    return overlays.get(environmentId) || null;
  }

  getEventTheme(eventId?: SeasonalEvent): {
    colors: { primary: string; secondary: string; accent: string; background: string };
    music: string;
    particles: string[];
    uiOverlay: string;
  } | null {
    if (!eventId) {
      return null;
    }
    return this.eventThemes.get(eventId) || null;
  }

  getParticlesForEnvironment(environmentId: EnvironmentId, eventId?: SeasonalEvent): string[] {
    const overlay = this.getOverlay(environmentId, eventId);
    return overlay?.particles || [];
  }

  getColorTint(environmentId: EnvironmentId, eventId?: SeasonalEvent): string | null {
    const overlay = this.getOverlay(environmentId, eventId);
    return overlay?.colorTint || null;
  }

  getBackgroundOverlay(environmentId: EnvironmentId, eventId?: SeasonalEvent): string | null {
    const overlay = this.getOverlay(environmentId, eventId);
    return overlay?.backgroundOverlay || null;
  }

  getEventMusic(eventId?: SeasonalEvent): string | null {
    const theme = this.getEventTheme(eventId);
    return theme?.music || null;
  }

  getUIOverlay(eventId?: SeasonalEvent): string | null {
    const theme = this.getEventTheme(eventId);
    return theme?.uiOverlay || null;
  }

  getAllActiveOverlays(eventId?: SeasonalEvent): Map<EnvironmentId, EnvironmentOverlayData> {
    if (!eventId) {
      return new Map();
    }
    return this.activeOverlays.get(eventId) || new Map();
  }

  hasActiveOverlay(environmentId: EnvironmentId, eventId?: SeasonalEvent): boolean {
    if (!eventId) {
      return false;
    }
    const overlays = this.activeOverlays.get(eventId);
    return overlays?.has(environmentId) || false;
  }

  clear(): void {
    this.activeOverlays.clear();
    this.eventThemes.clear();
  }
}
