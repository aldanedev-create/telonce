/**
 * Plugin System - Type Definitions
 */

import type { ASTNode } from '@teloce/compiler';
import type { HookSystem } from './hooks';
import type { PluginRegistry } from './registry';

/**
 * Plugin definition
 */
export interface Plugin {
  /** Plugin name (must be unique) */
  name: string;

  /** Plugin version (semver) */
  version: string;

  /** Plugin description */
  description?: string;

  /** Plugin author */
  author?: string;

  /** License */
  license?: string;

  /** Plugin dependencies */
  dependencies?: PluginDependency[];

  /** Teloce compatibility version */
  teloce?: string;

  /** Custom directives */
  directives?: Directive[];

  /** Custom filters */
  filters?: Filter[];

  /** Custom components */
  components?: Component[];

  /** AST transforms */
  transforms?: Transform[];

  /** Helper functions */
  helpers?: Helpers;

  /** Lifecycle hooks */
  hooks?: Hooks;

  /** Plugin configuration */
  config?: PluginConfig;
}

/**
 * Plugin manifest (for package.json)
 */
export interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  teloce?: {
    version: string;
    plugins?: string[];
  };
  exports?: {
    '.'?: string;
    './plugin'?: string;
  };
}

/**
 * Plugin dependency
 */
export interface PluginDependency {
  name: string;
  version: string;
  optional?: boolean;
}

/**
 * Plugin configuration schema
 */
export interface PluginConfig {
  /** JSON schema for configuration */
  schema?: Record<string, any>;

  /** Default configuration values */
  defaults?: Record<string, any>;
}

/**
 * Directive definition
 */
export interface Directive {
  /** Directive name (without @) */
  name: string;

  /** Priority (higher = runs first) */
  priority?: number;

  /** Transform directive node */
  transform?: (node: any, context: PluginContext) => any;

  /** Render directive */
  render?: (node: any, context: PluginContext) => any;

  /** Validate directive usage */
  validate?: (node: any, context: PluginContext) => string[];

  /** Description for documentation */
  description?: string;

  /** Example usage */
  example?: string;
}

/**
 * Filter definition
 */
export interface Filter {
  /** Filter name (without |) */
  name: string;

  /** Transform function */
  transform: (value: any, ...args: any[]) => any;

  /** Description for documentation */
  description?: string;

  /** Example usage */
  example?: string;
}

/**
 * Component definition
 */
export interface Component {
  /** Component name */
  name: string;

  /** Component definition */
  component: any;

  /** Description for documentation */
  description?: string;
}

/**
 * Transform definition
 */
export interface Transform {
  /** Transform name */
  name: string;

  /** Transform function */
  transform: (ast: ASTNode[]) => ASTNode[];

  /** Priority (higher = runs first) */
  priority?: number;

  /** Only run on certain node types */
  nodeTypes?: string[];
}

/**
 * Helpers object
 */
export interface Helpers {
  [key: string]: any;
}

/**
 * Lifecycle hooks
 */
export interface Hooks {
  /** Called when plugin is initialized */
  init?: (api: PluginAPI) => void;

  /** Called when plugin is destroyed */
  destroy?: () => void;

  /** Called before compilation */
  beforeCompile?: (ast: ASTNode[], context: PluginContext) => ASTNode[];

  /** Called after compilation */
  afterCompile?: (code: string, context: PluginContext) => string;

  /** Called before rendering */
  beforeRender?: (state: any, context: PluginContext) => any;

  /** Called after rendering */
  afterRender?: (dom: any, context: PluginContext) => void;

  /** Called for each AST node */
  transformNode?: (node: ASTNode, context: PluginContext) => ASTNode;

  /** Called for compilation complete */
  complete?: (result: any, context: PluginContext) => any;
}

/**
 * Hook handler function
 */
export type HookHandler = (...args: any[]) => any;

/**
 * Plugin context
 */
export interface PluginContext {
  /** Plugin name */
  plugin: string;

  /** File being processed */
  file?: string;

  /** Line number */
  line?: number;

  /** Column number */
  column?: number;

  /** Additional context data */
  [key: string]: any;
}

/**
 * Plugin API
 */
export interface PluginAPI {
  /** Register a custom directive */
  registerDirective: (directive: Directive) => void;

  /** Register a custom filter */
  registerFilter: (filter: Filter) => void;

  /** Register a custom component */
  registerComponent: (component: Component) => void;

  /** Register a transform */
  registerTransform: (transform: Transform) => void;

  /** Register a helper */
  registerHelper: (name: string, value: any) => void;

  /** Register a hook */
  registerHook: (name: string, handler: HookHandler, priority?: number) => void;

  /** Get plugin configuration */
  getConfig: <T = any>(key: string, defaultValue?: T) => T;

  /** Set plugin configuration */
  setConfig: (key: string, value: any) => void;

  /** Get all registered directives */
  getDirectives: () => Directive[];

  /** Get all registered filters */
  getFilters: () => Filter[];

  /** Get all registered components */
  getComponents: () => Component[];

  /** Check if a directive exists */
  hasDirective: (name: string) => boolean;

  /** Check if a filter exists */
  hasFilter: (name: string) => boolean;

  /** Check if a component exists */
  hasComponent: (name: string) => boolean;

  /** Log a message */
  log: (message: string, level?: 'info' | 'warn' | 'error') => void;
}

/**
 * Plugin lifecycle states
 */
export type PluginLifecycle = 'unloaded' | 'loading' | 'loaded' | 'initialized' | 'error' | 'destroyed';

/**
 * Plugin system
 */
export interface PluginSystem {
  /** Register a plugin */
  use: (plugin: Plugin | ((api: PluginAPI) => void)) => void;

  /** Unregister a plugin */
  unuse: (name: string) => void;

  /** Get a plugin by name */
  get: (name: string) => Plugin | undefined;

  /** Get all registered plugins */
  getAll: () => Plugin[];

  /** Check if a plugin is registered */
  has: (name: string) => boolean;

  /** Get plugin API */
  getAPI: () => PluginAPI;

  /** Get hook system */
  getHooks: () => HookSystem;

  /** Get registry */
  getRegistry: () => PluginRegistry;

  /** Initialize all plugins */
  init: () => Promise<void>;

  /** Destroy all plugins */
  destroy: () => Promise<void>;

  /** Get plugin state */
  state: PluginLifecycle;
}