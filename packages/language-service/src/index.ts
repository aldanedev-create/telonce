/**
 * @teloce/language-service - Language Service
 * 
 * This package provides language services for Teloce templates.
 * It includes autocomplete, diagnostics, hover information, and formatting.
 * 
 * ⚠️ Currently this package is designed to be consumed by editor extensions
 * (VS Code, Neovim, etc.) but can also be used programmatically.
 */

// Export capabilities
export {
  getCompletions,
  getCompletionItems,
  type CompletionItem,
  type CompletionContext,
  type CompletionProvider,
} from './capabilities/completion';

export {
  getDiagnostics,
  validateTemplate,
  type Diagnostic,
  type DiagnosticSeverity,
  type DiagnosticProvider,
} from './capabilities/diagnostics';

export {
  getHoverInfo,
  type HoverInfo,
  type HoverProvider,
} from './capabilities/hover';

export {
  formatTemplate,
  type FormatOptions,
  type FormatterProvider,
} from './capabilities/formatter';

// Export JSDoc bridge
export {
  parseJSDoc,
  validateJSDoc,
  generateTypes,
  type JSDocResult,
  type JSDocTag,
  type JSDocType,
} from './jsdoc';

// Default export
export default {
  getCompletions,
  getCompletionItems,
  getDiagnostics,
  validateTemplate,
  getHoverInfo,
  formatTemplate,
  parseJSDoc,
  validateJSDoc,
  generateTypes,
};