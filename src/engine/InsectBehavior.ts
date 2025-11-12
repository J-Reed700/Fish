import { Insect } from '../entities/Insect';

export class InsectBehavior {
  static update(
    insects: Insect[],
    deltaTime: number,
    bounds: { width: number; height: number }
  ): Insect[] {
    return insects
      .map((insect) => {
        const newLifetime = insect.lifetime + deltaTime;
        if (newLifetime > insect.maxLifetime) return null;

        let position = insect.position;
        let velocity = insect.velocity;

        if (insect.subType === 'butterfly') {
          const time = newLifetime + insect.phaseOffset;
          const amplitude = 50;
          const frequency = 2;

          position = {
            x: insect.position.x + velocity.x * deltaTime,
            y: insect.position.y + Math.sin(time * frequency) * amplitude * deltaTime,
          };

          if (position.x < 0 || position.x > bounds.width) {
            velocity.x *= -1;
          }

          if (position.y > bounds.height * 0.6) {
            position.y = bounds.height * 0.6;
          }
          if (position.y < 0) {
            position.y = 0;
          }
        } else {
          if (Math.random() < 0.1) {
            velocity = {
              x: (Math.random() < 0.5 ? -1 : 1) * (100 + Math.random() * 50),
              y: (Math.random() - 0.5) * 100,
            };
          }

          position = {
            x: insect.position.x + velocity.x * deltaTime,
            y: insect.position.y + velocity.y * deltaTime,
          };

          if (position.x < 0 || position.x > bounds.width) {
            velocity.x *= -1;
            position.x = Math.max(0, Math.min(bounds.width, position.x));
          }
          if (position.y < 0 || position.y > bounds.height) {
            velocity.y *= -1;
            position.y = Math.max(0, Math.min(bounds.height, position.y));
          }
        }

        const rotation = Math.atan2(velocity.y, velocity.x);

        return {
          ...insect,
          position,
          velocity,
          rotation,
          lifetime: newLifetime,
        };
      })
      .filter(Boolean) as Insect[];
  }
}
