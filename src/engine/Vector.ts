import { Vector2D } from '../types';

/**
 * Vector utility functions for 2D physics calculations
 */
export class Vector {
  /**
   * Add two vectors
   */
  static add(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  /**
   * Subtract vector b from vector a
   */
  static subtract(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  /**
   * Multiply vector by scalar
   */
  static multiply(v: Vector2D, scalar: number): Vector2D {
    return { x: v.x * scalar, y: v.y * scalar };
  }

  /**
   * Divide vector by scalar
   */
  static divide(v: Vector2D, scalar: number): Vector2D {
    if (scalar === 0) return { x: 0, y: 0 };
    return { x: v.x / scalar, y: v.y / scalar };
  }

  /**
   * Calculate magnitude (length) of vector
   */
  static magnitude(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  /**
   * Calculate distance between two points
   */
  static distance(a: Vector2D, b: Vector2D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Normalize vector (set magnitude to 1)
   */
  static normalize(v: Vector2D): Vector2D {
    const mag = Vector.magnitude(v);
    if (mag === 0) return { x: 0, y: 0 };
    return Vector.divide(v, mag);
  }

  /**
   * Set magnitude of vector
   */
  static setMagnitude(v: Vector2D, mag: number): Vector2D {
    const normalized = Vector.normalize(v);
    return Vector.multiply(normalized, mag);
  }

  /**
   * Limit magnitude of vector
   */
  static limit(v: Vector2D, max: number): Vector2D {
    const mag = Vector.magnitude(v);
    if (mag > max) {
      return Vector.setMagnitude(v, max);
    }
    return v;
  }

  /**
   * Calculate angle of vector in radians
   */
  static angle(v: Vector2D): number {
    return Math.atan2(v.y, v.x);
  }

  /**
   * Create vector from angle and magnitude
   */
  static fromAngle(angle: number, magnitude: number = 1): Vector2D {
    return {
      x: Math.cos(angle) * magnitude,
      y: Math.sin(angle) * magnitude,
    };
  }

  /**
   * Create a random unit vector
   */
  static random(): Vector2D {
    const angle = Math.random() * Math.PI * 2;
    return Vector.fromAngle(angle);
  }

  /**
   * Dot product of two vectors
   */
  static dot(a: Vector2D, b: Vector2D): number {
    return a.x * b.x + a.y * b.y;
  }
}
