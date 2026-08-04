/**
 * For directive - keyed loop with Map<key,node> + insertBefore moves
 */

import { createEffect, type Signal } from '@teloce/reactivity';
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
  items: Signal<T[]>,
  renderFn: (item: T, index: number) => Node,
  keyFn: (item: T) => string
): {
  update: () => void;
  unmount: () => void;
  getCache: () => Map<string, any>;
} {
  const cache = new Map<string, { node: Node; data: T; key: string }>();
  let currentItems: T[] = [];
  let isMounted = false;

  function update() {
    const newItems = items();
    
    // Reconcile the list
    const result = reconcileList(
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
    // Clear all nodes
    for (const [key, entry] of cache) {
      if (entry.node.parentNode) {
        entry.node.parentNode.removeChild(entry.node);
      }
    }
    cache.clear();
    currentItems = [];
    isMounted = false;
  }

  function getCache() {
    return cache;
  }

  // Create effect for reactivity
  const effect = createEffect(() => {
    if (!isMounted) {
      isMounted = true;
      update();
    } else {
      update();
    }
  });

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
      // Use item itself if primitive, or fallback to index
      if (typeof item === 'string' || typeof item === 'number') {
        return String(item);
      }
      // Try to use id or name
      const obj = item as any;
      return obj.id !== undefined ? String(obj.id) : 
             obj.name !== undefined ? String(obj.name) : 
             String(Math.random());
    };
  }

  if (typeof key === 'function') {
    return key;
  }

  return (item: T) => {
    const obj = item as any;
    return String(obj[key]);
  };
}