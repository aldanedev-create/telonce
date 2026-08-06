/**
 * Chunks - splits bundle into multiple chunks for optimal loading
 */

export interface ChunkOptions {
  /**
   * Chunk size target in bytes
   */
  targetSize?: number;

  /**
   * Maximum chunk size in bytes
   */
  maxSize?: number;

  /**
   * Minimum chunk size in bytes
   */
  minSize?: number;

  /**
   * Split by vendor
   */
  splitVendor?: boolean;

  /**
   * Split by route
   */
  splitByRoute?: boolean;

  /**
   * Manual chunk configuration
   */
  manual?: Record<string, string[]>;

  /**
   * Chunk naming strategy
   */
  naming?: 'hash' | 'name' | 'content-hash';
}

export interface ChunkResult {
  /**
   * Generated chunks
   */
  chunks: Chunk[];

  /**
   * Total size
   */
  totalSize: number;

  /**
   * Number of chunks
   */
  count: number;

  /**
   * Analysis
   */
  analysis: ChunkInfo[];
}

export interface Chunk {
  /**
   * Chunk ID
   */
  id: string;

  /**
   * Chunk name
   */
  name: string;

  /**
   * Files in the chunk
   */
  files: string[];

  /**
   * Size in bytes
   */
  size: number;

  /**
   * Dependencies
   */
  dependencies: string[];

  /**
   * Type
   */
  type: 'entry' | 'vendor' | 'shared' | 'lazy' | 'runtime';
}

export interface ChunkInfo {
  /**
   * Chunk name
   */
  name: string;

  /**
   * Size in bytes
   */
  size: number;

  /**
   * Gzip size
   */
  gzipSize: number;

  /**
   * Modules count
   */
  moduleCount: number;

  /**
   * Duplicate modules count
   */
  duplicateCount: number;
}

export interface ChunkOptimization {
  /**
   * Optimized chunks
   */
  chunks: Chunk[];

  /**
   * Size reduction
   */
  sizeReduction: number;

  /**
   * Number of shared modules
   */
  sharedModules: number;
}

/**
 * Analyze chunks
 */
export function analyzeChunks(
  chunks: Chunk[]
): ChunkInfo[] {
  return chunks.map(chunk => ({
    name: chunk.name,
    size: chunk.size,
    gzipSize: Math.round(chunk.size * 0.7), // Approximate gzip
    moduleCount: chunk.files.length,
    duplicateCount: 0,
  }));
}

/**
 * Split code into chunks
 */
export function splitChunks(modules: string[], options: ChunkOptions = {}): Chunk[] {
  const chunks: Chunk[] = [];
  const targetSize = options.targetSize || 100000; // 100KB default
  let currentChunk: Chunk | null = null;

  for (const module of modules) {
    if (!currentChunk || currentChunk.size > targetSize) {
      currentChunk = {
        id: `chunk-${chunks.length}`,
        name: `chunk-${chunks.length}`,
        files: [],
        size: 0,
        dependencies: [],
        type: 'shared',
      };
      chunks.push(currentChunk);
    }
    currentChunk.files.push(module);
    currentChunk.size += module.length;
  }

  return chunks;
}

/**
 * Optimize chunks
 */
export function optimizeChunks(chunks: Chunk[]): ChunkOptimization {
  // Group by similarity
  const grouped = new Map<string, Chunk[]>();
  
  for (const chunk of chunks) {
    const key = chunk.files.length > 5 ? 'large' : 'small';
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(chunk);
  }

  const optimized: Chunk[] = [];
  let sizeReduction = 0;

  for (const [_, group] of grouped) {
    // Merge small chunks
    if (group.length > 3) {
      const merged: Chunk = {
        id: `merged-${optimized.length}`,
        name: `merged-${optimized.length}`,
        files: group.flatMap(c => c.files),
        size: group.reduce((sum, c) => sum + c.size, 0),
        dependencies: [],
        type: 'shared',
      };
      optimized.push(merged);
      sizeReduction += group.length * 100; // Approximate savings
    } else {
      optimized.push(...group);
    }
  }

  return {
    chunks: optimized,
    sizeReduction,
    sharedModules: 0,
  };
}

/**
 * Create chunks from entry files
 */
export function createChunks(entries: string[], options: ChunkOptions = {}): ChunkResult {
  const chunks: Chunk[] = [];

  // Create entry chunks
  for (const entry of entries) {
    chunks.push({
      id: `entry-${chunks.length}`,
      name: `entry-${chunks.length}`,
      files: [entry],
      size: entry.length,
      dependencies: [],
      type: 'entry',
    });
  }

  // Split vendor
  if (options.splitVendor) {
    chunks.push({
      id: 'vendor',
      name: 'vendor',
      files: [],
      size: 0,
      dependencies: [],
      type: 'vendor',
    });
  }

  // Create runtime chunk
  chunks.push({
    id: 'runtime',
    name: 'runtime',
    files: [],
    size: 0,
    dependencies: [],
    type: 'runtime',
  });

  const totalSize = chunks.reduce((sum, c) => sum + c.size, 0);

  return {
    chunks,
    totalSize,
    count: chunks.length,
    analysis: analyzeChunks(chunks),
  };
}