import type { TeloceApp } from './create';
import { createTeloce } from './create';

/**
 * Mount options
 */
export interface MountOptions {
  /**
   * Replace the target element
   */
  replace?: boolean;

  /**
   * Hydrate server-rendered content
   */
  hydrate?: boolean;

  /**
   * Props to pass to the component
   */
  props?: Record<string, any>;
}

/**
 * Mount a Teloce application
 */
export function mount(
  app: TeloceApp,
  selector: string | Element,
  data: Record<string, any> = {},
  options: MountOptions = {}
) {
  const root = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;

  if (!root) {
    throw new Error(`Root element not found: ${selector}`);
  }

  app.mount(root, data);

  return app;
}

/**
 * Create and mount a Teloce application
 */
export function createAndMount(
  selector: string | Element,
  data: Record<string, any> = {},
  options: MountOptions = {}
) {
  // Was previously `const { createTeloce } = require('./create');` - a
  // CommonJS require() call embedded directly in ESM source. This
  // function isn't currently re-exported from @teloce/core's public
  // index.ts (so it's tree-shaken out of the real build today, meaning
  // this particular bug is currently unreachable) - but the moment
  // anyone wires it up, `require` doesn't exist as a global in a browser
  // or a strict ESM/Node context, so it would throw a ReferenceError
  // immediately. There's no reason for a dynamic require here at all;
  // createTeloce is a normal named export of the same kind mount.ts
  // already imports a type from at the top of this file.
  const app = createTeloce();
  mount(app, selector, data, options);
  return app;
}