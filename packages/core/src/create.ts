import { createSignal, createEffect, createComputed, batch } from '@teloce/reactivity';
import { createConfig, type TeloceConfig } from './config';
import { registerComponent, getComponent, type Component } from './component';

/**
 * Teloce application instance
 */
export interface TeloceApp {
  config: TeloceConfig;
  reactive: <T extends Record<string, any>>(obj: T) => Record<string, any>;
  effect: (fn: () => void) => unknown;
  computed: <T>(fn: () => T) => () => T;
  component: (name: string, component: Component) => void;
  use: (plugin: any) => void;
  mount: (root: Element, state: Record<string, any>) => TeloceApp;
  unmount: () => void;
}

/**
 * Create a Teloce application
 */
export function createTeloce(config: Partial<TeloceConfig> = {}): TeloceApp {
  const fullConfig = createConfig(config);
  let root: Element | null = null;
  let state: Record<string, any> = {};
  let effects: unknown[] = [];
  let isMounted = false;

  const app: TeloceApp = {
    config: fullConfig,

    reactive(obj) {
      // Wrap each property as a signal
      const signals: Record<string, unknown> = {};
      for (const key in obj) {
        const signal = createSignal(obj[key]);
        signals[key] = {
          get: () => signal(),
          set: (value: any) => signal.set(value),
          // For direct access (state.key)
          value: signal(),
        };
      }
      // Create proxy for reactive access
      return new Proxy({}, {
        get(_target, prop: string) {
          const signal = (signals as Record<string, any>)[prop];
          if (signal && typeof signal === 'object' && 'get' in signal) {
            return (signal as any).get();
          }
          return signal;
        },
        set(_target, prop: string, value) {
          const signal = (signals as Record<string, any>)[prop];
          if (signal && typeof signal === 'object' && 'set' in signal) {
            (signal as any).set(value);
            return true;
          }
          (signals as Record<string, any>)[prop] = value;
          return true;
        },
      });
    },

    effect(fn) {
      const effect = createEffect(fn);
      effects.push(effect as unknown);
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