/**
 * Model directive - two-way binding with reactive syncing, checkbox support, and numeric conversion
 */

import { createEffect, type Signal, type Effect } from '@teloce/reactivity';

export interface ModelDirectiveProps {
  /**
   * Signal to bind to
   */
  model?: Signal<any>;

  /**
   * Input type override
   */
  type?: 'text' | 'checkbox' | 'radio' | 'select' | 'textarea' | 'number' | string;

  /**
   * Value for checkbox/radio
   */
  value?: any;

  /**
   * True value for custom checkbox binding
   */
  trueValue?: any;

  /**
   * False value for custom checkbox binding
   */
  falseValue?: any;

  /**
   * Force numeric type conversion
   */
  number?: boolean;
}

/**
 * Model directive
 */
export function Model(props: ModelDirectiveProps = {}): any {
  return {
    type: 'model',
    props,
  };
}

/**
 * Create a two-way binding with full reactive synchronization
 */
export function createModel(
  el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  signal?: Signal<any>,
  options: ModelDirectiveProps = {}
): {
  update: () => void;
  unmount: () => void;
} {
  const type = options.type || el.type || 'text';
  const value = options.value;
  const trueValue = options.trueValue !== undefined ? options.trueValue : true;
  const falseValue = options.falseValue !== undefined ? options.falseValue : false;
  const forceNumber = options.number || type === 'number';

  let effect: Effect | null = null;
  let isUpdatingFromDOM = false;

  function update() {
    if (isUpdatingFromDOM || !signal) return;
    const val = signal();

    if (el instanceof HTMLInputElement) {
      if (type === 'checkbox') {
        if (Array.isArray(val)) {
          el.checked = val.includes(value !== undefined ? value : el.value);
        } else if (value !== undefined) {
          el.checked = val === value;
        } else {
          el.checked = val === trueValue || Boolean(val);
        }
      } else if (type === 'radio') {
        el.checked = val === value;
      } else {
        el.value = val !== undefined && val !== null ? String(val) : '';
      }
    } else if (el instanceof HTMLSelectElement) {
      if (el.multiple && Array.isArray(val)) {
        for (const option of Array.from(el.options)) {
          option.selected = val.includes(option.value);
        }
      } else {
        el.value = val !== undefined && val !== null ? String(val) : '';
      }
    } else if (el instanceof HTMLTextAreaElement) {
      el.value = val !== undefined && val !== null ? String(val) : '';
    }
  }

  function handleInput() {
    if (!signal) return;
    isUpdatingFromDOM = true;
    try {
      if (el instanceof HTMLInputElement) {
        if (type === 'checkbox') {
          const currentVal = signal();
          if (Array.isArray(currentVal)) {
            const itemVal = value !== undefined ? value : el.value;
            if (el.checked) {
              if (!currentVal.includes(itemVal)) {
                signal.set([...currentVal, itemVal]);
              }
            } else {
              signal.set(currentVal.filter((v: any) => v !== itemVal));
            }
          } else if (value !== undefined) {
            signal.set(el.checked ? value : falseValue);
          } else {
            signal.set(el.checked ? trueValue : falseValue);
          }
        } else if (type === 'radio') {
          if (el.checked) {
            signal.set(value);
          }
        } else if (type === 'number' || forceNumber) {
          const num = parseFloat(el.value);
          signal.set(isNaN(num) ? el.value : num);
        } else {
          signal.set(el.value);
        }
      } else if (el instanceof HTMLSelectElement) {
        if (el.multiple) {
          const selectedValues = Array.from(el.selectedOptions).map(opt => opt.value);
          signal.set(selectedValues);
        } else {
          const val = el.value;
          if (forceNumber) {
            const num = parseFloat(val);
            signal.set(isNaN(num) ? val : num);
          } else {
            signal.set(val);
          }
        }
      } else if (el instanceof HTMLTextAreaElement) {
        signal.set(el.value);
      }
    } finally {
      isUpdatingFromDOM = false;
    }
  }

  // Bind event listeners
  const eventName = (type === 'checkbox' || type === 'radio' || el instanceof HTMLSelectElement) ? 'change' : 'input';
  el.addEventListener(eventName, handleInput);
  if (type === 'checkbox' || type === 'radio') {
    el.addEventListener('input', handleInput);
  }

  // Create reactive effect so external signal changes update the DOM element automatically
  if (signal) {
    effect = createEffect(() => {
      update();
    });
  }

  return {
    update,
    unmount() {
      // Stop the effect subscription to prevent memory leaks
      if (effect) {
        effect.stop();
        effect = null;
      }
      el.removeEventListener(eventName, handleInput);
      if (type === 'checkbox' || type === 'radio') {
        el.removeEventListener('input', handleInput);
      }
    },
  };
}