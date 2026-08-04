/**
 * Class directive - dynamic class binding
 */

import { type Signal } from '@teloce/reactivity';

export interface ClassDirectiveProps {
  /**
   * Class binding - string, object, or array
   */
  class: string | Record<string, boolean> | (string | Record<string, boolean>)[] | Signal<any>;
}

/**
 * Class directive
 */
export function Class(props: ClassDirectiveProps): any {
  return {
    type: 'class',
    props,
  };
}

/**
 * Create a class binding
 */
export function createClass(
  el: HTMLElement,
  binding: Signal<string | Record<string, boolean> | (string | Record<string, boolean>)[]>
): {
  update: () => void;
  unmount: () => void;
} {
  function update() {
    const value = binding();
    
    // Remove all existing classes
    el.className = '';
    
    // Apply new classes
    const classes = normalizeClasses(value);
    for (const cls of classes) {
      el.classList.add(cls);
    }
  }

  function unmount() {
    el.className = '';
  }

  // Initial update
  update();

  return {
    update,
    unmount,
  };
}

/**
 * Normalize class binding to array of strings
 */
function normalizeClasses(
  value: string | Record<string, boolean> | (string | Record<string, boolean>)[] | any
): string[] {
  const result: string[] = [];

  if (typeof value === 'string') {
    return value.split(' ').filter(Boolean);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      result.push(...normalizeClasses(item));
    }
    return result;
  }

  if (typeof value === 'object' && value !== null) {
    for (const [key, val] of Object.entries(value)) {
      if (val) {
        result.push(key);
      }
    }
    return result;
  }

  return result;
}