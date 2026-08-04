import type { TeloceApp } from './create';

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
  const { createTeloce } = require('./create');
  const app = createTeloce();
  mount(app, selector, data, options);
  return app;
}