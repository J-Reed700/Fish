import { clearAsyncStorageMock } from '../__mocks__/@react-native-async-storage/async-storage';
import { clearMockFirestore } from '../__mocks__/firebase/firestore';

beforeEach(() => {
  clearAsyncStorageMock();
  clearMockFirestore();
  jest.clearAllTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};
