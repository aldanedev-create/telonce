import { createSignal, createEffect, createComputed, batch } from '@teloce/reactivity';
import { createConfig, type TeloceConfig } from './config';
import { registerComponent, getComponent, type Component } from './component';

/**
 * Teloce application instance
 */
export interface TeloceApp {
  config: TeloceConfig;
  reactive: <T extends Record<string, any>>(obj: T) => T;
  effect: (fn: () => void) => void;
  computed: <T>(fn: () => T) => () => T;
  component: (name: string, component: Component) => void;
  use: (plugin: any) => void;
  mount: (root: Element, state: Record<string, any>) => void;
  unmount: () => void;
}

/**
 * Create a Teloce application
 */
export function createTeloce(config: Partial<TeloceConfig> = {}): TeloceApp {
  const fullConfig = createConfig(config);
  let root: Element | null = null;
  let state: Record<string, any> = {};
  let effects: (() => void)[] = [];
  let isMounted = false;

  const app: TeloceApp = {
    config: fullConfig,

    reactive(obj) {
      // Wrap each property as a signal
      const signals: Record<string, any> = {};
      for (const key in obj) {
        const [get, set] = createSignal(obj[key]);
        signals[key] = {
          get,
          set,
          // For direct access (state.key)
          value: get(),
        };
      }
      // Create proxy for reactive access
      return new Proxy(signals, {
        get(target, prop: string) {
          if (prop in target) {
            const signal = target[prop];
            if (signal && typeof signal === 'object' && 'get' in signal) {
              return signal.get();
            }
            return signal;
          }
          return undefined;
        },
        set(target, prop: string, value) {
          if (prop in target) {
            const signal = target[prop];
            if (signal && typeof signal === 'object' && 'set' in signal) {
              signal.set(value);
              return true;
            }
          }
          target[prop] = value;
          return true;
        },
      });
    },

    effect(fn) {
      const effect = createEffect(fn);
      effects.push(effect);
      return effect;
    },

    computed(fn) {
      return createComputed(fn);
    },

    component(name, component) {
      registerComponent(fullConfig.components, name, component);
    },

    use(plugin) {
      if (typeof plugin === 'function') {
        plugin(app);
      } else if (plugin && typeof plugin === 'object' && 'install' in plugin) {
        plugin.install(app);
      }
    },

    mount(el, data) {
      if (isMounted) {
        this.unmount();
      }

      root = el;
      state = this.reactive(data || {});
      isMounted = true;

      // Mount components
      // Implementation depends on runtime-dom
      return this;
    },

    unmount() {
      isMounted = false;
      effects.forEach(effect => {
        if (typeof effect === 'function') {
          // Clean up effect
        }
      });
      effects = [];
      root = null;
    },
  };

  return app;
}