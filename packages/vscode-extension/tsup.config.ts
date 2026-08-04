import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  platform: 'node',
  target: 'node18',
  clean: true,
  sourcemap: true,
  minify: false,
  external: ['vscode'],
  outDir: 'dist',
  splitting: false,
  dts: false,
});