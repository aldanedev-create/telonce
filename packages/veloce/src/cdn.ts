// Full CDN entry point - used only for the IIFE build (dist/teloce.global.js,
// loaded via <script src="...">). Unlike the main `teloce` entry
// (src/index.ts), this intentionally bundles the compiler too: a
// no-build-step, script-tag consumer has no separate build step to run
// @teloce/vite-plugin at, and no downstream bundler to strip unused
// exports back out even if it wanted to - so completeness here matters
// more than bundle size, which is the opposite tradeoff from the npm/ESM
// entry.
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
import { compileSFC, parse } from '@teloce/sfc';

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

  // Compiler & SFC - only present in this CDN build, not the npm/ESM entry
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

if (typeof window !== 'undefined') {
  (window as any).teloce = teloceGlobal;
  // For backward compatibility
  (window as any).Teloce = teloceGlobal;
}

export default teloceGlobal;
