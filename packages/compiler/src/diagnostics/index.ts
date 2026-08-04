/**
 * Diagnostics - provides error/warning messages for the debugger
 * 
 * This module feeds error information to @teloce/debugger
 * for human-friendly error messages.
 */

export interface Diagnostic {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  source?: string;
  suggestions?: string[];
}

export interface DiagnosticResult {
  diagnostics: Diagnostic[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

/**
 * Create a diagnostic
 */
export function createDiagnostic(
  type: Diagnostic['type'],
  code: string,
  message: string,
  options: {
    file?: string;
    line?: number;
    column?: number;
    source?: string;
    suggestions?: string[];
  } = {}
): Diagnostic {
  return {
    type,
    code,
    message,
    ...options,
  };
}

/**
 * Create an error diagnostic
 */
export function createError(
  code: string,
  message: string,
  options: Omit<Partial<Diagnostic>, 'type' | 'code' | 'message'> = {}
): Diagnostic {
  return createDiagnostic('error', code, message, options);
}

/**
 * Create a warning diagnostic
 */
export function createWarning(
  code: string,
  message: string,
  options: Omit<Partial<Diagnostic>, 'type' | 'code' | 'message'> = {}
): Diagnostic {
  return createDiagnostic('warning', code, message, options);
}

/**
 * Create an info diagnostic
 */
export function createInfo(
  code: string,
  message: string,
  options: Omit<Partial<Diagnostic>, 'type' | 'code' | 'message'> = {}
): Diagnostic {
  return createDiagnostic('info', code, message, options);
}

/**
 * Generate diagnostics from errors
 */
export function fromError(error: Error, file?: string): Diagnostic {
  return createError(
    error.name,
    error.message,
    {
      file,
      suggestions: [],
    }
  );
}

/**
 * Generate diagnostics from validation results
 */
export function fromValidation(
  errors: string[],
  warnings: string[],
  file?: string
): DiagnosticResult {
  const diagnostics: Diagnostic[] = [];

  for (const error of errors) {
    diagnostics.push(createError('VALIDATION_ERROR', error, { file }));
  }

  for (const warning of warnings) {
    diagnostics.push(createWarning('VALIDATION_WARNING', warning, { file }));
  }

  return {
    diagnostics,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
  };
}

/**
 * Diagnostic codes
 */
export const DiagnosticCodes = {
  // Compilation errors
  PARSE_ERROR: 'PARSE_ERROR',
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  UNDEFINED_VARIABLE: 'UNDEFINED_VARIABLE',
  INVALID_EXPRESSION: 'INVALID_EXPRESSION',

  // Validation errors
  MISSING_ATTRIBUTE: 'MISSING_ATTRIBUTE',
  INVALID_ATTRIBUTE: 'INVALID_ATTRIBUTE',
  INVALID_CHILDREN: 'INVALID_CHILDREN',

  // Validation warnings
  MISSING_KEY: 'MISSING_KEY',
  UNUSED_VARIABLE: 'UNUSED_VARIABLE',

  // Runtime errors
  TYPE_ERROR: 'TYPE_ERROR',
  REFERENCE_ERROR: 'REFERENCE_ERROR',
};