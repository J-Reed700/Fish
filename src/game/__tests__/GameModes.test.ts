import { GAME_MODE_CONFIGS } from '../../config/GameConfig';
import { GameMode } from '../../types';

describe('Game Mode Configurations', () => {
  test('all game modes are defined', () => {
    const modes: GameMode[] = ['free-swim', 'hunt', 'bubbles', 'frenzy'];

    modes.forEach(mode => {
      expect(GAME_MODE_CONFIGS[mode]).toBeDefined();
    });
  });

  test('free-swim mode has default config', () => {
    const config = GAME_MODE_CONFIGS['free-swim'];
    expect(config).toEqual({});
  });

  test('hunt mode has speed multiplier and boids overrides', () => {
    const config = GAME_MODE_CONFIGS['hunt'];

    expect(config.speedMultiplier).toBe(1.5);
    expect(config.boidsOverride).toBeDefined();
    expect(config.boidsOverride?.separationDistance).toBe(25);
    expect(config.boidsOverride?.separationWeight).toBe(2.0);
  });

  test('bubbles mode has no fish and high spawn rate', () => {
    const config = GAME_MODE_CONFIGS['bubbles'];

    expect(config.fishCount).toBe(0);
    expect(config.particleCount).toBe(35);
    expect(config.spawnRate).toBe(0.1);
  });

  test('frenzy mode has more fish and modified boids', () => {
    const config = GAME_MODE_CONFIGS['frenzy'];

    expect(config.fishCount).toBe(60);
    expect(config.boidsOverride).toBeDefined();
    expect(config.boidsOverride?.alignmentWeight).toBe(1.5);
    expect(config.boidsOverride?.cohesionWeight).toBe(1.5);
  });
});
