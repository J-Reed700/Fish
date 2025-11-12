import type { SpeedRunState, Fish, Vector2D } from '../../types';
import { MINI_GAME_CONFIG } from '../../config/GameConfig';

export class SpeedRun {
  static createInitialState(): SpeedRunState {
    'worklet';
    const config = MINI_GAME_CONFIG['speed-run'];

    return {
      type: 'speed-run',
      isActive: true,
      score: 0,
      timeRemaining: config.duration,
      highScore: 0,
      difficulty: 1,
      currentRound: 1,
      catchMultiplier: 1.0,
      totalCatches: 0,
    };
  }

  static update(state: SpeedRunState, deltaTime: number): SpeedRunState {
    'worklet';
    const config = MINI_GAME_CONFIG['speed-run'];
    const newTimeRemaining = Math.max(0, state.timeRemaining - deltaTime * 1000);

    const catchesPerMultiplier = config.multiplierIncrement;
    const newMultiplier = 1.0 + Math.floor(state.totalCatches / catchesPerMultiplier) * config.multiplierBonus;

    return {
      ...state,
      timeRemaining: newTimeRemaining,
      isActive: newTimeRemaining > 0,
      catchMultiplier: newMultiplier,
    };
  }

  static handleCatch(state: SpeedRunState, fish: Fish): SpeedRunState {
    'worklet';
    const baseScore = 10;
    const scoreWithMultiplier = Math.floor(baseScore * state.catchMultiplier);

    return {
      ...state,
      totalCatches: state.totalCatches + 1,
      score: state.score + scoreWithMultiplier,
    };
  }

  static handleTouch(
    state: SpeedRunState,
    touchPoint: Vector2D,
    fish: Fish[]
  ): { state: SpeedRunState; caughtFish: Fish[] } {
    'worklet';
    const caughtFish: Fish[] = [];

    fish.forEach((f) => {
      const dx = f.position.x - touchPoint.x;
      const dy = f.position.y - touchPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < f.size) {
        caughtFish.push(f);
      }
    });

    let newState = state;
    caughtFish.forEach((f) => {
      newState = this.handleCatch(newState, f);
    });

    return {
      state: newState,
      caughtFish,
    };
  }
}
