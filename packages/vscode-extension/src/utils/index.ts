/**
 * Teloce VS Code Extension - Utilities
 * 
 * This file exports all utility functions for the Teloce VS Code extension.
 */

// Export all utilities
export {
  getDocumentContent,
  getCursorPosition,
  getWordAtPosition,
  getLineText,
  getIndentation,
  getLanguageId,
  isTeloceFile,
  isHTMLFile,
  getFileExtension,
  getWorkspaceRoot,
  getConfig,
  getConfigValue,
  setConfigValue,
  showErrorMessage,
  showWarningMessage,
  showInfoMessage,
  showStatusMessage,
  withProgress,
  formatDuration,
  formatFileSize,
  debounce,
  throttle,
  escapeHtml,
  unescapeHtml,
  trimLines,
  dedent,
  normalizePath,
  isPathRelative,
  isPathAbsolute,
  getRelativePath,
  getAbsolutePath,
  fileExists,
  directoryExists,
  readFile,
  writeFile,
  createTempFile,
  deleteTempFile,
  getTempDir,
} from './helpers.js';

// Export logger
export {
  createLogger,
  getLogger,
  setLogLevel,
  LogLevel,
  type Logger,
  type LoggerOptions,
} from './logger.js';

// Export telemetry
export {
  createTelemetry,
  getTelemetry,
  trackEvent,
  trackError,
  trackTiming,
  type Telemetry,
  type TelemetryOptions,
  type TelemetryEvent,
} from './telemetry.js';

// Export cache
export {
  createCache,
  getCache,
  clearCache,
  type Cache,
  type CacheOptions,
} from './cache.js';