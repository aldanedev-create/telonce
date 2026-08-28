// Full CDN entry point - used only for the IIFE build (dist/teloce.global.js,
// loaded via <script src="...">). Unlike the main `teloce` entry
// (src/index.ts), this intentionally bundles the template compiler too: a
// no-build-step, script-tag consumer has no separate build step to run
// @teloce/vite-plugin at, and no downstream bundler to strip unused
// exports back out even if it wanted to - so completeness here matters
// more than bundle size, which is the opposite tradeoff from the npm/ESM
// entry.
//
// compileSFC/parse (full .vel single-file-component compilation, from
// @teloce/sfc) are deliberately NOT included here, unlike an earlier
// version of this file. @teloce/sfc's script compiler uses the real
// esbuild package to strip TypeScript syntax out of <script lang="ts">
// blocks, and esbuild is a Node-only tool - its own driver code requires
// real Node built-ins (fs, os, path, child_process, crypto, tty) just to
// load, regardless of whether any of its functions are actually called.
// Simply having an unused `import { transformSync } from 'esbuild'`
// anywhere in this bundle's module graph was enough to break this
// build's platform:'browser' target outright ("Could not resolve
// fs/os/path/..."), and marking esbuild as `external` didn't fix it
// either - esbuild's bundler still walked into esbuild's own internal
// require() calls regardless. On reflection, compiling a full .vel SFC
// file (not just a template snippet) from raw text at runtime in a bare
// browser <script> tag with no build step was already a stretch use
// case - .vel files inherently imply a build step exists to process
// them - so this drops that specific capability from the CDN build
// rather than keep fighting the bundler, while `compile` (the template-
// only compiler, no esbuild dependency at all) stays available for
// simpler runtime-compilation needs.
import {
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
} from './index';
import { compile } from '@teloce/compiler';

const teloceGlobal = {
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

  // Template compiler - only present in this CDN build, not the npm/ESM
  // entry. Full .vel SFC compilation (compileSFC/parse) isn't included -
  // see the comment above.
  compile,

  // Standard library
  transition,
  animate,
  format,
  createFilter,
  createTransition,
};

if (typeof window !== 'undefined') {
  (window as any).teloce = teloceGlobal;
  // For backward compatibility
  (window as any).Teloce = teloceGlobal;
}

export default teloceGlobal;
