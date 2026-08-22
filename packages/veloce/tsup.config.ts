import { defineConfig } from 'tsup';

const aliases = {
  '@teloce/compiler': '../compiler/src/index.ts',
  '@teloce/core': '../core/src/index.ts',
  '@teloce/reactivity': '../reactivity/src/index.ts',
  '@teloce/runtime-core': '../runtime-core/src/index.ts',
  '@teloce/runtime-dom': '../runtime-dom/src/index.ts',
  '@teloce/sfc': '../sfc/src/index.ts',
  '@teloce/std': '../std/src/index.ts',
};

export default defineConfig([
  // 1. CDN Global Build (IIFE) -> teloce.global.js
  //    Built from src/cdn.ts, which bundles the compiler on purpose - see
  //    the comment at the top of that file for why this build is the one
  //    exception to "don't ship the compiler to the browser".
  {
    entry: { teloce: 'src/cdn.ts' },
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
      options.alias = aliases;
    },
  },
  // 2. ESM Build -> teloce.esm.js
  //    Built from the lean src/index.ts (no compiler/sfc) - this is what
  //    `import { createApp } from 'teloce'` actually resolves to.
  {
    entry: { teloce: 'src/index.ts' },
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
      options.alias = aliases;
    },
  },
  // 3. CJS Build -> teloce.js (for the "require" export condition)
  {
    entry: { teloce: 'src/index.ts' },
    format: ['cjs'],
    minify: true,
    sourcemap: true,
    clean: false,
    dts: false,
    outDir: 'dist',
    outExtension: () => ({ js: '.js' }),
    platform: 'browser',
    target: 'es2020',
    noExternal: [/@teloce\/.*/],
    esbuildOptions(options) {
      options.bundle = true;
      options.splitting = false;
      options.legalComments = 'none';
      options.alias = aliases;
    },
  },
  // 4. Optional teloce/compiler subpath build -> teloce-compiler.esm.js / .js
  {
    entry: { 'teloce-compiler': 'src/compiler.ts' },
    format: ['esm', 'cjs'],
    minify: true,
    sourcemap: true,
    clean: false,
    dts: true,
    outDir: 'dist',
    outExtension: ({ format }) => ({ js: format === 'esm' ? '.esm.js' : '.js' }),
    platform: 'node',
    target: 'es2020',
    noExternal: [/@teloce\/.*/],
    esbuildOptions(options) {
      options.bundle = true;
      options.splitting = false;
      options.legalComments = 'none';
      options.alias = aliases;
    },
  },
  // 5. TypeScript Declarations for the main (lean) entry
  {
    entry: { teloce: 'src/index.ts' },
    dts: { only: true },
    clean: false,
    outDir: 'dist',
    platform: 'neutral',
    target: 'es2020',
    esbuildOptions(options) {
      options.alias = aliases;
    },
  },
]);
