import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AsyncStorageAdapter,
  ConflictError,
  StorageLimitError,
  StorageMonitor,
} from '../AsyncStorageAdapter';
import type { SessionRecord } from '../../types';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../services/ErrorReporting');

describe('AsyncStorageAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Optimistic Locking', () => {
    it('should save data with version 1 on first write', async () => {
      const testData = { foo: 'bar' };
      const version = await AsyncStorageAdapter.saveWithLock('test-key', testData);

      expect(version).toBe(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        expect.stringContaining('"version":1')
      );
    });

    it('should increment version on subsequent writes', async () => {
      const initialData = { version: 1, data: { foo: 'bar' }, timestamp: Date.now() };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(initialData));

      const version = await AsyncStorageAdapter.saveWithLock('test-key', { foo: 'baz' });

      expect(version).toBe(2);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        expect.stringContaining('"version":2')
      );
    });

    it('should throw ConflictError when expected version does not match', async () => {
      const currentData = { version: 5, data: { foo: 'bar' }, timestamp: Date.now() };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(currentData));

      await expect(
        AsyncStorageAdapter.saveWithLock('test-key', { foo: 'baz' }, 3)
      ).rejects.toThrow(ConflictError);

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle concurrent writes without data corruption', async () => {
      let writeCount = 0;
      let currentVersion = 0;

      (AsyncStorage.getItem as jest.Mock).mockImplementation(async () => {
        if (currentVersion === 0) {
          return null;
        }
        return JSON.stringify({
          version: currentVersion,
          data: { count: writeCount },
          timestamp: Date.now(),
        });
      });

      (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key, value) => {
        const parsed = JSON.parse(value);
        currentVersion = parsed.version;
        writeCount++;
      });

      const writes = Array.from({ length: 10 }, (_, i) =>
        AsyncStorageAdapter.saveWithLock('test-key', { count: i })
      );

      const versions = await Promise.all(writes);

      expect(versions).toHaveLength(10);
      expect(Math.max(...versions)).toBe(10);
      expect(new Set(versions).size).toBe(10);
    });
  });

  describe('Storage Size Monitoring', () => {
    it('should throw StorageLimitError when data exceeds max size', async () => {
      const largeData = { data: 'x'.repeat(6 * 1024 * 1024) };

      await expect(
        AsyncStorageAdapter.saveWithLock('test-key', largeData)
      ).rejects.toThrow(StorageLimitError);

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should calculate key size correctly', async () => {
      const testData = JSON.stringify({ foo: 'bar' });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(testData);

      const size = await StorageMonitor.getKeySize('test-key');

      expect(size).toBeGreaterThan(0);
    });

    it('should detect when key is near limit', async () => {
      const largeData = JSON.stringify({ data: 'x'.repeat(4.5 * 1024 * 1024) });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(largeData);

      const isNear = await StorageMonitor.isNearLimit('test-key');

      expect(isNear).toBe(true);
    });

    it('should trim old sessions when approaching limit', async () => {
      const sessions: SessionRecord[] = Array.from({ length: 500 }, (_, i) => ({
        id: `session-${i}`,
        profileId: 'test-profile',
        startTime: Date.now() - i * 60000,
        endTime: Date.now() - i * 60000 + 30000,
        duration: 30,
        mode: 'free-swim',
        touchCount: 10,
        catchesBySpecies: {
          goldfish: 1,
          clownfish: 0,
          angelfish: 0,
          betta: 0,
          guppy: 0,
          'neon-tetra': 0,
          koi: 0,
          molly: 0,
        },
        fishCount: 1,
      }));

      const versionedData = {
        version: 1,
        data: sessions,
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(versionedData));

      const newSession: SessionRecord = {
        id: 'new-session',
        profileId: 'test-profile',
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        duration: 30,
        mode: 'free-swim',
        touchCount: 5,
        catchesBySpecies: {
          goldfish: 1,
          clownfish: 0,
          angelfish: 0,
          betta: 0,
          guppy: 0,
          'neon-tetra': 0,
          koi: 0,
          molly: 0,
        },
        fishCount: 1,
      };

      await AsyncStorageAdapter.appendSession('test-profile', newSession);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Data Corruption Recovery', () => {
    it('should recover from corrupted JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid json{{{');

      const result = await AsyncStorageAdapter.getWithRecovery('test-key', { default: true });

      expect(result).toEqual({ default: true });
    });

    it('should recover from backup when primary data is corrupted', async () => {
      const backupData = { version: 1, data: { recovered: true }, timestamp: Date.now() };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('invalid json')
        .mockResolvedValueOnce(JSON.stringify(backupData));

      const result = await AsyncStorageAdapter.getWithRecovery('test-key', { default: true });

      expect(result).toEqual({ recovered: true });
    });

    it('should create backup on every write', async () => {
      await AsyncStorageAdapter.saveWithLock('test-key', { foo: 'bar' });

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key:backup',
        expect.any(String)
      );
    });

    it('should clear corrupted data and return default', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('invalid json')
        .mockResolvedValueOnce(null);

      const result = await AsyncStorageAdapter.getWithRecovery('test-key', { default: true });

      expect(result).toEqual({ default: true });
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('Session Management', () => {
    it('should load sessions with recovery', async () => {
      const sessions: SessionRecord[] = [
        {
          id: 'session-1',
          profileId: 'profile-1',
          startTime: Date.now(),
          endTime: Date.now() + 30000,
          duration: 30,
          mode: 'free-swim',
          touchCount: 10,
          catchesBySpecies: {
            goldfish: 2,
            clownfish: 0,
            angelfish: 0,
            betta: 0,
            guppy: 0,
            'neon-tetra': 0,
            koi: 0,
            molly: 0,
          },
          fishCount: 2,
        },
      ];

      const versionedData = { version: 1, data: sessions, timestamp: Date.now() };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(versionedData));

      const result = await AsyncStorageAdapter.loadSessions('profile-1');

      expect(result).toEqual(sessions);
    });

    it('should append session without race conditions', async () => {
      const existingSessions: SessionRecord[] = [
        {
          id: 'session-1',
          profileId: 'profile-1',
          startTime: Date.now(),
          endTime: Date.now() + 30000,
          duration: 30,
          mode: 'free-swim',
          touchCount: 10,
          catchesBySpecies: {
            goldfish: 1,
            clownfish: 0,
            angelfish: 0,
            betta: 0,
            guppy: 0,
            'neon-tetra': 0,
            koi: 0,
            molly: 0,
          },
          fishCount: 1,
        },
      ];

      const versionedData = { version: 1, data: existingSessions, timestamp: Date.now() };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(versionedData));

      const newSession: SessionRecord = {
        id: 'session-2',
        profileId: 'profile-1',
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        duration: 30,
        mode: 'hunt',
        touchCount: 5,
        catchesBySpecies: {
          goldfish: 0,
          clownfish: 1,
          angelfish: 0,
          betta: 0,
          guppy: 0,
          'neon-tetra': 0,
          koi: 0,
          molly: 0,
        },
        fishCount: 1,
      };

      await AsyncStorageAdapter.appendSession('profile-1', newSession);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        call => call[0] === 'sessions:profile-1'
      )?.[1];

      expect(savedData).toBeDefined();
      const parsed = JSON.parse(savedData);
      expect(parsed.data).toHaveLength(2);
      expect(parsed.version).toBe(2);
    });

    it('should limit sessions to max count', async () => {
      const existingSessions: SessionRecord[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `session-${i}`,
        profileId: 'profile-1',
        startTime: Date.now() - i * 60000,
        endTime: Date.now() - i * 60000 + 30000,
        duration: 30,
        mode: 'free-swim',
        touchCount: 10,
        catchesBySpecies: {
          goldfish: 1,
          clownfish: 0,
          angelfish: 0,
          betta: 0,
          guppy: 0,
          'neon-tetra': 0,
          koi: 0,
          molly: 0,
        },
        fishCount: 1,
      }));

      const versionedData = { version: 1, data: existingSessions, timestamp: Date.now() };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(versionedData));

      const newSession: SessionRecord = {
        id: 'new-session',
        profileId: 'profile-1',
        startTime: Date.now(),
        endTime: Date.now() + 30000,
        duration: 30,
        mode: 'free-swim',
        touchCount: 5,
        catchesBySpecies: {
          goldfish: 1,
          clownfish: 0,
          angelfish: 0,
          betta: 0,
          guppy: 0,
          'neon-tetra': 0,
          koi: 0,
          molly: 0,
        },
        fishCount: 1,
      };

      await AsyncStorageAdapter.appendSession('profile-1', newSession);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        call => call[0] === 'sessions:profile-1'
      )?.[1];

      expect(savedData).toBeDefined();
      const parsed = JSON.parse(savedData);
      expect(parsed.data.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('StorageMonitor', () => {
    it('should calculate total storage size', async () => {
      const keys = ['key1', 'key2', 'key3'];
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce(keys);
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify({ data: 'test1' }))
        .mockResolvedValueOnce(JSON.stringify({ data: 'test2' }))
        .mockResolvedValueOnce(JSON.stringify({ data: 'test3' }));

      const totalSize = await StorageMonitor.getStorageSize();

      expect(totalSize).toBeGreaterThan(0);
    });

    it('should trim old data when requested', async () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, data: 'test' }));
      const versionedData = { version: 1, data: largeArray, timestamp: Date.now() };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(versionedData));

      await StorageMonitor.trimOldData('test-key', 1000);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});
