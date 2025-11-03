
// Necessário para o react-native-reanimated funcionar corretamente.
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // manter por último
    ],
  };
};
