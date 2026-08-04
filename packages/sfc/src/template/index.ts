/**
 * Template compiler - hands off to @teloce/compiler
 */

import { compile as compileTemplate, type CompileOptions } from '@teloce/compiler';

export interface TemplateCompileResult {
  /**
   * Compiled template code
   */
  code: string;

  /**
   * Source map (if enabled)
   */
  map?: string;

  /**
   * Diagnostics
   */
  diagnostics: {
    errors: string[];
    warnings: string[];
  };
}

export interface TemplateCompileOptions {
  /**
   * Filename for error reporting
   */
  filename?: string;

  /**
   * Enable source maps
   */
  sourceMap?: boolean;

  /**
   * Enable minification
   */
  minify?: boolean;

  /**
   * Development mode
   */
  dev?: boolean;

  /**
   * Target platform
   */
  target?: 'browser' | 'node' | 'esm';
}

/**
 * Compile the template section
 * 
 * This function passes the template to @teloce/compiler
 * for full compilation to JavaScript.
 */
export function compileTemplate(
  source: string,
  options: TemplateCompileOptions = {}
): TemplateCompileResult {
  const diagnostics = {
    errors: [] as string[],
    warnings: [] as string[],
  };

  try {
    // Compile the template using the main compiler
    const result = compileTemplate(source, {
      filename: options.filename,
      sourceMap: options.sourceMap,
      minify: options.minify,
      dev: options.dev,
      target: options.target,
    });

    // Extract diagnostics
    diagnostics.errors = result.diagnostics.errors;
    diagnostics.warnings = result.diagnostics.warnings;

    // Generate code for the template
    const code = result.code || '() => []';

    return {
      code,
      map: result.map,
      diagnostics,
    };
  } catch (error) {
    diagnostics.errors.push(
      `Failed to compile template: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      code: '() => []',
      diagnostics,
    };
  }
}