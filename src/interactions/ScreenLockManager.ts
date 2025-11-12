import { Vector2D } from '../types';

export interface LockState {
  isLocked: boolean;
  unlockProgress: number[];
  unlockStartTime: number;
}

export interface Bounds {
  width: number;
  height: number;
}

export const CORNER_SIZE = 50;
export const UNLOCK_SEQUENCE = [0, 1, 3, 2];
export const UNLOCK_TIMEOUT = 3000;

export class ScreenLockManager {
  static create(): LockState {
    return {
      isLocked: false,
      unlockProgress: [],
      unlockStartTime: 0,
    };
  }

  static lock(): LockState {
    return {
      isLocked: true,
      unlockProgress: [],
      unlockStartTime: 0,
    };
  }

  static unlock(): LockState {
    return {
      isLocked: false,
      unlockProgress: [],
      unlockStartTime: 0,
    };
  }

  static getTouchedCorner(point: Vector2D, bounds: Bounds): number | null {
    if (point.x < CORNER_SIZE && point.y < CORNER_SIZE) return 0;
    if (point.x > bounds.width - CORNER_SIZE && point.y < CORNER_SIZE) return 1;
    if (point.x < CORNER_SIZE && point.y > bounds.height - CORNER_SIZE) return 2;
    if (point.x > bounds.width - CORNER_SIZE && point.y > bounds.height - CORNER_SIZE) return 3;
    return null;
  }

  static handleTouch(
    state: LockState,
    touchPoint: Vector2D,
    bounds: Bounds
  ): LockState {
    if (!state.isLocked) {
      return state;
    }

    if (this.shouldResetUnlock(state, Date.now())) {
      state = { ...state, unlockProgress: [], unlockStartTime: 0 };
    }

    const corner = this.getTouchedCorner(touchPoint, bounds);

    if (corner === null) {
      return state;
    }

    const expectedCorner = UNLOCK_SEQUENCE[state.unlockProgress.length];

    if (corner === expectedCorner) {
      const newProgress = [...state.unlockProgress, corner];
      const startTime = state.unlockProgress.length === 0 ? Date.now() : state.unlockStartTime;

      if (newProgress.length === UNLOCK_SEQUENCE.length) {
        return this.unlock();
      }

      return {
        ...state,
        unlockProgress: newProgress,
        unlockStartTime: startTime,
      };
    } else if (state.unlockProgress.length > 0) {
      return { ...state, unlockProgress: [], unlockStartTime: 0 };
    }

    return state;
  }

  static isUnlockComplete(state: LockState): boolean {
    return !state.isLocked && state.unlockProgress.length === 0;
  }

  static shouldResetUnlock(state: LockState, currentTime: number): boolean {
    if (state.unlockProgress.length === 0) {
      return false;
    }
    return currentTime - state.unlockStartTime > UNLOCK_TIMEOUT;
  }

  static getUnlockProgress(state: LockState): number {
    return state.unlockProgress.length;
  }

  static getExpectedCorner(state: LockState): number {
    if (state.unlockProgress.length >= UNLOCK_SEQUENCE.length) {
      return -1;
    }
    return UNLOCK_SEQUENCE[state.unlockProgress.length];
  }
}
