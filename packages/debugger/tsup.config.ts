import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  clean: true,
  sourcemap: true,
  splitting: false,
  target: 'es2020',
  dts: true,
});