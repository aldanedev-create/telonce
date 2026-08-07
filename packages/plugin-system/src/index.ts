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

// 1. Import everything locally so it is available in scope
import type {
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

import {
  PluginRegistry,
  createPluginRegistry,
  type RegistryOptions,
} from './registry.js';

import {
  HookSystem,
  createHookSystem,
  type Hook,
  type HookContext,
  type HookRegistration,
} from './hooks.js';

import {
  PluginAPI,
  createPluginAPI,
  type APIOptions,
} from './api.js';

import {
  PluginLoader,
  createPluginLoader,
  type LoaderOptions,
  type LoaderResult,
} from './loader.js';

import {
  createPluginSystem,
  type PluginSystem,
  type PluginSystemOptions,
} from './plugin-system.js';

// 2. Export types
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
};

// 3. Export named values and module types
export {
  PluginRegistry,
  createPluginRegistry,
  type RegistryOptions,

  HookSystem,
  createHookSystem,
  type Hook,
  type HookContext,
  type HookRegistration,

  PluginAPI,
  createPluginAPI,
  type APIOptions,

  PluginLoader,
  createPluginLoader,
  type LoaderOptions,
  type LoaderResult,

  createPluginSystem,
  type PluginSystem,
  type PluginSystemOptions,
};

// 4. Default export using the locally scoped references
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