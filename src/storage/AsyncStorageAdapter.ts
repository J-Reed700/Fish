import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionRecord } from '../types';
import { ErrorReporting } from '../services/ErrorReporting';

const STORAGE_KEYS = {
  sessions: (profileId: string) => `sessions:${profileId}`,
  aggregates: (profileId: string) => `aggregates:${profileId}`,
  backup: (key: string) => `${key}:backup`,
};

const MAX_KEY_SIZE = 5 * 1024 * 1024;
const WARNING_THRESHOLD = 0.8;

export interface VersionedData<T> {
  version: number;
  data: T;
  timestamp: number;
}

export class ConflictError extends Error {
  constructor(message: string, public expectedVersion?: number, public actualVersion?: number) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class StorageLimitError extends Error {
  constructor(message: string, public keySize?: number, public limit?: number) {
    super(message);
    this.name = 'StorageLimitError';
  }
}

export class AsyncStorageAdapter {
  private static locks: Map<string, Promise<void>> = new Map();

  private static async acquireLock(key: string): Promise<() => void> {
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }

    let releaseLock: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    this.locks.set(key, lockPromise);

    return () => {
      this.locks.delete(key);
      releaseLock!();
    };
  }

  static async saveWithLock<T>(
    key: string,
    data: T,
    expectedVersion?: number
  ): Promise<number> {
    const release = await this.acquireLock(key);

    try {
      const currentVersioned = await this.getVersioned<T>(key);
      const currentVersion = currentVersioned?.version ?? 0;

      if (expectedVersion !== undefined && expectedVersion !== currentVersion) {
        throw new ConflictError(
          `Version conflict for key ${key}`,
          expectedVersion,
          currentVersion
        );
      }

      const newVersion = currentVersion + 1;
      const versionedData: VersionedData<T> = {
        version: newVersion,
        data,
        timestamp: Date.now(),
      };

      const stringValue = JSON.stringify(versionedData);
      const size = new Blob([stringValue]).size;

      if (size > MAX_KEY_SIZE) {
        throw new StorageLimitError(
          `Data size ${size} exceeds limit ${MAX_KEY_SIZE}`,
          size,
          MAX_KEY_SIZE
        );
      }

      if (size > MAX_KEY_SIZE * WARNING_THRESHOLD) {
        ErrorReporting.captureMessage(
          `Storage key ${key} approaching size limit: ${size}/${MAX_KEY_SIZE}`,
          'warning'
        );
      }

      await this.createBackup(key, versionedData);
      await AsyncStorage.setItem(key, stringValue);

      return newVersion;
    } finally {
      release();
    }
  }

  static async getVersioned<T>(key: string): Promise<VersionedData<T> | null> {
    const value = await AsyncStorage.getItem(key);

    if (!value) {
      return null;
    }

    try {
      const parsed = JSON.parse(value);
      if (parsed.version !== undefined && parsed.data !== undefined) {
        return parsed as VersionedData<T>;
      }
      return {
        version: 0,
        data: parsed as T,
        timestamp: Date.now(),
      };
    } catch (error) {
      ErrorReporting.logError(error as Error, { key, type: 'JSON Parse Error' });
      return null;
    }
  }

  static async getWithRecovery<T>(
    key: string,
    defaultValue: T
  ): Promise<T> {
    try {
      const versionedData = await this.getVersioned<T>(key);
      if (!versionedData) {
        return defaultValue;
      }
      return versionedData.data;
    } catch (error) {
      ErrorReporting.logError(error as Error, { key, type: 'Storage Read Error' });

      const backup = await this.getBackup<T>(key);
      if (backup) {
        ErrorReporting.captureMessage(
          `Recovered data for key ${key} from backup`,
          'info'
        );
        return backup.data;
      }

      await AsyncStorage.removeItem(key);
      return defaultValue;
    }
  }

  static async createBackup<T>(key: string, data: VersionedData<T>): Promise<void> {
    try {
      const backupKey = STORAGE_KEYS.backup(key);
      await AsyncStorage.setItem(backupKey, JSON.stringify(data));
    } catch (error) {
      ErrorReporting.logError(error as Error, { key, type: 'Backup Creation Error' });
    }
  }

  static async getBackup<T>(key: string): Promise<VersionedData<T> | null> {
    try {
      const backupKey = STORAGE_KEYS.backup(key);
      const value = await AsyncStorage.getItem(backupKey);

      if (!value) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      ErrorReporting.logError(error as Error, { key, type: 'Backup Read Error' });
      return null;
    }
  }

  static async saveSessions(profileId: string, sessions: SessionRecord[]): Promise<void> {
    const key = STORAGE_KEYS.sessions(profileId);
    await this.saveWithLock(key, sessions);
  }

  static async loadSessions(profileId: string): Promise<SessionRecord[]> {
    const key = STORAGE_KEYS.sessions(profileId);
    return await this.getWithRecovery<SessionRecord[]>(key, []);
  }

  static async appendSession(profileId: string, session: SessionRecord): Promise<void> {
    const key = STORAGE_KEYS.sessions(profileId);
    const release = await this.acquireLock(key);

    try {
      const versionedData = await this.getVersioned<SessionRecord[]>(key);
      const sessions = versionedData?.data ?? [];
      const currentVersion = versionedData?.version ?? 0;

      sessions.push(session);

      const MAX_SESSIONS = 1000;
      if (sessions.length > MAX_SESSIONS) {
        sessions.splice(0, sessions.length - MAX_SESSIONS);
      }

      const stringValue = JSON.stringify({ version: currentVersion + 1, data: sessions, timestamp: Date.now() });
      const size = new Blob([stringValue]).size;

      if (size > MAX_KEY_SIZE * WARNING_THRESHOLD) {
        const trimmedSessions = await this.trimOldSessions(sessions, MAX_KEY_SIZE * 0.7);
        await this.saveWithLock(key, trimmedSessions, currentVersion);
      } else {
        await this.saveWithLock(key, sessions, currentVersion);
      }
    } finally {
      release();
    }
  }

  private static async trimOldSessions(
    sessions: SessionRecord[],
    targetSize: number
  ): Promise<SessionRecord[]> {
    let trimmedSessions = [...sessions];
    let size = new Blob([JSON.stringify(trimmedSessions)]).size;

    while (size > targetSize && trimmedSessions.length > 100) {
      const removeCount = Math.ceil(trimmedSessions.length * 0.1);
      trimmedSessions = trimmedSessions.slice(removeCount);
      size = new Blob([JSON.stringify(trimmedSessions)]).size;
    }

    ErrorReporting.captureMessage(
      `Trimmed sessions from ${sessions.length} to ${trimmedSessions.length}`,
      'info'
    );

    return trimmedSessions;
  }

  static async get<T>(key: string): Promise<T | null> {
    return await this.getWithRecovery<T | null>(key, null);
  }

  static async set<T>(key: string, value: T): Promise<void> {
    await this.saveWithLock(key, value);
  }

  static async clear(): Promise<void> {
    await AsyncStorage.clear();
  }

  static async removeOldSessions(profileId: string, daysToKeep: number): Promise<void> {
    const key = STORAGE_KEYS.sessions(profileId);
    const release = await this.acquireLock(key);

    try {
      const versionedData = await this.getVersioned<SessionRecord[]>(key);
      const sessions = versionedData?.data ?? [];
      const currentVersion = versionedData?.version ?? 0;
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

      const filteredSessions = sessions.filter(session => session.endTime >= cutoffTime);

      await this.saveWithLock(key, filteredSessions, currentVersion);
    } finally {
      release();
    }
  }
}

export class StorageMonitor {
  static async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const size = await this.getKeySize(key);
        totalSize += size;
      }

      return totalSize;
    } catch (error) {
      ErrorReporting.logError(error as Error, { type: 'Storage Size Check Error' });
      return 0;
    }
  }

  static async getKeySize(key: string): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) {
        return 0;
      }
      return new Blob([value]).size;
    } catch (error) {
      ErrorReporting.logError(error as Error, { key, type: 'Key Size Check Error' });
      return 0;
    }
  }

  static async isNearLimit(key: string): Promise<boolean> {
    const size = await this.getKeySize(key);
    return size > MAX_KEY_SIZE * WARNING_THRESHOLD;
  }

  static async trimOldData(key: string, maxSize: number): Promise<void> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) {
        return;
      }

      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed.data)) {
        return;
      }

      let trimmedData = [...parsed.data];
      let size = new Blob([JSON.stringify(trimmedData)]).size;

      while (size > maxSize && trimmedData.length > 10) {
        const removeCount = Math.ceil(trimmedData.length * 0.1);
        trimmedData = trimmedData.slice(removeCount);
        size = new Blob([JSON.stringify(trimmedData)]).size;
      }

      await AsyncStorageAdapter.saveWithLock(key, trimmedData, parsed.version);

      ErrorReporting.captureMessage(
        `Trimmed key ${key} from ${parsed.data.length} to ${trimmedData.length} items`,
        'info'
      );
    } catch (error) {
      ErrorReporting.logError(error as Error, { key, type: 'Trim Data Error' });
    }
  }
}

export default AsyncStorageAdapter;
