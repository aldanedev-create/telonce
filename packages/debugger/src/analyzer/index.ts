/**
 * Analyzer - Performance, memory, and compilation analysis
 */

export interface PerformanceReport {
  /**
   * Total time in milliseconds
   */
  totalTime: number;

  /**
   * DOM operations count
   */
  domOperations: number;

  /**
   * Re-renders count
   */
  reRenderCount: number;

  /**
   * Average render time in milliseconds
   */
  averageRenderTime: number;

  /**
   * FPS (frames per second)
   */
  fps: number;

  /**
   * Component render times
   */
  componentTimes: Record<string, number>;

  /**
   * Slowest operations
   */
  slowOperations: Array<{
    name: string;
    time: number;
    threshold: number;
  }>;

  /**
   * Recommendations
   */
  recommendations: string[];
}

export interface MemoryReport {
  /**
   * Total memory used in bytes
   */
  totalUsed: number;

  /**
   * Peak memory usage in bytes
   */
  peakUsed: number;

  /**
   * Memory usage by category
   */
  byCategory: Record<string, number>;

  /**
   * Memory leaks detected
   */
  memoryLeaks: Array<{
    location: string;
    size: number;
    description: string;
  }>;

  /**
   * Recommendations
   */
  recommendations: string[];
}

export interface CompileTimeReport {
  /**
   * Total compile time in milliseconds
   */
  totalTime: number;

  /**
   * Lexer time
   */
  lexerTime: number;

  /**
   * Parser time
   */
  parserTime: number;

  /**
   * Transformer time
   */
  transformerTime: number;

  /**
   * Optimizer time
   */
  optimizerTime: number;

  /**
   * Codegen time
   */
  codegenTime: number;

  /**
   * File compile times
   */
  fileTimes: Record<string, number>;

  /**
   * Slowest files
   */
  slowFiles: Array<{
    file: string;
    time: number;
  }>;

  /**
   * Recommendations
   */
  recommendations: string[];
}

export interface BundleReport {
  /**
   * Total bundle size in bytes
   */
  totalSize: number;

  /**
   * Gzipped size in bytes
   */
  gzipSize: number;

  /**
   * Chunk count
   */
  chunkCount: number;

  /**
   * Largest chunks
   */
  largestChunks: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;

  /**
   * Duplicate modules
   */
  duplicateModules: Array<{
    name: string;
    occurrences: number;
    size: number;
  }>;

  /**
   * Recommendations
   */
  recommendations: string[];
}

export interface AnalyzerOptions {
  /**
   * Threshold for slow operations in milliseconds
   */
  slowThreshold?: number;

  /**
   * Threshold for memory warnings in bytes
   */
  memoryThreshold?: number;

  /**
   * Enable detailed analysis
   */
  detailed?: boolean;
}

/**
 * Analyze performance
 */
export function analyzePerformance(
  data: {
    renderTimes: Record<string, number[]>;
    domOperations: number;
    reRenderCount: number;
    totalTime: number;
  },
  options: AnalyzerOptions = {}
): PerformanceReport {
  const slowThreshold = options.slowThreshold || 16; // 16ms ~ 60fps
  const recommendations: string[] = [];

  // Calculate average render time
  let totalRenderTime = 0;
  let renderCount = 0;
  const componentTimes: Record<string, number> = {};

  for (const [name, times] of Object.entries(data.renderTimes)) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    componentTimes[name] = avg;
    totalRenderTime += times.reduce((a, b) => a + b, 0);
    renderCount += times.length;
  }

  const averageRenderTime = renderCount > 0 ? totalRenderTime / renderCount : 0;
  const fps = averageRenderTime > 0 ? 1000 / averageRenderTime : 60;

  // Find slow operations
  const slowOperations: Array<{ name: string; time: number; threshold: number }> = [];
  for (const [name, avg] of Object.entries(componentTimes)) {
    if (avg > slowThreshold) {
      slowOperations.push({ name, time: avg, threshold: slowThreshold });
    }
  }

  // Generate recommendations
  if (fps < 30) {
    recommendations.push('Performance is below 30 FPS. Consider optimizing your components.');
  }
  if (slowOperations.length > 0) {
    recommendations.push(`Slow components detected: ${slowOperations.map(s => s.name).join(', ')}`);
    recommendations.push('Consider using memoization or splitting large components.');
  }
  if (data.reRenderCount > 100) {
    recommendations.push('High re-render count detected. Check for unnecessary re-renders.');
  }

  return {
    totalTime: data.totalTime,
    domOperations: data.domOperations,
    reRenderCount: data.reRenderCount,
    averageRenderTime,
    fps,
    componentTimes,
    slowOperations,
    recommendations,
  };
}

/**
 * Analyze memory usage
 */
export function analyzeMemory(
  data: {
    memoryUsage: Record<string, number>;
    peakMemory: number;
  },
  options: AnalyzerOptions = {}
): MemoryReport {
  const memoryThreshold = options.memoryThreshold || 50 * 1024 * 1024; // 50MB
  const recommendations: string[] = [];
  const memoryLeaks: Array<{ location: string; size: number; description: string }> = [];

  const totalUsed = Object.values(data.memoryUsage).reduce((a, b) => a + b, 0);
  const peakUsed = data.peakMemory || totalUsed;

  // Check for memory leaks
  for (const [category, size] of Object.entries(data.memoryUsage)) {
    if (size > memoryThreshold) {
      memoryLeaks.push({
        location: category,
        size,
        description: `High memory usage in ${category}`,
      });
    }
  }

  // Generate recommendations
  if (totalUsed > memoryThreshold) {
    recommendations.push(`High memory usage: ${Math.round(totalUsed / 1024 / 1024)}MB`);
    recommendations.push('Consider cleaning up unused references and subscriptions.');
  }
  if (memoryLeaks.length > 0) {
    recommendations.push(`Potential memory leaks detected in: ${memoryLeaks.map(l => l.location).join(', ')}`);
    recommendations.push('Check for event listeners, timers, or subscriptions that are not being cleaned up.');
  }

  return {
    totalUsed,
    peakUsed,
    byCategory: data.memoryUsage,
    memoryLeaks,
    recommendations,
  };
}

/**
 * Analyze compile time
 */
export function analyzeCompileTime(
  data: {
    totalTime: number;
    lexerTime: number;
    parserTime: number;
    transformerTime: number;
    optimizerTime: number;
    codegenTime: number;
    fileTimes: Record<string, number>;
  },
  options: AnalyzerOptions = {}
): CompileTimeReport {
  const recommendations: string[] = [];
  const slowThreshold = options.slowThreshold || 100; // 100ms per file

  // Find slow files
  const slowFiles: Array<{ file: string; time: number }> = [];
  for (const [file, time] of Object.entries(data.fileTimes)) {
    if (time > slowThreshold) {
      slowFiles.push({ file, time });
    }
  }

  // Generate recommendations
  if (data.totalTime > 1000) {
    recommendations.push(`Total compile time: ${data.totalTime}ms`);
    recommendations.push('Consider splitting large files or using incremental compilation.');
  }
  if (slowFiles.length > 0) {
    recommendations.push(`Slow files: ${slowFiles.map(f => f.file).join(', ')}`);
    recommendations.push('Consider reducing the complexity of these files.');
  }

  return {
    totalTime: data.totalTime,
    lexerTime: data.lexerTime,
    parserTime: data.parserTime,
    transformerTime: data.transformerTime,
    optimizerTime: data.optimizerTime,
    codegenTime: data.codegenTime,
    fileTimes: data.fileTimes,
    slowFiles,
    recommendations,
  };
}

/**
 * Analyze bundle size
 */
export function analyzeBundleSize(
  data: {
    totalSize: number;
    gzipSize: number;
    chunks: Array<{ name: string; size: number }>;
  },
  options: AnalyzerOptions = {}
): BundleReport {
  const recommendations: string[] = [];
  const totalSize = data.totalSize;
  const gzipSize = data.gzipSize;

  // Find largest chunks
  const sortedChunks = [...data.chunks].sort((a, b) => b.size - a.size);
  const largestChunks = sortedChunks.slice(0, 5).map(chunk => ({
    name: chunk.name,
    size: chunk.size,
    percentage: (chunk.size / totalSize) * 100,
  }));

  // Find duplicate modules (simulated)
  const duplicateModules: Array<{ name: string; occurrences: number; size: number }> = [];

  // Generate recommendations
  if (totalSize > 1024 * 1024) {
    recommendations.push(`Total bundle size: ${Math.round(totalSize / 1024)}KB`);
    recommendations.push('Consider code splitting or tree shaking.');
  }
  if (largestChunks.length > 0 && largestChunks[0].percentage > 50) {
    recommendations.push(`Large chunk: ${largestChunks[0].name} (${Math.round(largestChunks[0].percentage)}%)`);
    recommendations.push('Consider splitting this chunk into smaller pieces.');
  }

  return {
    totalSize,
    gzipSize,
    chunkCount: data.chunks.length,
    largestChunks,
    duplicateModules,
    recommendations,
  };
}