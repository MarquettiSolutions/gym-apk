import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
jest.mock('@notifee/react-native', () =>
  require('@notifee/react-native/jest-mock'),
);
jest.mock('react-native-video', () => 'Video');
jest.mock('react-native-blob-util', () => ({
  fs: {
    dirs: { DocumentDir: '/mock/document-dir', CacheDir: '/mock/cache-dir' },
    exists: jest.fn(async () => true),
    mkdir: jest.fn(async () => undefined),
    writeFile: jest.fn(async () => undefined),
    readFile: jest.fn(async () => '{}'),
  },
  config: jest.fn(() => ({ fetch: jest.fn(async () => undefined) })),
  android: {
    actionViewIntent: jest.fn(async () => true),
  },
}));
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  saveDocuments: jest.fn(),
  types: { json: 'application/json' },
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
  isErrorWithCode: error =>
    typeof error === 'object' && error !== null && 'code' in error,
}));
