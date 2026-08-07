import { defineConfig } from 'tsup';

export default defineConfig([
  // 1. CDN Global Build (IIFE) -> teloce.global.js
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'Teloce',
    minify: true,
    sourcemap: true,
    clean: true,
    dts: false,
    outDir: 'dist',
    outExtension: () => ({ js: '.global.js' }),
    platform: 'browser',
    target: 'es2020',
    noExternal: [/@teloce\/.*/],
    esbuildOptions(options) {
      options.bundle = true;
      options.splitting = false;
      options.legalComments = 'none';
      options.alias = {
        '@teloce/compiler': '../compiler/src/index.ts',
        '@teloce/core': '../core/src/index.ts',
        '@teloce/reactivity': '../reactivity/src/index.ts',
        '@teloce/runtime-core': '../runtime-core/src/index.ts',
        '@teloce/runtime-dom': '../runtime-dom/src/index.ts',
        '@teloce/sfc': '../sfc/src/index.ts',
        '@teloce/std': '../std/src/index.ts',
      };
    },
  },
  // 2. ESM Build -> teloce.esm.js
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
    noExternal: [/@teloce\/.*/],
    esbuildOptions(options) {
      options.bundle = true;
      options.splitting = false;
      options.legalComments = 'none';
      options.alias = {
        '@teloce/compiler': '../compiler/src/index.ts',
        '@teloce/core': '../core/src/index.ts',
        '@teloce/reactivity': '../reactivity/src/index.ts',
        '@teloce/runtime-core': '../runtime-core/src/index.ts',
        '@teloce/runtime-dom': '../runtime-dom/src/index.ts',
        '@teloce/sfc': '../sfc/src/index.ts',
        '@teloce/std': '../std/src/index.ts',
      };
    },
  },
  // 3. TypeScript Declarations
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: false,
    outDir: 'dist',
    platform: 'neutral',
    target: 'es2020',
    esbuildOptions(options) {
      options.alias = {
        '@teloce/compiler': '../compiler/src/index.ts',
        '@teloce/core': '../core/src/index.ts',
        '@teloce/reactivity': '../reactivity/src/index.ts',
        '@teloce/runtime-core': '../runtime-core/src/index.ts',
        '@teloce/runtime-dom': '../runtime-dom/src/index.ts',
        '@teloce/sfc': '../sfc/src/index.ts',
        '@teloce/std': '../std/src/index.ts',
      };
    },
  },
]);