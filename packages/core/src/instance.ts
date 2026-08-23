import { createSignal, createEffect, type Effect } from '@teloce/reactivity';
import type { Component } from './component';

// Separate WeakSet from create.ts's own copy (same small function,
// duplicated rather than exported/threaded through as a parameter to
// every compiled call site of mountChildComponent below, since compiled
// code calling it shouldn't need to know about this internal detail).
const injectedComponentStyles = new WeakSet<object>();
function injectComponentStyles(comp: { styles?: string; name?: string }): void {
  if (!comp.styles) return;
  if (typeof document === 'undefined') return;
  if (injectedComponentStyles.has(comp)) return;

  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-teloce-component', comp.name || 'component');
  styleEl.textContent = comp.styles;
  document.head.appendChild(styleEl);

  injectedComponentStyles.add(comp);
}

/**
 * Standalone version of the reactive() proxy logic that used to live only
 * as a method on the app object built by createTeloce() (see create.ts).
 * Extracted here so child component instances (see createComponentInstance
 * below) can build their own independent reactive state without needing a
 * full app instance - a child component is not "the app", it's a nested
 * instance with its own local state, methods, and lifecycle, but it still
 * needs the same signal-backed property behavior.
 */
export function reactive<T extends Record<string, any>>(obj: T): T {
  const signals = new Map<string | symbol, ReturnType<typeof createSignal>>();
  const raw = { ...(obj || {}) };

  for (const key in raw) {
    signals.set(key, createSignal((raw as any)[key]));
  }

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
      // Same fix as the copy of this logic in create.ts - see the comment
      // there for the full explanation of why Reflect.set has to run
      // before sig.set.
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
  }) as T;
}

/**
 * Shared app-level registries a compiled render() function can reach into
 * while it's running - which components a `<PascalCase>` tag resolves to,
 * which custom directive a `~name="..."` attribute resolves to, and any
 * globally-registered state (see createStatePlugin in ./plugin.ts).
 *
 * Previously none of this existed: app.component()/config.directives/
 * app._globalState all successfully registered data into a Map or plain
 * object, but nothing in the compiler's codegen or the runtime ever read
 * any of it back - a <MyButton> tag rendered as a literal, inert
 * `<mybutton>` HTML element regardless of whether a "MyButton" component
 * was registered, custom directives had zero .get() call sites anywhere
 * in the codebase, and _globalState was write-only. This is threaded
 * through as a third argument to every compiled render() function (and
 * closed over by any nested for/if/component render callbacks within it,
 * via normal JS closure scoping - see generator/index.ts) precisely so
 * that lookup can finally happen.
 */
export interface AppContext {
  components: Map<string, Component>;
  directives: Map<string, CustomDirective>;
  globalState: Record<string, any>;
}

export interface CustomDirective {
  mounted?: (el: Element, value: any) => void;
  updated?: (el: Element, value: any) => void;
  unmounted?: (el: Element) => void;
}

export interface ComponentInstanceHandle {
  /** The single Node this instance's template rendered into `container`. */
  node: Node;
  /** Re-runs prop getters and updates the instance's exposed prop values. */
  updateProps: () => void;
  /** Tears the instance down: runs unmounted/beforeUnmount, removes its DOM node. */
  unmount: () => void;
}

/**
 * Instantiates a child component - the runtime half of component
 * composition. Called from compiled code wherever a template uses a
 * `<PascalCase>` tag that resolves to a registered component (see the new
 * codegen path in compiler/src/generator/index.ts's Element case).
 *
 * Scope note: this supports one-way prop passing (parent -> child, static
 * or reactive) and event emission (child -> parent, via this.$emit in the
 * child's methods/lifecycle). It does not support slots (parent-provided
 * child content, i.e. anything nested inside a component tag in the
 * template) - that's a real, separate piece of work involving its own
 * compiler support for compiling slot content into a passable render
 * function, left for a follow-up.
 */
/**
 * Custom directive resolution - the runtime half of `~name="expr"`
 * attribute bindings (see the new codegen path for these in
 * compiler/src/generator/index.ts's genAttribute). Same "registered but
 * never consulted" gap as component composition had: config.directives
 * (see ./config.ts) already had callers writing into it via
 * createDirectivePlugin (./plugin.ts), but zero .get() call sites
 * anywhere in the codebase before this.
 */
export function applyDirective(
  el: Element,
  name: string,
  valueGetter: () => any,
  appContext: AppContext
): void {
  const directive = appContext?.directives?.get(name);
  if (!directive) {
    console.warn(
      `[teloce] Unknown directive ~${name} - no directive with that name was registered ` +
        `via app.directive('${name}', ...) or createDirectivePlugin before this template was mounted.`
    );
    return;
  }

  let isMounted = false;
  createEffect(() => {
    const value = valueGetter();
    if (!isMounted) {
      directive.mounted?.(el, value);
      isMounted = true;
    } else {
      directive.updated?.(el, value);
    }
  });
}

export function createComponentInstance(
  comp: Record<string, any>,
  propsGetters: Record<string, () => any>,
  emitHandlers: Record<string, (...args: any[]) => void>,
  appContext: AppContext
): ComponentInstanceHandle {
  injectComponentStyles(comp);

  const initialData = typeof comp.data === 'function' ? comp.data() : {};
  // Props are seeded into the child's own reactive state alongside its
  // own data() - so `this.someProp` in the child's methods/template reads
  // the current (possibly parent-reactive) prop value the same way it'd
  // read any of its own local state. If a prop name collides with a
  // data() key, the prop value is what's actually used (data() only
  // supplies the initial value in that case; updateProps() below is what
  // keeps it current).
  const initialProps: Record<string, any> = {};
  for (const key in propsGetters) {
    initialProps[key] = propsGetters[key]();
  }
  const state = reactive({ ...initialData, ...initialProps });

  const methods = comp.methods || {};
  const computedFns = comp.computed || {};

  const ctx: any = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === '$emit') {
          return (name: string, ...args: any[]) => {
            const handler = emitHandlers[name];
            if (handler) handler(...args);
          };
        }
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
          prop === '$emit' ||
          (typeof prop === 'string' && (prop in methods || prop in computedFns)) ||
          prop in state
        );
      },
    }
  );

  comp.created?.call(ctx, ctx);

  const fragment = document.createDocumentFragment();
  comp.template(fragment, ctx, appContext);
  const node =
    fragment.childNodes.length === 1
      ? (fragment.firstChild as Node)
      : (() => {
          const wrapper = document.createElement('span');
          wrapper.setAttribute('data-teloce-fragment', '');
          wrapper.style.display = 'contents';
          wrapper.appendChild(fragment);
          return wrapper;
        })();

  comp.mounted?.call(ctx, ctx);

  let propEffect: Effect | null = null;
  if (Object.keys(propsGetters).length > 0) {
    propEffect = createEffect(() => {
      for (const key in propsGetters) {
        (ctx as any)[key] = propsGetters[key]();
      }
    }) as unknown as Effect;
  }

  return {
    node,
    updateProps() {
      for (const key in propsGetters) {
        (ctx as any)[key] = propsGetters[key]();
      }
    },
    unmount() {
      comp.beforeUnmount?.call(ctx, ctx);
      if (propEffect && typeof (propEffect as any).stop === 'function') {
        (propEffect as any).stop();
      }
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      comp.unmounted?.call(ctx, ctx);
    },
  };
}

/**
 * Mounts a child component instance into `container` and keeps it in sync
 * with reactive prop changes for as long as the parent's own template
 * effect is alive. This is the function compiled code actually calls -
 * createComponentInstance above is the reusable piece; this wraps it with
 * the container-append + prop-reactivity-effect wiring a template needs.
 */
export function mountChildComponent(
  container: Element,
  comp: Record<string, any> | undefined,
  tagName: string,
  propsGetters: Record<string, () => any>,
  emitHandlers: Record<string, (...args: any[]) => void>,
  appContext: AppContext
): void {
  if (!comp) {
    console.warn(
      `[teloce] Unknown component <${tagName}> - no component with that name was registered ` +
        `via app.component('${tagName}', ...) before this template was mounted.`
    );
    return;
  }

  const instance = createComponentInstance(comp, propsGetters, emitHandlers, appContext);
  container.appendChild(instance.node);
  // createComponentInstance already wires up its own internal effect that
  // keeps `ctx`'s prop values current; nothing further is needed here for
  // ongoing reactivity; unmount cleanup is deliberately not wired to the
  // parent's own unmount here in this first pass (matches the scope note
  // on createComponentInstance above re: slots also being left for a
  // follow-up) - the child's DOM node still gets torn down for free
  // whenever the parent's own container is cleared/replaced by the
  // reconciler, same as any other plain DOM node.
}
