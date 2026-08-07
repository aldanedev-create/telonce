/**
 * @teloce/runtime-dom - DOM Runtime
 * 
 * This is the DOM runtime for Teloce.
 * It provides reconciliation, directives, and event handling
 * with keyed loops and direct DOM updates.
 */

// Import locally so they exist in scope for the default export object
import { 
  createRenderer, 
  reconcileList, 
  reconcileChildren,
  type Renderer, 
  type ReconciliationResult,
  type RendererOptions
} from './reconciler';

import { If, Else, createIf } from './directives/if';
import { For, createFor } from './directives/for';
import { Model, createModel } from './directives/model';
import { Class, createClass } from './directives/class';
import { Style, createStyle } from './directives/style';
import { Show, createShow } from './directives/show';
import { Hide, createHide } from './directives/hide';

import { 
  createEventBinding, 
  bindEvents, 
  unbindEvents,
  createEventHandlers,
  type EventBinding, 
  type EventHandler,
  type EventHandlerMap
} from './events';

// Export reconciler
export { 
  createRenderer, 
  reconcileList, 
  reconcileChildren,
  type Renderer, 
  type ReconciliationResult,
  type RendererOptions
};

// Export directives
export { If, Else, createIf };
export { For, createFor };
export { Model, createModel };
export { Class, createClass };
export { Style, createStyle };
export { Show, createShow };
export { Hide, createHide };

// Export events
export { 
  createEventBinding, 
  bindEvents, 
  unbindEvents,
  createEventHandlers,
  type EventBinding, 
  type EventHandler,
  type EventHandlerMap
};

// Default export
export default {
  createRenderer,
  reconcileList,
  reconcileChildren,
  If,
  Else,
  For,
  Model,
  Class,
  Style,
  Show,
  Hide,
  createIf,
  createFor,
  createModel,
  createClass,
  createStyle,
  createShow,
  createHide,
  createEventBinding,
  bindEvents,
  unbindEvents,
  createEventHandlers,
};