/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const isDev = process.env.NODE_ENV === 'development';

console.log('PROCESS ENV:', process.env.NODE_ENV);

if (!isDev) {
  // Production mode: use compiled JavaScript
  require('./dist-main/main/main.js');
} else {
  // Development mode: use ts-node
  require('ts-node').register({
    compilerOptions: {
      module: 'commonjs',
      target: 'es2020'
    }
  });
  require('./src/main/main.ts');
}