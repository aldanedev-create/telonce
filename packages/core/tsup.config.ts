import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    compilerOptions: {
      composite: false, // <-- Crucial fix for the TS6307 error
    },
  },
  clean: true,
  sourcemap: true,
  splitting: false,
  target: 'es2020',
  external: ['@teloce/runtime-dom', '@teloce/std'],
});