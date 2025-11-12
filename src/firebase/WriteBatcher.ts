import { doc, writeBatch, WriteBatch, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

interface BatchedWrite {
  collection: string;
  docId: string;
  data: Record<string, any>;
  timestamp: number;
}

interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number;
  retryAttempts: number;
}

export class WriteBatcher {
  private queue: BatchedWrite[] = new Map().entries;
  private writeMap: Map<string, BatchedWrite> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;
  private config: BatchConfig;
  private isProcessing = false;

  constructor(config?: Partial<BatchConfig>) {
    this.config = {
      maxBatchSize: config?.maxBatchSize || 10,
      maxWaitTime: config?.maxWaitTime || 10000,
      retryAttempts: config?.retryAttempts || 3,
    };
  }

  enqueue(collection: string, docId: string, data: Record<string, any>): void {
    const key = `${collection}/${docId}`;
    const existing = this.writeMap.get(key);

    if (existing) {
      existing.data = { ...existing.data, ...data };
      existing.timestamp = Date.now();
    } else {
      const write: BatchedWrite = {
        collection,
        docId,
        data,
        timestamp: Date.now(),
      };
      this.writeMap.set(key, write);
    }

    if (this.writeMap.size >= this.config.maxBatchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.writeMap.size === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    const writes = Array.from(this.writeMap.values());
    this.writeMap.clear();

    try {
      await this.executeBatch(writes);
    } catch (error) {
      console.error('Batch write failed:', error);
      for (const write of writes) {
        const key = `${write.collection}/${write.docId}`;
        this.writeMap.set(key, write);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeBatch(writes: BatchedWrite[], attempt: number = 1): Promise<void> {
    const batches: BatchedWrite[][] = [];
    const FIRESTORE_BATCH_LIMIT = 500;

    for (let i = 0; i < writes.length; i += FIRESTORE_BATCH_LIMIT) {
      batches.push(writes.slice(i, i + FIRESTORE_BATCH_LIMIT));
    }

    for (const batchWrites of batches) {
      try {
        const batch = writeBatch(db);

        for (const write of batchWrites) {
          const docRef = doc(db, write.collection, write.docId);
          batch.update(docRef, write.data);
        }

        await batch.commit();
      } catch (error) {
        if (attempt < this.config.retryAttempts) {
          console.warn(`Batch write attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          return this.executeBatch(batchWrites, attempt + 1);
        }
        throw error;
      }
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) {
      return;
    }

    this.flushTimer = setTimeout(() => {
      this.flush();
    }, this.config.maxWaitTime);
  }

  async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    await this.flush();
  }

  getQueueSize(): number {
    return this.writeMap.size;
  }
}

export const globalWriteBatcher = new WriteBatcher({
  maxBatchSize: 10,
  maxWaitTime: 10000,
  retryAttempts: 3,
});
