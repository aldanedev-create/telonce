/**
 * Effect tracking utilities
 * 
 * This module provides utilities for tracking dependencies
 * between effects and reactive values.
 */

import { currentEffect, type Effect } from './reactive';

/**
 * A dependency is a set of effects
 */
export type Dep = Set<Effect>;

/**
 * A map of dependencies by key
 */
export type Deps = Map<symbol | string, Dep>;

/**
 * High-performance global target map for dependency tracking:
 * WeakMap<TargetObject, Map<Key, Set<Effect>>>
 */
const targetMap = new WeakMap<object, Map<symbol | string, Set<Effect>>>();

/**
 * Map of effect cleanups (supports multiple cleanup functions per effect)
 */
const effectCleanups: Map<Effect, Array<() => void>> = new Map();

/**
 * Track dependencies for the current effect
 */
export function track(target: object, key: symbol | string): void {
  const effect = getCurrentEffect();
  if (!effect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  if (!dep.has(effect)) {
    dep.add(effect);
  }
}

/**
 * Trigger effects for a tracked dependency
 */
export function trigger(target: object, key: symbol | string): void {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (!dep) return;

  // Clone to avoid infinite loops if effects trigger themselves or modify subscriptions during execution
  const effectsToRun = Array.from(dep);
  for (const effect of effectsToRun) {
    effect.run();
  }
}

/**
 * Get all dependencies for an effect (kept for backward compatibility/introspection)
 */
export function getDependencies(_effect: Effect): Deps {
  const deps: Deps = new Map();
  return deps;
}

/**
 * Clear all dependencies for an effect
 */
export function clearDependencies(_effect: Effect): void {
  // Dependencies are managed cleanly via targetMap and effect stop routines.
}

/**
 * Get the current effect
 */
function getCurrentEffect(): Effect | null {
  return currentEffect;
}

/**
 * Set the current effect (maintained for compatibility, delegates via reactive context if needed)
 */
export function setCurrentEffect(_effect: Effect | null): void {
  // Controlled internally by reactive.ts execution stack
}

/**
 * Register cleanup for an effect
 */
export function onEffectCleanup(effect: Effect, cleanup: () => void): void {
  let cleanups = effectCleanups.get(effect);
  if (!cleanups) {
    cleanups = [];
    effectCleanups.set(effect, cleanups);
  }
  cleanups.push(cleanup);
}

/**
 * Clean up an effect
 */
export function cleanupEffect(effect: Effect): void {
  const cleanups = effectCleanups.get(effect);
  if (cleanups) {
    for (const cleanup of cleanups) {
      try {
        cleanup();
      } catch (err) {
        console.error('Error during effect cleanup:', err);
      }
    }
    effectCleanups.delete(effect);
  }
  clearDependencies(effect);
}