/**
 * @teloce/reactivity - Reactivity System
 * 
 * This is the reactivity system for Teloce.
 * It provides signals, effects, and computed values
 * for fine-grained reactive updates.
 */

import {
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
  type Memo,
} from './reactive';

import {
  track,
  trigger,
  getDependencies,
  clearDependencies,
  type Dep,
  type Deps,
} from './effect';

import { isComputed, isSignal, toSignal, type SignalLike } from './computed';

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
  type Memo,
};

export {
  track,
  trigger,
  getDependencies,
  clearDependencies,
  type Dep,
  type Deps,
};

export { isComputed, isSignal, toSignal, type SignalLike };

export default {
  createSignal,
  createEffect,
  createComputed,
  createMemo,
  batch,
  untracked,
  currentEffect,
  track,
  trigger,
  getDependencies,
  clearDependencies,
  isComputed,
  isSignal,
  toSignal,
};