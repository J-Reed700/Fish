import { FishFactory } from '../FishFactory';
import { FishSpecies } from '../../types';
import { Vector } from '../../engine/Vector';

describe('FishFactory', () => {
  const mockBounds = { width: 800, height: 600 };

  describe('create', () => {
    it('should create a fish with the specified species', () => {
      const fish = FishFactory.create('goldfish', { x: 100, y: 100 }, mockBounds);
      expect(fish.species).toBe('goldfish');
    });

    it('should generate a unique ID', () => {
      const fish1 = FishFactory.create('goldfish', { x: 100, y: 100 }, mockBounds);
      const fish2 = FishFactory.create('goldfish', { x: 100, y: 100 }, mockBounds);
      expect(fish1.id).not.toBe(fish2.id);
      expect(fish1.id.length).toBeGreaterThan(0);
    });

    it('should apply size variation (±20%)', () => {
      const species: FishSpecies = 'goldfish';
      const baseSize = 40;
      const fish = FishFactory.create(species, { x: 100, y: 100 }, mockBounds);

      expect(fish.size).toBeGreaterThanOrEqual(baseSize * 0.8);
      expect(fish.size).toBeLessThanOrEqual(baseSize * 1.2);
    });

    it('should initialize velocity at half maxSpeed', () => {
      const fish = FishFactory.create('goldfish', { x: 100, y: 100 }, mockBounds);
      const velocityMagnitude = Vector.magnitude(fish.velocity);
      const expectedSpeed = 50;

      expect(velocityMagnitude).toBeCloseTo(expectedSpeed, 1);
    });

    it('should set rotation based on velocity angle', () => {
      const fish = FishFactory.create('goldfish', { x: 100, y: 100 }, mockBounds);
      const expectedRotation = Vector.angle(fish.velocity);
      expect(fish.rotation).toBeCloseTo(expectedRotation, 5);
    });

    it('should initialize acceleration to zero', () => {
      const fish = FishFactory.create('goldfish', { x: 100, y: 100 }, mockBounds);
      expect(fish.acceleration.x).toBe(0);
      expect(fish.acceleration.y).toBe(0);
    });

    it('should clamp position within bounds with margin', () => {
      const fishAtEdge = FishFactory.create('goldfish', { x: 0, y: 0 }, mockBounds);
      expect(fishAtEdge.position.x).toBe(50);
      expect(fishAtEdge.position.y).toBe(50);

      const fishBeyondEdge = FishFactory.create('goldfish', { x: 900, y: 700 }, mockBounds);
      expect(fishBeyondEdge.position.x).toBe(750);
      expect(fishBeyondEdge.position.y).toBe(550);
    });

    it('should set correct species properties', () => {
      const fish = FishFactory.create('guppy', { x: 100, y: 100 }, mockBounds);
      expect(fish.maxSpeed).toBe(130);
      expect(fish.maxForce).toBe(3);
      expect(fish.color).toBe('#00BFFF');
    });

    it('should create all species types correctly', () => {
      const allSpecies: FishSpecies[] = [
        'goldfish',
        'clownfish',
        'angelfish',
        'betta',
        'guppy',
        'neon-tetra',
        'koi',
        'molly',
      ];

      allSpecies.forEach((species) => {
        const fish = FishFactory.create(species, { x: 400, y: 300 }, mockBounds);
        expect(fish.species).toBe(species);
        expect(fish.size).toBeGreaterThan(0);
        expect(fish.maxSpeed).toBeGreaterThan(0);
      });
    });
  });

  describe('createRandom', () => {
    it('should create a fish with random species', () => {
      const fish = FishFactory.createRandom(mockBounds);
      const allSpecies: FishSpecies[] = [
        'goldfish',
        'clownfish',
        'angelfish',
        'betta',
        'guppy',
        'neon-tetra',
        'koi',
        'molly',
      ];
      expect(allSpecies).toContain(fish.species);
    });

    it('should create a fish with position within bounds', () => {
      const fish = FishFactory.createRandom(mockBounds);
      expect(fish.position.x).toBeGreaterThanOrEqual(50);
      expect(fish.position.x).toBeLessThanOrEqual(750);
      expect(fish.position.y).toBeGreaterThanOrEqual(50);
      expect(fish.position.y).toBeLessThanOrEqual(550);
    });

    it('should create different fish on multiple calls', () => {
      const fish1 = FishFactory.createRandom(mockBounds);
      const fish2 = FishFactory.createRandom(mockBounds);
      expect(fish1.id).not.toBe(fish2.id);
    });

    it('should distribute species randomly over many calls', () => {
      const speciesCounts = new Map<FishSpecies, number>();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const fish = FishFactory.createRandom(mockBounds);
        speciesCounts.set(fish.species, (speciesCounts.get(fish.species) || 0) + 1);
      }

      expect(speciesCounts.size).toBeGreaterThan(3);
    });
  });

  describe('createMany', () => {
    it('should create the specified number of fish', () => {
      const fish = FishFactory.createMany(10, mockBounds);
      expect(fish.length).toBe(10);
    });

    it('should create fish with unique IDs', () => {
      const fish = FishFactory.createMany(20, mockBounds);
      const ids = new Set(fish.map((f) => f.id));
      expect(ids.size).toBe(20);
    });

    it('should distribute fish spatially using grid layout', () => {
      const fish = FishFactory.createMany(16, mockBounds);

      const xPositions = fish.map((f) => f.position.x);
      const yPositions = fish.map((f) => f.position.y);

      const xSpread = Math.max(...xPositions) - Math.min(...xPositions);
      const ySpread = Math.max(...yPositions) - Math.min(...yPositions);

      expect(xSpread).toBeGreaterThan(200);
      expect(ySpread).toBeGreaterThan(200);
    });

    it('should respect species distribution proportions', () => {
      const distribution = {
        goldfish: 0.4,
        clownfish: 0.3,
        angelfish: 0.3,
      };

      const fish = FishFactory.createMany(100, mockBounds, distribution);

      const goldfishCount = fish.filter((f) => f.species === 'goldfish').length;
      const clownfishCount = fish.filter((f) => f.species === 'clownfish').length;
      const angelfishCount = fish.filter((f) => f.species === 'angelfish').length;

      expect(goldfishCount).toBeGreaterThanOrEqual(35);
      expect(goldfishCount).toBeLessThanOrEqual(45);
      expect(clownfishCount).toBeGreaterThanOrEqual(25);
      expect(clownfishCount).toBeLessThanOrEqual(35);
      expect(angelfishCount).toBeGreaterThanOrEqual(25);
      expect(angelfishCount).toBeLessThanOrEqual(35);
    });

    it('should handle partial species distribution', () => {
      const distribution = {
        goldfish: 0.5,
        guppy: 0.3,
      };

      const fish = FishFactory.createMany(50, mockBounds, distribution);
      expect(fish.length).toBe(50);

      const goldfishCount = fish.filter((f) => f.species === 'goldfish').length;
      const guppyCount = fish.filter((f) => f.species === 'guppy').length;

      expect(goldfishCount).toBeGreaterThanOrEqual(20);
      expect(guppyCount).toBeGreaterThanOrEqual(10);
    });

    it('should fill remaining slots when distribution does not sum to 1', () => {
      const distribution = {
        goldfish: 0.3,
        clownfish: 0.2,
      };

      const fish = FishFactory.createMany(20, mockBounds, distribution);
      expect(fish.length).toBe(20);

      const definedSpecies = fish.filter(
        (f) => f.species === 'goldfish' || f.species === 'clownfish'
      ).length;
      expect(definedSpecies).toBeGreaterThan(0);
    });

    it('should distribute species evenly without distribution parameter', () => {
      const fish = FishFactory.createMany(80, mockBounds);
      const speciesCounts = new Map<FishSpecies, number>();

      fish.forEach((f) => {
        speciesCounts.set(f.species, (speciesCounts.get(f.species) || 0) + 1);
      });

      expect(speciesCounts.size).toBeGreaterThan(3);
    });

    it('should keep all fish within bounds', () => {
      const fish = FishFactory.createMany(50, mockBounds);

      fish.forEach((f) => {
        expect(f.position.x).toBeGreaterThanOrEqual(50);
        expect(f.position.x).toBeLessThanOrEqual(750);
        expect(f.position.y).toBeGreaterThanOrEqual(50);
        expect(f.position.y).toBeLessThanOrEqual(550);
      });
    });

    it('should handle small counts', () => {
      const fish = FishFactory.createMany(1, mockBounds);
      expect(fish.length).toBe(1);
      expect(fish[0].id).toBeTruthy();
    });

    it('should handle large counts', () => {
      const fish = FishFactory.createMany(200, mockBounds);
      expect(fish.length).toBe(200);

      const ids = new Set(fish.map((f) => f.id));
      expect(ids.size).toBe(200);
    });
  });

  describe('contract validation', () => {
    it('should produce pure functions with no side effects', () => {
      const position = { x: 100, y: 100 };
      const originalX = position.x;
      const originalY = position.y;

      FishFactory.create('goldfish', position, mockBounds);

      expect(position.x).toBe(originalX);
      expect(position.y).toBe(originalY);
    });

    it('should return complete Fish objects', () => {
      const fish = FishFactory.create('goldfish', { x: 100, y: 100 }, mockBounds);

      expect(fish).toHaveProperty('id');
      expect(fish).toHaveProperty('position');
      expect(fish).toHaveProperty('velocity');
      expect(fish).toHaveProperty('acceleration');
      expect(fish).toHaveProperty('rotation');
      expect(fish).toHaveProperty('size');
      expect(fish).toHaveProperty('color');
      expect(fish).toHaveProperty('species');
      expect(fish).toHaveProperty('maxSpeed');
      expect(fish).toHaveProperty('maxForce');
    });
  });
});
