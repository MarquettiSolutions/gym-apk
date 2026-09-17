module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // 'react-native-reanimated/plugin' debe ser siempre el último plugin de la
  // lista (requisito de la librería).
  plugins: [
    ['inline-import', { extensions: ['.sql'] }],
    'react-native-reanimated/plugin',
  ],
};
