/**
 * Style directive - dynamic style binding
 */

import { type Signal } from '@teloce/reactivity';

export interface StyleDirectiveProps {
  /**
   * Style binding - object or string
   */
  style: Record<string, any> | string | Signal<any>;
}

/**
 * Style directive
 */
export function Style(props: StyleDirectiveProps): any {
  return {
    type: 'style',
    props,
  };
}

/**
 * Create a style binding
 */
export function createStyle(
  el: HTMLElement,
  binding: Signal<Record<string, any> | string>
): {
  update: () => void;
  unmount: () => void;
} {
  function update() {
    const value = binding();
    
    // Clear existing styles
    el.style.cssText = '';
    
    // Apply new styles
    if (typeof value === 'string') {
      el.style.cssText = value;
    } else if (typeof value === 'object' && value !== null) {
      for (const [key, val] of Object.entries(value)) {
        if (val !== undefined && val !== null) {
          // Convert camelCase to kebab-case if needed
          const prop = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
          el.style.setProperty(prop, String(val));
        }
      }
    }
  }

  function unmount() {
    el.style.cssText = '';
  }

  // Initial update
  update();

  return {
    update,
    unmount,
  };
}