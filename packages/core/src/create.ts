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
      const signals = new Map<string | symbol, ReturnType<typeof createSignal>>();
      const raw = { ...(obj || {}) };

      for (const key in raw) {
        signals.set(key, createSignal(raw[key]));
      }

      // Create proxy with full property traps for iteration, spread, JSON.stringify, and dynamic properties
      return new Proxy(raw, {
        get(target, prop, receiver) {
          if (prop === '__isReactive') return true;
          if (prop === '__raw') return target;

          let sig = signals.get(prop);
          if (!sig && (prop in target || typeof prop === 'string')) {
            sig = createSignal(Reflect.get(target, prop, receiver));
            signals.set(prop, sig);
          }

          return sig ? sig() : Reflect.get(target, prop, receiver);
        },

        set(target, prop, value, receiver) {
          let sig = signals.get(prop);
          if (!sig) {
            sig = createSignal(value);
            signals.set(prop, sig);
          } else {
            sig.set(value);
          }
          Reflect.set(target, prop, value, receiver);
          return true;
        },

        has(target, prop) {
          return signals.has(prop) || Reflect.has(target, prop);
        },

        ownKeys(target) {
          return Array.from(signals.keys());
        },

        getOwnPropertyDescriptor(target, prop) {
          if (signals.has(prop) || prop in target) {
            const val = signals.has(prop) ? signals.get(prop)!() : Reflect.get(target, prop);
            return {
              configurable: true,
              enumerable: true,
              value: val,
              writable: true,
            };
          }
          return Reflect.getOwnPropertyDescriptor(target, prop);
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

      // Mount components logic (runtime-dom integration)
      return this;
    },

    unmount() {
      isMounted = false;
      effects.forEach(effect => {
        if (effect && typeof (effect as any).stop === 'function') {
          (effect as any).stop();
        }
      });
      effects = [];
      root = null;
    },
  };

  return app;
}