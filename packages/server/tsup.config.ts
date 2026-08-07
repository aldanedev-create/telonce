import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    compilerOptions: {
      composite: false, // <-- Fixes the TS6307 error during dts generation
    },
  },
  clean: true,
  sourcemap: true,
  outDir: 'dist',
});