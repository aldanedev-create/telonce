/**
 * Show directive - show/hide element
 */

import { type Signal } from '@teloce/reactivity';

export interface ShowDirectiveProps {
  /**
   * Condition to show
   */
  show: boolean | Signal<boolean>;
}

/**
 * Show directive
 */
export function Show(props: ShowDirectiveProps): any {
  return {
    type: 'show',
    props,
  };
}

/**
 * Create a show/hide binding
 */
export function createShow(
  el: HTMLElement,
  condition: Signal<boolean>
): {
  update: () => void;
  unmount: () => void;
} {
  let originalDisplay = el.style.display || (typeof getComputedStyle === 'function' ? getComputedStyle(el).display : '');
  function update() {
    const value = condition();
    el.style.display = value ? originalDisplay : 'none';
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