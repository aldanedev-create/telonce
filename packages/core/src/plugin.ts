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
    // Add state to app
    const state = app.reactive(initialState);
    (app as any)._globalState = state;
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