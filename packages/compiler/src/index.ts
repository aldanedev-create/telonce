/**
 * @teloce/compiler - Template Compiler
 * 
 * This is the compiler for Teloce templates.
 * It parses HTML with Teloce directives and transforms them
 * into JavaScript code that can be executed in the browser.
 */

import { tokenize } from './lexer';
import { parse } from './parser';
import { validate } from './validator';
import { analyzeScope } from './scope-analysis';
import { transform } from './transformer';
import { optimize } from './optimizer';
import { generate } from './generator';
import { compile } from './compile';
import { parseHTML } from './parser/html';
import { parseTemplate } from './parser/template';
import { parseExpression } from './parser/expressions';
import { PatchFlag } from './types';

export { tokenize } from './lexer';
export type { Token, TokenType } from './lexer';
export { TokenType as TokenTypes } from './lexer/tokens';
export { parse } from './parser';
export type { ASTNode, ElementNode, TextNode, InterpolationNode, ForNode, IfNode, DirectiveNode } from './parser';
export { ASTNodeType } from './parser/ast';
export { parseHTML } from './parser/html';
export { parseTemplate } from './parser/template';
export { parseExpression } from './parser/expressions';
export { validate, type ValidationResult } from './validator';
export { analyzeScope, type Scope, type ScopeAnalysis } from './scope-analysis';
export { transform, type TransformOptions, type TransformResult } from './transformer';
export { optimize, type OptimizeOptions, type OptimizeResult } from './optimizer';
export { generate, type GenerateOptions, type GenerateResult } from './generator';
export { compile, type CompileOptions, type CompileResult } from './compile';
export { PatchFlag } from './types';

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
  PatchFlag,
};