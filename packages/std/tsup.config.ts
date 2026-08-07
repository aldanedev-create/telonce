import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  platform: 'neutral',
  esbuildOptions(options) {
    options.bundle = true;
    options.minify = true;
  },
});