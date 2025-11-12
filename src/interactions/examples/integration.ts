import { TouchHandler } from '../TouchHandler';
import { Fish, Particle, Vector2D, GameState } from '../../types';

class GameLoop {
  private fish: Fish[];
  private particles: Particle[];
  private canvas: { width: number; height: number };

  constructor(canvas: { width: number; height: number }) {
    this.canvas = canvas;
    this.fish = this.initializeFish();
    this.particles = [];
  }

  private initializeFish(): Fish[] {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `fish-${i}`,
      position: {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
      },
      velocity: {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
      },
      acceleration: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI * 2,
      size: 15 + Math.random() * 15,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      species: 'goldfish',
      maxSpeed: 100 + Math.random() * 50,
      maxForce: 10 + Math.random() * 5,
    }));
  }

  async onTouch(x: number, y: number): Promise<void> {
    const touchPoint: Vector2D = { x, y };

    const { hitFish, particles } = await TouchHandler.handleTouch(
      touchPoint,
      this.fish
    );

    console.log(`Touch detected: ${hitFish.length} fish hit`);

    this.fish = this.fish.map((fish) => {
      if (hitFish.includes(fish)) {
        return TouchHandler.applyTouchForce(fish, touchPoint, 300);
      }
      return fish;
    });

    this.particles.push(...particles);
  }

  async onMouseDown(event: { clientX: number; clientY: number }): Promise<void> {
    await this.onTouch(event.clientX, event.clientY);
  }

  update(deltaTime: number): void {
    this.fish = this.fish.map((fish) => {
      const velocity = {
        x: fish.velocity.x + fish.acceleration.x * deltaTime,
        y: fish.velocity.y + fish.acceleration.y * deltaTime,
      };

      const position = {
        x: fish.position.x + velocity.x * deltaTime,
        y: fish.position.y + velocity.y * deltaTime,
      };

      let newX = position.x;
      let newY = position.y;
      let newVelX = velocity.x;
      let newVelY = velocity.y;

      if (newX < 0 || newX > this.canvas.width) {
        newVelX *= -1;
        newX = Math.max(0, Math.min(this.canvas.width, newX));
      }
      if (newY < 0 || newY > this.canvas.height) {
        newVelY *= -1;
        newY = Math.max(0, Math.min(this.canvas.height, newY));
      }

      return {
        ...fish,
        position: { x: newX, y: newY },
        velocity: { x: newVelX, y: newVelY },
        acceleration: { x: 0, y: 0 },
      };
    });

    this.particles = this.particles
      .map((particle) => ({
        ...particle,
        lifetime: particle.lifetime + deltaTime,
        position: {
          x: particle.position.x + particle.velocity.x * deltaTime,
          y: particle.position.y + particle.velocity.y * deltaTime,
        },
      }))
      .filter((particle) => particle.lifetime < particle.maxLifetime);
  }

  render(): void {
    console.log('\n--- Frame ---');
    console.log(`Fish: ${this.fish.length}, Particles: ${this.particles.length}`);
    this.fish.forEach((fish) => {
      console.log(
        `  ${fish.id}: pos=(${fish.position.x.toFixed(0)}, ${fish.position.y.toFixed(0)}), vel=(${fish.velocity.x.toFixed(1)}, ${fish.velocity.y.toFixed(1)})`
      );
    });
  }

  getState(): GameState {
    return {
      fish: this.fish,
      particles: this.particles,
      mode: 'free-swim',
      score: 0,
      isPaused: false,
    };
  }
}

console.log('=== Touch Handler Integration Example ===\n');

const game = new GameLoop({ width: 800, height: 600 });

(async () => {
  console.log('Initial state:');
  game.render();

  console.log('\n\n--- Simulating touch at (400, 300) ---');
  await game.onTouch(400, 300);

  console.log('\nAfter touch (before physics update):');
  game.render();

  console.log('\n\n--- Updating physics (deltaTime = 0.016) ---');
  game.update(0.016);

  console.log('\nAfter physics update:');
  game.render();

  console.log('\n\n--- Simulating another touch at (200, 200) ---');
  await game.onTouch(200, 200);

  console.log('\nAfter second touch:');
  game.render();

  console.log('\n\n--- Running 3 more updates ---');
  for (let i = 0; i < 3; i++) {
    game.update(0.016);
    console.log(`\nFrame ${i + 2}:`);
    console.log(`  Active particles: ${game.getState().particles.length}`);
    console.log(
      `  Average fish speed: ${(
        game.getState().fish.reduce((sum, f) => {
          return sum + Math.sqrt(f.velocity.x ** 2 + f.velocity.y ** 2);
        }, 0) / game.getState().fish.length
      ).toFixed(2)}`
    );
  }

  console.log('\n=== Integration Demo Complete ===');
})();

export { GameLoop };
