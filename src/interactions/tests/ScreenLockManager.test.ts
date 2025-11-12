import {
  ScreenLockManager,
  LockState,
  CORNER_SIZE,
  UNLOCK_SEQUENCE,
  UNLOCK_TIMEOUT,
} from '../ScreenLockManager';

describe('ScreenLockManager', () => {
  const bounds = { width: 400, height: 800 };

  describe('create', () => {
    it('should create unlocked state', () => {
      const state = ScreenLockManager.create();
      expect(state.isLocked).toBe(false);
      expect(state.unlockProgress).toEqual([]);
      expect(state.unlockStartTime).toBe(0);
    });
  });

  describe('lock', () => {
    it('should create locked state', () => {
      const state = ScreenLockManager.lock();
      expect(state.isLocked).toBe(true);
      expect(state.unlockProgress).toEqual([]);
      expect(state.unlockStartTime).toBe(0);
    });
  });

  describe('unlock', () => {
    it('should create unlocked state', () => {
      const state = ScreenLockManager.unlock();
      expect(state.isLocked).toBe(false);
      expect(state.unlockProgress).toEqual([]);
      expect(state.unlockStartTime).toBe(0);
    });
  });

  describe('getTouchedCorner', () => {
    it('should detect top-left corner', () => {
      const point = { x: 25, y: 25 };
      const corner = ScreenLockManager.getTouchedCorner(point, bounds);
      expect(corner).toBe(0);
    });

    it('should detect top-right corner', () => {
      const point = { x: bounds.width - 25, y: 25 };
      const corner = ScreenLockManager.getTouchedCorner(point, bounds);
      expect(corner).toBe(1);
    });

    it('should detect bottom-left corner', () => {
      const point = { x: 25, y: bounds.height - 25 };
      const corner = ScreenLockManager.getTouchedCorner(point, bounds);
      expect(corner).toBe(2);
    });

    it('should detect bottom-right corner', () => {
      const point = { x: bounds.width - 25, y: bounds.height - 25 };
      const corner = ScreenLockManager.getTouchedCorner(point, bounds);
      expect(corner).toBe(3);
    });

    it('should return null for center touch', () => {
      const point = { x: bounds.width / 2, y: bounds.height / 2 };
      const corner = ScreenLockManager.getTouchedCorner(point, bounds);
      expect(corner).toBeNull();
    });

    it('should return null for edge touch outside corners', () => {
      const point = { x: CORNER_SIZE + 10, y: 25 };
      const corner = ScreenLockManager.getTouchedCorner(point, bounds);
      expect(corner).toBeNull();
    });
  });

  describe('handleTouch', () => {
    it('should not process touches when unlocked', () => {
      const state = ScreenLockManager.create();
      const point = { x: 25, y: 25 };
      const newState = ScreenLockManager.handleTouch(state, point, bounds);
      expect(newState).toEqual(state);
    });

    it('should start unlock sequence on first correct corner', () => {
      const state = ScreenLockManager.lock();
      const point = { x: 25, y: 25 };
      const newState = ScreenLockManager.handleTouch(state, point, bounds);
      expect(newState.unlockProgress).toEqual([0]);
      expect(newState.unlockStartTime).toBeGreaterThan(0);
      expect(newState.isLocked).toBe(true);
    });

    it('should progress through unlock sequence', () => {
      let state = ScreenLockManager.lock();

      state = ScreenLockManager.handleTouch(state, { x: 25, y: 25 }, bounds);
      expect(state.unlockProgress).toEqual([0]);

      state = ScreenLockManager.handleTouch(state, { x: bounds.width - 25, y: 25 }, bounds);
      expect(state.unlockProgress).toEqual([0, 1]);

      state = ScreenLockManager.handleTouch(state, { x: bounds.width - 25, y: bounds.height - 25 }, bounds);
      expect(state.unlockProgress).toEqual([0, 1, 3]);
    });

    it('should unlock after complete sequence', () => {
      let state = ScreenLockManager.lock();

      state = ScreenLockManager.handleTouch(state, { x: 25, y: 25 }, bounds);
      state = ScreenLockManager.handleTouch(state, { x: bounds.width - 25, y: 25 }, bounds);
      state = ScreenLockManager.handleTouch(state, { x: bounds.width - 25, y: bounds.height - 25 }, bounds);
      state = ScreenLockManager.handleTouch(state, { x: 25, y: bounds.height - 25 }, bounds);

      expect(state.isLocked).toBe(false);
      expect(state.unlockProgress).toEqual([]);
    });

    it('should reset progress on wrong corner', () => {
      let state = ScreenLockManager.lock();

      state = ScreenLockManager.handleTouch(state, { x: 25, y: 25 }, bounds);
      expect(state.unlockProgress).toEqual([0]);

      state = ScreenLockManager.handleTouch(state, { x: 25, y: bounds.height - 25 }, bounds);
      expect(state.unlockProgress).toEqual([]);
    });

    it('should ignore center touches during unlock', () => {
      let state = ScreenLockManager.lock();

      state = ScreenLockManager.handleTouch(state, { x: 25, y: 25 }, bounds);
      expect(state.unlockProgress).toEqual([0]);

      state = ScreenLockManager.handleTouch(state, { x: bounds.width / 2, y: bounds.height / 2 }, bounds);
      expect(state.unlockProgress).toEqual([0]);
    });
  });

  describe('isUnlockComplete', () => {
    it('should return true for unlocked state with no progress', () => {
      const state = ScreenLockManager.unlock();
      expect(ScreenLockManager.isUnlockComplete(state)).toBe(true);
    });

    it('should return false for locked state', () => {
      const state = ScreenLockManager.lock();
      expect(ScreenLockManager.isUnlockComplete(state)).toBe(false);
    });

    it('should return false for state with progress', () => {
      const state: LockState = {
        isLocked: true,
        unlockProgress: [0],
        unlockStartTime: Date.now(),
      };
      expect(ScreenLockManager.isUnlockComplete(state)).toBe(false);
    });
  });

  describe('shouldResetUnlock', () => {
    it('should return false when no progress', () => {
      const state = ScreenLockManager.lock();
      const shouldReset = ScreenLockManager.shouldResetUnlock(state, Date.now());
      expect(shouldReset).toBe(false);
    });

    it('should return false when within timeout', () => {
      const now = Date.now();
      const state: LockState = {
        isLocked: true,
        unlockProgress: [0],
        unlockStartTime: now - 1000,
      };
      const shouldReset = ScreenLockManager.shouldResetUnlock(state, now);
      expect(shouldReset).toBe(false);
    });

    it('should return true when timeout exceeded', () => {
      const now = Date.now();
      const state: LockState = {
        isLocked: true,
        unlockProgress: [0],
        unlockStartTime: now - UNLOCK_TIMEOUT - 100,
      };
      const shouldReset = ScreenLockManager.shouldResetUnlock(state, now);
      expect(shouldReset).toBe(true);
    });
  });

  describe('getUnlockProgress', () => {
    it('should return progress count', () => {
      const state: LockState = {
        isLocked: true,
        unlockProgress: [0, 1, 3],
        unlockStartTime: Date.now(),
      };
      expect(ScreenLockManager.getUnlockProgress(state)).toBe(3);
    });
  });

  describe('getExpectedCorner', () => {
    it('should return first corner when no progress', () => {
      const state = ScreenLockManager.lock();
      expect(ScreenLockManager.getExpectedCorner(state)).toBe(UNLOCK_SEQUENCE[0]);
    });

    it('should return next expected corner', () => {
      const state: LockState = {
        isLocked: true,
        unlockProgress: [0, 1],
        unlockStartTime: Date.now(),
      };
      expect(ScreenLockManager.getExpectedCorner(state)).toBe(UNLOCK_SEQUENCE[2]);
    });
  });

  describe('timeout handling', () => {
    it('should reset progress on timeout during touch', () => {
      const oldTime = Date.now() - UNLOCK_TIMEOUT - 100;
      let state: LockState = {
        isLocked: true,
        unlockProgress: [0],
        unlockStartTime: oldTime,
      };

      state = ScreenLockManager.handleTouch(state, { x: 25, y: 25 }, bounds);
      expect(state.unlockProgress).toEqual([0]);
      expect(state.unlockStartTime).toBeGreaterThan(oldTime);
    });
  });
});
