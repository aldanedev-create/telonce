/**
 * Model directive - two-way binding
 */

import { createEffect, type Signal, type Effect } from '@teloce/reactivity';

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
  let effect: Effect | null = null;
  let isUpdatingFromDOM = false;

  function update() {
    if (isUpdatingFromDOM) return;
    const val = signal();
    
    if (el instanceof HTMLInputElement) {
      if (type === 'checkbox') {
        el.checked = val === value || (value === undefined && Boolean(val));
      } else if (type === 'radio') {
        el.checked = val === value;
      } else {
        el.value = val !== undefined && val !== null ? val : '';
      }
    } else if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      el.value = val !== undefined && val !== null ? val : '';
    }
  }

  function handleInput() {
    isUpdatingFromDOM = true;
    try {
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
    } finally {
      isUpdatingFromDOM = false;
    }
  }

  // Bind event listeners
  el.addEventListener('input', handleInput);
  const isCheckType = type === 'checkbox' || type === 'radio';
  if (isCheckType) {
    el.addEventListener('change', handleInput);
  }

  // Create reactive effect so external signal changes update the DOM element automatically
  effect = createEffect(() => {
    update();
  });

  return {
    update,
    unmount() {
      // Stop the effect subscription to prevent memory leaks
      if (effect) {
        effect.stop();
        effect = null;
      }
      el.removeEventListener('input', handleInput);
      if (isCheckType) {
        el.removeEventListener('change', handleInput);
      }
    },
  };
}