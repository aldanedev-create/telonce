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

  //  (app as any)._root = root;

  // `state` is a live getter onto app.state (create.ts) rather than a
  // separately pre-wrapped copy of `data` - it needs to reflect whatever
  // mount() actually ends up using internally (which may differ from the
  // raw `data` passed in here, e.g. when `data` is a component and
  // mount() builds its own internal state from that component's data()).
  return {
    get state() {
      return app.state;
    },
    root,
    mount: () => app.mount(root, data),
    unmount: () => app.unmount(),
    use: (plugin: any) => app.use(plugin),
    component: (name: string, component: Component) => app.component(name, component),
    filter: (name: string, fn: Parameters<typeof app.filter>[1]) => app.filter(name, fn),
  };
}


export { createConfig, type TeloceConfig } from './config';
export { mount } from './mount';
export { createPlugin } from './plugin';