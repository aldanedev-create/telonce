/**
 * Script compiler - compiles the <script> section
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
 * Extract the main export default object content using brace balancing
 */
function extractExportObject(script: string): string | null {
  const exportIdx = script.search(/export\s+default/);
  if (exportIdx === -1) return null;

  const scriptFromExport = script.slice(exportIdx);
  let braceCount = 0;
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < scriptFromExport.length; i++) {
    const char = scriptFromExport[i];
    if (char === '{') {
      if (startIndex === -1) startIndex = i;
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0 && startIndex !== -1) {
        endIndex = i;
        break;
      }
    }
  }

  if (startIndex !== -1 && endIndex !== -1) {
    return scriptFromExport.slice(startIndex + 1, endIndex);
  }
  return null;
}

/**
 * Extract a specific property block (like methods, computed, props) using brace balancing
 */
function extractObjectProperty(objStr: string, propName: string): string | null {
  const regex = new RegExp(`${propName}\\s*:\\s*\\{`, '');
  const match = objStr.match(regex);
  if (!match || match.index === undefined) return null;

  const startIdx = match.index + match[0].length - 1;
  let braceCount = 0;
  let endIndex = -1;

  for (let i = startIdx; i < objStr.length; i++) {
    const char = objStr[i];
    if (char === '{') {
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex !== -1) {
    return objStr.slice(startIdx + 1, endIndex).trim();
  }
  return null;
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
      const dataMatch = exportObj.match(/data\s*\(\s*\)\s*\{\s*return\s*(\{[\s\S]*?\})\s*\}/);
      if (dataMatch) {
        exports.data = `() => ${dataMatch[1]}`;
      } else {
        // Fallful fallback for arrow function or simple object returns in data
        const simpleDataMatch = exportObj.match(/data\s*:\s*(?:function\s*\(\s*\)\s*\{[\s\S]*?return\s*(\{[\s\S]*?\})\s*\}|\(\s*\)\s*=>\s*(\{[\s\S]*?\}))/);
        if (simpleDataMatch) {
          exports.data = `() => ${simpleDataMatch[1] || simpleDataMatch[2]}`;
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
        // Handle array syntax for props e.g. props: ['a', 'b']
        const propsArrayMatch = exportObj.match(/props\s*:\s*(\[[^\]]*\])/);
        if (propsArrayMatch) {
          exports.props = propsArrayMatch[1];
        }
      }

      // 5. Extract lifecycle hooks
      const lifecycleHooks = ['created', 'mounted', 'updated', 'unmounted', 'beforeCreate', 'beforeMount', 'beforeUpdate', 'beforeUnmount'];
      for (const hook of lifecycleHooks) {
        const hookRegex = new RegExp(`${hook}\\s*\\(\\s*\\)\\s*\\{`, '');
        const hookMatch = exportObj.match(hookRegex);
        if (hookMatch && hookMatch.index !== undefined) {
          const startIdx = hookMatch.index + hookMatch[0].length - 1;
          let braceCount = 0;
          let endIndex = -1;

          for (let i = startIdx; i < exportObj.length; i++) {
            const char = exportObj[i];
            if (char === '{') {
              braceCount++;
            } else if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                endIndex = i;
                break;
              }
            }
          }

          if (endIndex !== -1) {
            const hookBody = exportObj.slice(startIdx + 1, endIndex).trim();
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

  // Minify if requested
  if (options.minify) {
    code = code
      .replace(/\s+/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim();
  }

  return {
    code,
    exports,
    diagnostics,
  };
}