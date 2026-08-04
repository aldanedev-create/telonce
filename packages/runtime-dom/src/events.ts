/**
 * Events - event binding and handling
 */

/**
 * Event handler function
 */
export type EventHandler = (event: Event) => void;

/**
 * Event handler map
 */
export type EventHandlerMap = Record<string, EventHandler>;

/**
 * Event binding
 */
export interface EventBinding {
  /**
   * Event name
   */
  event: string;

  /**
   * Handler function
   */
  handler: EventHandler;

  /**
   * Options
   */
  options?: AddEventListenerOptions;
}

/**
 * Create an event binding
 */
export function createEventBinding(
  event: string,
  handler: EventHandler,
  options?: AddEventListenerOptions
): EventBinding {
  return {
    event,
    handler,
    options,
  };
}

/**
 * Bind events to an element
 */
export function bindEvents(
  el: HTMLElement | EventTarget,
  bindings: EventBinding[]
): () => void {
  for (const binding of bindings) {
    el.addEventListener(binding.event, binding.handler, binding.options);
  }

  // Return unbind function
  return () => {
    unbindEvents(el, bindings);
  };
}

/**
 * Unbind events from an element
 */
export function unbindEvents(
  el: HTMLElement | EventTarget,
  bindings: EventBinding[]
): void {
  for (const binding of bindings) {
    el.removeEventListener(binding.event, binding.handler, binding.options);
  }
}

/**
 * Create event handlers from a map
 */
export function createEventHandlers(
  handlers: EventHandlerMap
): EventBinding[] {
  const bindings: EventBinding[] = [];

  for (const [event, handler] of Object.entries(handlers)) {
    bindings.push(createEventBinding(event, handler));
  }

  return bindings;
}

/**
 * Event modifier helpers
 */
export const EventModifiers = {
  /**
   * Stop propagation
   */
  stop: (handler: EventHandler): EventHandler => {
    return (event: Event) => {
      event.stopPropagation();
      handler(event);
    };
  },

  /**
   * Prevent default
   */
  prevent: (handler: EventHandler): EventHandler => {
    return (event: Event) => {
      event.preventDefault();
      handler(event);
    };
  },

  /**
   * Self - only trigger if event target is the element itself
   */
  self: (el: HTMLElement, handler: EventHandler): EventHandler => {
    return (event: Event) => {
      if (event.target === el) {
        handler(event);
      }
    };
  },

  /**
   * Once - trigger only once
   */
  once: (handler: EventHandler): EventHandler => {
    let called = false;
    return (event: Event) => {
      if (!called) {
        called = true;
        handler(event);
      }
    };
  },

  /**
   * Capture - use capture phase
   */
  capture: (handler: EventHandler): EventHandler => {
    return handler;
  },
};

/**
 * Parse event string with modifiers
 * @example parseEvent('click.stop.prevent') => { event: 'click', modifiers: ['stop', 'prevent'] }
 */
export function parseEvent(eventString: string): {
  event: string;
  modifiers: string[];
} {
  const parts = eventString.split('.');
  const event = parts[0];
  const modifiers = parts.slice(1);
  return { event, modifiers };
}

/**
 * Create event handler with modifiers
 */
export function createEventHandlerWithModifiers(
  el: HTMLElement,
  eventString: string,
  handler: EventHandler
): EventBinding {
  const { event, modifiers } = parseEvent(eventString);
  let finalHandler = handler;

  // Apply modifiers
  const options: AddEventListenerOptions = {};

  for (const mod of modifiers) {
    switch (mod) {
      case 'stop':
        finalHandler = EventModifiers.stop(finalHandler);
        break;
      case 'prevent':
        finalHandler = EventModifiers.prevent(finalHandler);
        break;
      case 'self':
        finalHandler = EventModifiers.self(el, finalHandler);
        break;
      case 'once':
        finalHandler = EventModifiers.once(finalHandler);
        break;
      case 'capture':
        options.capture = true;
        break;
      case 'passive':
        options.passive = true;
        break;
    }
  }

  return createEventBinding(event, finalHandler, options);
}