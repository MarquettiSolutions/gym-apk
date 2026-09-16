jest.mock('@notifee/react-native', () =>
  require('@notifee/react-native/jest-mock'),
);
jest.mock('react-native-video', () => 'Video');
jest.mock('react-native-blob-util', () => ({
  fs: {
    dirs: { DocumentDir: '/mock/document-dir', CacheDir: '/mock/cache-dir' },
    exists: jest.fn(async () => true),
    mkdir: jest.fn(async () => undefined),
  },
  config: jest.fn(() => ({ fetch: jest.fn(async () => undefined) })),
}));
