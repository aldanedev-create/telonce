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

function generateScopeId(filename?: string, source?: string): string {
  const input = `${filename || 'component.vel'}:${source || ''}`;
  const hash = hashString(input);
  return `teloce-${hash}`;
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
    const scopeId = generateScopeId(options.filename, source);
    scope = {
      id: scopeId,
      className: `_${scopeId}`,
      attribute: `data-${scopeId}`,
    };

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

  // Helper to scope a comma-separated list of selectors
  function processSelectors(selectorStr: string, isKeyframe = false): string {
    if (isKeyframe) return selectorStr; // Do not scope keyframe percentages (0%, 100%, from, to)

    return selectorStr
      .split(',')
      .map((sel) => {
        const trimmed = sel.trim();
        if (!trimmed) return '';

        // Handle pseudo-classes (e.g., a:hover, input:focus -> a[data-v-xxx]:hover)
        if (trimmed.includes(':')) {
          const colonIndex = trimmed.indexOf(':');
          const element = trimmed.slice(0, colonIndex).trim();
          const pseudo = trimmed.slice(colonIndex); // includes leading colon(s)
          
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