/**
 * Computed utilities
 * 
 * This module provides utilities for working with computed values
 * and signal-like objects.
 */

import { createSignal, createEffect, getCurrentEffect, setCurrentEffect, type Signal, type Computed, type Effect } from './reactive';

/**
 * Check if a value is a computed signal
 */
export function isComputed<T>(value: any): value is Computed<T> {
  return value && typeof value === 'function' && 'peek' in value;
}

/**
 * Check if a value is a signal
 */
export function isSignal<T>(value: any): value is Signal<T> {
  return value && typeof value === 'function' && 'set' in value && 'peek' in value;
}

/**
 * Signal-like type
 */
export type SignalLike<T> = Signal<T> | Computed<T> | (() => T);

/**
 * Create a computed signal (lazy evaluation with caching and dirty flag management)
 */
export function computed<T>(fn: () => T): Computed<T> {
  let value: T;
  let dirty = true;
  const subscribers = new Set<Effect>();
  const deps = new Set<Set<Effect>>();

  const computationEffect: Effect = {
    deps,
    run() {
      if (!dirty) {
        dirty = true;
        // Notify all outer subscribers that this computed value is now dirty/stale
        const currentSubs = Array.from(subscribers);
        for (const sub of currentSubs) {
          sub.run();
        }
      }
    },
    stop() {
      for (const dep of deps) {
        dep.delete(computationEffect);
      }
      deps.clear();
      subscribers.clear();
    }
  };

  const computedFn = (() => {
    const activeEffect = getCurrentEffect();
    if (activeEffect) {
      subscribers.add(activeEffect);
      activeEffect.deps.add(subscribers);
    }

    if (dirty) {
      // Clean up old dependencies before re-evaluating
      for (const dep of deps) {
        dep.delete(computationEffect);
      }
      deps.clear();

      const prev = getCurrentEffect();
      setCurrentEffect(computationEffect);
      try {
        const nextValue = fn();
        if (!Object.is(value, nextValue)) {
          value = nextValue;
        }
      } finally {
        setCurrentEffect(prev);
        dirty = false;
      }
    }

    return value;
  }) as Computed<T>;

  computedFn.peek = () => {
    if (dirty) {
      const prev = getCurrentEffect();
      setCurrentEffect(null);
      try {
        value = fn();
      } finally {
        setCurrentEffect(prev);
        dirty = false;
      }
    }
    return value;
  };

  return computedFn;
}

/**
 * Alias for computed
 */
export function createComputed<T>(fn: () => T): Computed<T> {
  return computed(fn);
}

/**
 * Convert a signal-like value to a signal
 */
export function toSignal<T>(value: SignalLike<T>): Signal<T> {
  if (isSignal<T>(value)) {
    return value;
  }

  if (isComputed<T>(value)) {
    const signal = createSignal<T>(value());
    createEffect(() => {
      signal.set(value());
    });
    return signal;
  }

  if (typeof value === 'function') {
    const signal = createSignal<T>(value());
    createEffect(() => {
      const next = value();
      if (!Object.is(signal.peek(), next)) {
        signal.set(next);
      }
    });
    return signal;
  }

  return createSignal<T>(value);
}

/**
 * Get the value of a signal-like object
 */
export function getValue<T>(value: SignalLike<T>): T {
  if (typeof value === 'function') {
    return value();
  }
  return value as T;
}

/**
 * Set the value of a signal-like object
 * (only works for actual signals)
 */
export function setValue<T>(value: SignalLike<T>, newValue: T): void {
  if (isSignal(value)) {
    value.set(newValue);
  }
  // Computed and functions are read-only
}