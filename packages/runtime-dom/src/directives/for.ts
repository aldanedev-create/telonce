/**
 * For directive - keyed loop with Map<key,node> + insertBefore moves
 */

import { createEffect, type Signal, type Effect } from '@teloce/reactivity';
import { reconcileList } from '../reconciler';

export interface ForDirectiveProps<T = any> {
  /**
   * Items to iterate over
   */
  each: T[] | Signal<T[]>;

  /**
   * Key function or property name
   */
  key?: string | ((item: T, index: number) => string) | ((item: T) => string);

  /**
   * Item name in template
   */
  item?: string;

  /**
   * Index name in template
   */
  index?: string;

  /**
   * Render function
   */
  children: (item: T, index: number) => any;
}

/**
 * For directive
 */
export function For<T>(props: ForDirectiveProps<T>): any {
  return {
    type: 'for',
    props,
  };
}

/**
 * Create a keyed for loop
 */
export function createFor<T>(
  container: HTMLElement,
  items: Signal<T[]> | T[],
  renderFn: (item: T, index: number) => Node,
  keyFn: (item: T, index?: number) => string
): {
  update: () => void;
  unmount: () => void;
  getCache: () => Map<string, any>;
} {
  const cache = new Map<string, { node: Node; data: T; key: string }>();
  let currentItems: T[] = [];
  let effect: Effect | null = null;

  function update() {
    // Support both static arrays and reactive signals
    const newItems = typeof items === 'function' ? (items as Signal<T[]>)() : items;
    
    if (!Array.isArray(newItems)) {
      return;
    }

    // Reconcile the list
    reconcileList(
      currentItems,
      newItems,
      keyFn as any,
      renderFn,
      container,
      cache
    );

    currentItems = newItems;
  }

  function unmount() {
    // Stop the reactive effect subscription to prevent memory leaks
    if (effect) {
      effect.stop();
      effect = null;
    }

    // Clear all DOM nodes
    for (const [_key, entry] of cache) {
      if (entry.node.parentNode) {
        entry.node.parentNode.removeChild(entry.node);
      }
    }
    cache.clear();
    currentItems = [];
  }

  function getCache() {
    return cache;
  }

  // Create effect for reactivity if items is a signal/function
  if (typeof items === 'function') {
    effect = createEffect(() => {
      update();
    });
  } else {
    // Initial run for static arrays
    update();
  }

  return {
    update,
    unmount,
    getCache,
  };
}

// WeakMap cache to maintain stable object-reference identities across renders without Math.random()
const objectKeyCache = new WeakMap<object, string>();
let fallbackKeyCounter = 0;

/**
 * Key function helper
 */
export function getKeyFn<T>(
  key?: string | ((item: T, index: number) => string) | ((item: T) => string)
): (item: T, index?: number) => string {
  if (!key) {
    return (item: T, _index?: number) => {
      if (item === null || item === undefined) {
        return String(item);
      }
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
        return String(item);
      }
      if (typeof item === 'object') {
        let cachedKey = objectKeyCache.get(item as object);
        if (!cachedKey) {
          cachedKey = (item as any).id !== undefined 
            ? String((item as any).id) 
            : (item as any).name !== undefined 
            ? String((item as any).name) 
            : `__teloce_key_${++fallbackKeyCounter}`;
          objectKeyCache.set(item as object, cachedKey);
        }
        return cachedKey;
      }
      return String(item);
    };
  }

  if (typeof key === 'function') {
    return key as (item: T, index?: number) => string;
  }

  return (item: T, _index?: number) => {
    if (item && typeof item === 'object') {
      const val = (item as any)[key];
      if (val !== undefined && val !== null) {
        return String(val);
      }
      let cachedKey = objectKeyCache.get(item as object);
      if (!cachedKey) {
        cachedKey = `__teloce_key_${++fallbackKeyCounter}`;
        objectKeyCache.set(item as object, cachedKey);
      }
      return cachedKey;
    }
    return String(item);
  };
}