import { createTeloce } from './create';
import { createConfig, type TeloceConfig } from './config';
import type { Component } from './component';


/**
 * Creates a new Teloce application
 */
export function createApp(
  rootSelector: string | Element,
  data: Record<string, any> = {},
  options: Partial<TeloceConfig> = {}
) {
  const config = createConfig(options);
  const app = createTeloce(config);

  // Mount the app
  const root = typeof rootSelector === 'string'
    ? document.querySelector(rootSelector)
    : rootSelector;

  if (!root) {
    throw new Error(`Root element not found: ${rootSelector}`);
  }

  // Initialize state
  const state = app.reactive(data);

  // Store state on app instance
  (app as any)._state = state;
  (app as any)._root = root;

  // Return app instance
  return {
    state,
    root,
    mount: () => app.mount(root, state),
    unmount: () => app.unmount(),
    use: (plugin: any) => app.use(plugin),
    component: (name: string, component: Component) => app.component(name, component),
    filter: (name: string, fn: Parameters<typeof app.filter>[1]) => app.filter(name, fn),
  };
}

export { createConfig, type TeloceConfig } from './config';
export { mount } from './mount';
export { createPlugin } from './plugin';