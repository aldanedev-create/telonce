import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    compilerOptions: {
      composite: false, // Disables composite for tsup's type generation
    },
  },
  clean: true,
  sourcemap: true,
  splitting: false,
  target: 'es2020',
});