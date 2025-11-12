# Error Reporting Service

A self-contained module for crash reporting and error tracking using Sentry in React Native/Expo applications.

## Purpose

Capture and report errors, crashes, and diagnostic information to enable production debugging and monitoring.

## Installation

```bash
npm install @sentry/react-native
```

## Configuration

### 1. Initialize in App.tsx

```typescript
import { ErrorReporting } from './src/services/ErrorReporting';

ErrorReporting.initialize('YOUR_SENTRY_DSN_HERE');
```

### 2. Configure app.json

Add Sentry plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@sentry/react-native/expo",
        {
          "organization": "YOUR_SENTRY_ORG",
          "project": "YOUR_SENTRY_PROJECT"
        }
      ]
    ]
  }
}
```

### 3. Set Environment Variables

Create a `.env` file (or configure in your build system):

```
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-organization
SENTRY_PROJECT=your-project
```

## Public Interface

### `ErrorReporting.initialize(dsn?: string): void`

Initialize Sentry with your DSN. Call this once at app startup.

```typescript
import { ErrorReporting } from './src/services/ErrorReporting';

ErrorReporting.initialize('https://your-dsn@sentry.io/project-id');
```

### `ErrorReporting.logError(error: Error, context?: ErrorContext): void`

Log an error with optional context for debugging.

```typescript
try {
  await loadGameData();
} catch (error) {
  ErrorReporting.logError(error as Error, {
    screen: 'GameScreen',
    action: 'loadData',
    profileId: currentProfile.id,
  });
}
```

### `ErrorReporting.setUser(profileId: string, additionalData?: Record<string, any>): void`

Associate errors with a specific user profile.

```typescript
ErrorReporting.setUser(profile.id, {
  username: profile.name,
  level: profile.level,
});
```

### `ErrorReporting.clearUser(): void`

Clear the current user (e.g., on logout).

```typescript
ErrorReporting.clearUser();
```

### `ErrorReporting.addBreadcrumb(message: string, data?: Record<string, any>): void`

Add a breadcrumb for debugging the sequence of events leading to an error.

```typescript
ErrorReporting.addBreadcrumb('User started game', {
  difficulty: 'hard',
  fishCount: 30,
});
```

### `ErrorReporting.captureMessage(message: string, level?: 'info' | 'warning' | 'error' | 'debug'): void`

Log a message without an error.

```typescript
ErrorReporting.captureMessage('User completed level 10', 'info');
```

### `ErrorReporting.setTag(key: string, value: string): void`

Add tags for filtering and grouping errors.

```typescript
ErrorReporting.setTag('game_mode', 'challenge');
```

### `ErrorReporting.setContext(name: string, context: Record<string, any>): void`

Add structured context data.

```typescript
ErrorReporting.setContext('game_state', {
  score: 1500,
  level: 10,
  lives: 3,
});
```

### `ErrorReporting.wrap<T>(component: React.ComponentType<T>): React.ComponentType<T>`

Wrap a component to catch and report errors.

```typescript
export default ErrorReporting.wrap(App);
```

## Usage Examples

### Basic Error Logging

```typescript
import { ErrorReporting } from './services/ErrorReporting';

async function loadProfile(profileId: string) {
  try {
    const data = await AsyncStorage.getItem(profileId);
    return JSON.parse(data);
  } catch (error) {
    ErrorReporting.logError(error as Error, {
      profileId,
      action: 'loadProfile',
    });
    throw error;
  }
}
```

### User Session Tracking

```typescript
function LoginScreen() {
  const handleLogin = async (profileId: string) => {
    ErrorReporting.setUser(profileId, {
      loginTime: new Date().toISOString(),
    });
    ErrorReporting.addBreadcrumb('User logged in');
  };

  return (
    // ... UI
  );
}
```

### Game State Context

```typescript
function GameScreen() {
  useEffect(() => {
    ErrorReporting.setContext('game_state', {
      mode: 'challenge',
      difficulty: 'hard',
      fishCount: 30,
    });
  }, []);

  const handleGameAction = (action: string) => {
    ErrorReporting.addBreadcrumb(`User action: ${action}`);
    // ... perform action
  };
}
```

### Performance Monitoring

```typescript
import { ErrorReporting } from './services/ErrorReporting';

async function loadHeavyResource() {
  const transaction = ErrorReporting.startTransaction(
    'Load Heavy Resource',
    'resource.load'
  );

  try {
    await fetchLargeData();
    transaction?.setStatus('ok');
  } catch (error) {
    transaction?.setStatus('internal_error');
    ErrorReporting.logError(error as Error);
  } finally {
    transaction?.finish();
  }
}
```

### Error Boundary Integration

```typescript
import React from 'react';
import { ErrorReporting } from './services/ErrorReporting';

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    ErrorReporting.logError(error, {
      componentStack: errorInfo.componentStack,
      boundary: 'GameErrorBoundary',
    });
  }

  render() {
    return this.props.children;
  }
}
```

## Data Structures

### ErrorContext

```typescript
interface ErrorContext {
  profileId?: string;
  gameState?: any;
  screen?: string;
  action?: string;
  [key: string]: any;
}
```

## Environment Configuration

The module automatically adapts to development vs. production:

- **Development**: Verbose logging, debug enabled, console output
- **Production**: Minimal logging, optimized error reporting

## Privacy & Security

- Never log sensitive data (passwords, tokens, personal info)
- Use `setUser()` with anonymized IDs if needed
- Configure Sentry data scrubbing rules for your project

## Troubleshooting

### Errors Not Appearing in Sentry

1. Verify DSN is correctly configured
2. Check network connectivity
3. Ensure Sentry plugin is installed: `npx expo install @sentry/react-native`
4. Check console for initialization warnings

### Source Maps Not Working

1. Ensure you've configured the postPublish hook in `app.json`
2. Run `expo publish` or build with sourcemaps enabled
3. Verify organization and project names match Sentry settings

### Too Many Events

Adjust sample rates in initialization:

```typescript
ErrorReporting.initialize('YOUR_DSN', {
  tracesSampleRate: 0.5, // 50% of transactions
});
```

## Performance Characteristics

- Initialization: <100ms
- Error capture: <10ms (async, non-blocking)
- Breadcrumb storage: In-memory, max 100 entries
- Network: Batched uploads, retry on failure

## Dependencies

- `@sentry/react-native`: ^7.6.0
- `expo-constants`: For app version info (included with Expo)

## Testing

During development, errors are logged to console and sent to Sentry. Check console output to verify Sentry events are being captured.

```typescript
// Trigger a test error
ErrorReporting.captureMessage('Test message from Fish app', 'info');

// Trigger a test error
try {
  throw new Error('Test error');
} catch (error) {
  ErrorReporting.logError(error as Error, { test: true });
}
```

## Regeneration Specification

This module can be regenerated from this documentation. Key invariants:

- All public methods maintain their signatures
- ErrorContext structure remains compatible
- Sentry initialization options preserve defaults
- Error capturing is non-blocking and async
