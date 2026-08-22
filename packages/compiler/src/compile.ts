/**
 * Main compile function - orchestrates the entire compilation pipeline
 */

import { tokenize } from './lexer';
import { parse } from './parser';
import { validate } from './validator';
import { analyzeScope } from './scope-analysis';
import { transform } from './transformer';
import { optimize } from './optimizer';
import { generate } from './generator';

export interface CompileOptions {
  /**
   * Filename for error reporting
   */
  filename?: string;

  /**
   * Source map generation
   */
  sourceMap?: boolean;

  /**
   * Enable optimization
   */
  optimize?: boolean;

  /**
   * Minify output
   */
  minify?: boolean;

  /**
   * Target platform
   */
  target?: 'browser' | 'node' | 'esm';

  /**
   * Attribute name to stamp onto every generated element, for scoped CSS.
   * See the matching option on TemplateCompileOptions in @teloce/sfc for
   * the full explanation.
   */
  scopeAttr?: string;

  /**
   * Development mode (more verbose errors)
   */
  dev?: boolean;
}

export interface CompileResult {
  /**
   * Generated JavaScript code
   */
  code: string;

  /**
   * Source map (if enabled)
   */
  map?: string;

  /**
   * Compiled AST
   */
  ast: any;

  /**
   * Warnings and errors
   */
  diagnostics: {
    warnings: string[];
    errors: string[];
  };

  /**
   * Compilation statistics
   */
  stats: {
    tokens: number;
    nodes: number;
    time: number;
  };
}

/**
 * Compile a Teloce template
 */
export function compile(
  template: string,
  options: CompileOptions = {}
): CompileResult {
  const startTime = performance.now();

  try {
    // 1. Lexer - tokenize the input
    const tokens = tokenize(template);
    const tokenCount = tokens.length;

    // 2. Parser - build AST
    const ast = parse(tokens, { filename: options.filename });

    // 3. Validator - check for errors
    const validation = validate(ast);

    // 4. Scope analysis
    analyzeScope(ast);

    // 5. Transformer - optimize and transform
    const transformed = transform(ast, {
      hoistStatic: true,
      foldConstants: true,
    });

    const transformedAst = transformed.ast;

    // 6. Optimizer - generate patch flags
    const optimizedAst = options.optimize !== false
      ? optimize(transformedAst, { staticHoisting: true }).ast
      : transformedAst;

    // 7. Generator - emit JavaScript
    const code = generate(optimizedAst, {
      minify: options.minify ?? false,
      target: options.target ?? 'browser',
      dev: options.dev ?? false,
      scopeAttr: options.scopeAttr,
    });

    const endTime = performance.now();

    return {
      code: code.code,
      ast: optimizedAst,
      diagnostics: {
        warnings: validation.warnings,
        errors: validation.errors,
      },
      stats: {
        tokens: tokenCount,
        nodes: ast.length || 0,
        time: endTime - startTime,
      },
    };
  } catch (error) {
    // Return error information
    return {
      code: '',
      ast: null,
      diagnostics: {
        warnings: [],
        errors: [error instanceof Error ? error.message : String(error)],
      },
      stats: {
        tokens: 0,
        nodes: 0,
        time: performance.now() - startTime,
      },
    };
  }
}