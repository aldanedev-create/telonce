/**
 * Script compiler - compiles the <script> section with stateful brace balancing and safe minification
 */

export interface ScriptCompileResult {
  /**
   * Compiled JavaScript code
   */
  code: string;

  /**
   * Exports from the script
   */
  exports: {
    data?: string;
    methods?: string;
    computed?: string;
    lifecycle?: Record<string, string>;
    props?: string;
  };

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

export interface ScriptCompileOptions {
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
 * Stateful brace finder that ignores strings, template literals, and comments
 */
function findMatchingBrace(str: string, startIdx: number): number {
  let braceCount = 0;
  let inString: string | null = null;
  let inCommentLine = false;
  let inCommentBlock = false;
  let escaped = false;

  for (let i = startIdx; i < str.length; i++) {
    const char = str[i];
    const nextChar = str[i + 1];

    if (inCommentLine) {
      if (char === '\n') inCommentLine = false;
      continue;
    }
    if (inCommentBlock) {
      if (char === '*' && nextChar === '/') {
        inCommentBlock = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === '/' && nextChar === '/') {
      inCommentLine = true;
      i++;
      continue;
    }
    if (char === '/' && nextChar === '*') {
      inCommentBlock = true;
      i++;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      continue;
    }

    if (char === '{') {
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Extract the main export default object content using stateful brace balancing
 */
function extractExportObject(script: string): string | null {
  const exportIdx = script.search(/export\s+default/);
  if (exportIdx === -1) return null;

  const scriptFromExport = script.slice(exportIdx);
  const firstBraceIdx = scriptFromExport.indexOf('{');
  if (firstBraceIdx === -1) return null;

  const endBraceIdx = findMatchingBrace(scriptFromExport, firstBraceIdx);
  if (endBraceIdx !== -1) {
    return scriptFromExport.slice(firstBraceIdx + 1, endBraceIdx);
  }
  return null;
}

/**
 * Extract a specific property block using stateful brace balancing
 */
function extractObjectProperty(objStr: string, propName: string): string | null {
  const regex = new RegExp(`${propName}\\s*:\\s*(?:function\\s*\\([^)]*\\)\\s*\\{|\\([^)]*\\)\\s*=>\\s*\\{|\\{)`, '');
  const match = objStr.match(regex);
  if (!match || match.index === undefined) return null;

  const startIdx = objStr.indexOf('{', match.index);
  if (startIdx === -1) return null;

  const endIdx = findMatchingBrace(objStr, startIdx);
  if (endIdx !== -1) {
    return objStr.slice(startIdx + 1, endIdx).trim();
  }
  return null;
}

/**
 * Safe minifier that preserves strings, template literals, URLs, and comments correctly
 */
function safeMinify(code: string): string {
  let result = '';
  let i = 0;
  let inString: string | null = null;
  let inCommentLine = false;
  let inCommentBlock = false;
  let escaped = false;

  while (i < code.length) {
    const char = code[i];
    const nextChar = code[i + 1];

    if (inCommentLine) {
      if (char === '\n') {
        inCommentLine = false;
        result += '\n';
      }
      i++;
      continue;
    }

    if (inCommentBlock) {
      if (char === '*' && nextChar === '/') {
        inCommentBlock = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    if (inString) {
      result += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === inString) {
        inString = null;
      }
      i++;
      continue;
    }

    if (char === '/' && nextChar === '/') {
      inCommentLine = true;
      i += 2;
      continue;
    }
    if (char === '/' && nextChar === '*') {
      inCommentBlock = true;
      i += 2;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      result += char;
      i++;
      continue;
    }

    if (/\s/.test(char)) {
      if (!result.endsWith(' ') && !result.endsWith('\n') && result.length > 0) {
        result += ' ';
      }
      i++;
      while (i < code.length && /\s/.test(code[i])) {
        i++;
      }
      continue;
    }

    result += char;
    i++;
  }

  return result.trim();
}

/**
 * Compile the script section
 */
export function compileScript(
  source: string,
  options: ScriptCompileOptions = {}
): ScriptCompileResult {
  const diagnostics = {
    errors: [] as string[],
    warnings: [] as string[],
  };

  let code = source;
  const exports: ScriptCompileResult['exports'] = {
    lifecycle: {},
  };

  try {
    const exportObj = extractExportObject(source);

    if (exportObj) {
      // 1. Extract data function
      const dataMatch = exportObj.match(/data\s*\(\s*\)\s*\{/);
      if (dataMatch && dataMatch.index !== undefined) {
        const startIdx = exportObj.indexOf('{', dataMatch.index);
        const endIdx = findMatchingBrace(exportObj, startIdx);
        if (endIdx !== -1) {
          const dataBody = exportObj.slice(startIdx + 1, endIdx).trim();
          exports.data = `() => { ${dataBody} }`;
        }
      } else {
        const simpleDataMatch = exportObj.match(/data\s*:\s*(?:function\s*\(\s*\)\s*\{|\(\s*\)\s*=>\s*\{)/);
        if (simpleDataMatch && simpleDataMatch.index !== undefined) {
          const startIdx = exportObj.indexOf('{', simpleDataMatch.index);
          const endIdx = findMatchingBrace(exportObj, startIdx);
          if (endIdx !== -1) {
            const dataBody = exportObj.slice(startIdx + 1, endIdx).trim();
            exports.data = `() => { ${dataBody} }`;
          }
        }
      }

      // 2. Extract methods
      const methodsContent = extractObjectProperty(exportObj, 'methods');
      if (methodsContent) {
        exports.methods = `{ ${methodsContent} }`;
      }

      // 3. Extract computed
      const computedContent = extractObjectProperty(exportObj, 'computed');
      if (computedContent) {
        exports.computed = `{ ${computedContent} }`;
      }

      // 4. Extract props
      const propsContent = extractObjectProperty(exportObj, 'props');
      if (propsContent) {
        exports.props = `{ ${propsContent} }`;
      } else {
        const propsArrayMatch = exportObj.match(/props\s*:\s*(\[[^\]]*\])/);
        if (propsArrayMatch) {
          exports.props = propsArrayMatch[1];
        }
      }

      // 5. Extract lifecycle hooks
      const lifecycleHooks = [
        'created',
        'mounted',
        'updated',
        'unmounted',
        'beforeCreate',
        'beforeMount',
        'beforeUpdate',
        'beforeUnmount',
      ];
      for (const hook of lifecycleHooks) {
        const hookRegex = new RegExp(`${hook}\\s*\\([^)]*\\)\\s*\\{`, '');
        const hookMatch = exportObj.match(hookRegex);
        if (hookMatch && hookMatch.index !== undefined) {
          const startIdx = exportObj.indexOf('{', hookMatch.index);
          const endIdx = findMatchingBrace(exportObj, startIdx);
          if (endIdx !== -1) {
            const hookBody = exportObj.slice(startIdx + 1, endIdx).trim();
            if (exports.lifecycle) {
              exports.lifecycle[hook] = `function() { ${hookBody} }`;
            }
          }
        }
      }
    }
  } catch (error) {
    diagnostics.errors.push(
      `Failed to parse script: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Minify safely if requested
  if (options.minify) {
    code = safeMinify(code);
  }

  return {
    code,
    exports,
    diagnostics,
  };
}