import { mockFirestoreData } from '../../__mocks__/firebase/firestore';

export const setMockFirestoreData = (path: string, data: any) => {
  mockFirestoreData.set(path, data);
};

export const getMockFirestoreData = (path: string) => {
  return mockFirestoreData.get(path);
};

export const clearMockFirestoreData = () => {
  mockFirestoreData.clear();
};

export const setMockCollection = (collectionPath: string, docs: any[]) => {
  mockFirestoreData.set(collectionPath, docs);
};

export const addMockDocument = (path: string, doc: any) => {
  const existing = mockFirestoreData.get(path) || [];
  if (Array.isArray(existing)) {
    mockFirestoreData.set(path, [...existing, doc]);
  } else {
    mockFirestoreData.set(path, doc);
  }
};
