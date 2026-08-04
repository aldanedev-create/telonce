/**
 * @teloce/runtime-core - Runtime Core
 * 
 * This is the core runtime for Teloce.
 * It provides the component system, lifecycle management,
 * props handling, slots, and directive registration.
 */

import {
  createComponent,
  defineComponent,
} from './component';

import {
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
} from './component/lifecycle';

import {
  defineProps,
  validateProps,
  mergeProps,
} from './component/props';

import {
  createSlots,
  renderSlot,
  renderSlots,
} from './component/slots';

import {
  registerDirective,
  getDirective,
  hasDirective,
  createDirective,
} from './directives/register';

import {
  resolveDirective,
  resolveDirectives,
} from './directives/resolver';

// Export component system
export {
  createComponent,
  defineComponent,
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
} from './component/lifecycle';

// Export props
export {
  defineProps,
  validateProps,
  mergeProps,
} from './component/props';

// Export slots
export {
  createSlots,
  renderSlot,
  renderSlots,
} from './component/slots';

// Export directives
export {
  registerDirective,
  getDirective,
  hasDirective,
  createDirective,
} from './directives/register';

export {
  resolveDirective,
  resolveDirectives,
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