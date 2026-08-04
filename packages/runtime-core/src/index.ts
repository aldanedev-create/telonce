/**
 * @teloce/runtime-core - Runtime Core
 * 
 * This is the core runtime for Teloce.
 * It provides the component system, lifecycle management,
 * props handling, slots, and directive registration.
 */

// Export component system
export {
  createComponent,
  defineComponent,
  type Component,
  type ComponentOptions,
  type ComponentInstance,
  type ComponentContext
} from './component';

// Export lifecycle
export {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onActivated,
  onDeactivated,
  runLifecycle,
  type LifecycleHook,
  type LifecycleManager
} from './component/lifecycle';

// Export props
export {
  defineProps,
  validateProps,
  mergeProps,
  type PropDefinition,
  type PropValidator,
  type PropsOptions
} from './component/props';

// Export slots
export {
  createSlots,
  renderSlot,
  renderSlots,
  type Slot,
  type SlotContext,
  type SlotsManager
} from './component/slots';

// Export directives
export {
  registerDirective,
  getDirective,
  hasDirective,
  createDirective,
  type Directive,
  type DirectiveOptions,
  type DirectiveRegistry
} from './directives/register';

export {
  resolveDirective,
  resolveDirectives,
  type DirectiveResolver,
  type DirectiveResolution
} from './directives/resolver';

// Default export
export default {
  createComponent,
  defineComponent,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onActivated,
  onDeactivated,
  runLifecycle,
  defineProps,
  validateProps,
  mergeProps,
  createSlots,
  renderSlot,
  renderSlots,
  registerDirective,
  getDirective,
  hasDirective,
  createDirective,
  resolveDirective,
  resolveDirectives,
};