import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheConfig {
  ttl: number;
  maxSize?: number;
  persistToDisk?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private cacheConfig: Map<string, CacheConfig> = new Map();
  private writeQueue: Map<string, Promise<void>> = new Map();

  registerCache(prefix: string, config: CacheConfig): void {
    this.cacheConfig.set(prefix, config);
  }

  async get<T>(key: string): Promise<T | null> {
    const config = this.getCacheConfig(key);
    if (!config) return null;

    const memEntry = this.memoryCache.get(key);
    if (memEntry && Date.now() < memEntry.expiresAt) {
      return memEntry.data as T;
    }

    if (memEntry) {
      this.memoryCache.delete(key);
    }

    if (config.persistToDisk) {
      try {
        const diskData = await AsyncStorage.getItem(key);
        if (diskData) {
          const entry: CacheEntry<T> = JSON.parse(diskData);
          if (Date.now() < entry.expiresAt) {
            this.memoryCache.set(key, entry);
            return entry.data;
          } else {
            await AsyncStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.error('Cache read error:', error);
      }
    }

    return null;
  }

  async set<T>(key: string, data: T): Promise<void> {
    const config = this.getCacheConfig(key);
    if (!config) return;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + config.ttl,
    };

    this.memoryCache.set(key, entry);

    if (config.maxSize && this.memoryCache.size > config.maxSize) {
      this.evictOldest();
    }

    if (config.persistToDisk) {
      const existingWrite = this.writeQueue.get(key);
      if (existingWrite) {
        await existingWrite;
      }

      const writePromise = this.persistToStorage(key, entry);
      this.writeQueue.set(key, writePromise);

      writePromise.finally(() => {
        if (this.writeQueue.get(key) === writePromise) {
          this.writeQueue.delete(key);
        }
      });
    }
  }

  async invalidate(pattern?: string): Promise<void> {
    if (!pattern) {
      this.memoryCache.clear();
      return;
    }

    const keysToDelete: string[] = [];
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(pattern)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.memoryCache.delete(key);

      const config = this.getCacheConfig(key);
      if (config?.persistToDisk) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.error('Cache invalidation error:', error);
        }
      }
    }
  }

  async warmup<T>(keys: Array<{ key: string; fetcher: () => Promise<T> }>): Promise<void> {
    const promises = keys.map(async ({ key, fetcher }) => {
      const cached = await this.get<T>(key);
      if (!cached) {
        try {
          const data = await fetcher();
          await this.set(key, data);
        } catch (error) {
          console.error(`Cache warmup failed for ${key}:`, error);
        }
      }
    });

    await Promise.all(promises);
  }

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { backgroundRefresh?: boolean }
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      if (options?.backgroundRefresh) {
        this.refreshInBackground(key, fetcher);
      }
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data);
    return data;
  }

  private async refreshInBackground<T>(key: string, fetcher: () => Promise<T>): Promise<void> {
    try {
      const data = await fetcher();
      await this.set(key, data);
    } catch (error) {
      console.error(`Background refresh failed for ${key}:`, error);
    }
  }

  private getCacheConfig(key: string): CacheConfig | undefined {
    for (const [prefix, config] of this.cacheConfig.entries()) {
      if (key.startsWith(prefix)) {
        return config;
      }
    }
    return undefined;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  private async persistToStorage<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  getCacheStats() {
    return {
      memoryEntries: this.memoryCache.size,
      queuedWrites: this.writeQueue.size,
    };
  }
}

export const cacheManager = new CacheManager();

cacheManager.registerCache('leaderboard:', {
  ttl: 5 * 60 * 1000,
  maxSize: 50,
  persistToDisk: true,
});

cacheManager.registerCache('challenges:', {
  ttl: 60 * 60 * 1000,
  maxSize: 20,
  persistToDisk: true,
});

cacheManager.registerCache('user_progress:', {
  ttl: 10 * 60 * 1000,
  maxSize: 30,
  persistToDisk: true,
});
