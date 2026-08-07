/**
 * Plugin API - Provides API for plugins to interact with the system
 */

import type {
  PluginAPI as IPluginAPI,
  Directive,
  Filter,
  Component,
  Transform,
  HookHandler,
} from './types';
import type { PluginRegistry } from './registry';
import type { HookSystem } from './hooks';

export interface APIOptions {
  registry: PluginRegistry;
  hooks: HookSystem;
  pluginName: string;
  config?: Record<string, any>;
}

export class PluginAPI implements IPluginAPI {
  private registry: PluginRegistry;
  private hooks: HookSystem;
  private pluginName: string;
  private config: Record<string, any>;

  constructor(options: APIOptions) {
    this.registry = options.registry;
    this.hooks = options.hooks;
    this.pluginName = options.pluginName;
    this.config = options.config || {};
  }

  /**
   * Register a custom directive
   */
  registerDirective(directive: Directive): void {
    this.registry.registerDirective(directive);
  }

  /**
   * Register a custom filter
   */
  registerFilter(filter: Filter): void {
    this.registry.registerFilter(filter);
  }

  /**
   * Register a custom component
   */
  registerComponent(component: Component): void {
    this.registry.registerComponent(component);
  }

  /**
   * Register a transform
   */
  registerTransform(transform: Transform): void {
    this.registry.registerTransform(transform);
  }

  /**
   * Register a helper
   */
  registerHelper(name: string, value: any): void {
    this.registry.registerHelper(name, value);
  }

  /**
   * Register a hook
   */
  registerHook(name: string, handler: HookHandler, priority: number = 0): void {
    this.hooks.register({
      name,
      handler,
      priority,
      plugin: this.pluginName,
    });
  }

  /**
   * Get plugin configuration
   */
  getConfig<T = any>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let value: any = this.config;

    for (const k of keys) {
      if (value === undefined || value === null) {
        return defaultValue as T;
      }
      value = value[k];
    }

    return value !== undefined ? value : defaultValue as T;
  }

  /**
   * Set plugin configuration
   */
  setConfig(key: string, value: any): void {
    const keys = key.split('.');
    let target: any = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]] || typeof target[keys[i]] !== 'object') {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }

    target[keys[keys.length - 1]] = value;
  }

  /**
   * Get all registered directives
   */
  getDirectives(): Directive[] {
    return this.registry.getDirectives();
  }

  /**
   * Get all registered filters
   */
  getFilters(): Filter[] {
    return this.registry.getFilters();
  }

  /**
   * Get all registered components
   */
  getComponents(): Component[] {
    return this.registry.getComponents();
  }

  /**
   * Check if a directive exists
   */
  hasDirective(name: string): boolean {
    return this.registry.hasDirective(name);
  }

  /**
   * Check if a filter exists
   */
  hasFilter(name: string): boolean {
    return this.registry.hasFilter(name);
  }

  /**
   * Check if a component exists
   */
  hasComponent(name: string): boolean {
    return this.registry.hasComponent(name);
  }

  /**
   * Log a message
   */
  log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const prefix = `[plugin:${this.pluginName}]`;
    const consoleMap = {
      info: console.log,
      warn: console.warn,
      error: console.error,
    };

    consoleMap[level](`${prefix} ${message}`);
  }

  /**
   * Get the plugin name
   */
  get name(): string {
    return this.pluginName;
  }
}

/**
 * Create a plugin API
 */
export function createPluginAPI(options: APIOptions): PluginAPI {
  return new PluginAPI(options);
}