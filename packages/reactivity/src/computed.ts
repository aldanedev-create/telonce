/**
 * Computed utilities
 * 
 * This module provides utilities for working with computed values
 * and signal-like objects.
 */

import { createSignal, createEffect, type Signal, type Computed } from './reactive';

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
      if (signal.peek() !== next) {
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