/**
 * @teloce/shared - Internal Shared Utilities
 * 
 * ⚠️ This package is internal only and never published to npm.
 * 
 * It provides shared utilities, constants, types, and file system
 * helpers used across Teloce packages.
 */

// Export constants
export {
  VERSION,
  NAME,
  PACKAGE_NAME,
  DEFAULT_PORT,
  DEFAULT_HOST,
  DEFAULT_DEBUG_PORT,
  CDN_URL,
  REPO_URL,
  DOCS_URL,
  SUPPORT_URL,
  FILE_EXTENSIONS,
  DIRECTIVES,
  EVENT_MODIFIERS,
  BUILTIN_FILTERS,
  ERROR_CODES,
  LOG_LEVELS,
} from './constants';

// Export filesystem utilities
export {
  FileSystem,
  createFileSystem,
  readFile,
  writeFile,
  exists,
  mkdir,
  readdir,
  remove,
  copy,
  move,
  resolve,
  dirname,
  basename,
  extname,
  join,
  normalize,
  isAbsolute,
  relative,
  glob,
  watch,
  type FileSystemOptions,
  type FileEntry,
  type FileStats,
  type WatchEvent,
  type WatchOptions,
  type GlobOptions,
} from './filesystem';

// Export types
export {
  type Result,
  type Option,
  type Either,
  type Maybe,
  type AsyncResult,
  type AsyncOption,
  type AsyncEither,
  type AsyncMaybe,
  type Logger,
  type LoggerOptions,
  type Config,
  type ConfigOptions,
  type ErrorWithCode,
  type ErrorWithStack,
  type Serializable,
  type JSONValue,
  type JSONObject,
  type JSONArray,
  type DeepReadonly,
  type DeepPartial,
  type DeepRequired,
  type NonNullableProps,
  type OptionalProps,
  type RequiredProps,
} from './types';

// Default export
export default {
  // Constants
  VERSION,
  NAME,
  PACKAGE_NAME,
  DEFAULT_PORT,
  DEFAULT_HOST,
  DEFAULT_DEBUG_PORT,
  CDN_URL,
  REPO_URL,
  DOCS_URL,
  SUPPORT_URL,
  FILE_EXTENSIONS,
  DIRECTIVES,
  EVENT_MODIFIERS,
  BUILTIN_FILTERS,
  ERROR_CODES,
  LOG_LEVELS,

  // FileSystem
  FileSystem,
  createFileSystem,
  readFile,
  writeFile,
  exists,
  mkdir,
  readdir,
  remove,
  copy,
  move,
  resolve,
  dirname,
  basename,
  extname,
  join,
  normalize,
  isAbsolute,
  relative,
  glob,
  watch,
};