/**
 * Shared constants used across Teloce packages
 */

export const VERSION = '0.1.0';
export const NAME = 'Teloce';
export const PACKAGE_NAME = '@teloce/core';

// Server defaults
export const DEFAULT_PORT = 5173;
export const DEFAULT_HOST = 'localhost';
export const DEFAULT_DEBUG_PORT = 9000;

// URLs
export const CDN_URL = 'https://cdn.teloce.dev';
export const REPO_URL = 'https://github.com/telocejs/teloce';
export const DOCS_URL = 'https://docs.teloce.dev';
export const SUPPORT_URL = 'https://github.com/telocejs/teloce/discussions';

// File extensions
export const FILE_EXTENSIONS = {
  TEMPLATE: '.teloce',
  SFC: '.vel',
  CONFIG: '.teloce.config',
  TYPES: '.d.ts',
  JS: '.js',
  MJS: '.mjs',
  CJS: '.cjs',
  TS: '.ts',
  MTS: '.mts',
  CTS: '.cts',
  JSON: '.json',
  CSS: '.css',
  HTML: '.html',
  MAP: '.map',
} as const;

// Built-in directives
export const DIRECTIVES = [
  'for',
  'if',
  'else',
  'show',
  'hide',
  'switch',
  'case',
  'default',
  'slot',
  'component',
  'template',
  'fragment',
  'portal',
  'teleport',
  'transition',
  'animate',
  'page',
  'layout',
] as const;

// Event modifiers
export const EVENT_MODIFIERS = [
  'stop',
  'prevent',
  'self',
  'once',
  'passive',
  'capture',
  'left',
  'right',
  'middle',
  'enter',
  'tab',
  'space',
  'ctrl',
  'shift',
  'alt',
  'meta',
  'exact',
] as const;

// Built-in filters
export const BUILTIN_FILTERS = [
  'capitalize',
  'uppercase',
  'lowercase',
  'trim',
  'truncate',
  'slugify',
  'kebabCase',
  'camelCase',
  'snakeCase',
  'startCase',
  'escape',
  'unescape',
  'currency',
  'percent',
  'number',
  'decimal',
  'round',
  'floor',
  'ceil',
  'abs',
  'dateFormat',
  'timeAgo',
  'dateFromISO',
  'relativeTime',
  'join',
  'first',
  'last',
  'pluck',
  'where',
  'orderBy',
  'groupBy',
  'keys',
  'values',
  'entries',
  'pick',
  'omit',
  'size',
] as const;

// Error codes
export const ERROR_CODES = {
  // Compilation errors
  COMPILE_ERROR: 'COMPILE_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  LEXER_ERROR: 'LEXER_ERROR',
  AST_ERROR: 'AST_ERROR',

  // Runtime errors
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  REACTIVITY_ERROR: 'REACTIVITY_ERROR',
  RENDER_ERROR: 'RENDER_ERROR',

  // Framework errors
  FRAMEWORK_ERROR: 'FRAMEWORK_ERROR',
  TEMPLATE_ERROR: 'TEMPLATE_ERROR',
  COMPONENT_ERROR: 'COMPONENT_ERROR',

  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  WEBSOCKET_ERROR: 'WEBSOCKET_ERROR',
  PROXY_ERROR: 'PROXY_ERROR',

  // Plugin errors
  PLUGIN_ERROR: 'PLUGIN_ERROR',
  PLUGIN_NOT_FOUND: 'PLUGIN_NOT_FOUND',
  PLUGIN_VERSION_MISMATCH: 'PLUGIN_VERSION_MISMATCH',

  // Config errors
  CONFIG_ERROR: 'CONFIG_ERROR',
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  CONFIG_INVALID: 'CONFIG_INVALID',

  // File errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
  FILE_WRITE_ERROR: 'FILE_WRITE_ERROR',
} as const;

// Log levels
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
} as const;

// Export types
export type Directive = typeof DIRECTIVES[number];
export type EventModifier = typeof EVENT_MODIFIERS[number];
export type BuiltinFilter = typeof BUILTIN_FILTERS[number];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];