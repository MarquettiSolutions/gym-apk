module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@notifee|react-native-video|react-native-blob-util|react-native-screens|react-native-safe-area-context|@op-engineering|uuid)/)',
  ],
};
