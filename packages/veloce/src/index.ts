// Import all core packages
import { createApp, defineComponent, mount, createConfig, createPlugin } from '@teloce/core';
import { createSignal, createEffect, createComputed, createMemo, batch, untracked } from '@teloce/reactivity';
import { createRenderer, reconcileList, For, If, Show } from '@teloce/runtime-dom';
import { createDirective, registerDirective } from '@teloce/runtime-core';
import { transition, animate, createFilter, createTransition } from '@teloce/std';
import type { Filter } from '@teloce/std';
import format from '@teloce/std';
import { compile } from '@teloce/compiler';
import { compileSFC, parse } from '@teloce/sfc';

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

  // Runtime Core
  createDirective,
  registerDirective,

  // Compiler & SFC
  compile,
  compileSFC,
  parse,

  // Standard library
  transition,
  animate,
  format,
  createFilter,
  createTransition,
};

// Export types separately for verbatimModuleSyntax compliance
export type { Filter };

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

    // Runtime Core
    createDirective,
    registerDirective,

    // Compiler & SFC
    compile,
    compileSFC,
    parse,

    // Standard library
    transition,
    animate,
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
  createDirective,
  registerDirective,
  compile,
  compileSFC,
  parse,
  transition,
  animate,
  format,
  createFilter,
  createTransition,
};