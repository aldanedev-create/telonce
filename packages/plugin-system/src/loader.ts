/**
 * Plugin Loader - Loads plugins from various sources
 */

import { createRequire } from 'module';
import type { Plugin } from './types';
import type { PluginRegistry } from './registry';

// Use native require in CJS, or create standard ESM require fallback
const loaderRequire = typeof require !== 'undefined'
  ? require
  : createRequire(import.meta.url);

export interface LoaderOptions {
  /** Plugin registry */
  registry: PluginRegistry;

  /** Base directory for loading */
  baseDir?: string;

  /** Enable debug logging */
  debug?: boolean;
}

export interface LoaderResult {
  /** Loaded plugins */
  plugins: Plugin[];

  /** Failed plugins */
  failed: Array<{ name: string; error: string }>;

  /** Total found plugins */
  total: number;
}

/**
 * Lightweight semver version matching helper
 */
function satisfiesVersion(installed: string, required: string): boolean {
  if (!required || required === '*' || required === 'latest') return true;
  if (installed === required) return true;

  const cleanReq = required.trim();
  
  if (cleanReq.startsWith('>=')) {
    return compareVersions(installed, cleanReq.slice(2).trim()) >= 0;
  }
  if (cleanReq.startsWith('>')) {
    return compareVersions(installed, cleanReq.slice(1).trim()) > 0;
  }
  if (cleanReq.startsWith('<=')) {
    return compareVersions(installed, cleanReq.slice(2).trim()) <= 0;
  }
  if (cleanReq.startsWith('<')) {
    return compareVersions(installed, cleanReq.slice(1).trim()) < 0;
  }

  if (cleanReq.startsWith('^')) {
    return matchCaret(installed, cleanReq.slice(1).trim());
  }

  if (cleanReq.startsWith('~')) {
    return matchTilde(installed, cleanReq.slice(1).trim());
  }

  return compareVersions(installed, cleanReq) === 0;
}

function parseVersion(v: string): [number, number, number] {
  const parts = v.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function compareVersions(v1: string, v2: string): number {
  const [major1, minor1, patch1] = parseVersion(v1);
  const [major2, minor2, patch2] = parseVersion(v2);

  if (major1 !== major2) return major1 > major2 ? 1 : -1;
  if (minor1 !== minor2) return minor1 > minor2 ? 1 : -1;
  if (patch1 !== patch2) return patch1 > patch2 ? 1 : -1;
  return 0;
}

function matchCaret(installed: string, target: string): boolean {
  const [instMaj, instMin, instPat] = parseVersion(installed);
  const [targMaj, targMin, targPat] = parseVersion(target);

  if (instMaj !== targMaj) return false;
  if (targMaj === 0) {
    if (targMin === 0) {
      return instMin === 0 && instPat >= targPat;
    }
    return instMin === targMin && instPat >= targPat;
  }
  return compareVersions(installed, target) >= 0 && instMaj === targMaj;
}

function matchTilde(installed: string, target: string): boolean {
  const [instMaj, instMin, _] = parseVersion(installed);
  const [targMaj, targMin, __] = parseVersion(target);

  if (instMaj !== targMaj || instMin !== targMin) return false;
  return compareVersions(installed, target) >= 0;
}

export class PluginLoader {
  private registry: PluginRegistry;
  private baseDir: string;
  private debug: boolean;

  constructor(options: LoaderOptions) {
    this.registry = options.registry;
    this.baseDir = options.baseDir || process.cwd();
    this.debug = options.debug || false;
  }

  /**
   * Load a plugin from a module
   */
  async loadModule(modulePath: string): Promise<Plugin | null> {
    try {
      if (this.debug) {
        console.log(`[loader] Loading plugin from ${modulePath}`);
      }

      const module = await import(modulePath);
      const plugin = module.default || module;

      // Validate plugin structure
      if (!plugin || typeof plugin !== 'object') {
        throw new Error('Plugin must export an object');
      }

      if (!plugin.name) {
        throw new Error('Plugin must have a name');
      }

      if (!plugin.version) {
        throw new Error('Plugin must have a version');
      }

      return plugin as Plugin;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (this.debug) {
        console.error(`[loader] Failed to load plugin from ${modulePath}:`, message);
      }
      return null;
    }
  }

  /**
   * Load a plugin from a package name
   */
  async loadPackage(name: string): Promise<Plugin | null> {
    try {
      if (this.debug) {
        console.log(`[loader] Loading plugin package: ${name}`);
      }

      // Try to load the package using ESM-compatible require.resolve
      const packagePath = loaderRequire.resolve(name, { paths: [this.baseDir] });      
      return await this.loadModule(packagePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (this.debug) {
        console.error(`[loader] Failed to load package ${name}:`, message);
      }
      return null;
    }
  }

  /**
   * Load a plugin from a function
   */
  loadFunction(fn: (api: any) => void, name: string = 'anonymous'): Plugin {
    return {
      name,
      version: '0.0.0',
      hooks: {
        init: fn,
      },
    };
  }

  /**
   * Load multiple plugins from a list
   */
  async loadMany(
    sources: Array<string | (() => void)>
  ): Promise<LoaderResult> {
    const plugins: Plugin[] = [];
    const failed: Array<{ name: string; error: string }> = [];

    for (const source of sources) {
      try {
        let plugin: Plugin | null = null;

        if (typeof source === 'string') {
          // Try as package name
          plugin = await this.loadPackage(source);

          // If not found, try as file path
          if (!plugin) {
            plugin = await this.loadModule(source);
          }
        } else if (typeof source === 'function') {
          // Function-based plugin
          plugin = this.loadFunction(source);
        }

        if (plugin) {
          // Validate dependencies
          const deps = plugin.dependencies || [];
          for (const dep of deps) {
            if (!dep.optional) {
              // Check if dependency is available in registry
              const depPlugin = this.registry.get(dep.name);
              if (!depPlugin) {
                const error = `Missing required dependency: ${dep.name}@${dep.version}`;
                if (this.debug) {
                  console.error(`[loader] ${error}`);
                }
                failed.push({ name: plugin.name, error });
                plugin = null;
                break;
              }
              // Check version compatibility using semver ranges
              if (dep.version && !satisfiesVersion(depPlugin.version, dep.version)) {
                const error = `Dependency version mismatch: ${dep.name}@${dep.version} (found ${depPlugin.version})`;
                if (this.debug) {
                  console.error(`[loader] ${error}`);
                }
                failed.push({ name: plugin.name, error });
                plugin = null;
                break;
              }
            }
          }

          if (plugin) {
            plugins.push(plugin);
          }
        } else {
          failed.push({
            name: typeof source === 'string' ? source : 'anonymous',
            error: 'Plugin could not be loaded',
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failed.push({
          name: typeof source === 'string' ? source : 'anonymous',
          error: message,
        });
      }
    }

    return {
      plugins,
      failed,
      total: sources.length,
    };
  }

  /**
   * Load plugins from package.json
   */
  async loadFromPackageJson(): Promise<LoaderResult> {
    try {
      const packageJsonPath = `${this.baseDir}/package.json`;
      const packageJson = loaderRequire(packageJsonPath);
      const teloce = packageJson.teloce || {};

      if (!teloce.plugins || !Array.isArray(teloce.plugins)) {
        if (this.debug) {
          console.log(`[loader] No plugins configured under "teloce.plugins" in ${packageJsonPath}`);
        }
        return { plugins: [], failed: [], total: 0 };
      }

      return await this.loadMany(teloce.plugins);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (this.debug) {
        console.error(`[loader] Failed to load plugins from package.json:`, message);
      }
      return { plugins: [], failed: [{ name: 'package.json', error: message }], total: 0 };
    }
  }

  /**
   * Load plugins from configuration
   */
  async loadFromConfig(plugins: string[]): Promise<LoaderResult> {
    return await this.loadMany(plugins);
  }
}

/**
 * Create a plugin loader
 */
export function createPluginLoader(options: LoaderOptions): PluginLoader {
  return new PluginLoader(options);
}