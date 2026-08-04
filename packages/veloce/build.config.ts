import { defineConfig } from 'tsup';

export default defineConfig([
  // CDN Build (IIFE) - for <script> tag
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'teloce',
    name: 'teloce',
    minify: true,
    sourcemap: true,
    clean: true,
    dts: false,
    outDir: 'dist',
    outExtension: () => ({ js: '.global.js' }),
    platform: 'browser',
    target: 'es2020',
    env: {
      NODE_ENV: 'production',
    },
    define: {
      __DEV__: 'false',
    },
    esbuildOptions(options) {
      options.legalComments = 'none';
      options.bundle = true;
      options.splitting = false;
    },
  },

  // ESM Build - for <script type="module">
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    minify: true,
    sourcemap: true,
    clean: false,
    dts: false,
    outDir: 'dist',
    outExtension: () => ({ js: '.esm.js' }),
    platform: 'browser',
    target: 'es2020',
    env: {
      NODE_ENV: 'production',
    },
    define: {
      __DEV__: 'false',
    },
    esbuildOptions(options) {
      options.legalComments = 'none';
      options.bundle = true;
      options.splitting = false;
    },
  },

  // Debug Build - unminified for development
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'teloce',
    name: 'teloce-debug',
    minify: false,
    sourcemap: true,
    clean: false,
    dts: false,
    outDir: 'dist',
    outExtension: () => ({ js: '.debug.js' }),
    platform: 'browser',
    target: 'es2020',
    env: {
      NODE_ENV: 'development',
    },
    define: {
      __DEV__: 'true',
    },
    esbuildOptions(options) {
      options.legalComments = 'inline';
      options.bundle = true;
      options.splitting = false;
    },
  },

  // TypeScript declarations
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: false,
    outDir: 'dist',
    outExtension: () => ({ js: '.d.ts' }),
    platform: 'neutral',
    target: 'es2020',
    esbuildOptions(options) {
      options.bundle = false;
    },
  },
]);