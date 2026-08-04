/**
 * @teloce/bundler - Production Bundler
 * 
 * This package provides production packaging for Teloce applications.
 * It includes tree-shaking, minification, and chunk splitting.
 */

import {
  treeShake,
  analyzeImports,
  analyzeExports,
  removeUnused,
} from './tree-shaking';

import {
  minify,
  minifyJavaScript,
  minifyCSS,
  minifyHTML,
  optimizeCode,
} from './minifier';

import {
  createChunks,
  splitChunks,
  analyzeChunks,
  optimizeChunks,
} from './chunks';

import {
  bundle,
} from './bundle';

// Export tree-shaking
export {
  treeShake,
  analyzeImports,
  analyzeExports,
  removeUnused,
  type TreeShakeOptions,
  type TreeShakeResult,
  type ImportInfo,
  type ExportInfo,
  type ModuleInfo,
} from './tree-shaking';

// Export minifier
export {
  minify,
  minifyJavaScript,
  minifyCSS,
  minifyHTML,
  optimizeCode,
  type MinifyOptions,
  type MinifyResult,
  type MinifierPlugin,
} from './minifier';

// Export chunks
export {
  createChunks,
  splitChunks,
  analyzeChunks,
  optimizeChunks,
  type ChunkOptions,
  type ChunkResult,
  type Chunk,
  type ChunkInfo,
  type ChunkOptimization,
} from './chunks';

// Export main bundler
export {
  bundle,
  type BundleOptions,
  type BundleResult,
  type BundleStats,
} from './bundle';

// Default export
export default {
  treeShake,
  analyzeImports,
  analyzeExports,
  removeUnused,
  minify,
  minifyJavaScript,
  minifyCSS,
  minifyHTML,
  optimizeCode,
  createChunks,
  splitChunks,
  analyzeChunks,
  optimizeChunks,
  bundle,
};