import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MiniGameType, MiniGameState } from '../types';
import { MINI_GAME_CONFIG } from '../config/GameConfig';

const HIGH_SCORES_KEY = '@minigame_highscores';
const PLAY_COUNTS_KEY = '@minigame_playcounts';

export interface HighScores {
  [key: string]: number;
}

export interface PlayCounts {
  [key: string]: number;
}

export class MiniGameManager {
  static async loadHighScores(): Promise<HighScores> {
    try {
      const stored = await AsyncStorage.getItem(HIGH_SCORES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load high scores:', e);
    }

    return {};
  }

  static async saveHighScore(gameType: MiniGameType, score: number): Promise<void> {
    try {
      const highScores = await this.loadHighScores();
      const currentHigh = highScores[gameType] || 0;

      if (score > currentHigh) {
        highScores[gameType] = score;
        await AsyncStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
      }
    } catch (e) {
      console.error('Failed to save high score:', e);
    }
  }

  static async incrementPlayCount(gameType: MiniGameType): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(PLAY_COUNTS_KEY);
      const playCounts: PlayCounts = stored ? JSON.parse(stored) : {};

      playCounts[gameType] = (playCounts[gameType] || 0) + 1;

      await AsyncStorage.setItem(PLAY_COUNTS_KEY, JSON.stringify(playCounts));
    } catch (e) {
      console.error('Failed to increment play count:', e);
    }
  }

  static async getPlayCounts(): Promise<PlayCounts> {
    try {
      const stored = await AsyncStorage.getItem(PLAY_COUNTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load play counts:', e);
    }

    return {};
  }

  static createInitialState(gameType: MiniGameType): MiniGameState {
    'worklet';
    const baseState: MiniGameState = {
      type: gameType,
      isActive: true,
      score: 0,
      timeRemaining: 0,
      highScore: 0,
      difficulty: 1,
      currentRound: 1,
    };

    switch (gameType) {
      case 'whack-a-mole':
        baseState.timeRemaining = MINI_GAME_CONFIG['whack-a-mole'].gameDuration;
        break;
      case 'bubble-pop':
        baseState.timeRemaining = MINI_GAME_CONFIG['bubble-pop'].duration;
        break;
      case 'speed-run':
        baseState.timeRemaining = MINI_GAME_CONFIG['speed-run'].duration;
        break;
      default:
        baseState.timeRemaining = 0;
    }

    return baseState;
  }

  static updateTimer(state: MiniGameState, deltaTime: number): MiniGameState {
    'worklet';
    if (state.timeRemaining > 0) {
      const newTimeRemaining = Math.max(0, state.timeRemaining - deltaTime * 1000);

      return {
        ...state,
        timeRemaining: newTimeRemaining,
        isActive: newTimeRemaining > 0,
      };
    }

    return state;
  }

  static isGameOver(state: MiniGameState): boolean {
    'worklet';
    switch (state.type) {
      case 'whack-a-mole':
      case 'bubble-pop':
      case 'speed-run':
        return state.timeRemaining <= 0;
      case 'memory-match':
        return false;
      case 'follow-leader':
        return state.currentRound > MINI_GAME_CONFIG['follow-leader'].roundCount;
      default:
        return !state.isActive;
    }
  }

  static calculateFinalScore(state: MiniGameState): number {
    'worklet';
    return state.score;
  }
}
