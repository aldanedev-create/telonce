import { defineConfig } from '@teloce/cli';

export default defineConfig({
  // Framework detection
  framework: {
    autoDetect: true,
    flask: {
      staticFolder: 'static',
      templatesFolder: 'templates',
    },
    django: {
      staticFolder: 'static',
      templatesFolder: 'templates',
    },
    fastapi: {
      staticFolder: 'static',
      templatesFolder: 'templates',
    },
  },

  // Compiler settings
  compiler: {
    sourceMaps: true,
    minify: true,
    target: 'es2020',
    strictMode: true,
  },

  // Development server
  devServer: {
    port: 5173,
    host: 'localhost',
    open: true,
    hotReload: true,
  },

  // Debugger
  debugger: {
    port: 9000,
    host: 'localhost',
    open: true,
  },

  // Build settings
  build: {
    outDir: 'dist',
    chunkSize: 500,
    treeShaking: true,
    bundleAnalyzer: false,
  },

  // CDN settings
  cdn: {
    url: 'https://cdn.teloce.dev',
    version: 'latest',
  },
});