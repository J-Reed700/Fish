import { TouchHandler } from '../TouchHandler';
import { Fish, Vector2D } from '../../types';

describe('TouchHandler', () => {
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

  describe('handleTouch', () => {
    it('should detect fish at touch point', async () => {
      const fish = [
        createTestFish('1', 100, 100, 20),
        createTestFish('2', 200, 200, 20),
      ];
      const touchPoint: Vector2D = { x: 100, y: 100 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      expect(result.hitFish).toHaveLength(1);
      expect(result.hitFish[0].id).toBe('1');
    });

    it('should detect fish within radius', async () => {
      const fish = [createTestFish('1', 100, 100, 20)];
      const touchPoint: Vector2D = { x: 110, y: 100 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      expect(result.hitFish).toHaveLength(1);
      expect(result.hitFish[0].id).toBe('1');
    });

    it('should not detect fish outside radius', async () => {
      const fish = [createTestFish('1', 100, 100, 20)];
      const touchPoint: Vector2D = { x: 150, y: 150 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      expect(result.hitFish).toHaveLength(0);
    });

    it('should detect multiple fish if overlapping touch', async () => {
      const fish = [
        createTestFish('1', 100, 100, 30),
        createTestFish('2', 120, 100, 30),
        createTestFish('3', 300, 300, 20),
      ];
      const touchPoint: Vector2D = { x: 110, y: 100 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      expect(result.hitFish).toHaveLength(2);
      expect(result.hitFish[0].id).toBe('1');
      expect(result.hitFish[1].id).toBe('2');
    });

    it('should use custom fishRadius when provided', async () => {
      const fish = [createTestFish('1', 100, 100, 10)];
      const touchPoint: Vector2D = { x: 130, y: 100 };

      const resultDefault = await TouchHandler.handleTouch(touchPoint, fish);
      expect(resultDefault.hitFish).toHaveLength(0);

      const resultCustom = await TouchHandler.handleTouch(touchPoint, fish, 35);
      expect(resultCustom.hitFish).toHaveLength(1);
    });

    it('should generate splash particles', async () => {
      const fish = [createTestFish('1', 100, 100, 20)];
      const touchPoint: Vector2D = { x: 50, y: 50 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      expect(result.particles.length).toBeGreaterThanOrEqual(10);
      result.particles.forEach((p) => {
        expect(p.type).toBe('splash');
        expect(p.position.x).toBe(50);
        expect(p.position.y).toBe(50);
      });
    });

    it('should generate particles even when no fish hit', async () => {
      const fish = [createTestFish('1', 100, 100, 20)];
      const touchPoint: Vector2D = { x: 500, y: 500 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      expect(result.hitFish).toHaveLength(0);
      expect(result.particles.length).toBeGreaterThanOrEqual(10);
    });

    it('should handle empty fish array', async () => {
      const touchPoint: Vector2D = { x: 100, y: 100 };

      const result = await TouchHandler.handleTouch(touchPoint, []);

      expect(result.hitFish).toHaveLength(0);
      expect(result.particles.length).toBeGreaterThanOrEqual(10);
    });

    it('should maintain fish order in hitFish array', async () => {
      const fish = [
        createTestFish('1', 100, 100, 30),
        createTestFish('2', 105, 105, 30),
        createTestFish('3', 110, 110, 30),
      ];
      const touchPoint: Vector2D = { x: 105, y: 105 };

      const result = await TouchHandler.handleTouch(touchPoint, fish);

      expect(result.hitFish.map((f) => f.id)).toEqual(['1', '2', '3']);
    });
  });

  describe('applyTouchForce', () => {
    it('should push fish away from touch point', () => {
      const fish = createTestFish('1', 100, 100);
      const touchPoint: Vector2D = { x: 90, y: 90 };
      const force = 300;

      const result = TouchHandler.applyTouchForce(fish, touchPoint, force);

      expect(result.acceleration.x).toBeGreaterThan(0);
      expect(result.acceleration.y).toBeGreaterThan(0);
    });

    it('should not mutate original fish', () => {
      const fish = createTestFish('1', 100, 100);
      const originalAcceleration = { ...fish.acceleration };
      const touchPoint: Vector2D = { x: 90, y: 90 };

      const result = TouchHandler.applyTouchForce(fish, touchPoint, 300);

      expect(fish.acceleration).toEqual(originalAcceleration);
      expect(result).not.toBe(fish);
    });

    it('should add force to existing acceleration', () => {
      const fish = {
        ...createTestFish('1', 100, 100),
        acceleration: { x: 50, y: 50 },
      };
      const touchPoint: Vector2D = { x: 90, y: 90 };
      const force = 300;

      const result = TouchHandler.applyTouchForce(fish, touchPoint, force);

      expect(result.acceleration.x).toBeGreaterThan(50);
      expect(result.acceleration.y).toBeGreaterThan(50);
    });

    it('should apply force in correct direction', () => {
      const fish = createTestFish('1', 100, 100);
      const touchPoint: Vector2D = { x: 90, y: 90 };

      const result = TouchHandler.applyTouchForce(fish, touchPoint, 300);

      expect(result.acceleration.x).toBeGreaterThan(0);
      expect(result.acceleration.y).toBeGreaterThan(0);
    });

    it('should scale force by magnitude parameter', () => {
      const fish = createTestFish('1', 100, 100);
      const touchPoint: Vector2D = { x: 90, y: 90 };

      const result1 = TouchHandler.applyTouchForce(fish, touchPoint, 100);
      const result2 = TouchHandler.applyTouchForce(fish, touchPoint, 300);

      const mag1 = Math.sqrt(
        result1.acceleration.x ** 2 + result1.acceleration.y ** 2
      );
      const mag2 = Math.sqrt(
        result2.acceleration.x ** 2 + result2.acceleration.y ** 2
      );

      expect(mag2).toBeGreaterThan(mag1);
      expect(mag2 / mag1).toBeCloseTo(3, 0);
    });

    it('should preserve all other fish properties', () => {
      const fish = createTestFish('1', 100, 100);
      const touchPoint: Vector2D = { x: 90, y: 90 };

      const result = TouchHandler.applyTouchForce(fish, touchPoint, 300);

      expect(result.id).toBe(fish.id);
      expect(result.position).toEqual(fish.position);
      expect(result.velocity).toEqual(fish.velocity);
      expect(result.rotation).toBe(fish.rotation);
      expect(result.size).toBe(fish.size);
      expect(result.color).toBe(fish.color);
    });

    it('should handle fish at same position as touch point', () => {
      const fish = createTestFish('1', 100, 100);
      const touchPoint: Vector2D = { x: 100, y: 100 };

      const result = TouchHandler.applyTouchForce(fish, touchPoint, 300);

      expect(result.acceleration.x).toBe(0);
      expect(result.acceleration.y).toBe(0);
    });
  });

  describe('integration', () => {
    it('should work in typical game loop pattern', async () => {
      const allFish = [
        createTestFish('1', 100, 100, 20),
        createTestFish('2', 150, 150, 20),
        createTestFish('3', 300, 300, 20),
      ];
      const touchPoint: Vector2D = { x: 105, y: 105 };

      const { hitFish, particles } = await TouchHandler.handleTouch(touchPoint, allFish);

      expect(hitFish.length).toBeGreaterThan(0);
      expect(particles.length).toBeGreaterThanOrEqual(10);

      const updatedFish = allFish.map((f) => {
        if (hitFish.includes(f)) {
          return TouchHandler.applyTouchForce(f, touchPoint, 300);
        }
        return f;
      });

      expect(updatedFish).toHaveLength(3);
      expect(updatedFish[0]).not.toBe(allFish[0]);
      expect(updatedFish[2]).toBe(allFish[2]);
    });
  });
});
