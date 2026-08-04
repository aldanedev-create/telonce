/**
 * Plugin System - Main entry point
 */

import type {
  Plugin,
  PluginAPI,
  PluginSystem as IPluginSystem,
  PluginLifecycle,
  PluginContext,
} from './types';
import { PluginRegistry, createPluginRegistry } from './registry';
import { HookSystem, createHookSystem, BuiltinHooks } from './hooks';
import { PluginAPI as APIImpl, createPluginAPI } from './api';
import { PluginLoader, createPluginLoader, type LoaderOptions } from './loader';

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
  private state: PluginLifecycle = 'unloaded';
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


 @teloce/plugin-system

> Core plugin system for Teloce - extend the template engine with custom directives, filters, components, and more

The Teloce Plugin System is a **small-scale, tech-neutral** plugin architecture that allows developers to extend the template engine's functionality.

---

## Features

- **🔌 Tech-Neutral** - Works with CDN, npm, and build tools
- **📦 Small Footprint** - Lightweight plugin API
- **🧩 Composable** - Multiple plugins work together
- **📋 Versioned** - Plugins declare compatibility
- **🔄 Lifecycle Hooks** - Before/after compile, render, etc.
- **📝 TypeScript Support** - Full type definitions

---

## Installation

```bash
npm install @teloce/plugin-system
Quick Start
Define a Plugin
javascript
// my-plugin.js
export default {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'Adds custom directives and filters',
  
  // Custom directives
  directives: [
    {
      name: 'custom',
      transform: (node, context) => {
        // Transform the node
        return node;
      }
    }
  ],
  
  // Custom filters
  filters: [
    {
      name: 'reverse',
      transform: (value) => value.split('').reverse().join('')
    }
  ],
  
  // Lifecycle hooks
  hooks: {
    init: (api) => {
      console.log('Plugin initialized!');
      api.registerHelper('hello', () => 'Hello from plugin!');
    },
    beforeCompile: (ast, context) => {
      // Modify AST before compilation
      return ast;
    }
  }
};
Use the Plugin
javascript
import { createPluginSystem } from '@teloce/plugin-system';
import myPlugin from './my-plugin';

const system = createPluginSystem({
  debug: true,
  plugins: [myPlugin]
});

// Initialize
await system.init();

// Use the plugin
const api = system.getAPI();
console.log(api.getHelpers().hello()); // Hello from plugin!
Plugin Capabilities
Custom Directives
javascript
directives: [
  {
    name: 'animate',
    priority: 10,
    transform: (node, context) => {
      // Add animation logic
      return node;
    },
    render: (node, context) => {
      // Render with animation
      return node;
    }
  }
]
Custom Filters
javascript
filters: [
  {
    name: 'markdown',
    transform: (value) => {
      // Convert Markdown to HTML
      return marked(value);
    }
  }
]
Custom Components
javascript
components: [
  {
    name: 'Chart',
    component: ChartComponent,
    description: 'Data visualization component'
  }
]
AST Transforms
javascript
transforms: [
  {
    name: 'auto-import',
    priority: 5,
    transform: (ast) => {
      // Add imports to AST
      return ast;
    }
  }
]
Helpers
javascript
helpers: {
  formatDate: (date) => date.toLocaleDateString(),
  sum: (a, b) => a + b
}
Lifecycle Hooks
Hook	When It Runs
init	Plugin is first loaded
destroy	Plugin is removed
beforeCompile	Before template compilation
afterCompile	After template compilation
beforeRender	Before DOM rendering
afterRender	After DOM rendering
transformNode	For each AST node
complete	Compilation complete
API Reference
PluginSystem
Method	Description
use(plugin)	Register a plugin
unuse(name)	Unregister a plugin
get(name)	Get a plugin by name
getAll()	Get all plugins
has(name)	Check if plugin exists
getAPI()	Get plugin API
init()	Initialize all plugins
destroy()	Destroy all plugins
PluginAPI
Method	Description
registerDirective(directive)	Register a custom directive
registerFilter(filter)	Register a custom filter
registerComponent(component)	Register a custom component
registerHelper(name, value)	Register a helper
registerHook(name, handler)	Register a lifecycle hook
getConfig(key)	Get plugin configuration
setConfig(key, value)	Set plugin configuration
hasDirective(name)	Check if directive exists
hasFilter(name)	Check if filter exists
hasComponent(name)	Check if component exists
Plugin Loading
From npm Package
json
// package.json
{
  "name": "@teloce/plugin-markdown",
  "version": "1.0.0",
  "teloce": {
    "plugin": true
  }
}
From CDN
html
<script src="https://cdn.teloce.dev/plugins/markdown.min.js"></script>
Programmatically
javascript
system.use({
  name: 'my-plugin',
  version: '1.0.0',
  // ...
});
License
MIT