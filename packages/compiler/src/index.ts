/**
 * @teloce/compiler - Template Compiler
 * 
 * This is the compiler for Teloce templates.
 * It parses HTML with Teloce directives and transforms them
 * into JavaScript code that can be executed in the browser.
 */

// Export lexer
export { tokenize, type Token, type TokenType } from './lexer';
export { TokenType as TokenTypes } from './lexer/tokens';

// Export parser
export { parse, type ASTNode, type ElementNode, type TextNode, type InterpolationNode, type ForNode, type IfNode, type DirectiveNode } from './parser';
export { ASTNodeType } from './parser/ast';

// Export HTML parser
export { parseHTML } from './parser/html';

// Export template parser
export { parseTemplate } from './parser/template';

// Export expression parser
export { parseExpression } from './parser/expressions';

// Export validator
export { validate, type ValidationResult, type ValidationError } from './validator';

// Export scope analysis
export { analyzeScope, type Scope, type ScopeAnalysis } from './scope-analysis';

// Export transformer
export { transform, type TransformOptions, type TransformResult } from './transformer';

// Export optimizer
export { optimize, type OptimizeOptions, type OptimizeResult } from './optimizer';

// Export code generator
export { generate, type GenerateOptions, type GenerateResult } from './generator';

// Export main compile function
export { compile, type CompileOptions, type CompileResult } from './compile';

// Default export
export default {
  tokenize,
  parse,
  parseHTML,
  parseTemplate,
  parseExpression,
  validate,
  analyzeScope,
  transform,
  optimize,
  generate,
  compile,
};