import type { TeloceApp } from './create';

/**
 * Plugin installation function
 */
export type PluginInstall = (app: TeloceApp) => void;

/**
 * Plugin interface
 */
export interface Plugin {
  install: PluginInstall;
  name?: string;
  version?: string;
}

/**
 * Create a plugin
 */
export function createPlugin(
  install: PluginInstall,
  name?: string,
  version?: string
): Plugin {
  return {
    install,
    name,
    version,
  };
}

/**
 * Plugin for adding components
 */
export function createComponentPlugin(
  components: Record<string, any>
): Plugin {
  return createPlugin((app) => {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component);
    }
  }, 'component-plugin');
}

/**
 * Plugin for adding global state
 */
export function createStatePlugin(
  initialState: Record<string, any>
): Plugin {
  return createPlugin((app) => {
    // Previously this built its own separate reactive() object and stashed
    // it on `app._globalState` - a location nothing else in the codebase
    // ever read from, so registered global state had no way to actually
    // reach a template. `app.config.state` (see createConfig in
    // ./config.ts) is already a reactive object created fresh per app and
    // is exactly what AppContext.globalState (./instance.ts) exposes to
    // every compiled render() function, so merging into it here - rather
    // than replacing it with a disconnected object - is what actually
    // wires this up end to end.
    for (const key in initialState) {
      app.config.state[key] = initialState[key];
    }
  }, 'state-plugin');
}

/**
 * Plugin for adding directives
 */
export function createDirectivePlugin(
  directives: Record<string, any>
): Plugin {
  return createPlugin((app) => {
    for (const [name, directive] of Object.entries(directives)) {
      app.config.directives.set(name, directive);
    }
  }, 'directive-plugin');
}