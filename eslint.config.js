// https://docs.expo.dev/guides/using-eslint/
const { FlatCompat } = require('@eslint/eslintrc');
const globals = require('globals');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: require.resolve('eslint-config-expo').replace(/default\.js$/, ''),
});

module.exports = [
  ...compat.extends('expo'),
  {
    // The backend (server/) is a separate Node package with its own package.json
    // and no eslint devDependency of its own — the Expo client config's rules
    // (e.g. expo/no-dynamic-env-var, which assumes EXPO_PUBLIC_* client env vars)
    // don't apply to it.
    ignores: ['dist/*', 'node_modules/*', 'server/**'],
  },
  {
    files: ['eslint.config.js', 'babel.config.js', 'metro.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
];
