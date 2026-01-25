const path = require('path');
const baseConfig = require('./webpack.config.js');

module.exports = {
  ...baseConfig,
  mode: 'production',
  target: 'web', // Changed from 'electron-renderer' to 'web'
  output: {
    ...baseConfig.output,
    path: path.resolve(__dirname, 'release/web'),
    publicPath: './',
  },
  resolve: {
    ...baseConfig.resolve,
    alias: {
      ...baseConfig.resolve.alias,
      // Use web-compatible ipc module
      [path.resolve(__dirname, 'src/lib/ipc.ts')]: path.resolve(__dirname, 'src/lib/ipc.web.ts'),
      'electron': false,
    },
    fallback: {
      // Polyfills for Node.js modules in case they're used
      fs: false,
      path: false,
      crypto: false,
    },
  },
};
