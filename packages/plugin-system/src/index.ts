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

// Export types
export {
  type Plugin,
  type PluginConfig,
  type PluginAPI,
  type PluginContext,
  type Directive,
  type Filter,
  type Component,
  type Transform,
  type Helpers,
  type Hooks,
  type HookHandler,
  type PluginLifecycle,
  type PluginManifest,
  type PluginDependency,
} from './types';

// Export registry
export {
  PluginRegistry,
  createPluginRegistry,
  type RegistryOptions,
} from './registry';

// Export hooks
export {
  HookSystem,
  createHookSystem,
  type Hook,
  type HookContext,
  type HookRegistration,
} from './hooks';

// Export API
export {
  PluginAPI,
  createPluginAPI,
  type APIOptions,
} from './api';

// Export loader
export {
  PluginLoader,
  createPluginLoader,
  type LoaderOptions,
  type LoaderResult,
} from './loader';

// Export main functions
export {
  createPluginSystem,
  type PluginSystem,
  type PluginSystemOptions,
} from './plugin-system';

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