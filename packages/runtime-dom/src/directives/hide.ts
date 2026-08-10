/**
 * Hide directive - hide/show element (inverse of show)
 */

import { type Signal } from '@teloce/reactivity';

export interface HideDirectiveProps {
  /**
   * Condition to hide
   */
  hide: boolean | Signal<boolean>;
}

/**
 * Hide directive
 */
export function Hide(props: HideDirectiveProps): any {
  return {
    type: 'hide',
    props,
  };
}

/**
 * Create a hide/show binding (inverse of show)
 */
export function createHide(
  el: HTMLElement,
  condition: Signal<boolean>
): {
  update: () => void;
  unmount: () => void;
} {
  
  let originalDisplay = el.style.display || (typeof getComputedStyle === 'function' ? getComputedStyle(el).display : '');
 
  function update() {
    const value = condition();
    el.style.display = value ? 'none' : originalDisplay;
  }

  function unmount() {
    el.style.display = originalDisplay;
  }

  // Store original display
  originalDisplay = originalDisplay === 'none' ? 'block' : originalDisplay;

  // Initial update
  update();

  return {
    update,
    unmount,
  };
}