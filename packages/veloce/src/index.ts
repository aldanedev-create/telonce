// Import all core packages
import { createApp, defineComponent, mount, createConfig, createPlugin } from '@teloce/core';
import { createSignal, createEffect, createComputed, createMemo, batch, untracked } from '@teloce/reactivity';
import { createRenderer, reconcileList, For, If, Show, Switch, Match, createDirective, registerDirective } from '@teloce/runtime-dom';
import { transition, animate, filter, format, createFilter, createTransition } from '@teloce/std';

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