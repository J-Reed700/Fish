import { TouchHandler } from '../TouchHandler';
import { Fish, Particle, Vector2D } from '../../types';

function createFish(id: string, x: number, y: number): Fish {
  return {
    id,
    position: { x, y },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    rotation: 0,
    size: 20,
    color: '#FF6B35',
    species: 'goldfish',
    maxSpeed: 100,
    maxForce: 10,
  };
}

let fishArray: Fish[] = [
  createFish('fish-1', 100, 100),
  createFish('fish-2', 200, 200),
  createFish('fish-3', 300, 150),
  createFish('fish-4', 150, 250),
];

let particleArray: Particle[] = [];

async function simulateTouch(x: number, y: number, force: number = 300): Promise<void> {
  const touchPoint: Vector2D = { x, y };

  const { hitFish, particles } = await TouchHandler.handleTouch(touchPoint, fishArray);

  console.log(`\n=== Touch at (${x}, ${y}) ===`);
  console.log(`Hit ${hitFish.length} fish: ${hitFish.map((f) => f.id).join(', ')}`);

  fishArray = fishArray.map((fish) => {
    if (hitFish.includes(fish)) {
      return TouchHandler.applyTouchForce(fish, touchPoint, force);
    }
    return fish;
  });

  particleArray.push(...particles);
  console.log(`Added ${particles.length} particles (total: ${particleArray.length})`);
}

async function simulateMultipleTouches(): Promise<void> {
  console.log('=== Simulating Multiple Touches ===\n');

  console.log('Initial fish positions:');
  fishArray.forEach((f) =>
    console.log(`  ${f.id}: (${f.position.x}, ${f.position.y})`)
  );

  await simulateTouch(100, 100, 400);
  await simulateTouch(200, 200, 300);
  await simulateTouch(150, 150, 500);

  console.log('\nFinal fish accelerations:');
  fishArray.forEach((f) => {
    const mag = Math.sqrt(f.acceleration.x ** 2 + f.acceleration.y ** 2);
    console.log(
      `  ${f.id}: (${f.acceleration.x.toFixed(2)}, ${f.acceleration.y.toFixed(2)}) [mag: ${mag.toFixed(2)}]`
    );
  });

  console.log(`\nTotal particles generated: ${particleArray.length}`);
}

async function demonstrateCustomRadius(): Promise<void> {
  console.log('\n\n=== Custom Hit Radius Demo ===\n');

  const testFish = [createFish('test-fish', 100, 100)];
  const touchPoint: Vector2D = { x: 130, y: 100 };

  const defaultResult = await TouchHandler.handleTouch(touchPoint, testFish);
  console.log(
    `Touch at (130, 100) with default radius (20): ${defaultResult.hitFish.length} hits`
  );

  const largeRadiusResult = await TouchHandler.handleTouch(touchPoint, testFish, 50);
  console.log(
    `Touch at (130, 100) with custom radius (50): ${largeRadiusResult.hitFish.length} hits`
  );

  const smallRadiusResult = await TouchHandler.handleTouch(touchPoint, testFish, 10);
  console.log(
    `Touch at (130, 100) with custom radius (10): ${smallRadiusResult.hitFish.length} hits`
  );
}

function demonstrateImmutability(): void {
  console.log('\n\n=== Immutability Demo ===\n');

  const originalFish = createFish('immutable-test', 200, 200);
  const touchPoint: Vector2D = { x: 180, y: 180 };

  console.log('Original fish acceleration:', originalFish.acceleration);

  const modifiedFish = TouchHandler.applyTouchForce(originalFish, touchPoint, 500);

  console.log('After applyTouchForce:');
  console.log('  Original fish acceleration:', originalFish.acceleration);
  console.log('  Modified fish acceleration:', modifiedFish.acceleration);
  console.log(
    `  Objects are different: ${originalFish !== modifiedFish}`
  );
  console.log(
    `  Original unchanged: ${originalFish.acceleration.x === 0 && originalFish.acceleration.y === 0}`
  );
}

function demonstrateForceScaling(): void {
  console.log('\n\n=== Force Scaling Demo ===\n');

  const fish = createFish('force-test', 100, 100);
  const touchPoint: Vector2D = { x: 90, y: 90 };

  const forces = [100, 300, 500, 1000];

  console.log('Applying different force magnitudes:');
  forces.forEach((force) => {
    const result = TouchHandler.applyTouchForce(fish, touchPoint, force);
    const magnitude = Math.sqrt(
      result.acceleration.x ** 2 + result.acceleration.y ** 2
    );
    console.log(
      `  Force ${force.toString().padStart(4)}: acceleration magnitude = ${magnitude.toFixed(2)}`
    );
  });
}

(async () => {
  await simulateMultipleTouches();
  await demonstrateCustomRadius();
  demonstrateImmutability();
  demonstrateForceScaling();

  console.log('\n=== Demo Complete ===');
})();
