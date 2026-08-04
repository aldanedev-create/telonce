import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.config.{js,ts}',
        '**/__tests__/**',
        '**/__fixtures__/**',
        '**/__mocks__/**',
      ],
      all: true,
    },
    include: [
      'packages/**/*.{test,spec}.{js,ts}',
      'tests/**/*.{test,spec}.{js,ts}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.turbo/**',
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      '@teloce/core': path.resolve(__dirname, 'packages/core/src'),
      '@teloce/compiler': path.resolve(__dirname, 'packages/compiler/src'),
      '@teloce/reactivity': path.resolve(__dirname, 'packages/reactivity/src'),
      '@teloce/runtime-core': path.resolve(__dirname, 'packages/runtime-core/src'),
      '@teloce/runtime-dom': path.resolve(__dirname, 'packages/runtime-dom/src'),
      '@teloce/std': path.resolve(__dirname, 'packages/std/src'),
      '@teloce/debugger': path.resolve(__dirname, 'packages/debugger/src'),
      '@teloce/cli': path.resolve(__dirname, 'packages/cli/src'),
      '@teloce/server': path.resolve(__dirname, 'packages/server/src'),
      '@teloce/bundler': path.resolve(__dirname, 'packages/bundler/src'),
      '@teloce/sfc': path.resolve(__dirname, 'packages/sfc/src'),
      '@teloce/shared': path.resolve(__dirname, 'packages/shared/src'),
    },
  },
});