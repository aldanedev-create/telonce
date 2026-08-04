/**
 * Teloce - Umbrella Package
 * 
 * This is the main entry point for the Teloce framework.
 * It bundles all core functionality into a single package
 * for CDN and npm users.
 */

// Import all core packages
import { createApp, defineComponent, mount, createConfig, createPlugin } from '@teloce/core';
import { 
  createSignal, 
  createEffect, 
  createComputed, 
  createMemo, 
  batch, 
  untracked,
  type Signal,
  type Effect,
  type Computed
} from '@teloce/reactivity';
import { 
  createRenderer, 
  reconcileList, 
  For, 
  If, 
  Show, 
  Switch, 
  Match, 
  createDirective, 
  registerDirective,
  type Renderer,
  type ReconciliationResult
} from '@teloce/runtime-dom';
import { 
  transition, 
  animate, 
  filter, 
  format, 
  createFilter, 
  createTransition,
  type Transition,
  type Animation,
  type Filter
} from '@teloce/std';

// Export everything for ESM/npm users
export {
  // Core
  createApp,
  defineComponent,
  mount,
  createConfig,
  createPlugin,

  // Reactivity (Signals)
  createSignal,
  createEffect,
  createComputed,
  createMemo,
  batch,
  untracked,

  // Runtime DOM
  createRenderer,
  reconcileList,
  For,
  If,
  Show,
  Switch,
  Match,
  createDirective,
  registerDirective,

  // Standard library
  transition,
  animate,
  filter,
  format,
  createFilter,
  createTransition,
};

// Export types
export type {
  Signal,
  Effect,
  Computed,
  Renderer,
  ReconciliationResult,
  Transition,
  Animation,
  Filter,
};

// Attach to window for CDN users (IIFE build)
if (typeof window !== 'undefined') {
  (window as any).teloce = {
    // Core
    createApp,
    defineComponent,
    mount,
    createConfig,
    createPlugin,

    // Reactivity
    createSignal,
    createEffect,
    createComputed,
    createMemo,
    batch,
    untracked,

    // Runtime DOM
    createRenderer,
    reconcileList,
    For,
    If,
    Show,
    Switch,
    Match,
    createDirective,
    registerDirective,

    // Standard library
    transition,
    animate,
    filter,
    format,
    createFilter,
    createTransition,
  };

  // For backward compatibility
  (window as any).Teloce = (window as any).teloce;
}

// Default export for CommonJS
export default {
  createApp,
  defineComponent,
  mount,
  createConfig,
  createPlugin,
  createSignal,
  createEffect,
  createComputed,
  createMemo,
  batch,
  untracked,
  createRenderer,
  reconcileList,
  For,
  If,
  Show,
  Switch,
  Match,
  createDirective,
  registerDirective,
  transition,
  animate,
  filter,
  format,
  createFilter,
  createTransition,
};