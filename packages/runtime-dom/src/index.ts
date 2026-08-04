/**
 * @teloce/runtime-dom - DOM Runtime
 * 
 * This is the DOM runtime for Teloce.
 * It provides reconciliation, directives, and event handling
 * with keyed loops and direct DOM updates.
 */

// Export reconciler
export { 
  createRenderer, 
  reconcileList, 
  reconcileChildren,
  type Renderer, 
  type ReconciliationResult,
  type RendererOptions
} from './reconciler';

// Export directives
export { If, Else, createIf } from './directives/if';
export { For, createFor } from './directives/for';
export { Model, createModel } from './directives/model';
export { Class, createClass } from './directives/class';
export { Style, createStyle } from './directives/style';
export { Show, createShow } from './directives/show';
export { Hide, createHide } from './directives/hide';

// Export events
export { 
  createEventBinding, 
  bindEvents, 
  unbindEvents,
  createEventHandlers,
  type EventBinding, 
  type EventHandler,
  type EventHandlerMap
} from './events';

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