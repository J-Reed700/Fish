# TouchHandler Examples

This directory contains usage examples for the TouchHandler module.

## Files

### basic_usage.ts

Demonstrates the fundamental usage pattern:
- Detecting touches on fish
- Generating splash particles
- Applying forces to hit fish

**Run:**
```bash
ts-node src/interactions/examples/basic_usage.ts
```

**Key concepts:**
- Using `handleTouch()` to detect collisions
- Using `applyTouchForce()` to push fish away
- Immutable updates with array mapping

---

### advanced_usage.ts

Shows more complex scenarios:
- Multiple sequential touches
- Custom hit detection radius
- Immutability guarantees
- Force scaling effects

**Run:**
```bash
ts-node src/interactions/examples/advanced_usage.ts
```

**Key concepts:**
- Accumulating particles across multiple touches
- Override default fish radius for hit detection
- Demonstrating pure function behavior
- Varying force magnitudes

---

### integration.ts

Full game loop integration example:
- Complete GameLoop class
- Mouse/touch event handling
- Physics updates
- Particle lifecycle management

**Run:**
```bash
ts-node src/interactions/examples/integration.ts
```

**Key concepts:**
- Integrating TouchHandler into game architecture
- Separating touch detection from physics simulation
- Managing particle arrays
- Frame-by-frame updates

---

## Usage Patterns

### Pattern 1: Single Touch

```typescript
const { hitFish, particles } = TouchHandler.handleTouch(touchPoint, allFish);

const updatedFish = allFish.map(f =>
  hitFish.includes(f)
    ? TouchHandler.applyTouchForce(f, touchPoint, 300)
    : f
);

allParticles.push(...particles);
```

### Pattern 2: Custom Hit Radius

```typescript
const { hitFish, particles } = TouchHandler.handleTouch(
  touchPoint,
  allFish,
  50  // Custom radius overrides fish.size
);
```

### Pattern 3: Variable Force

```typescript
const baseForce = 300;
const forceMultiplier = clickIntensity; // 0.5 - 2.0

const updatedFish = allFish.map(f =>
  hitFish.includes(f)
    ? TouchHandler.applyTouchForce(f, touchPoint, baseForce * forceMultiplier)
    : f
);
```

### Pattern 4: Touch History

```typescript
const recentTouches: Vector2D[] = [];

function onTouch(point: Vector2D) {
  recentTouches.push(point);

  // Check all recent touches
  recentTouches.forEach(touch => {
    const { hitFish, particles } = TouchHandler.handleTouch(touch, allFish);
    // Apply forces...
  });

  // Cleanup old touches
  if (recentTouches.length > 10) {
    recentTouches.shift();
  }
}
```

## Testing Examples

All examples can be tested with:

```bash
npm test src/interactions/examples/
```

Or run individually with ts-node as shown above.
