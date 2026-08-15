import { createSignal, createEffect, createComputed, batch } from '@teloce/reactivity';
import { registerFilter, type Filter } from '@teloce/std';
import { createConfig, type TeloceConfig } from './config';
import { registerComponent, getComponent, type Component } from './component';

/**
 * Teloce application instance
 */
export interface TeloceApp {
  config: TeloceConfig;
  /**
   * The app's current reactive state - the same object mount() built via
   * reactive(), exposed directly for cases like debugging, devtools, or
   * reading/writing state from outside the component tree (e.g. a plain
   * event handler that isn't one of the component's own methods). Empty
   * object until mount() actually runs and populates it.
   */
  readonly state: Record<string, any>;
  reactive: <T extends Record<string, any>>(obj: T) => Record<string, any>;
  effect: (fn: () => void) => unknown;
  computed: <T>(fn: () => T) => () => T;
  component: (name: string, component: Component) => void;
  /**
   * Register a filter usable in `{{ expr | name }}` / `{{ expr | name(args) }}`
   * template interpolations. Filters are looked up from the same global
   * registry @teloce/std's built-in filters (currency, truncate,
   * dateFormat, ...) live in, so a custom filter registered here is
   * immediately usable by any template compiled afterward - it isn't
   * scoped to just this one app instance.
   */
  filter: (name: string, fn: Filter) => void;
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

    get state() {
      return state;
    },

    filter(name, fn) {
      registerFilter(name, fn);
    },

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