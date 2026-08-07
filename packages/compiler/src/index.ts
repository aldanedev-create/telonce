/**
 * @teloce/compiler - Template Compiler
 * 
 * This is the compiler for Teloce templates.
 * It parses HTML with Teloce directives and transforms them
 * into JavaScript code that can be executed in the browser.
 */

// 1. IMPORT everything first so they exist in the local scope
import { tokenize, type Token, type TokenType } from './lexer';
import { TokenType as TokenTypes } from './lexer/tokens';
import { parse, type ASTNode, type ElementNode, type TextNode, type InterpolationNode, type ForNode, type IfNode, type DirectiveNode } from './parser';
import { ASTNodeType } from './parser/ast';
import { parseHTML } from './parser/html';
import { parseTemplate } from './parser/template';
import { parseExpression } from './parser/expressions';
import { validate, type ValidationResult } from './validator';
import { analyzeScope, type Scope, type ScopeAnalysis } from './scope-analysis';
import { transform, type TransformOptions, type TransformResult } from './transformer';
import { optimize, type OptimizeOptions, type OptimizeResult, PatchFlag } from './optimizer';
import { generate, type GenerateOptions, type GenerateResult } from './codegen';
import { generateSourceMap, fromAST, toBase64, toDataURL, getMapping, type SourceMap, type SourceMapOptions } from './source-map';
import { 
  createDiagnostic, createError, createWarning, createInfo, 
  fromError, fromValidation, DiagnosticCodes, type Diagnostic, type DiagnosticResult 
} from './diagnostics';
import { 
  type CompilerOptions, type CompilerResult, type TokenType as TokenTypeAlias, 
  type Token as TokenAlias, type ASTNode as ASTNodeAlias, type ElementNode as ElementNodeAlias, 
  type TextNode as TextNodeAlias, type InterpolationNode as InterpolationNodeAlias, 
  type ForNode as ForNodeAlias, type IfNode as IfNodeAlias, type PatchFlag as PatchFlagType, 
  type Scope as ScopeType, type ScopeAnalysis as ScopeAnalysisType, type SourceMap as SourceMapType, 
  type Diagnostic as DiagnosticType 
} from './types';
import { compile, type CompileOptions, type CompileResult } from './compile';

// 2. EXPORT runtime values (Functions, Enums, Constants)
export {
  tokenize,
  parse,
  parseHTML,
  parseTemplate,
  parseExpression,
  validate,
  analyzeScope,
  transform,
  optimize,
  PatchFlag, // This is an Enum, so it's a runtime value
  generate,
  compile,
  generateSourceMap,
  fromAST,
  toBase64,
  toDataURL,
  getMapping,
  createDiagnostic,
  createError,
  createWarning,
  createInfo,
  fromError,
  fromValidation
};

// 3. EXPORT ALL TYPES (Using 'export type' ensures they don't break the build)
export type {
  Token, TokenType, TokenTypes,
  ASTNode, ElementNode, TextNode, InterpolationNode, ForNode, IfNode, DirectiveNode, ASTNodeType,
  ValidationResult,
  Scope, ScopeAnalysis,
  TransformOptions, TransformResult,
  OptimizeOptions, OptimizeResult,
  GenerateOptions, GenerateResult,
  SourceMap, SourceMapOptions,
  Diagnostic, DiagnosticResult, DiagnosticCodes,
  CompilerOptions, CompilerResult, TokenTypeAlias, TokenAlias, ASTNodeAlias, 
  ElementNodeAlias, TextNodeAlias, InterpolationNodeAlias, ForNodeAlias, 
  IfNodeAlias, PatchFlagType, ScopeType, ScopeAnalysisType, SourceMapType, DiagnosticType,
  CompileOptions, CompileResult
};

// 4. Create the default object ONLY with runtime values (No types allowed here)
const compiler = {
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
  generateSourceMap,
  fromAST,
  toBase64,
  toDataURL,
  getMapping,
  createDiagnostic,
  createError,
  createWarning,
  createInfo,
  fromError,
  fromValidation,
  PatchFlag
};

export default compiler;