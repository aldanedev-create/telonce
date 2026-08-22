/**
 * Style compiler - compiles the <style> section with scoped CSS support
 */

export interface CSSScope {
  /**
   * Unique scope ID
   */
  id: string;

  /**
   * Scope class name
   */
  className: string;

  /**
   * Scope attribute
   */
  attribute: string;
}

export interface StyleCompileResult {
  /**
   * Compiled CSS
   */
  css: string;

  /**
   * Scope information (if scoped)
   */
  scope?: CSSScope;

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

export interface StyleCompileOptions {
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
   * Enable scoped CSS
   */
  scoped?: boolean;

  /**
   * Component name for scope generation
   */
  componentName?: string;

  /**
   * Pre-computed scope to use instead of generating one from this style
   * block's own content. Passed by the top-level SFC compiler so the
   * template and style compilers agree on the exact same scope attribute.
   */
  scope?: CSSScope;
}

/**
 * Generate a deterministic scope ID using DJB2 content hashing on filename and source
 */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export function generateScopeId(filename?: string, source?: string): string {
  // Normalize filename to its basename to ensure SSR hydration stability across different environments/paths
  const normalizedFilename = filename
    ? filename.replace(/\\/g, '/').split('/').pop() || 'component.vel'
    : 'component.vel';
  const input = `${normalizedFilename}:${source || ''}`;
  const hash = hashString(input);
  return `teloce-${hash}`;
}

/**
 * Build the CSSScope object for a given scope id. Exposed so callers (like
 * the top-level SFC compile() below) can compute the scope id once, before
 * either the template or style is compiled, and hand the *same* scope to
 * both - see the comment on SFCCompileOptions.scoped in ./compile for why
 * this matters.
 */
export function scopeFromId(scopeId: string): CSSScope {
  return {
    id: scopeId,
    className: `_${scopeId}`,
    attribute: `data-${scopeId}`,
  };
}

/**
 * Compile the style section
 */
export function compileStyle(
  source: string,
  options: StyleCompileOptions = {}
): StyleCompileResult {
  const diagnostics = {
    errors: [] as string[],
    warnings: [] as string[],
  };

  let css = source;
  let scope: CSSScope | undefined;

  // Generate scope ID and scope CSS if requested
  if (options.scoped) {
    // Use the caller-provided scope (shared with the template compiler, so
    // the CSS selectors and the actual rendered elements agree on the same
    // attribute) if given, rather than always deriving a fresh one here.
    scope = options.scope ?? scopeFromId(generateScopeId(options.filename, source));

    try {
      css = scopeCSS(css, scope);
    } catch (error) {
      diagnostics.errors.push(
        `Failed to scope CSS: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Minify if requested safely
  if (options.minify) {
    css = css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ')             // Collapse whitespace
      .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around delimiters
      .trim();
  }

  return {
    css,
    scope,
    diagnostics,
  };
}

/**
 * Scope CSS with component-specific selectors, handling at-rules (@media, @supports, @keyframes)
 * and correctly constraining ID, class, and element selectors.
 */
function scopeCSS(css: string, scope: CSSScope): string {
  const { attribute } = scope;

  // Helper to split comma-separated selectors safely respecting parentheses (e.g., :not())
  function splitSelectors(selectorStr: string): string[] {
    const selectors: string[] = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let quoteChar = '';

    for (let i = 0; i < selectorStr.length; i++) {
      const char = selectorStr[i];
      if (inString) {
        current += char;
        if (char === quoteChar && selectorStr[i - 1] !== '\\') {
          inString = false;
        }
      } else if (char === '"' || char === "'") {
        inString = true;
        quoteChar = char;
        current += char;
      } else if (char === '(') {
        depth++;
        current += char;
      } else if (char === ')') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        selectors.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      selectors.push(current.trim());
    }
    return selectors;
  }

  // Helper to scope a comma-separated list of selectors
  function processSelectors(selectorStr: string, isKeyframe = false): string {
    if (isKeyframe) return selectorStr; // Do not scope keyframe percentages (0%, 100%, from, to)

    return splitSelectors(selectorStr)
      .map((sel) => {
        const trimmed = sel.trim();
        if (!trimmed) return '';

        // Handle pseudo-classes / pseudo-elements safely by locating the root-level colon
        let colonIdx = -1;
        let depth = 0;
        for (let i = 0; i < trimmed.length; i++) {
          const char = trimmed[i];
          if (char === '(') depth++;
          else if (char === ')') depth--;
          else if (char === ':' && depth === 0) {
            colonIdx = i;
            break;
          }
        }

        if (colonIdx !== -1) {
          const element = trimmed.slice(0, colonIdx).trim();
          const pseudo = trimmed.slice(colonIdx); // includes leading colon(s)
          
          if (element === '') {
            return `[${attribute}]${pseudo}`;
          }
          return `${element}[${attribute}]${pseudo}`;
        }

        // Handle ID selectors (#header -> #header[data-v-xxx]), classes, and combinators
        return `${trimmed}[${attribute}]`;
      })
      .filter(Boolean)
      .join(', ');
  }

  // Robust CSS parser that handles strings, comments, nested at-rules, and @keyframes
  function parseAndScope(ruleText: string): string {
    let result = '';
    let i = 0;

    while (i < ruleText.length) {
      // Skip whitespace
      while (i < ruleText.length && /\s/.test(ruleText[i])) {
        i++;
      }
      if (i >= ruleText.length) break;

      // Handle comments
      if (ruleText.startsWith('/*', i)) {
        const endComment = ruleText.indexOf('*/', i + 2);
        if (endComment === -1) {
          result += ruleText.slice(i);
          break;
        }
        result += ruleText.slice(i, endComment + 2);
        i = endComment + 2;
        continue;
      }

      // Check for At-Rules (@media, @supports, @keyframes, etc.)
      if (ruleText[i] === '@') {
        const braceIdx = ruleText.indexOf('{', i);
        if (braceIdx === -1) {
          result += ruleText.slice(i);
          break;
        }

        const atRuleHeader = ruleText.slice(i, braceIdx).trim();
        const isKeyframes = /@(-webkit-)?keyframes/i.test(atRuleHeader);

        // Find matching closing brace taking nested braces and strings into account
        let depth = 1;
        let curr = braceIdx + 1;
        while (curr < ruleText.length && depth > 0) {
          const char = ruleText[curr];
          if (char === '"' || char === "'") {
            const quote = char;
            curr++;
            while (curr < ruleText.length && ruleText[curr] !== quote) {
              if (ruleText[curr] === '\\') curr++;
              curr++;
            }
          } else if (char === '{') {
            depth++;
          } else if (char === '}') {
            depth--;
          }
          curr++;
        }

        const atRuleBody = ruleText.slice(braceIdx + 1, curr - 1);
        const scopedBody = isKeyframes ? atRuleBody : parseAndScope(atRuleBody);

        result += `${atRuleHeader} { ${scopedBody} } `;
        i = curr;
      } else {
        // Standard rule block
        const braceIdx = ruleText.indexOf('{', i);
        if (braceIdx === -1) {
          result += ruleText.slice(i);
          break;
        }

        const selectorPart = ruleText.slice(i, braceIdx).trim();

        // Find matching closing brace taking strings and nested braces into account
        let depth = 1;
        let curr = braceIdx + 1;
        while (curr < ruleText.length && depth > 0) {
          const char = ruleText[curr];
          if (char === '"' || char === "'") {
            const quote = char;
            curr++;
            while (curr < ruleText.length && ruleText[curr] !== quote) {
              if (ruleText[curr] === '\\') curr++;
              curr++;
            }
          } else if (char === '{') {
            depth++;
          } else if (char === '}') {
            depth--;
          }
          curr++;
        }

        const ruleBody = ruleText.slice(braceIdx + 1, curr - 1).trim();
        const scopedSelector = processSelectors(selectorPart);

        if (scopedSelector) {
          result += `${scopedSelector} { ${ruleBody} } `;
        }
        i = curr;
      }
    }

    return result.trim();
  }

  return parseAndScope(css);
}