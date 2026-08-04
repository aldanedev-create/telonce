/**
 * @teloce/reactivity - Reactivity System
 * 
 * This is the reactivity system for Teloce.
 * It provides signals, effects, and computed values
 * for fine-grained reactive updates.
 */

// Export all reactivity functionality
export { 
  createSignal, 
  createEffect, 
  createComputed, 
  createMemo, 
  batch, 
  untracked,
  currentEffect,
  type Signal,
  type Effect,
  type Computed,
  type Memo
} from './reactive';

// Export effect tracking utilities
export { 
  track, 
  trigger, 
  getDependencies, 
  clearDependencies,
  type Dep,
  type Deps
} from './effect';

// Export computed utilities
export { 
  isComputed,
  isSignal,
  toSignal,
  type SignalLike
} from './computed';

// Default export
export default {
  createSignal,
  createEffect,
  createComputed,
  createMemo,
  batch,
  untracked,
  track,
  trigger,
  getDependencies,
  clearDependencies,
  isComputed,
  isSignal,
  toSignal,
};