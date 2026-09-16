module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['src/db/migrations/**'],
  overrides: [
    {
      files: ['jest.setup.js'],
      env: { jest: true },
    },
  ],
};
