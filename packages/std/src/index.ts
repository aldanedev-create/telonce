/**
 * @teloce/std - Standard Library
 * 
 * This is the standard library for Teloce.
 * It provides filters, transitions, animations, and utilities
 * for common use cases in templates.
 */

// Export filters
export {
  // String filters
  capitalize,
  uppercase,
  lowercase,
  trim,
  truncate,
  slugify,
  kebabCase,
  camelCase,
  snakeCase,
  startCase,
  escape,
  unescape,

  // Number filters
  currency,
  percent,
  number,
  decimal,
  round,
  floor,
  ceil,
  abs,

  // Date filters
  dateFormat,
  timeAgo,
  dateFromISO,
  relativeTime,

  // Array filters
  join,
  first,
  last,
  pluck,
  where,
  orderBy,
  groupBy,

  // Object filters
  keys,
  values,
  entries,
  pick,
  omit,
  size,

  // Create custom filter
  createFilter,
  registerFilter,
  getFilter,
  hasFilter,
  type Filter,
  type FilterMap,
} from './filters';

// Export transitions
export {
  // Transition helpers
  transition,
  animate,
  createTransition,
  createAnimation,

  // Built-in transitions
  fade,
  slide,
  scale,
  zoom,
  flip,
  collapse,

  // Transition utilities
  waitForTransition,
  waitForAnimation,
  getTransitionDuration,
  setTransitionStyles,
  withTransition,
  type Transition,
  type TransitionOptions,
  type Animation,
  type AnimationOptions,
  type TransitionManager,
} from './transitions';

// Default export
export default {
  // Filters
  capitalize,
  uppercase,
  lowercase,
  trim,
  truncate,
  slugify,
  kebabCase,
  camelCase,
  snakeCase,
  startCase,
  escape,
  unescape,
  currency,
  percent,
  number,
  decimal,
  round,
  floor,
  ceil,
  abs,
  dateFormat,
  timeAgo,
  dateFromISO,
  relativeTime,
  join,
  first,
  last,
  pluck,
  where,
  orderBy,
  groupBy,
  keys,
  values,
  entries,
  pick,
  omit,
  size,
  createFilter,
  registerFilter,
  getFilter,
  hasFilter,

  // Transitions
  transition,
  animate,
  createTransition,
  createAnimation,
  fade,
  slide,
  scale,
  zoom,
  flip,
  collapse,
  waitForTransition,
  waitForAnimation,
  getTransitionDuration,
  setTransitionStyles,
  withTransition,
};