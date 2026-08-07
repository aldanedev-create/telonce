import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    compilerOptions: {
      composite: false,
      noUnusedLocals: false,
      noUnusedParameters: false,
      strictNullChecks: false,
    },
  },
  clean: true,
  sourcemap: true,
  splitting: false,
  target: 'es2020',
});