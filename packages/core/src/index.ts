/**
 * Teloce - Umbrella Package
 * 
 * This is the main entry point for the Teloce framework.
 * It bundles all core functionality into a single package
 * for CDN and npm users.
 */

// Import all core packages
import { createApp, createConfig, createPlugin, mount } from './app';
import { defineComponent } from './component';
import { createSignal, createEffect, createComputed, createMemo, batch, untracked, type Signal, type Effect, type Computed } from '@teloce/reactivity';
import { createRenderer, reconcileList, For, If, Show, type Renderer, type ReconciliationResult } from '@teloce/runtime-dom';
import { transition, animate, createFilter, createTransition, type Transition, type Animation, type Filter } from '@teloce/std';
import { reactive, createComponentInstance, mountChildComponent, applyDirective, type AppContext, type CustomDirective } from './instance';
import { createComponentPlugin, createStatePlugin, createDirectivePlugin, type Plugin } from './plugin';

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

  // Standard library
  transition,
  animate,
  createFilter,
  createTransition,

  // Component instantiation - used by compiled code for component
  // composition (<PascalCase> tags), see ./instance.ts
  reactive,
  createComponentInstance,
  mountChildComponent,
  applyDirective,

  // Plugin factories - previously not exported from the public API at
  // all, so `createStatePlugin` etc. from '@teloce/core' would fail with
  // "createStatePlugin is not a function" for any consumer trying to
  // import them the normal way, regardless of whether the plugins
  // themselves worked correctly.
  createComponentPlugin,
  createStatePlugin,
  createDirectivePlugin,
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
  AppContext,
  CustomDirective,
  Plugin,
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

    // Standard library
    transition,
    animate,
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
  transition,
  animate,
  createFilter,
  createTransition,
};