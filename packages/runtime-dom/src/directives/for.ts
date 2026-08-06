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
  key?: string | ((item: T) => string);

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
  keyFn: (item: T) => string
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
      keyFn,
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

/**
 * Key function helper
 */
export function getKeyFn<T>(
  key?: string | ((item: T) => string)
): (item: T) => string {
  if (!key) {
    return (item: T) => {
      // Use item itself if primitive, or fallback to object properties
      if (typeof item === 'string' || typeof item === 'number') {
        return String(item);
      }
      const obj = item as any;
      if (obj && typeof obj === 'object') {
        if (obj.id !== undefined) return String(obj.id);
        if (obj.name !== undefined) return String(obj.name);
      }
      return String(Math.random());
    };
  }

  if (typeof key === 'function') {
    return key;
  }

  return (item: T) => {
    const obj = item as any;
    return obj ? String(obj[key]) : String(Math.random());
  };
}