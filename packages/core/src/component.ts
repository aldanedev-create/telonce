import type { Effect, Signal } from '@teloce/reactivity';

/**
 * Component definition
 */
export interface ComponentOptions<P = any, S = any> {
  /**
   * Component name
   */
  name?: string;

  /**
   * Props definition
   */
  props?: Record<string, any>;

  /**
   * Component state (reactive)
   */
  data?: () => S;

  /**
   * Computed properties
   */
  computed?: Record<string, () => any>;

  /**
   * Lifecycle hooks
   */
  created?: () => void;
  mounted?: () => void;
  updated?: () => void;
  unmounted?: () => void;

  /**
   * Methods
   */
  methods?: Record<string, (...args: any[]) => any>;

  /**
   * Render function
   */
  render?: (ctx: ComponentContext<P, S>) => any;

  /**
   * Template string
   */
  template?: string;
}

/**
 * Component context
 */
export interface ComponentContext<P = any, S = any> {
  props: P;
  state: S;
  methods: Record<string, (...args: any[]) => any>;
  computed: Record<string, any>;
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
  mount: () => void;
  unmount: () => void;
  update: () => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
}

/**
 * Component constructor
 */
export type Component<P = any, S = any> = ComponentOptions<P, S> | ((props: P) => ComponentOptions<P, S>);

/**
 * Define a component
 */
export function defineComponent<P = any, S = any>(
  options: ComponentOptions<P, S> | ((props: P) => ComponentOptions<P, S>)
): Component<P, S> {
  return options;
}

/**
 * Register a component
 */
export function registerComponent(
  registry: Map<string, Component>,
  name: string,
  component: Component
): void {
  registry.set(name, component);
}

/**
 * Get a component by name
 */
export function getComponent(
  registry: Map<string, Component>,
  name: string
): Component | undefined {
  return registry.get(name);
}