/**
 * Plugin Loader - Loads plugins from various sources
 */

import type { Plugin, PluginManifest, PluginDependency } from './types';
import type { PluginRegistry } from './registry';

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

      // Try to load the package
      const packagePath = require.resolve(name, { paths: [this.baseDir] });
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
              // Check if dependency is available
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
              // Check version
              if (dep.version && depPlugin.version !== dep.version) {
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
      const packageJson = require(`${this.baseDir}/package.json`);
      const teloce = packageJson.teloce || {};

      if (!teloce.plugins || !Array.isArray(teloce.plugins)) {
        return { plugins: [], failed: [], total: 0 };
      }

      return await this.loadMany(teloce.plugins);
    } catch (error) {
      return { plugins: [], failed: [], total: 0 };
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