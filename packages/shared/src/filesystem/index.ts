/**
 * File system utilities for internal use
 */

import * as fs from 'fs';
import * as path from 'path';

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
    await fsPromises.writeFile(fullPath, content, encoding);
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
    await fsPromises.mkdir(fullPath, { recursive: options.recursive || false });
  }

  /**
   * Read directory contents
   */
  async readdir(dirPath: string, _options: { withFileTypes?: boolean } = {}): Promise<FileEntry[]> {
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
      await fsPromises.rm(fullPath, { recursive: options.recursive || true });
      return;
    }
    await fsPromises.unlink(fullPath);
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

    await fsPromises.rename(fullSource, fullDest);
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
   * Glob search using built-in recursive file traversal
   */
  async glob(pattern: string | string[], options: GlobOptions = {}): Promise<string[]> {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const ignore = options.ignore ? (Array.isArray(options.ignore) ? options.ignore : [options.ignore]) : [];
    const results: string[] = [];

    try {
      const entries = await fsPromises.readdir(this.baseDir, { recursive: true, withFileTypes: true });

      for (const entry of entries) {
        if (!options.includeDirectories && entry.isDirectory()) {
          continue;
        }

        const parentPath = entry.parentPath || this.baseDir;
        const fullEntryPath = path.join(parentPath, entry.name);
        const relPath = path.relative(this.baseDir, fullEntryPath).replace(/\\/g, '/');

        let matched = false;
        for (const pat of patterns) {
          const regexPattern = pat
            .replace(/\./g, '\\.')
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*');
          const regex = new RegExp(`^${regexPattern}$`);

          if (regex.test(relPath) || regex.test(entry.name)) {
            matched = true;
            break;
          }
        }

        if (matched) {
          let ignored = false;
          for (const ign of ignore) {
            if (typeof ign === 'string' && relPath.includes(ign)) {
              ignored = true;
              break;
            }
            if (ign instanceof RegExp && ign.test(relPath)) {
              ignored = true;
              break;
            }
          }

          if (!ignored) {
            results.push(options.absolute ? fullEntryPath : relPath);
          }
        }
      }
    } catch {
      // Base directory might not exist yet
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
export const readFile = (filePath: string, encoding?: BufferEncoding) => {
  const fs = createFileSystem();
  return fs.readFile(filePath, encoding);
};

export const writeFile = (filePath: string, content: string | Buffer, encoding?: BufferEncoding) => {
  const fs = createFileSystem({ createIfMissing: true });
  return fs.writeFile(filePath, content, encoding);
};

export const exists = (filePath: string) => {
  const fs = createFileSystem();
  return fs.exists(filePath);
};

export const mkdir = (dirPath: string, options?: { recursive?: boolean }) => {
  const fs = createFileSystem({ createIfMissing: true });
  return fs.mkdir(dirPath, options);
};

export const readdir = (dirPath: string) => {
  const fs = createFileSystem();
  return fs.readdir(dirPath);
};

export const remove = (targetPath: string, options?: { recursive?: boolean }) => {
  const fs = createFileSystem();
  return fs.remove(targetPath, options);
};

export const copy = (source: string, destination: string, options?: { overwrite?: boolean }) => {
  const fs = createFileSystem({ createIfMissing: true });
  return fs.copy(source, destination, options);
};

export const move = (source: string, destination: string) => {
  const fs = createFileSystem({ createIfMissing: true });
  return fs.move(source, destination);
};

export const resolve = (targetPath: string) => {
  const fs = createFileSystem();
  return fs.resolve(targetPath);
};

export const dirname = (p: string) => path.dirname(p);
export const basename = (p: string, ext?: string) => path.basename(p, ext);
export const extname = (p: string) => path.extname(p);
export const join = (...paths: string[]) => path.join(...paths);
export const normalize = (p: string) => path.normalize(p);
export const isAbsolute = (p: string) => path.isAbsolute(p);
export const relative = (from: string, to: string) => path.relative(from, to);

export const glob = async (pattern: string | string[], options?: GlobOptions) => {
  const fs = createFileSystem();
  return fs.glob(pattern, options);
};

export const watch = (
  targetPath: string,
  callback: (event: WatchEvent) => void,
  options?: WatchOptions
) => {
  const fs = createFileSystem();
  return fs.watch(targetPath, callback, options);
};