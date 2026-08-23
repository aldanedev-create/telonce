import { createSignal, createEffect, createComputed, batch } from '@teloce/reactivity';
import { registerFilter, type Filter } from '@teloce/std';
import { createConfig, type TeloceConfig } from './config';
import { registerComponent, getComponent, type Component } from './component';
import type { AppContext, CustomDirective } from './instance';

// Module-level (not per-app) so the same compiled component - which is
// what a .vel file's `<style>` block compiles to a `styles` string on -
// only ever gets its <style> tag inserted into <head> once, no matter how
// many times it's mounted/unmounted/remounted or how many app instances
// use it.
const injectedComponentStyles = new WeakSet<object>();

/**
 * A .vel file's `<style>` block compiles to CSS text on `comp.styles`, but
 * nothing previously read that property at runtime - the compiler did its
 * job producing correctly-scoped CSS, and it just sat there, unused, never
 * reaching the page. This inserts it into <head> the first time this exact
 * component is mounted.
 */
function injectComponentStyles(comp: { styles?: string; name?: string }): void {
  if (!comp.styles) return;
  if (typeof document === 'undefined') return; // non-browser environment
  if (injectedComponentStyles.has(comp)) return;

  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-teloce-component', comp.name || 'component');
  styleEl.textContent = comp.styles;
  document.head.appendChild(styleEl);

  injectedComponentStyles.add(comp);
}

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
   * Register a custom directive usable in templates via `~name="expr"`.
   * Previously the only way to register directives was through
   * createDirectivePlugin + app.use() (see ./plugin.ts) - this adds a
   * direct method for parity with app.component() above, since both
   * ultimately just write into the same kind of registry
   * (config.directives / config.components).
   */
  directive: (name: string, directive: CustomDirective) => void;
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
  mount: (root: Element, componentOrData: Record<string, any> | { template: (container: Element, ctx: any) => void; [key: string]: any }) => TeloceApp;
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
  // Tracks the currently-mounted component + its ctx proxy so unmount() can
  // invoke unmounted()/beforeUnmount() hooks with the same `this` binding
  // created()/mounted() get - see the fix comment in mount() below.
  let activeComponent: Record<string, any> | null = null;
  let activeCtx: any = null;

  // Shared registries a compiled render() function reaches into for
  // component/directive resolution and global state - see the doc
  // comment on AppContext in ./instance.ts for the full story on why
  // this exists now when it didn't before. fullConfig.components and
  // fullConfig.directives are the exact same Maps app.component() and
  // the directives plugin already write into (see below and ./plugin.ts)
  // - previously nothing ever read them back; this is what finally does.
  const appContext: AppContext = {
    components: fullConfig.components,
    directives: fullConfig.directives,
    globalState: fullConfig.state,
  };

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
          // Reflect.set (updating the underlying raw target) must happen
          // BEFORE sig.set (updating the signal) - sig.set() synchronously
          // re-runs any dependent effect right then, and if one of those
          // effects reads this same property again before Reflect.set has
          // run, the target's raw value and the signal's new value
          // disagree. That's not just stale data - the JS engine's Proxy
          // invariant checking can outright throw a TypeError ("... is a
          // read-only and non-configurable data property on the proxy
          // target but the proxy did not return its actual value"),
          // confirmed via a real reactive global-state update triggering
          // exactly this crash during its own dependent effect's re-run.
          Reflect.set(target, prop, value, receiver);
          let sig = signals.get(prop);
          if (!sig) {
            sig = createSignal(value);
            signals.set(prop, sig);
          } else {
            sig.set(value);
          }
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

    directive(name, directive) {
      fullConfig.directives.set(name, directive);
    },

    use(plugin) {
      if (typeof plugin === 'function') {
        plugin(app);
      } else if (plugin && typeof plugin === 'object' && 'install' in plugin) {
        plugin.install(app);
      }
    },
    mount(el, componentOrData) {
      if (isMounted) {
        this.unmount();
      }

      root = el;

      const isComponent =
        componentOrData &&
        typeof componentOrData === 'object' &&
        typeof (componentOrData as any).template === 'function';

      if (isComponent) {
        const comp = componentOrData as {
          template: (container: Element, ctx: any, appContext?: AppContext) => void;
          data?: () => Record<string, any>;
          methods?: Record<string, (...args: any[]) => any>;
          computed?: Record<string, () => any>;
          created?: (ctx: any) => void;
          mounted?: (ctx: any) => void;
          unmounted?: (ctx: any) => void;
          beforeUnmount?: (ctx: any) => void;
          styles?: string;
          name?: string;
        };

        injectComponentStyles(comp);

        const initialData = typeof comp.data === 'function' ? comp.data() : {};
        state = this.reactive(initialData);

        const methods = comp.methods || {};
        const computedFns = comp.computed || {};

        const ctx: any = new Proxy(
          {},
          {
            get(_target, prop) {
              if (prop === '$global') return appContext.globalState;
              if (typeof prop === 'string' && prop in methods) {
                return (...args: any[]) => methods[prop].apply(ctx, args);
              }
              if (typeof prop === 'string' && prop in computedFns) {
                return computedFns[prop].call(ctx);
              }
              return (state as any)[prop];
            },
            set(_target, prop, value) {
              (state as any)[prop] = value;
              return true;
            },
            has(_target, prop) {
              return (
                prop === '$global' ||
                (typeof prop === 'string' && (prop in methods || prop in computedFns)) ||
                prop in state
              );
            },
          }
        );

        // Lifecycle hooks are called with `this` bound to `ctx` (the same
        // reactive proxy methods get), not to `comp` (the raw, un-reactive
        // component definition object). Using `comp.created?.(ctx)` here
        // previously called the hook as `comp.created(ctx)` - a plain
        // property access + call, which binds `this` to `comp` rather than
        // `ctx`. Since `comp` doesn't have the component's state/methods as
        // its own properties (those live on `comp.data`/`comp.methods`,
        // unevaluated/nested), any hook body that read or wrote `this.x` or
        // called `this.someMethod()` silently broke ("this.x is not a
        // function"/undefined). `.call(ctx, ctx)` fixes `this` while still
        // passing ctx as the first argument for hooks that prefer an
        // explicit parameter.
        comp.created?.call(ctx, ctx);
        comp.template(el, ctx, appContext);
        comp.mounted?.call(ctx, ctx);

        activeComponent = comp;
        activeCtx = ctx;
      } else {
        state = this.reactive((componentOrData as Record<string, any>) || {});
        activeComponent = null;
        activeCtx = null;
      }

      isMounted = true;
      return this;
    },

    unmount() {
      // beforeUnmount/unmounted were previously never invoked at all - the
      // compiled hooks existed but nothing in the runtime ever called them.
      // Same `this`-binding fix as created/mounted above applies here.
      if (activeComponent) {
        (activeComponent as any).beforeUnmount?.call(activeCtx, activeCtx);
      }

      isMounted = false;
      effects.forEach(effect => {
        if (effect && typeof (effect as any).stop === 'function') {
          (effect as any).stop();
        }
      });
      effects = [];
      root = null;

      if (activeComponent) {
        (activeComponent as any).unmounted?.call(activeCtx, activeCtx);
      }
      activeComponent = null;
      activeCtx = null;
    },
  };

  return app;
}