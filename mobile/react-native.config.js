module.exports = {
  project: {
    ios: {
      sourceDir: './ios',
    },
    android: {},
  },
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null,
      },
    },
  },
  assets: ['./node_modules/react-native-vector-icons/Fonts'],
};
