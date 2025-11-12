export const mockFirestoreData: Map<string, any> = new Map();

export const collection = jest.fn((db: any, path: string) => ({
  path,
}));

export const doc = jest.fn((db: any, ...paths: string[]) => ({
  id: paths[paths.length - 1],
  path: paths.join('/'),
}));

export const getDocs = jest.fn(async (query: any) => {
  const path = query.path || query;
  const data = mockFirestoreData.get(path) || [];
  return {
    docs: data.map((item: any, index: number) => ({
      id: item.id || `doc_${index}`,
      data: () => item,
      exists: () => true,
    })),
    empty: data.length === 0,
  };
});

export const getDoc = jest.fn(async (docRef: any) => {
  const data = mockFirestoreData.get(docRef.path);
  return {
    id: docRef.id,
    data: () => data,
    exists: () => !!data,
  };
});

export const setDoc = jest.fn(async (docRef: any, data: any) => {
  mockFirestoreData.set(docRef.path, data);
  return Promise.resolve();
});

export const updateDoc = jest.fn(async (docRef: any, data: any) => {
  const existing = mockFirestoreData.get(docRef.path) || {};
  mockFirestoreData.set(docRef.path, { ...existing, ...data });
  return Promise.resolve();
});

export const deleteDoc = jest.fn(async (docRef: any) => {
  mockFirestoreData.delete(docRef.path);
  return Promise.resolve();
});

export const query = jest.fn((collectionRef: any, ...constraints: any[]) => ({
  path: collectionRef.path,
  constraints,
}));

export const where = jest.fn((field: string, op: string, value: any) => ({
  type: 'where',
  field,
  op,
  value,
}));

export const orderBy = jest.fn((field: string, direction: 'asc' | 'desc' = 'asc') => ({
  type: 'orderBy',
  field,
  direction,
}));

export const limit = jest.fn((count: number) => ({
  type: 'limit',
  count,
}));

export const onSnapshot = jest.fn((query: any, callback: (snapshot: any) => void) => {
  const data = mockFirestoreData.get(query.path) || [];
  const snapshot = {
    docs: data.map((item: any, index: number) => ({
      id: item.id || `doc_${index}`,
      data: () => item,
      exists: () => true,
    })),
    docChanges: () => [],
    empty: data.length === 0,
  };

  setTimeout(() => callback(snapshot), 0);

  return jest.fn();
});

export class Timestamp {
  constructor(public seconds: number, public nanoseconds: number) {}

  static now(): Timestamp {
    const ms = Date.now();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1000000);
  }

  static fromDate(date: Date): Timestamp {
    const ms = date.getTime();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1000000);
  }

  toDate(): Date {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
  }

  toMillis(): number {
    return this.seconds * 1000 + this.nanoseconds / 1000000;
  }
}

export const clearMockFirestore = () => {
  mockFirestoreData.clear();
};
