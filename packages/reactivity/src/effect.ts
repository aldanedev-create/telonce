/**
 * Effect tracking utilities
 * 
 * This module provides utilities for tracking dependencies
 * between effects and reactive values.
 */

import type { Effect } from './reactive';

/**
 * A dependency is a set of effects
 */
export type Dep = Set<Effect>;

/**
 * A map of dependencies by key
 */
export type Deps = Map<symbol | string, Dep>;

/**
 * Map of effects to their dependencies
 */
const depsMap: Map<Effect, Deps> = new Map();

/**
 * Map of effect cleanups
 */
const effectCleanups: Map<Effect, () => void> = new Map();

/**
 * Track dependencies for the current effect
 */
export function track(_target: object, key: symbol | string): void {
  const effect = getCurrentEffect();
  if (!effect) return;

  let deps = depsMap.get(effect);
  if (!deps) {
    deps = new Map();
    depsMap.set(effect, deps);
  }

  let dep = deps.get(key);
  if (!dep) {
    dep = new Set();
    deps.set(key, dep);
  }

  dep.add(effect);
}

/**
 * Trigger effects for a tracked dependency
 */
export function trigger(_target: object, key: symbol | string): void {
  const effects = new Set<Effect>();

  for (const [effect, deps] of depsMap) {
    const dep = deps.get(key);
    if (dep && dep.has(effect)) {
      effects.add(effect);
    }
  }

  for (const effect of effects) {
    effect.run();
  }
}

/**
 * Get all dependencies for an effect
 */
export function getDependencies(effect: Effect): Deps {
  return depsMap.get(effect) || new Map();
}

/**
 * Clear all dependencies for an effect
 */
export function clearDependencies(effect: Effect): void {
  depsMap.delete(effect);
}

/**
 * Get the current effect
 */
function getCurrentEffect(): Effect | null {
  // This is imported from reactive.ts
  // Using global reference
  return (globalThis as any).__currentEffect || null;
}

/**
 * Set the current effect
 */
export function setCurrentEffect(effect: Effect | null): void {
  (globalThis as any).__currentEffect = effect;
}

/**
 * Register cleanup for an effect
 */
export function onEffectCleanup(effect: Effect, cleanup: () => void): void {
  effectCleanups.set(effect, cleanup);
}

/**
 * Clean up an effect
 */
export function cleanupEffect(effect: Effect): void {
  const cleanup = effectCleanups.get(effect);
  if (cleanup) {
    cleanup();
    effectCleanups.delete(effect);
  }
  clearDependencies(effect);
}