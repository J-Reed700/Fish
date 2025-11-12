import { Fish, FishSpecies, Vector2D } from '../types';
import { Vector } from '../engine/Vector';
import { SPECIES_PROPERTIES } from '../config/GameConfig';

export class FishFactory {
  static create(
    species: FishSpecies,
    position: Vector2D,
    bounds: { width: number; height: number }
  ): Fish {
    const properties = SPECIES_PROPERTIES[species];

    const sizeVariation = 0.8 + Math.random() * 0.4;
    const size = properties.size * sizeVariation;

    const randomAngle = Math.random() * Math.PI * 2;
    const initialSpeed = properties.maxSpeed * 0.5;
    const velocity = Vector.fromAngle(randomAngle, initialSpeed);

    const clampedPosition = {
      x: Math.max(50, Math.min(bounds.width - 50, position.x)),
      y: Math.max(50, Math.min(bounds.height - 50, position.y)),
    };

    const rotation = Vector.angle(velocity);

    const id = Math.random().toString(36).substring(2, 11);

    return {
      id,
      position: clampedPosition,
      velocity,
      acceleration: { x: 0, y: 0 },
      rotation,
      size,
      color: properties.color,
      species,
      maxSpeed: properties.maxSpeed,
      maxForce: properties.maxForce,
    };
  }

  static createRandom(bounds: { width: number; height: number }): Fish {
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

    const randomSpecies =
      allSpecies[Math.floor(Math.random() * allSpecies.length)];

    const randomPosition: Vector2D = {
      x: 50 + Math.random() * (bounds.width - 100),
      y: 50 + Math.random() * (bounds.height - 100),
    };

    return this.create(randomSpecies, randomPosition, bounds);
  }

  static createMany(
    count: number,
    bounds: { width: number; height: number },
    speciesDistribution?: Partial<Record<FishSpecies, number>>
  ): Fish[] {
    const fish: Fish[] = [];

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

    let speciesToCreate: FishSpecies[];

    if (speciesDistribution) {
      speciesToCreate = [];
      for (const [species, proportion] of Object.entries(
        speciesDistribution
      )) {
        const fishCount = Math.round(count * proportion);
        for (let i = 0; i < fishCount; i++) {
          speciesToCreate.push(species as FishSpecies);
        }
      }

      while (speciesToCreate.length < count) {
        const randomSpecies =
          allSpecies[Math.floor(Math.random() * allSpecies.length)];
        speciesToCreate.push(randomSpecies);
      }

      while (speciesToCreate.length > count) {
        speciesToCreate.pop();
      }

      for (let i = speciesToCreate.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [speciesToCreate[i], speciesToCreate[j]] = [
          speciesToCreate[j],
          speciesToCreate[i],
        ];
      }
    } else {
      speciesToCreate = [];
      for (let i = 0; i < count; i++) {
        const randomSpecies =
          allSpecies[Math.floor(Math.random() * allSpecies.length)];
        speciesToCreate.push(randomSpecies);
      }
    }

    const gridCols = Math.ceil(Math.sqrt(count));
    const gridRows = Math.ceil(count / gridCols);

    const cellWidth = (bounds.width - 100) / gridCols;
    const cellHeight = (bounds.height - 100) / gridRows;

    for (let i = 0; i < count; i++) {
      const gridX = i % gridCols;
      const gridY = Math.floor(i / gridCols);

      const basePosX = 50 + gridX * cellWidth + cellWidth / 2;
      const basePosY = 50 + gridY * cellHeight + cellHeight / 2;

      const offsetX = (Math.random() - 0.5) * cellWidth * 0.6;
      const offsetY = (Math.random() - 0.5) * cellHeight * 0.6;

      const position: Vector2D = {
        x: basePosX + offsetX,
        y: basePosY + offsetY,
      };

      fish.push(this.create(speciesToCreate[i], position, bounds));
    }

    return fish;
  }
}
