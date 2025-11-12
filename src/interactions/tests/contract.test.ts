import { TouchHandler } from '../TouchHandler';
import { Fish, Vector2D } from '../../types';

describe('TouchHandler Contract Validation', () => {
  const createTestFish = (id: string, x: number, y: number, size: number = 20): Fish => ({
    id,
    position: { x, y },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    rotation: 0,
    size,
    color: '#FF0000',
    species: 'goldfish',
    maxSpeed: 100,
    maxForce: 10,
  });

  describe('Public Interface', () => {
    it('should expose handleTouch static method', () => {
      expect(typeof TouchHandler.handleTouch).toBe('function');
    });

    it('should expose applyTouchForce static method', () => {
      expect(typeof TouchHandler.applyTouchForce).toBe('function');
    });

    it('should only expose expected methods', () => {
      const methods = Object.getOwnPropertyNames(TouchHandler).filter(
        (name) => name !== 'length' && name !== 'prototype' && name !== 'name'
      );
      expect(methods.sort()).toEqual(['applyTouchForce', 'handleTouch'].sort());
    });
  });

  describe('handleTouch Contract', () => {
    it('should accept required parameters', async () => {
      const fish = [createTestFish('1', 100, 100)];
      const touchPoint: Vector2D = { x: 100, y: 100 };

      await expect(TouchHandler.handleTouch(touchPoint, fish)).resolves.toBeDefined();
    });

    it('should accept optional fishRadius parameter', async () => {
      const fish = [createTestFish('1', 100, 100)];
      const touchPoint: Vector2D = { x: 100, y: 100 };

      await expect(TouchHandler.handleTouch(touchPoint, fish, 50)).resolves.toBeDefined();
    });

    it('should return object with hitFish and particles', async () => {
      const fish = [createTestFish('1', 100, 100)];
      const touchPoint: Vector2D = { x: 100, y: 100 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      expect(result).toHaveProperty('hitFish');
      expect(result).toHaveProperty('particles');
      expect(Array.isArray(result.hitFish)).toBe(true);
      expect(Array.isArray(result.particles)).toBe(true);
    });

    it('should not mutate input fish array', async () => {
      const fish = [createTestFish('1', 100, 100)];
      const originalFish = JSON.parse(JSON.stringify(fish));
      const touchPoint: Vector2D = { x: 100, y: 100 };

      await TouchHandler.handleTouch(touchPoint, fish);

      expect(fish).toEqual(originalFish);
    });

    it('should maintain order of hitFish matching input order', async () => {
      const fish = [
        createTestFish('a', 100, 100, 30),
        createTestFish('b', 105, 105, 30),
        createTestFish('c', 110, 110, 30),
      ];
      const touchPoint: Vector2D = { x: 105, y: 105 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      const inputOrder = fish.filter((f) => result.hitFish.includes(f)).map((f) => f.id);
      const outputOrder = result.hitFish.map((f) => f.id);

      expect(outputOrder).toEqual(inputOrder);
    });

    it('should always return particles even with no hits', async () => {
      const fish = [createTestFish('1', 100, 100, 20)];
      const touchPoint: Vector2D = { x: 500, y: 500 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      expect(result.particles.length).toBeGreaterThan(0);
    });

    it('should generate splash type particles', async () => {
      const fish = [createTestFish('1', 100, 100)];
      const touchPoint: Vector2D = { x: 200, y: 200 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      result.particles.forEach((p) => {
        expect(p.type).toBe('splash');
      });
    });

    it('should place particles at touch point', async () => {
      const fish = [createTestFish('1', 100, 100)];
      const touchPoint: Vector2D = { x: 250, y: 350 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      result.particles.forEach((p) => {
        expect(p.position.x).toBe(250);
        expect(p.position.y).toBe(350);
      });
    });
  });

  describe('applyTouchForce Contract', () => {
    it('should accept required parameters', () => {
      const fish = createTestFish('1', 100, 100);
      const touchPoint: Vector2D = { x: 90, y: 90 };
      const force = 300;

      expect(() => TouchHandler.applyTouchForce(fish, touchPoint, force)).not.toThrow();
    });

    it('should return Fish type', () => {
      const fish = createTestFish('1', 100, 100);
      const touchPoint: Vector2D = { x: 90, y: 90 };
      const force = 300;

      const result = TouchHandler.applyTouchForce(fish, touchPoint, force);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('position');
      expect(result).toHaveProperty('velocity');
      expect(result).toHaveProperty('acceleration');
      expect(result).toHaveProperty('rotation');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('color');
      expect(result).toHaveProperty('species');
    });

    it('should not mutate input fish (immutability)', () => {
      const fish = createTestFish('1', 100, 100);
      const originalAcceleration = { ...fish.acceleration };
      const touchPoint: Vector2D = { x: 90, y: 90 };
      const force = 300;

      TouchHandler.applyTouchForce(fish, touchPoint, force);

      expect(fish.acceleration).toEqual(originalAcceleration);
    });

    it('should return new Fish object', () => {
      const fish = createTestFish('1', 100, 100);
      const touchPoint: Vector2D = { x: 90, y: 90 };
      const force = 300;

      const result = TouchHandler.applyTouchForce(fish, touchPoint, force);

      expect(result).not.toBe(fish);
    });

    it('should preserve all properties except acceleration', () => {
      const fish = createTestFish('1', 100, 100);
      const touchPoint: Vector2D = { x: 90, y: 90 };
      const force = 300;

      const result = TouchHandler.applyTouchForce(fish, touchPoint, force);

      expect(result.id).toBe(fish.id);
      expect(result.position).toBe(fish.position);
      expect(result.velocity).toBe(fish.velocity);
      expect(result.rotation).toBe(fish.rotation);
      expect(result.size).toBe(fish.size);
      expect(result.color).toBe(fish.color);
      expect(result.species).toBe(fish.species);
      expect(result.maxSpeed).toBe(fish.maxSpeed);
      expect(result.maxForce).toBe(fish.maxForce);
    });

    it('should apply force away from touch point', () => {
      const testCases = [
        { fish: { x: 100, y: 100 }, touch: { x: 90, y: 100 }, expectedX: '>', expectedY: '=' },
        { fish: { x: 100, y: 100 }, touch: { x: 110, y: 100 }, expectedX: '<', expectedY: '=' },
        { fish: { x: 100, y: 100 }, touch: { x: 100, y: 90 }, expectedX: '=', expectedY: '>' },
        { fish: { x: 100, y: 100 }, touch: { x: 100, y: 110 }, expectedX: '=', expectedY: '<' },
      ];

      testCases.forEach(({ fish: pos, touch, expectedX, expectedY }) => {
        const fish = createTestFish('1', pos.x, pos.y);
        const result = TouchHandler.applyTouchForce(fish, touch, 300);
        const forceX = result.acceleration.x - fish.acceleration.x;
        const forceY = result.acceleration.y - fish.acceleration.y;

        if (expectedX === '>') expect(forceX).toBeGreaterThan(0);
        if (expectedX === '<') expect(forceX).toBeLessThan(0);
        if (expectedX === '=') expect(Math.abs(forceX)).toBeLessThan(1);

        if (expectedY === '>') expect(forceY).toBeGreaterThan(0);
        if (expectedY === '<') expect(forceY).toBeLessThan(0);
        if (expectedY === '=') expect(Math.abs(forceY)).toBeLessThan(1);
      });
    });

    it('should add force to existing acceleration', () => {
      const fish = {
        ...createTestFish('1', 100, 100),
        acceleration: { x: 10, y: 20 },
      };
      const touchPoint: Vector2D = { x: 90, y: 90 };
      const force = 300;

      const result = TouchHandler.applyTouchForce(fish, touchPoint, force);

      expect(result.acceleration.x).not.toBe(10);
      expect(result.acceleration.y).not.toBe(20);
    });
  });

  describe('Performance Contract', () => {
    it('should handle large fish arrays efficiently', async () => {
      const largeFishArray = Array.from({ length: 1000 }, (_, i) =>
        createTestFish(`fish-${i}`, Math.random() * 1000, Math.random() * 1000, 20)
      );
      const touchPoint: Vector2D = { x: 500, y: 500 };

      const start = performance.now();
      await TouchHandler.handleTouch(touchPoint, largeFishArray);
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });

    it('should apply force quickly', () => {
      const fish = createTestFish('1', 100, 100);
      const touchPoint: Vector2D = { x: 90, y: 90 };

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        TouchHandler.applyTouchForce(fish, touchPoint, 300);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });
  });

  describe('Statelessness Contract', () => {
    it('should produce same results for same inputs', async () => {
      const fish = [createTestFish('1', 100, 100, 20)];
      const touchPoint: Vector2D = { x: 105, y: 105 };

      const result1 = await TouchHandler.handleTouch(touchPoint, fish);
      const result2 = await TouchHandler.handleTouch(touchPoint, fish);

      expect(result1.hitFish.length).toBe(result2.hitFish.length);
      expect(result1.hitFish[0]?.id).toBe(result2.hitFish[0]?.id);
    });

    it('should not maintain internal state between calls', () => {
      const fish1 = createTestFish('1', 100, 100);
      const fish2 = createTestFish('2', 200, 200);
      const touchPoint: Vector2D = { x: 90, y: 90 };

      const result1 = TouchHandler.applyTouchForce(fish1, touchPoint, 300);
      const result2 = TouchHandler.applyTouchForce(fish2, touchPoint, 300);

      expect(result1).not.toBe(result2);
      expect(result1.id).not.toBe(result2.id);
    });
  });
});
