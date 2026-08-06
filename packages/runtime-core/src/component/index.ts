/**
 * Component system - create, define, and manage components
 */

import { createSignal } from '@teloce/reactivity';
import { runLifecycle, createLifecycleManager, pushCurrentInstance, popCurrentInstance } from './lifecycle';
import { mergeProps, validateProps, type PropsOptions } from './props';
import { createSlots, type SlotsManager } from './slots';

/**
 * Component options
 */
export interface ComponentOptions<P extends Record<string, any> = Record<string, any>, S extends Record<string, any> = Record<string, any>> {
  /**
   * Component name
   */
  name?: string;

  /**
   * Props definition
   */
  props?: PropsOptions<P>;

  /**
   * Component state
   */
  data?: () => S;

  /**
   * Computed properties
   */
  computed?: Record<string, () => any>;

  /**
   * Methods
   */
  methods?: Record<string, (...args: any[]) => any>;

  /**
   * Lifecycle hooks
   */
  beforeMount?: () => void;
  mounted?: () => void;
  beforeUpdate?: () => void;
  updated?: () => void;
  beforeUnmount?: () => void;
  unmounted?: () => void;
  errorCaptured?: (err: Error) => void;

  /**
   * Render function
   */
  render?: (ctx: ComponentContext<P, S>) => any;

  /**
   * Template string
   */
  template?: string;

  /**
   * CSS styles
   */
  styles?: string | Record<string, string>;
}

/**
 * Component context
 */
export interface ComponentContext<P extends Record<string, any> = Record<string, any>, S extends Record<string, any> = Record<string, any>> {
  props: P;
  state: S;
  methods: Record<string, (...args: any[]) => any>;
  computed: Record<string, any>;
  slots: SlotsManager;
  emit: (event: string, ...args: any[]) => void;
}

/**
 * Component instance
 */
export interface ComponentInstance<P extends Record<string, any> = Record<string, any>, S extends Record<string, any> = Record<string, any>> {
  type: string;
  props: P;
  state: S;
  el: HTMLElement | null;
  mount: (el: HTMLElement) => void;
  unmount: () => void;
  update: () => void;
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
}

/**
 * Component constructor
 */
export type Component<P extends Record<string, any> = Record<string, any>, S extends Record<string, any> = Record<string, any>> =
  ComponentOptions<P, S> | ((props: P) => ComponentOptions<P, S>);

/**
 * Create a component
 */
export function createComponent<P extends Record<string, any> = Record<string, any>, S extends Record<string, any> = Record<string, any>>(
  options: ComponentOptions<P, S>
): Component<P, S> {
  return options;
}

/**
 * Define a component
 */
export function defineComponent<P extends Record<string, any> = Record<string, any>, S extends Record<string, any> = Record<string, any>>(
  options: ComponentOptions<P, S>
): Component<P, S> {
  return options;
}

/**
 * Create a component instance
 */
export function createComponentInstance<P extends Record<string, any> = Record<string, any>, S extends Record<string, any> = Record<string, any>>(
  component: Component<P, S>,
  props?: P,
  slots?: any
): ComponentInstance<P, S> {
  const options = typeof component === 'function' 
    ? component(props as P) 
    : component;

  // Resolve props: merge caller-provided props with declared defaults, then
  // validate. Previously `options.props` was accepted in the type but never
  // read, so declared defaults/required/type checks never ran.
  let resolvedProps: P = (props ?? ({} as P));
  if (options.props) {
    resolvedProps = mergeProps(props as Partial<P> | undefined, options.props);
    const { valid, errors } = validateProps(resolvedProps, options.props);
    if (!valid) {
      for (const message of errors) {
        console.warn(`[teloce] ${options.name || 'Component'}: ${message}`);
      }
    }
  }

  // Composition-style hooks (onMounted(), onBeforeUnmount(), ...) register
  // themselves against whichever instance is "current" while data() runs -
  // this is this component model's stand-in for a setup() phase.
  const lifecycle = createLifecycleManager();
  pushCurrentInstance(lifecycle);
  let state: S;
  try {
    state = options.data ? options.data() : ({} as S);
  } finally {
    popCurrentInstance();
  }
  const reactiveState = createReactiveState(state);

  // Create computed properties
  const computed = createComputedValues(options.computed || {}, reactiveState);

  // Create methods
  const methods = options.methods || {};

  // Create slots
  const slotManager = createSlots(slots);

  // Minimal event bus backing emit()/on() below. Previously both were
  // empty stubs, so parent listeners registered via `on()` were never
  // actually invoked by `emit()`.
  const listeners = new Map<string, Array<(...args: any[]) => void>>();
  function emit(event: string, ...args: any[]): void {
    for (const handler of listeners.get(event) || []) {
      handler(...args);
    }
  }
  function on(event: string, handler: (...args: any[]) => void): void {
    const existing = listeners.get(event);
    if (existing) {
      existing.push(handler);
    } else {
      listeners.set(event, [handler]);
    }
  }

  // Create context
  const context: ComponentContext<P, S> = {
    props: resolvedProps,
    state: reactiveState,
    methods,
    computed,
    slots: slotManager,
    emit,
  };

  // Create instance
  const instance: ComponentInstance<P, S> = {
    type: options.name || 'Component',
    props: resolvedProps,
    state: reactiveState,
    el: null,
    mount(el: HTMLElement) {
      this.el = el;
      runLifecycle('beforeMount', options, lifecycle);
      // `options.render` was previously built into `context` and then
      // never called. It's invoked here so render output actually exists;
      // note this package intentionally has no DOM dependency (to avoid a
      // circular @teloce/runtime-core <-> @teloce/runtime-dom dependency),
      // so attaching the result to `el` is left to the caller/runtime-dom.
      if (options.render) {
        (instance as any).output = options.render(context);
      }
      runLifecycle('mounted', options, lifecycle);
    },
    unmount() {
      runLifecycle('beforeUnmount', options, lifecycle);
      this.el = null;
      listeners.clear();
      runLifecycle('unmounted', options, lifecycle);
      lifecycle.cleanup();
    },
    update() {
      runLifecycle('beforeUpdate', options, lifecycle);
      if (options.render) {
        (instance as any).output = options.render(context);
      }
      runLifecycle('updated', options, lifecycle);
    },
    emit,
    on,
  };

  return instance;
}

/**
 * Create reactive state from an object
 */
function createReactiveState<T extends Record<string, any>>(obj: T): T {
  const state: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const signal = createSignal(obj[key]);
      Object.defineProperty(state, key, {
        get: () => signal(),
        set: (value) => signal.set(value),
        enumerable: true,
        configurable: true
      });
    }
  }
  
  return state;
}

/**
 * Create computed values
 */
function createComputedValues(
  computed: Record<string, () => any>,
  state: any
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in computed) {
    if (Object.prototype.hasOwnProperty.call(computed, key)) {
      // Bind each computed getter's `this` to the reactive state so
      // `computed: { double() { return this.count * 2 } }`-style
      // definitions (the documented usage pattern) can actually read
      // state. Previously `state` was accepted as a parameter but never
      // used, so `get: computed[key]` ran with `this` bound to `result`
      // (the computed-values object itself) instead of component state.
      Object.defineProperty(result, key, {
        get: () => computed[key].call(state),
        enumerable: true,
        configurable: true
      });
    }
  }
  
  return result;
}