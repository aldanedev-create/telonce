import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  globalName: 'teloce',
  dts: true, // Crucial: Generates index.d.ts files
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
});