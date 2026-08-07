/**
 * Plugin Registry - Manages registered plugins safely with complete cleanup and encapsulation
 */

import type { Plugin, Directive, Filter, Component, Transform } from './types';

export interface RegistryOptions {
  /** Allow duplicate plugin names */
  allowDuplicates?: boolean;

  /** Strict version checking */
  strictVersions?: boolean;
}

export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private directives: Map<string, Directive> = new Map();
  private filters: Map<string, Filter> = new Map();
  private components: Map<string, Component> = new Map();
  private transforms: Map<string, Transform> = new Map();
  private helpers: Map<string, any> = new Map();
  private options: RegistryOptions;

  constructor(options: RegistryOptions = {}) {
    this.options = {
      allowDuplicates: false,
      strictVersions: true,
      ...options,
    };
  }

  /**
   * Register a plugin
   */
  register(plugin: Plugin): void {
    if (!this.options.allowDuplicates && this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    // Validate version
    if (this.options.strictVersions && !plugin.version) {
      throw new Error(`Plugin "${plugin.name}" must specify a version`);
    }

    this.plugins.set(plugin.name, plugin);

    // Register directives
    if (plugin.directives) {
      for (const directive of plugin.directives) {
        this.registerDirective(directive);
      }
    }

    // Register filters
    if (plugin.filters) {
      for (const filter of plugin.filters) {
        this.registerFilter(filter);
      }
    }

    // Register components
    if (plugin.components) {
      for (const component of plugin.components) {
        this.registerComponent(component);
      }
    }

    // Register transforms
    if (plugin.transforms) {
      for (const transform of plugin.transforms) {
        this.registerTransform(transform);
      }
    }

    // Register helpers
    if (plugin.helpers) {
      for (const [key, value] of Object.entries(plugin.helpers)) {
        this.registerHelper(key, value);
      }
    }
  }

  /**
   * Unregister a plugin with full cleanup for directives, filters, components, transforms, and helpers
   */
  unregister(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) return false;

    // Remove all registered directives
    if (plugin.directives) {
      for (const directive of plugin.directives) {
        this.directives.delete(directive.name);
      }
    }
    // Remove all registered filters
    if (plugin.filters) {
      for (const filter of plugin.filters) {
        this.filters.delete(filter.name);
      }
    }
    // Remove all registered components
    if (plugin.components) {
      for (const component of plugin.components) {
        this.components.delete(component.name);
      }
    }
    // Remove all registered transforms
    if (plugin.transforms) {
      for (const transform of plugin.transforms) {
        this.transforms.delete(transform.name);
      }
    }
    // Remove all registered helpers
    if (plugin.helpers) {
      for (const key of Object.keys(plugin.helpers)) {
        this.helpers.delete(key);
      }
    }

    this.plugins.delete(name);
    return true;
  }

  /**
   * Get a plugin by name
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if a plugin is registered
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Register a directive
   */
  registerDirective(directive: Directive): void {
    if (this.directives.has(directive.name)) {
      console.warn(`Directive "${directive.name}" is already registered. Overwriting.`);
    }
    this.directives.set(directive.name, directive);
  }

  /**
   * Get a directive by name
   */
  getDirective(name: string): Directive | undefined {
    return this.directives.get(name);
  }

  /**
   * Get all directives
   */
  getDirectives(): Directive[] {
    return Array.from(this.directives.values()).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Check if a directive exists
   */
  hasDirective(name: string): boolean {
    return this.directives.has(name);
  }

  /**
   * Register a filter
   */
  registerFilter(filter: Filter): void {
    if (this.filters.has(filter.name)) {
      console.warn(`Filter "${filter.name}" is already registered. Overwriting.`);
    }
    this.filters.set(filter.name, filter);
  }

  /**
   * Get a filter by name
   */
  getFilter(name: string): Filter | undefined {
    return this.filters.get(name);
  }

  /**
   * Get all filters
   */
  getFilters(): Filter[] {
    return Array.from(this.filters.values());
  }

  /**
   * Check if a filter exists
   */
  hasFilter(name: string): boolean {
    return this.filters.has(name);
  }

  /**
   * Register a component
   */
  registerComponent(component: Component): void {
    if (this.components.has(component.name)) {
      console.warn(`Component "${component.name}" is already registered. Overwriting.`);
    }
    this.components.set(component.name, component);
  }

  /**
   * Get a component by name
   */
  getComponent(name: string): Component | undefined {
    return this.components.get(name);
  }

  /**
   * Get all components
   */
  getComponents(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Check if a component exists
   */
  hasComponent(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * Register a transform
   */
  registerTransform(transform: Transform): void {
    if (this.transforms.has(transform.name)) {
      console.warn(`Transform "${transform.name}" is already registered. Overwriting.`);
    }
    this.transforms.set(transform.name, transform);
  }

  /**
   * Get a transform by name
   */
  getTransform(name: string): Transform | undefined {
    return this.transforms.get(name);
  }

  /**
   * Get all transforms
   */
  getTransforms(): Transform[] {
    return Array.from(this.transforms.values()).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Register a helper
   */
  registerHelper(name: string, value: any): void {
    if (this.helpers.has(name)) {
      console.warn(`Helper "${name}" is already registered. Overwriting.`);
    }
    this.helpers.set(name, value);
  }

  /**
   * Get a helper by name
   */
  getHelper(name: string): any {
    return this.helpers.get(name);
  }

  /**
   * Get all helpers as a cloned Map view to protect internal state
   */
  getHelpers(): Map<string, any> {
    return new Map(this.helpers);
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.plugins.clear();
    this.directives.clear();
    this.filters.clear();
    this.components.clear();
    this.transforms.clear();
    this.helpers.clear();
  }

  /**
   * Get registry size
   */
  get size(): number {
    return this.plugins.size;
  }

  /**
   * Get registry stats
   */
  get stats(): {
    plugins: number;
    directives: number;
    filters: number;
    components: number;
    transforms: number;
    helpers: number;
  } {
    return {
      plugins: this.plugins.size,
      directives: this.directives.size,
      filters: this.filters.size,
      components: this.components.size,
      transforms: this.transforms.size,
      helpers: this.helpers.size,
    };
  }
}

/**
 * Create a plugin registry
 */
export function createPluginRegistry(options: RegistryOptions = {}): PluginRegistry {
  return new PluginRegistry(options);
}