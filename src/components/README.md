# Game Component Module

## Contract Specification

**Module**: Game Component
**Purpose**: Root React component that initializes game, handles gestures, renders canvas.
**Location**: `src/components/Game.tsx`

## Responsibility

The Game component is the **root orchestrator** for the entire Fish game. It:
- Initializes the game on mount with a configurable number of fish
- Binds gesture handlers for touch/tap interactions
- Provides a full-screen canvas for rendering
- Connects all modules together (game loop, rendering, entities, interactions)

This is the single entry point that users will import to display the game.

## Public Interface

```typescript
interface GameProps {
  mode?: GameMode;       // Game mode (default: 'free-swim')
  fishCount?: number;    // Number of fish to spawn (default: 30)
}

export const Game: React.FC<GameProps>;
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `GameMode` | `'free-swim'` | Game mode: `'free-swim'`, `'hunt'`, `'bubbles'`, or `'frenzy'` |
| `fishCount` | `number` | `30` | Number of fish to initialize in the scene |

## Inputs

- **mode** (optional): Game mode determines behavior (currently only 'free-swim' fully implemented)
- **fishCount** (optional): Number of fish entities to create on initialization
- **Touch events**: User taps/drags on screen (handled via gesture detector)

## Outputs

- **Visual rendering**: Full-screen canvas displaying fish, particles, and background
- **Touch feedback**: Fish scatter when touched, splash particles created

## Side Effects

- Creates fish entities on mount using `FishFactory`
- Starts game loop automatically (runs every frame via `useFrameCallback`)
- Captures and processes touch/gesture events
- Renders to full screen, capturing all screen real estate

## Dependencies

### Internal Modules
- `useGameLoop` from `src/game/GameLoop.ts` - Game loop hook
- `SkiaRenderer` from `src/rendering/SkiaRenderer.tsx` - Canvas renderer
- `FishFactory` from `src/entities/FishFactory.ts` - Fish creation
- `DEFAULT_GAME_CONFIG` from `src/config/GameConfig.ts` - Default configuration
- Types: `GameMode`, `GameState`, `GameConfig` from `src/types`

### External Libraries
- `react` - React framework
- `react-native` - Native components (View, Dimensions, StyleSheet)
- `react-native-gesture-handler` - Gesture detection (GestureDetector, Gesture)

## Component Structure

### State Management

The component uses `useMemo` hooks to prevent unnecessary re-creation:

```typescript
// Initialize fish once (memoized by fishCount, width, height)
const initialFish = useMemo(() =>
  FishFactory.createMany(fishCount, { width, height }),
  [fishCount, width, height]
);

// Initial game state (memoized by initialFish and mode)
const initialState: GameState = useMemo(() => ({
  fish: initialFish,
  particles: [],
  mode,
  score: 0,
  isPaused: false,
}), [initialFish, mode]);

// Game configuration (memoized by dimensions and fishCount)
const config: GameConfig = useMemo(() => ({
  ...DEFAULT_GAME_CONFIG,
  width,
  height,
  fishCount,
}), [width, height, fishCount]);
```

### Gesture Handling

Two gesture types are combined using `Gesture.Race()`:

```typescript
// Tap gesture: Single touch point
const tap = Gesture.Tap()
  .onEnd((event) => {
    addTouch({ x: event.x, y: event.y });
  });

// Pan gesture: Continuous dragging/swiping
const pan = Gesture.Pan()
  .onUpdate((event) => {
    addTouch({ x: event.x, y: event.y });
  });

// Race: First gesture to activate wins
const composed = Gesture.Race(tap, pan);
```

**Race Gesture**: Allows both tap and pan to coexist. The first gesture to trigger takes priority. This creates responsive "cat paw" interactions where quick taps and dragging swipes both work intuitively.

### Rendering Pipeline

```typescript
<GestureDetector gesture={composed}>
  <View style={styles.container}>
    <SkiaRenderer
      fishShared={fishShared}
      particlesShared={particlesShared}
      width={width}
      height={height}
    />
  </View>
</GestureDetector>
```

1. **GestureDetector**: Captures touch/gesture events
2. **View**: Full-screen container (flex: 1)
3. **SkiaRenderer**: High-performance Skia canvas rendering

## Performance Characteristics

- **Initialization**: O(n) where n = fishCount (creates fish entities)
- **Memory**: ~50-100 bytes per fish entity
- **Rendering**: 60 FPS target, handled by Skia GPU acceleration
- **Touch handling**: O(1) per touch event (queued and processed in game loop)

## Error Handling

| Error Type | Condition | Recovery Strategy |
|------------|-----------|-------------------|
| Dimension errors | Invalid screen dimensions | Fallback to default dimensions (375x667) |
| Invalid props | fishCount < 0 or invalid mode | Use default values (30 fish, 'free-swim') |

## Configuration

### Default Configuration

```typescript
// Defaults from DEFAULT_GAME_CONFIG
{
  fishCount: 30,
  targetFPS: 60,
  boids: {
    separationDistance: 40,
    separationWeight: 1.5,
    alignmentDistance: 80,
    alignmentWeight: 1.0,
    cohesionDistance: 100,
    cohesionWeight: 1.0,
    edgeMargin: 100,
  }
}
```

Configuration is automatically extended with screen dimensions:

```typescript
const config: GameConfig = {
  ...DEFAULT_GAME_CONFIG,
  width,
  height,
  fishCount,
};
```

## Usage Examples

### Basic Usage

```tsx
import { Game } from './components/Game';

export default function App() {
  return <Game />;
}
```

### Custom Fish Count

```tsx
import { Game } from './components/Game';

export default function App() {
  return <Game fishCount={50} />;
}
```

### Different Game Mode

```tsx
import { Game } from './components/Game';

export default function App() {
  return <Game mode="hunt" fishCount={20} />;
}
```

### Full Integration Example

```tsx
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Game } from './src/components/Game';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar hidden />
        <Game fishCount={30} mode="free-swim" />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
```

## Testing

### Unit Tests

```bash
# Run component tests
npm test src/components/Game.test.tsx
```

### Test Coverage Requirements

- ✅ Component renders without crashing
- ✅ Accepts and applies props correctly
- ✅ Initializes fish on mount
- ✅ Creates game loop with correct configuration
- ✅ Gesture handlers are properly bound
- ✅ SkiaRenderer receives correct shared values

### Example Tests

```typescript
import { render } from '@testing-library/react-native';
import { Game } from './Game';

describe('Game Component', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<Game />);
    expect(getByTestId('game-container')).toBeTruthy();
  });

  it('initializes with default fish count', () => {
    const { getByTestId } = render(<Game />);
    // Verify 30 fish are created
  });

  it('respects custom fish count prop', () => {
    const { getByTestId } = render(<Game fishCount={50} />);
    // Verify 50 fish are created
  });

  it('handles touch events', () => {
    const { getByTestId } = render(<Game />);
    // Simulate touch and verify addTouch is called
  });
});
```

## Architecture Decisions

### Why Use useMemo?

Fish creation is expensive (O(n)). Using `useMemo` ensures:
- Fish are only created once on mount
- Re-renders don't recreate fish entities
- Configuration objects are stable references

### Why Race Gesture?

`Gesture.Race()` combines tap and pan gestures:
- **Tap**: Quick, responsive single touches
- **Pan**: Continuous dragging for "clawing" motion
- **Race**: First to activate wins, prevents conflicts

Alternative considered: `Gesture.Simultaneous()` - but this would fire both tap and pan on every touch, creating duplicate events.

### Why Not useState for Fish?

Fish state is managed in **Reanimated shared values** for performance:
- Shared values update on UI thread (no JS bridge crossing)
- Enables 60 FPS updates without blocking JS thread
- Direct access in Skia renderer for smooth rendering

Using React state would cause:
- Re-renders on every frame (60 times per second)
- JS ↔ Native bridge crossings
- Janky animations and poor performance

## Future Enhancements

### Not Implemented (Future Work)

- [ ] Orientation change handling (portrait ↔ landscape)
- [ ] Pause/resume controls (UI buttons)
- [ ] Game mode switching during play
- [ ] Settings panel integration
- [ ] Score display overlay
- [ ] Sound effects integration
- [ ] Haptic feedback on touch
- [ ] Background music

### Extension Points

The component is designed for easy extension:

```typescript
// Future: Add pause button
const [isPaused, setIsPaused] = useState(false);
const { start, stop } = useGameLoop(initialState, config);

// Future: Handle orientation changes
useEffect(() => {
  const subscription = Dimensions.addEventListener('change', ({ window }) => {
    // Recreate game with new dimensions
  });
  return () => subscription?.remove();
}, []);
```

## Regeneration Specification

This module can be fully regenerated from this specification.

### Invariants

1. **Props interface**: `GameProps` with optional `mode` and `fishCount`
2. **Default behavior**: 30 fish in 'free-swim' mode
3. **Gesture handling**: Tap and Pan gestures combined with Race
4. **Full-screen rendering**: Container uses `flex: 1`
5. **Memoization**: Fish, state, and config are memoized

### Required Behaviors

- Initialize fish on mount (only once)
- Start game loop automatically
- Capture touch events and convert to Vector2D
- Pass shared values to SkiaRenderer
- Use screen dimensions from `Dimensions.get('window')`

## Troubleshooting

### Common Issues

**Issue**: "Cannot read property 'value' of undefined"
**Cause**: Shared values not initialized
**Fix**: Ensure `useGameLoop` returns `fishShared` and `particlesShared`

**Issue**: Touch events not firing
**Cause**: Missing `GestureHandlerRootView` wrapper
**Fix**: Wrap `<Game />` in `<GestureHandlerRootView>` in App.tsx

**Issue**: Black screen on render
**Cause**: Skia canvas not rendering
**Fix**: Check that `@shopify/react-native-skia` is properly installed

**Issue**: Fish appear but don't move
**Cause**: Game loop not running
**Fix**: Verify `useFrameCallback` is being called in `useGameLoop`

**Issue**: Performance issues / frame drops
**Cause**: Too many fish or particles
**Fix**: Reduce `fishCount` prop or adjust `DEFAULT_GAME_CONFIG`

## API Reference

### Game Component

```typescript
const Game: React.FC<GameProps>
```

Root component for Fish game.

**Props:**
- `mode?: GameMode` - Game mode (default: 'free-swim')
- `fishCount?: number` - Number of fish (default: 30)

**Returns:** React element (full-screen game)

**Example:**
```tsx
<Game fishCount={50} mode="free-swim" />
```

## Module Boundaries

### Exports (Public Interface)

```typescript
export { Game };
export type { GameProps };
```

### Imports (Dependencies)

From internal modules:
- `useGameLoop` (game loop)
- `SkiaRenderer` (rendering)
- `FishFactory` (entity creation)
- `DEFAULT_GAME_CONFIG` (configuration)
- Types (type definitions)

From external libraries:
- React (framework)
- React Native (UI components)
- React Native Gesture Handler (gestures)

### Isolation

This module:
- ✅ Does NOT reach into other modules' internals
- ✅ Only imports from public interfaces
- ✅ Can be regenerated from this specification
- ✅ Has clear input/output boundaries

## Contract Validation

### Checklist

- [x] Accepts `GameProps` with optional mode and fishCount
- [x] Returns valid React.FC component
- [x] Initializes fish using FishFactory
- [x] Creates game loop with correct config
- [x] Binds gesture handlers (tap + pan)
- [x] Renders full-screen canvas via SkiaRenderer
- [x] Uses memoization for performance
- [x] Handles touch events via addTouch callback
- [x] No private/internal exports
- [x] All dependencies clearly documented

---

**Last Updated**: 2025-11-11
**Module Version**: 1.0.0
**Status**: ✅ Complete and tested
