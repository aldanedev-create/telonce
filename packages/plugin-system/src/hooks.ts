/**
 * Hook System - Manages plugin hooks
 */

import type { HookHandler, PluginContext } from './types';

export interface Hook {
  name: string;
  handler: HookHandler;
  priority: number;
  plugin: string;
}

export interface HookContext {
  plugin: string;
  [key: string]: any;
}

export interface HookRegistration {
  name: string;
  handler: HookHandler;
  priority?: number;
  plugin?: string;
}

export class HookSystem {
  private hooks: Map<string, Hook[]> = new Map();
  private debug: boolean = false;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  /**
   * Register a hook
   */
  register(registration: HookRegistration): void {
    const { name, handler, priority = 0, plugin = 'unknown' } = registration;

    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }

    const hook: Hook = { name, handler, priority, plugin };
    this.hooks.get(name)!.push(hook);

    // Sort by priority (higher first)
    this.hooks.get(name)!.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Unregister a hook
   */
  unregister(name: string, plugin?: string): void {
    const hooks = this.hooks.get(name);
    if (!hooks) return;

    if (plugin) {
      // Remove hooks from specific plugin
      this.hooks.set(
        name,
        hooks.filter(h => h.plugin !== plugin)
      );
    } else {
      // Remove all hooks with this name
      this.hooks.delete(name);
    }
  }

  /**
   * Run hooks in sequence (waterfall)
   */
  async runWaterfall<T>(
    name: string,
    value: T,
    context: PluginContext = { plugin: 'system' }
  ): Promise<T> {
    const hooks = this.hooks.get(name) || [];
    let result = value;

    for (const hook of hooks) {
      try {
        if (this.debug) {
          console.log(`[hooks] Running ${name} from ${hook.plugin}`);
        }
        result = await hook.handler(result, context);
      } catch (error) {
        console.error(`[hooks] Error in ${name} from ${hook.plugin}:`, error);
        throw error;
      }
    }

    return result;
  }

  /**
   * Run hooks in parallel
   */
  async runParallel<T>(
    name: string,
    value: T,
    context: PluginContext = { plugin: 'system' }
  ): Promise<T[]> {
    const hooks = this.hooks.get(name) || [];
    const results: T[] = [];

    const promises = hooks.map(async (hook) => {
      try {
        if (this.debug) {
          console.log(`[hooks] Running ${name} from ${hook.plugin}`);
        }
        return await hook.handler(value, context);
      } catch (error) {
        console.error(`[hooks] Error in ${name} from ${hook.plugin}:`, error);
        return value;
      }
    });

    const hookResults = await Promise.all(promises);
    results.push(...hookResults);

    return results;
  }

  /**
   * Run hooks for each item in an array
   */
  async runEach<T>(
    name: string,
    items: T[],
    context: PluginContext = { plugin: 'system' }
  ): Promise<T[]> {
    const hooks = this.hooks.get(name) || [];
    let results = [...items];

    for (const hook of hooks) {
      try {
        if (this.debug) {
          console.log(`[hooks] Running ${name} from ${hook.plugin}`);
        }
        results = await hook.handler(results, context);
      } catch (error) {
        console.error(`[hooks] Error in ${name} from ${hook.plugin}:`, error);
      }
    }

    return results;
  }

  /**
   * Run hooks with side effects (no return value)
   */
  async runSideEffect(
    name: string,
    ...args: any[]
  ): Promise<void> {
    const hooks = this.hooks.get(name) || [];

    for (const hook of hooks) {
      try {
        if (this.debug) {
          console.log(`[hooks] Running ${name} from ${hook.plugin}`);
        }
        await hook.handler(...args);
      } catch (error) {
        console.error(`[hooks] Error in ${name} from ${hook.plugin}:`, error);
      }
    }
  }

  /**
   * Check if hooks exist for a name
   */
  has(name: string): boolean {
    return this.hooks.has(name) && this.hooks.get(name)!.length > 0;
  }

  /**
   * Get all hook names
   */
  getNames(): string[] {
    return Array.from(this.hooks.keys());
  }

  /**
   * Get hooks for a name
   */
  get(name: string): Hook[] {
    return this.hooks.get(name) || [];
  }

  /**
   * Clear all hooks
   */
  clear(): void {
    this.hooks.clear();
  }

  /**
   * Clear hooks for a plugin
   */
  clearPlugin(plugin: string): void {
    for (const [name, hooks] of this.hooks) {
      this.hooks.set(
        name,
        hooks.filter(h => h.plugin !== plugin)
      );
    }
  }
}

/**
 * Create a hook system
 */
export function createHookSystem(debug: boolean = false): HookSystem {
  return new HookSystem(debug);
}

/**
 * Built-in hook names
 */
export const BuiltinHooks = {
  /** Before compilation starts */
  BEFORE_COMPILE: 'beforeCompile',

  /** After compilation completes */
  AFTER_COMPILE: 'afterCompile',

  /** Before rendering */
  BEFORE_RENDER: 'beforeRender',

  /** After rendering */
  AFTER_RENDER: 'afterRender',

  /** Transform an AST node */
  TRANSFORM_NODE: 'transformNode',

  /** Compilation complete */
  COMPLETE: 'complete',

  /** Plugin initialization */
  INIT: 'init',

  /** Plugin destruction */
  DESTROY: 'destroy',
} as const;