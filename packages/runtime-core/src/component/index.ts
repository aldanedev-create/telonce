/**
 * Component system - create, define, and manage components
 */

import { createSignal, createEffect, type Signal } from '@teloce/reactivity';
import { runLifecycle, type LifecycleManager } from './lifecycle';
import { mergeProps, type PropsOptions } from './props';
import { createSlots, type SlotsManager } from './slots';

/**
 * Component options
 */
export interface ComponentOptions<P = any, S = any> {
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
export interface ComponentContext<P = any, S = any> {
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
export interface ComponentInstance<P = any, S = any> {
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
export type Component<P = any, S = any> = ComponentOptions<P, S> | ((props: P) => ComponentOptions<P, S>);

/**
 * Create a component
 */
export function createComponent<P = any, S = any>(
  options: ComponentOptions<P, S>
): Component<P, S> {
  return options;
}

/**
 * Define a component
 */
export function defineComponent<P = any, S = any>(
  options: ComponentOptions<P, S>
): Component<P, S> {
  return options;
}

/**
 * Create a component instance
 */
export function createComponentInstance<P = any, S = any>(
  component: Component<P, S>,
  props?: P,
  slots?: any
): ComponentInstance<P, S> {
  const options = typeof component === 'function' 
    ? component(props as P) 
    : component;

  // Create reactive state
  const state = options.data ? options.data() : {} as S;
  const reactiveState = createReactiveState(state);

  // Create computed properties
  const computed = createComputedValues(options.computed || {}, reactiveState);

  // Create methods
  const methods = options.methods || {};

  // Create slots
  const slotManager = createSlots(slots);

  // Create context
  const context: ComponentContext<P, S> = {
    props: props || {} as P,
    state: reactiveState,
    methods,
    computed,
    slots: slotManager,
    emit: (event: string, ...args: any[]) => {
      // Emit event
    }
  };

  // Create instance
  const instance: ComponentInstance<P, S> = {
    type: options.name || 'Component',
    props: props || {} as P,
    state: reactiveState,
    el: null,
    mount(el: HTMLElement) {
      this.el = el;
      // Run beforeMount
      runLifecycle('beforeMount', options);
      // Render the component
      // Run mounted
      runLifecycle('mounted', options);
    },
    unmount() {
      runLifecycle('beforeUnmount', options);
      this.el = null;
      runLifecycle('unmounted', options);
    },
    update() {
      runLifecycle('beforeUpdate', options);
      // Update the component
      runLifecycle('updated', options);
    },
    emit(event: string, ...args: any[]) {
      // Emit event
    },
    on(event: string, handler: (...args: any[]) => void) {
      // Register event handler
    }
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
      Object.defineProperty(result, key, {
        get: computed[key],
        enumerable: true,
        configurable: true
      });
    }
  }
  
  return result;
}