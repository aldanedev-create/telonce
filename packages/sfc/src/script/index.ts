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
 * Finds a top-level key in an object-literal source string - `propName`
 * followed by `:` - while correctly skipping over strings/comments (via
 * the same technique as findMatchingBrace) AND, critically, skipping any
 * occurrence that isn't actually at the top level of `objStr` itself.
 *
 * Without the depth check, extractObjectProperty/the lifecycle-hook scan
 * below used a plain regex search that matched `propName:` *anywhere* in
 * the export object's source text - including nested inside another
 * property entirely. Confirmed via a real, plausible case: a component
 * with `data() { return { config: { methods: {...} } }; }` had its
 * genuine top-level `methods: { realMethod() {...} }` silently replaced
 * by that unrelated nested `config.methods` value instead - the actual
 * methods were dropped with zero error, and the bogus data masquerading
 * as methods would then throw at runtime the moment anything tried to
 * call `this.realMethod()`, or worse, treat non-function values like
 * `this.get`/`this.post` as if they were callable methods.
 *
 * Also requires a `,`, `{`, or start-of-string immediately before the key
 * (skipping whitespace) so this doesn't match `propName` appearing as
 * part of a longer identifier, a string, or mid-expression - only an
 * actual object key position.
 */
function findTopLevelKey(objStr: string, propName: string, allow: ':' | '(' | 'either' = ':'): number {
  let depth = 0;
  let inString: string | null = null;
  let inCommentLine = false;
  let inCommentBlock = false;
  let escaped = false;
  let atKeyPosition = true; // true right after `{`, `,`, or at string start

  for (let i = 0; i < objStr.length; i++) {
    const char = objStr[i];
    const nextChar = objStr[i + 1];

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
      atKeyPosition = false;
      continue;
    }

    if (char === '{' || char === '[' || char === '(') {
      depth++;
      atKeyPosition = true;
      continue;
    }
    if (char === '}' || char === ']' || char === ')') {
      depth--;
      atKeyPosition = false;
      continue;
    }
    if (char === ',' && depth === 0) {
      atKeyPosition = true;
      continue;
    }
    if (/\s/.test(char)) {
      continue;
    }

    if (depth === 0 && atKeyPosition && objStr.startsWith(propName, i)) {
      const afterKey = i + propName.length;
      let j = afterKey;
      while (j < objStr.length && /\s/.test(objStr[j])) j++;
      const nextChar2 = objStr[j];
      const matches =
        allow === 'either' ? nextChar2 === ':' || nextChar2 === '(' : nextChar2 === allow;
      if (matches) {
        return i;
      }
    }

    atKeyPosition = false;
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
  const keyIdx = findTopLevelKey(objStr, propName);
  if (keyIdx === -1) return null;

  // Verify the value immediately following `propName:` is actually an
  // object literal (starts with `{`) before searching for it. Previously
  // this jumped straight to `objStr.indexOf('{', keyIdx)` - the position
  // of the *nearest* `{` anywhere after the key, with no check that the
  // key's own value was an object at all. For an array-style props
  // declaration (`props: ['label', 'count']`, a real, documented,
  // otherwise-valid way to declare props with no object literal
  // anywhere in it), that search skipped straight past the array and
  // matched a completely unrelated later property's opening brace -
  // confirmed via an actual compile: `props: ['label', 'count'],
  // data() { return {}; }` extracted `data()`'s own function body as if
  // it were the props definition, silently corrupting one property with
  // another's content instead of correctly recognizing this isn't an
  // object-form props declaration at all (that's the array-form
  // fallback's job, see the `props` handling in compileScript below).
  let j = keyIdx + propName.length;
  while (j < objStr.length && /\s/.test(objStr[j])) j++;
  if (objStr[j] !== ':') return null;
  j++;
  while (j < objStr.length && /\s/.test(objStr[j])) j++;
  if (objStr[j] !== '{') return null;

  const startIdx = j;
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
      // 1. Extract data function - checks for either the shorthand-method
      // form (`data() {...}`) or the key-value form (`data: function() {...}`
      // / `data: () => {...}`), same as before, but now via findTopLevelKey
      // so a method or nested value elsewhere named "data" (e.g. inside
      // `methods: { data() {...} }` for an unrelated purpose) can't be
      // mistaken for the component's actual top-level data().
      const dataKeyIdx = findTopLevelKey(exportObj, 'data', 'either');
      if (dataKeyIdx !== -1) {
        const startIdx = exportObj.indexOf('{', dataKeyIdx);
        if (startIdx !== -1) {
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
        const propsKeyIdx = findTopLevelKey(exportObj, 'props', ':');
        if (propsKeyIdx !== -1) {
          const propsArrayMatch = exportObj.slice(propsKeyIdx).match(/^props\s*:\s*(\[[^\]]*\])/);
          if (propsArrayMatch) {
            exports.props = propsArrayMatch[1];
          }
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
        const hookKeyIdx = findTopLevelKey(exportObj, hook, '(');
        if (hookKeyIdx !== -1) {
          const startIdx = exportObj.indexOf('{', hookKeyIdx);
          if (startIdx !== -1) {
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