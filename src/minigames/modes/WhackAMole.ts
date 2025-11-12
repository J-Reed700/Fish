import type { WhackAMoleState, Vector2D, Fish } from '../../types';
import { MINI_GAME_CONFIG } from '../../config/GameConfig';
import { FishFactory } from '../../entities/FishFactory';

export class WhackAMole {
  static createInitialState(bounds: { width: number; height: number }): WhackAMoleState {
    'worklet';
    const config = MINI_GAME_CONFIG['whack-a-mole'];
    const holes = this.createGrid(config.gridSize, bounds);

    return {
      type: 'whack-a-mole',
      isActive: true,
      score: 0,
      timeRemaining: config.gameDuration,
      highScore: 0,
      difficulty: 1,
      currentRound: 1,
      holes,
      comboCount: 0,
      lastHitTime: 0,
    };
  }

  private static createGrid(
    gridSize: number,
    bounds: { width: number; height: number }
  ): WhackAMoleState['holes'] {
    'worklet';
    const holes: WhackAMoleState['holes'] = [];
    const spacing = Math.min(bounds.width, bounds.height) / (gridSize + 1);
    const offsetX = (bounds.width - spacing * (gridSize - 1)) / 2;
    const offsetY = (bounds.height - spacing * (gridSize - 1)) / 2;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        holes.push({
          isVisible: false,
          position: {
            x: offsetX + col * spacing,
            y: offsetY + row * spacing,
          },
          entity: null,
          spawnTime: 0,
        });
      }
    }

    return holes;
  }

  static update(
    state: WhackAMoleState,
    deltaTime: number,
    bounds: { width: number; height: number }
  ): WhackAMoleState {
    'worklet';
    const config = MINI_GAME_CONFIG['whack-a-mole'];
    const now = Date.now();

    const newTimeRemaining = Math.max(0, state.timeRemaining - deltaTime * 1000);

    const updatedHoles = state.holes.map((hole) => {
      if (hole.isVisible && now - hole.spawnTime > config.popDuration) {
        return {
          ...hole,
          isVisible: false,
          entity: null,
        };
      }
      return hole;
    });

    const visibleCount = updatedHoles.filter((h) => h.isVisible).length;
    const shouldSpawn = visibleCount < 3 && Math.random() < 0.02;

    if (shouldSpawn) {
      const invisibleHoles = updatedHoles
        .map((hole, index) => ({ hole, index }))
        .filter(({ hole }) => !hole.isVisible);

      if (invisibleHoles.length > 0) {
        const randomIndex = Math.floor(Math.random() * invisibleHoles.length);
        const { index } = invisibleHoles[randomIndex];

        const fishSpecies = ['goldfish', 'clownfish', 'guppy', 'neon-tetra'] as const;
        const species = fishSpecies[Math.floor(Math.random() * fishSpecies.length)];
        const fish = FishFactory.createRandom(bounds.width, bounds.height, species);

        updatedHoles[index] = {
          ...updatedHoles[index],
          isVisible: true,
          entity: { ...fish, position: updatedHoles[index].position },
          spawnTime: now,
        };
      }
    }

    const comboExpired = now - state.lastHitTime > 2000;

    return {
      ...state,
      timeRemaining: newTimeRemaining,
      isActive: newTimeRemaining > 0,
      holes: updatedHoles,
      comboCount: comboExpired ? 0 : state.comboCount,
      difficulty: Math.floor(state.score / 10) + 1,
    };
  }

  static handleTouch(
    state: WhackAMoleState,
    touchPoint: Vector2D
  ): WhackAMoleState {
    'worklet';
    const config = MINI_GAME_CONFIG['whack-a-mole'];
    const now = Date.now();

    let hitIndex = -1;
    for (let i = 0; i < state.holes.length; i++) {
      const hole = state.holes[i];
      if (!hole.isVisible || !hole.entity) continue;

      const dx = hole.position.x - touchPoint.x;
      const dy = hole.position.y - touchPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 50) {
        hitIndex = i;
        break;
      }
    }

    if (hitIndex === -1) {
      return state;
    }

    const updatedHoles = [...state.holes];
    updatedHoles[hitIndex] = {
      ...updatedHoles[hitIndex],
      isVisible: false,
      entity: null,
    };

    const newComboCount = state.comboCount + 1;
    const comboBonus = newComboCount >= config.comboThreshold ? config.comboBonus : 0;
    const baseScore = 10;

    return {
      ...state,
      holes: updatedHoles,
      score: state.score + baseScore + comboBonus,
      comboCount: newComboCount,
      lastHitTime: now,
    };
  }
}
