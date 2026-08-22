// Runtime-only entry point.
//
// This deliberately does NOT import @teloce/compiler or @teloce/sfc.
// Those packages are the .vel parser/codegen toolchain - useful at build
// time (that's what @teloce/vite-plugin uses internally) or for advanced
// Node-side tooling, but never needed by an app's own browser bundle.
//
// The previous single-entry build (src/index.ts) imported and re-exported
// compile()/compileSFC() alongside createApp() etc. from the same module,
// and tsup's `noExternal: [/@teloce\/.*/]` bundled every @teloce/* package
// into that one pre-built dist/teloce.esm.js unconditionally - so any app
// that did `import { createApp } from 'teloce'` got the entire compiler
// shipped to the browser too, with no way for the consumer's own bundler
// to tree-shake it back out (the bundling already happened at publish
// time, inside an opaque single minified file). Measured ~57KB minified
// for a trivial one-component app, vs ~15KB importing only what's needed.
//
// This file is what `dist/teloce.esm.js` / `dist/teloce.js` (the
// "import"/"require" entries most consumers hit) are now built from. The
// full CDN build (dist/teloce.global.js, for <script src="...">
// no-build-step usage) still bundles everything including the compiler -
// see src/cdn.ts - since that build target has no separate build step to
// run the compiler at, and no bundler downstream to strip unused exports
// from in the first place.

import { createApp, defineComponent, mount, createConfig, createPlugin } from '@teloce/core';
import { createSignal, createEffect, createComputed, createMemo, batch, untracked } from '@teloce/reactivity';
import { createRenderer, reconcileList, For, If, Show } from '@teloce/runtime-dom';
import { createDirective, registerDirective } from '@teloce/runtime-core';
import { transition, animate, createFilter, createTransition } from '@teloce/std';
import type { Filter } from '@teloce/std';
import format from '@teloce/std';

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

  // Standard library
  transition,
  animate,
  format,
  createFilter,
  createTransition,
};

export type { Filter };

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
  transition,
  animate,
  format,
  createFilter,
  createTransition,
};
