/**
 * Computed utilities
 * 
 * This module provides utilities for working with computed values
 * and signal-like objects.
 */

import { createSignal, createComputed, type Signal, type Computed } from './reactive';

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
 * Convert a signal-like value to a signal
 */
export function toSignal<T>(value: SignalLike<T>): Signal<T> {
  // If it's already a signal, return it
  if (isSignal(value)) {
    return value;
  }

  // If it's a computed, wrap it in a signal
  if (isComputed(value)) {
    const [get, set] = createSignal(value());
    createEffect(() => {
      set(value());
    });
    return get as Signal<T>;
  }

  // If it's a function, wrap it
  if (typeof value === 'function') {
    const [get, set] = createSignal(value());
    createEffect(() => {
      const newVal = value();
      if (get() !== newVal) {
        set(newVal);
      }
    });
    return get as Signal<T>;
  }

  // It's a raw value - create a signal from it
  return createSignal(value);
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