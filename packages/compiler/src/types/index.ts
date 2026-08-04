/**
 * Type definitions for the compiler
 */

/**
 * Compiler options
 */
export interface CompilerOptions {
  /** Enable source maps */
  sourceMap?: boolean;

  /** Minify output */
  minify?: boolean;

  /** Target platform */
  target?: 'browser' | 'node' | 'esm';

  /** Development mode */
  dev?: boolean;

  /** Enable optimization */
  optimize?: boolean;

  /** Filename for error reporting */
  filename?: string;
}

/**
 * Compiler result
 */
export interface CompilerResult {
  /** Generated JavaScript code */
  code: string;

  /** Source map (if enabled) */
  map?: string;

  /** Compilation AST */
  ast: any;

  /** Diagnostics */
  diagnostics: {
    errors: string[];
    warnings: string[];
  };

  /** Statistics */
  stats: {
    tokens: number;
    nodes: number;
    time: number;
  };
}

/**
 * Token types
 */
export type TokenType = 
  | 'OpenTag'
  | 'CloseTag'
  | 'SelfCloseTag'
  | 'Text'
  | 'Comment'
  | 'Doctype'
  | 'Interpolation'
  | 'For'
  | 'If'
  | 'Else'
  | 'Attribute'
  | 'AttributeValue'
  | 'Identifier'
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Equals'
  | 'Colon'
  | 'Comma'
  | 'Dot'
  | 'EOF';

/**
 * Token
 */
export interface Token {
  type: TokenType;
  value: string;
  position: number;
  line: number;
  column: number;
}

/**
 * AST Node types
 */
export type ASTNodeType = 
  | 'Element'
  | 'Text'
  | 'Interpolation'
  | 'For'
  | 'If'
  | 'Else'
  | 'Show'
  | 'Hide'
  | 'Component'
  | 'Slot'
  | 'Fragment';

/**
 * AST Node
 */
export interface ASTNode {
  type: ASTNodeType;
  position: number;
  line: number;
  column: number;
}

/**
 * Element Node
 */
export interface ElementNode extends ASTNode {
  type: 'Element';
  tag: string;
  attributes: Record<string, string>;
  children: ASTNode[];
}

/**
 * Text Node
 */
export interface TextNode extends ASTNode {
  type: 'Text';
  value: string;
}

/**
 * Interpolation Node
 */
export interface InterpolationNode extends ASTNode {
  type: 'Interpolation';
  value: string;
}

/**
 * For Loop Node
 */
export interface ForNode extends ASTNode {
  type: 'For';
  item: string;
  collection: string;
  key?: string;
  children: ASTNode[];
}

/**
 * If Statement Node
 */
export interface IfNode extends ASTNode {
  type: 'If';
  condition: string;
  children: ASTNode[];
  elseChildren?: ASTNode[];
}

/**
 * Patch flag types
 */
export enum PatchFlag {
  NONE = 0,
  TEXT = 1 << 0,
  CLASS = 1 << 1,
  STYLE = 1 << 2,
  ATTR = 1 << 3,
  EVENT = 1 << 4,
  PROP = 1 << 5,
  FULL = 1 << 6,
  COMPONENT = 1 << 7,
  CHILDREN = 1 << 8,
  ALL = 1 << 9,
}

/**
 * Scope information
 */
export interface Scope {
  variables: Set<string>;
  parent?: Scope;
}

/**
 * Scope analysis result
 */
export interface ScopeAnalysis {
  scopes: Scope[];
  variables: string[];
  references: string[];
}

/**
 * Diagnostic codes
 */
export type DiagnosticCode = 
  | 'PARSE_ERROR'
  | 'SYNTAX_ERROR'
  | 'UNDEFINED_VARIABLE'
  | 'INVALID_EXPRESSION'
  | 'MISSING_ATTRIBUTE'
  | 'INVALID_ATTRIBUTE'
  | 'INVALID_CHILDREN'
  | 'MISSING_KEY'
  | 'UNUSED_VARIABLE'
  | 'TYPE_ERROR'
  | 'REFERENCE_ERROR';

/**
 * Diagnostic
 */
export interface Diagnostic {
  type: 'error' | 'warning' | 'info';
  code: DiagnosticCode;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  source?: string;
  suggestions?: string[];
}

/**
 * Source Map
 */
export interface SourceMap {
  version: number;
  file: string;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;
}