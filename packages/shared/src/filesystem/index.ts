/**
 * File system utilities for internal use
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const fsPromises = fs.promises;

export interface FileSystemOptions {
  /** Base directory */
  baseDir?: string;

  /** Create directories if they don't exist */
  createIfMissing?: boolean;

  /** Enable debug logging */
  debug?: boolean;
}

export interface FileEntry {
  /** File name */
  name: string;

  /** Full path */
  path: string;

  /** Relative path from base */
  relative: string;

  /** File extension */
  ext: string;

  /** Is directory */
  isDirectory: boolean;

  /** Is file */
  isFile: boolean;

  /** File size in bytes */
  size: number;

  /** Last modified time */
  modified: Date;

  /** Created time */
  created: Date;
}

export interface FileStats {
  /** File size in bytes */
  size: number;

  /** Is directory */
  isDirectory: boolean;

  /** Is file */
  isFile: boolean;

  /** Is symbolic link */
  isSymbolicLink: boolean;

  /** Last modified time */
  modified: Date;

  /** Created time */
  created: Date;

  /** Last accessed time */
  accessed: Date;
}

export interface WatchEvent {
  /** Event type */
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';

  /** File path */
  path: string;

  /** File name */
  name: string;

  /** Event timestamp */
  timestamp: number;
}

export interface WatchOptions {
  /** Ignore patterns */
  ignore?: string | string[] | RegExp;

  /** Enable recursive watching */
  recursive?: boolean;

  /** Debounce delay in milliseconds */
  debounce?: number;
}

export interface GlobOptions {
  /** Enable recursive search */
  recursive?: boolean;

  /** Include directories */
  includeDirectories?: boolean;

  /** Absolute paths */
  absolute?: boolean;

  /** Ignore patterns */
  ignore?: string | string[] | RegExp;
}

export class FileSystem {
  private baseDir: string;
  private createIfMissing: boolean;
  private debug: boolean;

  constructor(options: FileSystemOptions = {}) {
    this.baseDir = options.baseDir || process.cwd();
    this.createIfMissing = options.createIfMissing || false;
    this.debug = options.debug || false;
  }

  /**
   * Read a file
   */
  async readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    const fullPath = this.resolve(filePath);
    if (this.debug) {
      console.log(`[fs] Reading file: ${fullPath}`);
    }
    return fsPromises.readFile(fullPath, encoding);
  }

  /**
   * Read a file as buffer
   */
  async readFileBuffer(filePath: string): Promise<Buffer> {
    const fullPath = this.resolve(filePath);
    return fsPromises.readFile(fullPath);
  }

  /**
   * Write a file
   */
  async writeFile(filePath: string, content: string | Buffer, encoding: BufferEncoding = 'utf-8'): Promise<void> {
    const fullPath = this.resolve(filePath);
    if (this.debug) {
      console.log(`[fs] Writing file: ${fullPath}`);
    }
    if (this.createIfMissing) {
      await this.mkdir(path.dirname(fullPath), { recursive: true });
    }
    return fsPromises.writeFile(fullPath, content, encoding);
  }

  /**
   * Check if a file exists
   */
  async exists(filePath: string): Promise<boolean> {
    const fullPath = this.resolve(filePath);
    try {
      await fsPromises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a directory
   */
  async mkdir(dirPath: string, options: { recursive?: boolean } = {}): Promise<void> {
    const fullPath = this.resolve(dirPath);
    if (this.debug) {
      console.log(`[fs] Creating directory: ${fullPath}`);
    }
    return fsPromises.mkdir(fullPath, { recursive: options.recursive || false });
  }

  /**
   * Read directory contents
   */
  async readdir(dirPath: string, options: { withFileTypes?: boolean } = {}): Promise<FileEntry[]> {
    const fullPath = this.resolve(dirPath);
    if (this.debug) {
      console.log(`[fs] Reading directory: ${fullPath}`);
    }

    const entries = await fsPromises.readdir(fullPath, { withFileTypes: true });
    const result: FileEntry[] = [];

    for (const entry of entries) {
      const fullEntryPath = path.join(fullPath, entry.name);
      const stats = await this.stats(fullEntryPath);

      result.push({
        name: entry.name,
        path: fullEntryPath,
        relative: path.relative(this.baseDir, fullEntryPath),
        ext: path.extname(entry.name),
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
        size: stats.size,
        modified: stats.modified,
        created: stats.created,
      });
    }

    return result;
  }

  /**
   * Remove a file or directory
   */
  async remove(targetPath: string, options: { recursive?: boolean } = {}): Promise<void> {
    const fullPath = this.resolve(targetPath);
    if (this.debug) {
      console.log(`[fs] Removing: ${fullPath}`);
    }

    const stats = await this.stats(fullPath);
    if (stats.isDirectory) {
      return fsPromises.rm(fullPath, { recursive: options.recursive || true });
    }
    return fsPromises.unlink(fullPath);
  }

  /**
   * Copy a file or directory
   */
  async copy(source: string, destination: string, options: { overwrite?: boolean } = {}): Promise<void> {
    const fullSource = this.resolve(source);
    const fullDest = this.resolve(destination);
    if (this.debug) {
      console.log(`[fs] Copying: ${fullSource} -> ${fullDest}`);
    }

    if (this.createIfMissing) {
      await this.mkdir(path.dirname(fullDest), { recursive: true });
    }

    const stats = await this.stats(fullSource);
    if (stats.isDirectory) {
      // Recursively copy directory
      const entries = await this.readdir(fullSource);
      for (const entry of entries) {
        const sourcePath = entry.path;
        const destPath = path.join(fullDest, entry.name);
        await this.copy(sourcePath, destPath, options);
      }
    } else {
      await fsPromises.copyFile(fullSource, fullDest, options.overwrite ? 0 : fs.constants.COPYFILE_EXCL);
    }
  }

  /**
   * Move a file or directory
   */
  async move(source: string, destination: string): Promise<void> {
    const fullSource = this.resolve(source);
    const fullDest = this.resolve(destination);
    if (this.debug) {
      console.log(`[fs] Moving: ${fullSource} -> ${fullDest}`);
    }

    if (this.createIfMissing) {
      await this.mkdir(path.dirname(fullDest), { recursive: true });
    }

    return fsPromises.rename(fullSource, fullDest);
  }

  /**
   * Get file stats
   */
  async stats(targetPath: string): Promise<FileStats> {
    const fullPath = this.resolve(targetPath);
    const stats = await fsPromises.stat(fullPath);

    return {
      size: stats.size,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      isSymbolicLink: stats.isSymbolicLink(),
      modified: stats.mtime,
      created: stats.birthtime,
      accessed: stats.atime,
    };
  }

  /**
   * Resolve a path
   */
  resolve(targetPath: string): string {
    if (path.isAbsolute(targetPath)) {
      return targetPath;
    }
    return path.join(this.baseDir, targetPath);
  }

  /**
   * Get directory name
   */
  dirname(targetPath: string): string {
    return path.dirname(targetPath);
  }

  /**
   * Get base name
   */
  basename(targetPath: string, ext?: string): string {
    return path.basename(targetPath, ext);
  }

  /**
   * Get file extension
   */
  extname(targetPath: string): string {
    return path.extname(targetPath);
  }

  /**
   * Join paths
   */
  join(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
   * Normalize a path
   */
  normalize(targetPath: string): string {
    return path.normalize(targetPath);
  }

  /**
   * Check if a path is absolute
   */
  isAbsolute(targetPath: string): boolean {
    return path.isAbsolute(targetPath);
  }

  /**
   * Get relative path
   */
  relative(from: string, to: string): string {
    return path.relative(from, to);
  }

  /**
   * Glob search
   */
  async glob(pattern: string | string[], options: GlobOptions = {}): Promise<string[]> {
    const { glob: globSync } = await import('glob');
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const ignore = options.ignore ? (Array.isArray(options.ignore) ? options.ignore : [options.ignore]) : [];

    const results: string[] = [];

    for (const p of patterns) {
      const matches = await new Promise<string[]>((resolve, reject) => {
        globSync(p, {
          cwd: this.baseDir,
          absolute: options.absolute,
          ignore: ignore,
          nodir: !options.includeDirectories,
          dot: true,
        }, (err: any, matches: string[]) => {
          if (err) reject(err);
          else resolve(matches);
        });
      });
      results.push(...matches);
    }

    return results;
  }

  /**
   * Watch files
   */
  watch(
    targetPath: string,
    callback: (event: WatchEvent) => void,
    options: WatchOptions = {}
  ): fs.FSWatcher {
    const fullPath = this.resolve(targetPath);
    const recursive = options.recursive || false;
    const debounce = options.debounce || 0;
    let timeout: NodeJS.Timeout | null = null;
    const events: WatchEvent[] = [];

    const watcher = fs.watch(fullPath, { recursive }, (eventType, filename) => {
      if (!filename) return;

      // Check ignore patterns
      if (options.ignore) {
        const ignorePatterns = Array.isArray(options.ignore) ? options.ignore : [options.ignore];
        for (const pattern of ignorePatterns) {
          if (typeof pattern === 'string' && filename.includes(pattern)) {
            return;
          }
          if (pattern instanceof RegExp && pattern.test(filename)) {
            return;
          }
        }
      }

      const event: WatchEvent = {
        type: eventType as WatchEvent['type'],
        path: path.join(fullPath, filename),
        name: filename,
        timestamp: Date.now(),
      };

      if (debounce > 0) {
        events.push(event);
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
          const latest = events[events.length - 1];
          if (latest) {
            callback(latest);
          }
          events.length = 0;
        }, debounce);
      } else {
        callback(event);
      }
    });

    return watcher;
  }

  /**
   * Change base directory
   */
  chdir(newBaseDir: string): void {
    this.baseDir = newBaseDir;
  }

  /**
   * Get current base directory
   */
  cwd(): string {
    return this.baseDir;
  }
}

/**
 * Create a file system instance
 */
export function createFileSystem(options: FileSystemOptions = {}): FileSystem {
  return new FileSystem(options);
}

/**
 * Convenience functions
 */
export const readFile = (path: string, encoding?: BufferEncoding) => {
  const fs = createFileSystem();
  return fs.readFile(path, encoding);
};

export const writeFile = (path: string, content: string | Buffer, encoding?: BufferEncoding) => {
  const fs = createFileSystem({ createIfMissing: true });
  return fs.writeFile(path, content, encoding);
};

export const exists = (path: string) => {
  const fs = createFileSystem();
  return fs.exists(path);
};

export const mkdir = (path: string, options?: { recursive?: boolean }) => {
  const fs = createFileSystem({ createIfMissing: true });
  return fs.mkdir(path, options);
};

export const readdir = (path: string) => {
  const fs = createFileSystem();
  return fs.readdir(path);
};

export const remove = (path: string, options?: { recursive?: boolean }) => {
  const fs = createFileSystem();
  return fs.remove(path, options);
};

export const copy = (source: string, destination: string, options?: { overwrite?: boolean }) => {
  const fs = createFileSystem({ createIfMissing: true });
  return fs.copy(source, destination, options);
};

export const move = (source: string, destination: string) => {
  const fs = createFileSystem({ createIfMissing: true });
  return fs.move(source, destination);
};

export const resolve = (path: string) => {
  const fs = createFileSystem();
  return fs.resolve(path);
};

export const dirname = (path: string) => path.dirname(path);
export const basename = (path: string, ext?: string) => path.basename(path, ext);
export const extname = (path: string) => path.extname(path);
export const join = (...paths: string[]) => path.join(...paths);
export const normalize = (path: string) => path.normalize(path);
export const isAbsolute = (path: string) => path.isAbsolute(path);
export const relative = (from: string, to: string) => path.relative(from, to);

export const glob = async (pattern: string | string[], options?: GlobOptions) => {
  const fs = createFileSystem();
  return fs.glob(pattern, options);
};

export const watch = (
  path: string,
  callback: (event: WatchEvent) => void,
  options?: WatchOptions
) => {
  const fs = createFileSystem();
  return fs.watch(path, callback, options);
};