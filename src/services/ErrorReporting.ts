import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ErrorContext {
  profileId?: string;
  gameState?: any;
  screen?: string;
  action?: string;
  [key: string]: any;
}

export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

export class ErrorReporting {
  private static isInitialized = false;
  private static crashReportingEnabled = false;

  static async initialize(dsn?: string): Promise<void> {
    if (this.isInitialized) {
      console.warn('ErrorReporting already initialized');
      return;
    }

    try {
      const enabled = await AsyncStorage.getItem('crashReportingEnabled');
      this.crashReportingEnabled = enabled === 'true';
    } catch (error) {
      console.warn('Failed to load crash reporting preference:', error);
      this.crashReportingEnabled = false;
    }

    const sentryDsn = dsn || 'YOUR_SENTRY_DSN_HERE';

    if (sentryDsn === 'YOUR_SENTRY_DSN_HERE') {
      console.warn('Sentry DSN not configured. Error reporting will not work in production.');
    }

    Sentry.init({
      dsn: sentryDsn,
      debug: __DEV__,
      tracesSampleRate: 1.0,
      environment: __DEV__ ? 'development' : 'production',
      release: Constants.expoConfig?.version || '1.0.0',
      dist: Constants.expoConfig?.android?.versionCode?.toString() ||
            Constants.expoConfig?.ios?.buildNumber ||
            '1',
      beforeSend(event, hint) {
        if (!ErrorReporting.crashReportingEnabled && !__DEV__) {
          return null;
        }

        if (__DEV__) {
          console.log('Sentry Event:', event);
          console.log('Sentry Hint:', hint);
        }
        return event;
      },
      beforeBreadcrumb(breadcrumb) {
        if (breadcrumb.category === 'console' && __DEV__) {
          return null;
        }
        return breadcrumb;
      },
    });

    this.isInitialized = true;
    this.addBreadcrumb('ErrorReporting initialized', { timestamp: new Date().toISOString() });
  }

  static async setCrashReportingEnabled(enabled: boolean): Promise<void> {
    this.crashReportingEnabled = enabled;
    try {
      await AsyncStorage.setItem('crashReportingEnabled', enabled.toString());
    } catch (error) {
      console.warn('Failed to save crash reporting preference:', error);
    }
  }

  static isCrashReportingEnabled(): boolean {
    return this.crashReportingEnabled;
  }

  static logError(error: Error, context?: ErrorContext): void {
    if (!this.isInitialized) {
      console.error('ErrorReporting not initialized. Error:', error);
      return;
    }

    if (context) {
      Sentry.setContext('error_context', context);
    }

    this.addBreadcrumb(`Error occurred: ${error.message}`, {
      errorName: error.name,
      ...context,
    });

    Sentry.captureException(error);

    if (__DEV__) {
      console.error('Logged error to Sentry:', error, context);
    }
  }

  static setUser(profileId: string, additionalData?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('ErrorReporting not initialized');
      return;
    }

    Sentry.setUser({
      id: profileId,
      ...additionalData,
    });

    this.addBreadcrumb(`User set: ${profileId}`);
  }

  static clearUser(): void {
    if (!this.isInitialized) {
      console.warn('ErrorReporting not initialized');
      return;
    }

    Sentry.setUser(null);
    this.addBreadcrumb('User cleared');
  }

  static addBreadcrumb(message: string, data?: Record<string, any>): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.addBreadcrumb({
      message,
      data,
      timestamp: Date.now() / 1000,
      level: 'info',
    });
  }

  static captureMessage(message: string, level: LogLevel = 'info'): void {
    if (!this.isInitialized) {
      console.log(`[${level.toUpperCase()}] ${message}`);
      return;
    }

    Sentry.captureMessage(message, level as Sentry.SeverityLevel);

    if (__DEV__) {
      console.log(`Captured message to Sentry [${level}]:`, message);
    }
  }

  static setTag(key: string, value: string): void {
    if (!this.isInitialized) {
      console.warn('ErrorReporting not initialized');
      return;
    }

    Sentry.setTag(key, value);
  }

  static setContext(name: string, context: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('ErrorReporting not initialized');
      return;
    }

    Sentry.setContext(name, context);
  }

  static wrap<P extends Record<string, unknown>>(
    component: React.ComponentType<P>
  ): React.ComponentType<P> {
    if (!this.isInitialized) {
      console.warn('ErrorReporting not initialized, returning unwrapped component');
      return component;
    }

    return Sentry.wrap(component) as React.ComponentType<P>;
  }
}
