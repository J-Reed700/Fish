import type { Butterfly, Vector2D } from '../types';

export class ButterflyBehavior {
  static readonly BASE_SPEED = 50;
  static readonly FLEE_SPEED_MULTIPLIER = 2.5;
  static readonly FLEE_DISTANCE = 150;
  static readonly HOVER_PROBABILITY = 0.003;
  static readonly HOVER_DURATION = 60;
  static readonly WING_FLAP_BASE_SPEED = 0.15;
  static readonly NOISE_SCALE = 40;
  static readonly BOUNDARY_MARGIN = 50;
  static readonly TURN_SPEED = 0.05;

  static update(
    butterfly: Butterfly,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    touchPosition: Vector2D | null,
    time: number
  ): Butterfly {
    const updated = { ...butterfly };

    updated.stateTimer -= 1;

    if (touchPosition && updated.state !== 'fleeing') {
      const dist = this.distance(updated.position, touchPosition);
      if (dist < this.FLEE_DISTANCE) {
        updated.state = 'fleeing';
        updated.stateTimer = 120;
      }
    }

    if (updated.state === 'fleeing' && updated.stateTimer <= 0) {
      updated.state = 'floating';
    }

    if (updated.state === 'floating' && Math.random() < this.HOVER_PROBABILITY) {
      updated.state = 'hovering';
      updated.stateTimer = this.HOVER_DURATION;
    }

    if (updated.state === 'hovering' && updated.stateTimer <= 0) {
      updated.state = 'floating';
    }

    switch (updated.state) {
      case 'floating':
        updated.velocity = this.calculateFloatingVelocity(
          time,
          updated.floatFrequency,
          updated.floatAmplitude,
          updated.noiseOffset
        );
        break;
      case 'hovering':
        updated.velocity = { x: 0, y: 0 };
        break;
      case 'fleeing':
        if (touchPosition) {
          updated.velocity = this.calculateFleeVelocity(updated.position, touchPosition);
        }
        break;
    }

    updated.position = {
      x: updated.position.x + updated.velocity.x * deltaTime,
      y: updated.position.y + updated.velocity.y * deltaTime,
    };

    this.handleBoundaries(updated, screenWidth, screenHeight);

    const speed = Math.sqrt(updated.velocity.x ** 2 + updated.velocity.y ** 2);
    if (speed > 0.1) {
      const targetRotation = Math.atan2(updated.velocity.y, updated.velocity.x);
      updated.rotation = this.lerpAngle(updated.rotation, targetRotation, this.TURN_SPEED);
    }

    const wingSpeedMultiplier = updated.state === 'fleeing' ? 2 : updated.state === 'hovering' ? 0.5 : 1;
    updated.wingPhase += this.WING_FLAP_BASE_SPEED * wingSpeedMultiplier * deltaTime * 60;

    updated.lifetime += deltaTime;

    return updated;
  }

  static calculateFloatingVelocity(
    time: number,
    floatFrequency: number,
    floatAmplitude: number,
    noiseOffset: Vector2D
  ): Vector2D {
    const baseVelX = this.BASE_SPEED * Math.cos(time * floatFrequency);
    const baseVelY = this.BASE_SPEED * Math.sin(time * floatFrequency * 2);

    const noise = this.perlinNoise2D(time * 0.3 + noiseOffset.x, noiseOffset.y);
    const perturbX = noise * this.NOISE_SCALE - this.NOISE_SCALE / 2;
    const perturbY = noise * this.NOISE_SCALE - this.NOISE_SCALE / 2;

    return {
      x: baseVelX + perturbX,
      y: baseVelY + perturbY,
    };
  }

  static applyNoisePerturbation(velocity: Vector2D, time: number, noiseOffset: Vector2D): Vector2D {
    const noise = this.perlinNoise2D(time * 0.3 + noiseOffset.x, noiseOffset.y);
    const perturbX = noise * this.NOISE_SCALE - this.NOISE_SCALE / 2;
    const perturbY = noise * this.NOISE_SCALE - this.NOISE_SCALE / 2;

    return {
      x: velocity.x + perturbX,
      y: velocity.y + perturbY,
    };
  }

  static calculateFleeVelocity(position: Vector2D, touchPosition: Vector2D): Vector2D {
    const dx = position.x - touchPosition.x;
    const dy = position.y - touchPosition.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.1) {
      return { x: 0, y: 0 };
    }

    const normalizedX = dx / dist;
    const normalizedY = dy / dist;

    return {
      x: normalizedX * this.BASE_SPEED * this.FLEE_SPEED_MULTIPLIER,
      y: normalizedY * this.BASE_SPEED * this.FLEE_SPEED_MULTIPLIER,
    };
  }

  static handleBoundaries(butterfly: Butterfly, screenWidth: number, screenHeight: number): void {
    const margin = this.BOUNDARY_MARGIN;

    if (butterfly.position.x < margin) {
      butterfly.position.x = margin;
      butterfly.velocity.x = Math.abs(butterfly.velocity.x);
    } else if (butterfly.position.x > screenWidth - margin) {
      butterfly.position.x = screenWidth - margin;
      butterfly.velocity.x = -Math.abs(butterfly.velocity.x);
    }

    if (butterfly.position.y < margin) {
      butterfly.position.y = margin;
      butterfly.velocity.y = Math.abs(butterfly.velocity.y);
    } else if (butterfly.position.y > screenHeight - margin) {
      butterfly.position.y = screenHeight - margin;
      butterfly.velocity.y = -Math.abs(butterfly.velocity.y);
    }
  }

  static perlinNoise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const p = this.permutation;

    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];

    const x1 = this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u);
    const x2 = this.lerp(this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1), u);

    return (this.lerp(x1, x2, v) + 1) / 2;
  }

  private static fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private static lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private static lerpAngle(a: number, b: number, t: number): number {
    let diff = b - a;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return a + diff * t;
  }

  private static grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  private static distance(a: Vector2D, b: Vector2D): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private static readonly permutation = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69,
    142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219,
    203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
    74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230,
    220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76,
    132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173,
    186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
    59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163,
    70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
    178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162,
    241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204,
    176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141,
    128, 195, 78, 66, 215, 61, 156, 180, 151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194,
    233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
    75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174,
    20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83,
    111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25,
    63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188,
    159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147,
    118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170,
    213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253,
    19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193,
    238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
    181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
    222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
  ];
}
