import type { FollowLeaderState, Vector2D, Fish } from '../../types';
import { MINI_GAME_CONFIG } from '../../config/GameConfig';
import { FishFactory } from '../../entities/FishFactory';

export class FollowTheLeader {
  static createInitialState(bounds: { width: number; height: number }): FollowLeaderState {
    'worklet';
    const config = MINI_GAME_CONFIG['follow-leader'];
    const checkpoints = this.generateCheckpoints(config.checkpoints, bounds);
    const leaderFish = FishFactory.createRandom(bounds.width, bounds.height, 'goldfish');

    return {
      type: 'follow-leader',
      isActive: true,
      score: 0,
      timeRemaining: 0,
      highScore: 0,
      difficulty: 1,
      currentRound: 1,
      checkpoints,
      currentCheckpoint: 0,
      leaderFish,
      showPattern: true,
    };
  }

  private static generateCheckpoints(
    count: number,
    bounds: { width: number; height: number }
  ): FollowLeaderState['checkpoints'] {
    'worklet';
    const checkpoints: FollowLeaderState['checkpoints'] = [];
    const margin = 100;

    for (let i = 0; i < count; i++) {
      checkpoints.push({
        id: `checkpoint-${i}`,
        position: {
          x: margin + Math.random() * (bounds.width - 2 * margin),
          y: margin + Math.random() * (bounds.height - 2 * margin),
        },
        order: i,
        completed: false,
      });
    }

    return checkpoints;
  }

  static update(
    state: FollowLeaderState,
    deltaTime: number,
    time: number
  ): FollowLeaderState {
    'worklet';
    if (!state.leaderFish) return state;

    const currentCheckpointData = state.checkpoints[state.currentCheckpoint];
    if (!currentCheckpointData) {
      return state;
    }

    const targetPos = currentCheckpointData.position;
    const dx = targetPos.x - state.leaderFish.position.x;
    const dy = targetPos.y - state.leaderFish.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      const speed = 150;
      const vx = (dx / distance) * speed;
      const vy = (dy / distance) * speed;

      const newX = state.leaderFish.position.x + vx * deltaTime;
      const newY = state.leaderFish.position.y + vy * deltaTime;

      return {
        ...state,
        leaderFish: {
          ...state.leaderFish,
          position: { x: newX, y: newY },
          velocity: { x: vx, y: vy },
          rotation: Math.atan2(vy, vx),
        },
      };
    }

    return state;
  }

  static handleTouch(
    state: FollowLeaderState,
    touchPoint: Vector2D
  ): FollowLeaderState {
    'worklet';
    const config = MINI_GAME_CONFIG['follow-leader'];
    const currentCheckpointData = state.checkpoints[state.currentCheckpoint];

    if (!currentCheckpointData || currentCheckpointData.completed) {
      return state;
    }

    const dx = currentCheckpointData.position.x - touchPoint.x;
    const dy = currentCheckpointData.position.y - touchPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < config.checkpointRadius) {
      const updatedCheckpoints = state.checkpoints.map((cp) =>
        cp.id === currentCheckpointData.id ? { ...cp, completed: true } : cp
      );

      const nextCheckpoint = state.currentCheckpoint + 1;
      const allCompleted = nextCheckpoint >= state.checkpoints.length;

      if (allCompleted) {
        const config = MINI_GAME_CONFIG['follow-leader'];
        const nextRound = state.currentRound + 1;
        const isGameOver = nextRound > config.roundCount;

        if (isGameOver) {
          return {
            ...state,
            checkpoints: updatedCheckpoints,
            currentCheckpoint: nextCheckpoint,
            score: state.score + config.scorePerCheckpoint,
            isActive: false,
          };
        }

        return state;
      }

      return {
        ...state,
        checkpoints: updatedCheckpoints,
        currentCheckpoint: nextCheckpoint,
        score: state.score + config.scorePerCheckpoint,
      };
    }

    return {
      ...state,
      score: Math.max(0, state.score - 10),
    };
  }

  static startNewRound(
    state: FollowLeaderState,
    bounds: { width: number; height: number }
  ): FollowLeaderState {
    'worklet';
    const config = MINI_GAME_CONFIG['follow-leader'];
    const checkpointCount = config.checkpoints + Math.floor(state.currentRound / 2);
    const newCheckpoints = this.generateCheckpoints(checkpointCount, bounds);
    const leaderFish = FishFactory.createRandom(bounds.width, bounds.height, 'goldfish');

    return {
      ...state,
      checkpoints: newCheckpoints,
      currentCheckpoint: 0,
      currentRound: state.currentRound + 1,
      leaderFish,
      showPattern: true,
    };
  }
}
