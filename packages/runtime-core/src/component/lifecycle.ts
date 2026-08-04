/**
 * Lifecycle management - hooks and lifecycle manager
 */

import { createEffect } from '@teloce/reactivity';

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
  component: any
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
}

/**
 * Lifecycle hooks
 */
export function onBeforeMount(fn: LifecycleHook): void {
  // Register hook
}

export function onMounted(fn: LifecycleHook): void {
  // Register hook
}

export function onBeforeUpdate(fn: LifecycleHook): void {
  // Register hook
}

export function onUpdated(fn: LifecycleHook): void {
  // Register hook
}

export function onBeforeUnmount(fn: LifecycleHook): void {
  // Register hook
}

export function onUnmounted(fn: LifecycleHook): void {
  // Register hook
}

export function onErrorCaptured(fn: (err: Error) => void): void {
  // Register hook
}

export function onActivated(fn: LifecycleHook): void {
  // Register hook
}

export function onDeactivated(fn: LifecycleHook): void {
  // Register hook
}