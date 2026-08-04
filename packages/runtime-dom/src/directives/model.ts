/**
 * Model directive - two-way binding
 */

import { type Signal } from '@teloce/reactivity';

export interface ModelDirectiveProps {
  /**
   * Signal to bind to
   */
  model: Signal<any>;

  /**
   * Input type
   */
  type?: 'text' | 'checkbox' | 'radio' | 'select' | 'textarea';

  /**
   * Value for checkbox/radio
   */
  value?: any;
}

/**
 * Model directive
 */
export function Model(props: ModelDirectiveProps): any {
  return {
    type: 'model',
    props,
  };
}

/**
 * Create a two-way binding
 */
export function createModel(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  signal: Signal<any>,
  options: { type?: string; value?: any } = {}
): {
  update: () => void;
  unmount: () => void;
} {
  const { type = 'text', value } = options;

  function update() {
    const val = signal();
    
    if (el instanceof HTMLInputElement) {
      if (type === 'checkbox') {
        el.checked = val === value || (value === undefined && Boolean(val));
      } else if (type === 'radio') {
        el.checked = val === value;
      } else {
        el.value = val;
      }
    } else if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      el.value = val;
    }
  }

  function handleInput() {
    if (el instanceof HTMLInputElement) {
      if (type === 'checkbox') {
        signal.set(el.checked);
      } else if (type === 'radio') {
        if (el.checked) {
          signal.set(value);
        }
      } else {
        signal.set(el.value);
      }
    } else if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      signal.set(el.value);
    }
  }

  // Bind event listeners
  el.addEventListener('input', handleInput);
  if (type === 'checkbox' || type === 'radio') {
    el.addEventListener('change', handleInput);
  }

  // Initial update
  update();

  return {
    update,
    unmount() {
      el.removeEventListener('input', handleInput);
      el.removeEventListener('change', handleInput);
    },
  };
}