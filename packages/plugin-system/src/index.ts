/**
 * @teloce/plugin-system - Core Plugin System
 * 
 * This package provides the plugin system for Teloce.
 * It allows extending the template engine with custom directives,
 * filters, components, transforms, and hooks.
 * 
 * The plugin system is small, simple, and tech-neutral.
 * Plugins work with CDN, npm, and build tools.
 */

// Import values locally so they are available in scope for the default export
import { PluginRegistry, createPluginRegistry } from './registry.js';
import { HookSystem, createHookSystem } from './hooks.js';
import { PluginAPI, createPluginAPI } from './api.js';
import { PluginLoader, createPluginLoader } from './loader.js';
import { createPluginSystem } from './plugin-system.js';

// Export types
export type {
  Plugin,
  PluginConfig,
  PluginContext,
  Directive,
  Filter,
  Component,
  Transform,
  Helpers,
  Hooks,
  HookHandler,
  PluginLifecycle,
  PluginManifest,
  PluginDependency,
} from './types.js';

// Export registry
export {
  PluginRegistry,
  createPluginRegistry,
  type RegistryOptions,
} from './registry.js';

// Export hooks
export {
  HookSystem,
  createHookSystem,
  type Hook,
  type HookContext,
  type HookRegistration,
} from './hooks.js';

// Export API
export {
  PluginAPI,
  createPluginAPI,
  type APIOptions,
} from './api.js';

// Export loader
export {
  PluginLoader,
  createPluginLoader,
  type LoaderOptions,
  type LoaderResult,
} from './loader.js';

// Export main functions
export {
  createPluginSystem,
  type PluginSystem,
  type PluginSystemOptions,
} from './plugin-system.js';

// Default export
export default {
  PluginRegistry,
  createPluginRegistry,
  HookSystem,
  createHookSystem,
  PluginAPI,
  createPluginAPI,
  PluginLoader,
  createPluginLoader,
  createPluginSystem,
};