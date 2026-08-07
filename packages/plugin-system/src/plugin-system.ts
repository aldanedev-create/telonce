/**
 * Plugin System - Main entry point
 */

import type {
  Plugin,
  PluginAPI,
  PluginSystem as IPluginSystem,
  PluginLifecycle,
} from './types';
import { PluginRegistry, createPluginRegistry } from './registry';
import { HookSystem, createHookSystem, BuiltinHooks } from './hooks';
import { createPluginAPI } from './api';
import { PluginLoader, createPluginLoader } from './loader';

export interface PluginSystemOptions {
  /** Enable debug logging */
  debug?: boolean;

  /** Base directory for loading */
  baseDir?: string;

  /** Registry options */
  registry?: {
    allowDuplicates?: boolean;
    strictVersions?: boolean;
  };

  /** Initial plugins */
  plugins?: Array<Plugin | string | (() => void)>;
}

export class PluginSystem implements IPluginSystem {
  private registry: PluginRegistry;
  private hooks: HookSystem;
  private loader: PluginLoader;
  private config: Record<string, any> = {};
  private initialized: boolean = false;
  public state: PluginLifecycle = 'unloaded';
  private debug: boolean;

  constructor(options: PluginSystemOptions = {}) {
    this.debug = options.debug || false;

    // Create registry
    this.registry = createPluginRegistry(options.registry);

    // Create hook system
    this.hooks = createHookSystem(this.debug);

    // Create loader
    this.loader = createPluginLoader({
      registry: this.registry,
      baseDir: options.baseDir,
      debug: this.debug,
    });

    // Register built-in hooks
    this.registerBuiltinHooks();

    // Load initial plugins
    if (options.plugins) {
      this.loadPlugins(options.plugins);
    }
  }

  /**
   * Register built-in hooks
   */
  private registerBuiltinHooks(): void {
    // All built-in hooks are defined in BuiltinHooks constant
    // They can be used by any plugin
  }

  /**
   * Load plugins from various sources
   */
  private async loadPlugins(sources: Array<Plugin | string | (() => void)>): Promise<void> {
    const plugins: Plugin[] = [];

    for (const source of sources) {
      if (typeof source === 'string') {
        // Try to load as package or file
        const plugin = await this.loader.loadPackage(source);
        if (plugin) {
          plugins.push(plugin);
        }
      } else if (typeof source === 'function') {
        // Function-based plugin
        plugins.push(this.loader.loadFunction(source));
      } else {
        // Plugin object
        plugins.push(source);
      }
    }

    // Register all plugins
    for (const plugin of plugins) {
      this.use(plugin);
    }
  }

  /**
   * Register a plugin
   */
  use(plugin: Plugin | ((api: PluginAPI) => void)): void {
    let pluginObj: Plugin;

    if (typeof plugin === 'function') {
      pluginObj = this.loader.loadFunction(plugin);
    } else {
      pluginObj = plugin;
    }

    // Register the plugin
    this.registry.register(pluginObj);

    // Create API for the plugin
    const api = createPluginAPI({
      registry: this.registry,
      hooks: this.hooks,
      pluginName: pluginObj.name,
      config: pluginObj.config?.defaults || {},
    });

    // Initialize plugin
    if (pluginObj.hooks?.init) {
      try {
        pluginObj.hooks.init(api);
      } catch (error) {
        console.error(`[plugin-system] Error initializing ${pluginObj.name}:`, error);
      }
    }

    if (this.debug) {
      console.log(`[plugin-system] Plugin "${pluginObj.name}" v${pluginObj.version} loaded`);
    }

    this.state = 'loaded';
  }

  /**
   * Unregister a plugin
   */
  unuse(name: string): void {
    const plugin = this.registry.get(name);
    if (!plugin) return;

    // Destroy plugin
    if (plugin.hooks?.destroy) {
      try {
        plugin.hooks.destroy();
      } catch (error) {
        console.error(`[plugin-system] Error destroying ${name}:`, error);
      }
    }

    // Remove hooks from this plugin
    this.hooks.clearPlugin(name);

    // Unregister from registry
    this.registry.unregister(name);

    if (this.debug) {
      console.log(`[plugin-system] Plugin "${name}" unloaded`);
    }
  }

  /**
   * Get a plugin by name
   */
  get(name: string): Plugin | undefined {
    return this.registry.get(name);
  }

  /**
   * Get all registered plugins
   */
  getAll(): Plugin[] {
    return this.registry.getAll();
  }

  /**
   * Check if a plugin is registered
   */
  has(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * Get plugin API
   */
  getAPI(): PluginAPI {
    // Return a combined API for the system
    return createPluginAPI({
      registry: this.registry,
      hooks: this.hooks,
      pluginName: 'system',
      config: this.config,
    });
  }

  /**
   * Get hook system
   */
  getHooks(): HookSystem {
    return this.hooks;
  }

  /**
   * Get registry
   */
  getRegistry(): PluginRegistry {
    return this.registry;
  }

  /**
   * Initialize all plugins
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // Run init hooks
    await this.hooks.runSideEffect(BuiltinHooks.INIT, this.getAPI());

    this.initialized = true;
    this.state = 'initialized';

    if (this.debug) {
      console.log('[plugin-system] All plugins initialized');
    }
  }

  /**
   * Destroy all plugins
   */
  async destroy(): Promise<void> {
    // Run destroy hooks
    await this.hooks.runSideEffect(BuiltinHooks.DESTROY);

    // Clear all hooks
    this.hooks.clear();

    // Clear registry
    this.registry.clear();

    this.initialized = false;
    this.state = 'destroyed';

    if (this.debug) {
      console.log('[plugin-system] All plugins destroyed');
    }
  }

  /**
   * Get plugin state
   */
  getState(): PluginLifecycle {
    return this.state;
  }

  /**
   * Get registry stats
   */
  getStats() {
    return this.registry.stats;
  }
}

/**
 * Create a plugin system
 */
export function createPluginSystem(options: PluginSystemOptions = {}): PluginSystem {
  return new PluginSystem(options);
}