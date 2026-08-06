/**
 * Lifecycle management - hooks and lifecycle manager
 */

/**
 * Lifecycle hook functions
 */
export type LifecycleHook = () => void | (() => void);

/**
 * Lifecycle manager
 */
export interface LifecycleManager {
  /**
   * Register a hook
   */
  on: (hook: string, fn: LifecycleHook) => void;

  /**
   * Run hooks for a specific phase
   */
  run: (phase: string) => void;

  /**
   * Clean up all hooks
   */
  cleanup: () => void;
}

/**
 * Lifecycle phases
 */
export const LifecyclePhases = {
  BEFORE_MOUNT: 'beforeMount',
  MOUNTED: 'mounted',
  BEFORE_UPDATE: 'beforeUpdate',
  UPDATED: 'updated',
  BEFORE_UNMOUNT: 'beforeUnmount',
  UNMOUNTED: 'unmounted',
  ERROR_CAPTURED: 'errorCaptured',
  ACTIVATED: 'activated',
  DEACTIVATED: 'deactivated'
} as const;

/**
 * Create a lifecycle manager
 */
export function createLifecycleManager(): LifecycleManager {
  const hooks = new Map<string, Set<LifecycleHook>>();

  return {
    on(hook: string, fn: LifecycleHook) {
      if (!hooks.has(hook)) {
        hooks.set(hook, new Set());
      }
      hooks.get(hook)!.add(fn);
    },

    run(phase: string) {
      const phaseHooks = hooks.get(phase);
      if (phaseHooks) {
        for (const fn of phaseHooks) {
          fn();
        }
      }
    },

    cleanup() {
      hooks.clear();
    }
  };
}

/**
 * Run lifecycle hooks on a component
 */
export function runLifecycle(
  phase: string,
  component: any,
  manager?: LifecycleManager
): void {
  const hookMap: Record<string, string> = {
    'beforeMount': 'beforeMount',
    'mounted': 'mounted',
    'beforeUpdate': 'beforeUpdate',
    'updated': 'updated',
    'beforeUnmount': 'beforeUnmount',
    'unmounted': 'unmounted',
    'errorCaptured': 'errorCaptured'
  };

  const hookName = hookMap[phase];
  if (hookName && component[hookName]) {
    component[hookName]();
  }

  // Also run any composition-style hooks registered via onMounted()/
  // onBeforeUnmount()/etc. (see below). `component[hookName]` above only
  // covers the options-object style (`mounted() {...}` on defineComponent).
  manager?.run(phase);
}

/**
 * Composition-style lifecycle hooks (`onMounted(fn)`, `onBeforeUnmount(fn)`,
 * ...). These previously accepted a callback and discarded it — nothing
 * ever stored `fn` anywhere, so hooks registered this way silently never
 * ran. They now register against whichever component instance is
 * "currently being set up," tracked via a stack (a stack, not a single
 * nullable slot, so that a component whose data()/render() constructs or
 * reads another component mid-setup doesn't clobber the outer instance's
 * registration target - see the equivalent bug in @teloce/reactivity's
 * `currentEffect`).
 */
const instanceStack: LifecycleManager[] = [];

/**
 * Push the lifecycle manager that onX() calls should register against
 * while a component is being set up. Must be paired with popCurrentInstance().
 */
export function pushCurrentInstance(manager: LifecycleManager): void {
  instanceStack.push(manager);
}

/**
 * Pop the current lifecycle manager, restoring the previous one (if any).
 */
export function popCurrentInstance(): void {
  instanceStack.pop();
}

function registerHook(phase: string, fn: LifecycleHook | ((err: Error) => void)): void {
  const current = instanceStack[instanceStack.length - 1];
  if (!current) {
    console.warn(
      `[teloce] on${phase[0].toUpperCase()}${phase.slice(1)}() was called outside of component setup - the callback will never run.`
    );
    return;
  }
  current.on(phase, fn as LifecycleHook);
}

export function onBeforeMount(fn: LifecycleHook): void {
  registerHook(LifecyclePhases.BEFORE_MOUNT, fn);
}

export function onMounted(fn: LifecycleHook): void {
  registerHook(LifecyclePhases.MOUNTED, fn);
}

export function onBeforeUpdate(fn: LifecycleHook): void {
  registerHook(LifecyclePhases.BEFORE_UPDATE, fn);
}

export function onUpdated(fn: LifecycleHook): void {
  registerHook(LifecyclePhases.UPDATED, fn);
}

export function onBeforeUnmount(fn: LifecycleHook): void {
  registerHook(LifecyclePhases.BEFORE_UNMOUNT, fn);
}

export function onUnmounted(fn: LifecycleHook): void {
  registerHook(LifecyclePhases.UNMOUNTED, fn);
}

export function onErrorCaptured(fn: (err: Error) => void): void {
  registerHook(LifecyclePhases.ERROR_CAPTURED, fn);
}

export function onActivated(fn: LifecycleHook): void {
  registerHook(LifecyclePhases.ACTIVATED, fn);
}

export function onDeactivated(fn: LifecycleHook): void {
  registerHook(LifecyclePhases.DEACTIVATED, fn);
}