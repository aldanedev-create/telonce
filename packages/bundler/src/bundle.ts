/**
 * Main bundler - orchestrates the entire bundling process and populates output files
 */

import { treeShake, type TreeShakeOptions, type TreeShakeResult } from './tree-shaking';
import { minify, type MinifyOptions, type MinifyResult } from './minifier';
import { createChunks, type ChunkOptions, type ChunkResult } from './chunks';

export interface BundleOptions {
  /**
   * Entry files
   */
  entry: string | string[];

  /**
   * Output directory
   */
  outDir?: string;

  /**
   * Enable tree-shaking
   */
  treeShake?: boolean | TreeShakeOptions;

  /**
   * Enable minification
   */
  minify?: boolean | MinifyOptions;

  /**
   * Enable chunk splitting
   */
  chunks?: boolean | ChunkOptions;

  /**
   * Source maps
   */
  sourceMap?: boolean;

  /**
   * Development mode
   */
  dev?: boolean;

  /**
   * Output format
   */
  format?: 'esm' | 'cjs' | 'iife' | 'umd';

  /**
   * Target platform
   */
  target?: 'browser' | 'node';

  /**
   * External dependencies
   */
  external?: string[];

  /**
   * Global variables (for UMD/IIFE)
   */
  globals?: Record<string, string>;
}

export interface BundleResult {
  /**
   * Bundled files
   */
  files: {
    path: string;
    content: string;
    size: number;
    type: 'js' | 'css' | 'html' | 'map';
  }[];

  /**
   * Bundle statistics
   */
  stats: BundleStats;

  /**
   * Tree-shaking result
   */
  treeShake?: TreeShakeResult;

  /**
   * Minification result
   */
  minify?: MinifyResult;

  /**
   * Chunk result
   */
  chunks?: ChunkResult;

  /**
   * Diagnostics
   */
  diagnostics: {
    errors: string[];
    warnings: string[];
  };
}

export interface BundleStats {
  /**
   * Total size in bytes
   */
  totalSize: number;

  /**
   * Gzipped size in bytes
   */
  gzipSize: number;

  /**
   * Number of files
   */
  fileCount: number;

  /**
   * Module count
   */
  moduleCount: number;

  /**
   * Chunk count (if chunking is enabled)
   */
  chunkCount?: number;

  /**
   * Build time in milliseconds
   */
  buildTime: number;
}

/**
 * Bundle a Teloce application
 */
export function bundle(
  options: BundleOptions
): BundleResult {
  const startTime = performance.now();
  const diagnostics = {
    errors: [] as string[],
    warnings: [] as string[],
  };
  const files: BundleResult['files'] = [];
  const outDir = options.outDir || 'dist';
  const entries = Array.isArray(options.entry) ? options.entry : [options.entry];

  let stats: BundleStats = {
    totalSize: 0,
    gzipSize: 0,
    fileCount: 0,
    moduleCount: 0,
    buildTime: 0,
  };

  try {
    // 1. Tree-shaking
    let treeShakeResult: TreeShakeResult | undefined;
    if (options.treeShake) {
      const tsOptions = typeof options.treeShake === 'boolean'
        ? {}
        : options.treeShake;
      treeShakeResult = treeShake(options.entry, tsOptions);
      stats.moduleCount = treeShakeResult.modules.length;
    }

    // 2. Chunk splitting
    let chunkResult: ChunkResult | undefined;
    if (options.chunks) {
      const chunkOptions = typeof options.chunks === 'boolean'
        ? {}
        : options.chunks;
      chunkResult = createChunks(entries, chunkOptions);
      stats.chunkCount = chunkResult.chunks.length;
    }

    // 3. Generate output files. Tree-shaking is checked first and, when it
    // ran, always wins: it's the one path here that actually reads real
    // source from disk (see tree-shaking/index.ts's fs.readFileSync) and
    // produces genuine file content. createChunks(), by contrast, doesn't
    // read any files at all - it works purely on entry path strings - so
    // `chunk.code`/`chunk.content` for a real project is always empty.
    // Previously this checked chunkResult FIRST, so as soon as chunking
    // was enabled (the CLI's default), every chunk's empty content won
    // over any real tree-shaken content, and `teloce build` would happily
    // report "Build completed successfully!" while writing out empty,
    // extensionless files. Chunk entries with genuinely empty content are
    // now skipped rather than written, since a 0-byte file named after a
    // chunk isn't useful output, and if that leaves nothing at all we
    // still fall through to the tree-shake/placeholder branches below.
    if (treeShakeResult && treeShakeResult.modules.length > 0) {
      const combinedContent = treeShakeResult.modules
        .map((m: any) => m.code || m.content || m.source || '')
        .join('\n\n');
      const ext = options.format === 'esm' ? 'mjs' : 'js';
      for (const entry of entries) {
        const baseName = entry.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'bundle';
        const filePath = `${outDir}/${baseName}.${ext}`;
        files.push({
          path: filePath,
          content: combinedContent,
          size: new TextEncoder().encode(combinedContent).length,
          type: 'js',
        });
      }
    } else if (chunkResult && chunkResult.chunks.some((c: any) => c.code || c.content)) {
      for (const chunk of chunkResult.chunks) {
        const chunkAny = chunk as any;
        const content = chunkAny.code || chunkAny.content || '';
        if (!content) continue;
        const fileName = chunkAny.name || chunkAny.fileName || `chunk-${files.length + 1}.js`;
        const filePath = `${outDir}/${fileName}`;
        files.push({
          path: filePath,
          content,
          size: new TextEncoder().encode(content).length,
          type: filePath.endsWith('.css') ? 'css' : 'js',
        });
      }
    } else {
      diagnostics.warnings.push(
        'Neither tree-shaking nor chunk splitting produced real bundled content ' +
          '(pass treeShake: true and ensure your entry files exist on disk); writing ' +
          'placeholder output instead of empty files.'
      );
      for (const entry of entries) {
        const baseName = entry.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'bundle';
        const filePath = `${outDir}/${baseName}.js`;
        const content = `// Bundle output for ${entry}\n`;
        files.push({
          path: filePath,
          content,
          size: new TextEncoder().encode(content).length,
          type: 'js',
        });
      }
    }

    // 4. Minification
    let minifyResult: MinifyResult | undefined;
    if (options.minify) {
      const minifyOptions = typeof options.minify === 'boolean'
        ? {}
        : options.minify;
      minifyResult = minify(files.map((f) => f.content), minifyOptions);

      if (minifyResult && minifyResult.code) {
        if (Array.isArray(minifyResult.code)) {
          for (let i = 0; i < files.length && i < minifyResult.code.length; i++) {
            files[i].content = minifyResult.code[i];
            files[i].size = new TextEncoder().encode(files[i].content).length;
          }
        } else if (typeof minifyResult.code === 'string' && files.length > 0) {
          files[0].content = minifyResult.code;
          files[0].size = new TextEncoder().encode(files[0].content).length;
        }
      }
    }

    const endTime = performance.now();
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    stats = {
      ...stats,
      totalSize,
      gzipSize: Math.round(totalSize * 0.35), // Approximate gzip compression ratio estimation
      fileCount: files.length,
      buildTime: endTime - startTime,
    };

    return {
      files,
      stats,
      treeShake: treeShakeResult,
      minify: minifyResult,
      chunks: chunkResult,
      diagnostics,
    };
  } catch (error) {
    diagnostics.errors.push(
      error instanceof Error ? error.message : String(error)
    );
    return {
      files: [],
      stats,
      diagnostics,
    };
  }
}