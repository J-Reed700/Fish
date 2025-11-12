import { TouchHandler } from '../TouchHandler';
import { Fish, Particle, Vector2D } from '../../types';

const sampleFish: Fish[] = [
  {
    id: 'fish-1',
    position: { x: 150, y: 200 },
    velocity: { x: 10, y: 5 },
    acceleration: { x: 0, y: 0 },
    rotation: 0,
    size: 25,
    color: '#FF6B35',
    species: 'goldfish',
    maxSpeed: 120,
    maxForce: 15,
  },
  {
    id: 'fish-2',
    position: { x: 300, y: 150 },
    velocity: { x: -8, y: 12 },
    acceleration: { x: 0, y: 0 },
    rotation: Math.PI / 4,
    size: 20,
    color: '#4ECDC4',
    species: 'clownfish',
    maxSpeed: 100,
    maxForce: 12,
  },
  {
    id: 'fish-3',
    position: { x: 500, y: 400 },
    velocity: { x: 5, y: -3 },
    acceleration: { x: 0, y: 0 },
    rotation: Math.PI / 2,
    size: 30,
    color: '#FFE66D',
    species: 'angelfish',
    maxSpeed: 90,
    maxForce: 10,
  },
];

const touchPoint: Vector2D = { x: 160, y: 205 };

const { hitFish, particles } = await TouchHandler.handleTouch(touchPoint, sampleFish);

console.log(`Touch at (${touchPoint.x}, ${touchPoint.y})`);
console.log(`Hit ${hitFish.length} fish:`);
hitFish.forEach((fish) => {
  console.log(`  - ${fish.id} at (${fish.position.x}, ${fish.position.y})`);
});

console.log(`Generated ${particles.length} splash particles`);

const updatedFish = sampleFish.map((fish) => {
  if (hitFish.includes(fish)) {
    return TouchHandler.applyTouchForce(fish, touchPoint, 300);
  }
  return fish;
});

console.log('\nFish after applying force:');
updatedFish.forEach((fish, index) => {
  const isHit = hitFish.some((h) => h.id === fish.id);
  const accelMag = Math.sqrt(
    fish.acceleration.x ** 2 + fish.acceleration.y ** 2
  );
  console.log(
    `  ${fish.id}: acceleration = (${fish.acceleration.x.toFixed(2)}, ${fish.acceleration.y.toFixed(2)}) [magnitude: ${accelMag.toFixed(2)}]${isHit ? ' ← HIT!' : ''}`
  );
});
