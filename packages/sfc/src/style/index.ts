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
 * Generate a unique scope ID
 */
function generateScopeId(componentName?: string): string {
  const prefix = componentName ? componentName.toLowerCase() : 'component';
  const random = Math.random().toString(36).substring(2, 8);
  return `teloce-${prefix}-${random}`;
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

  // Generate scope ID
  if (options.scoped) {
    const scopeId = generateScopeId(options.componentName);
    scope = {
      id: scopeId,
      className: `_${scopeId}`,
      attribute: `data-${scopeId}`,
    };

    // Scope the CSS
    css = scopeCSS(css, scope);
  }

  // Minify if requested
  if (options.minify) {
    css = css
      .replace(/\s+/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/;\s*/g, ';')
      .replace(/{\s*/g, '{')
      .replace(/}\s*/g, '}')
      .replace(/:\s*/g, ':')
      .replace(/,\s*/g, ',')
      .trim();
  }

  return {
    css,
    scope,
    diagnostics,
  };
}

/**
 * Scope CSS with component-specific selectors
 */
function scopeCSS(css: string, scope: CSSScope): string {
  const { attribute, className } = scope;

  // Add scope attribute to selectors
  return css.replace(
    /([^{]+)(\{[^}]*\})/g,
    (match, selector, rules) => {
      // Split selectors
      const scopedSelectors = selector.split(',').map((sel: string) => {
        const trimmed = sel.trim();
        // Handle pseudo-classes and combinators
        if (trimmed.includes(':')) {
          // Add data attribute to the element before pseudo-class
          const parts = trimmed.split(':');
          const element = parts[0].trim();
          const pseudo = parts.slice(1).join(':');
          if (element === '') {
            return `[${attribute}]:${pseudo}`;
          }
          return `${element}[${attribute}]:${pseudo}`;
        }
        if (trimmed.includes('>') || trimmed.includes('+') || trimmed.includes('~')) {
          // Add attribute to the last element in complex selector
          const parts = trimmed.split(/\s*(?=[>+~])/);
          const lastPart = parts[parts.length - 1].trim();
          if (lastPart.startsWith('.')) {
            return `${parts.slice(0, -1).join(' ')} ${lastPart}[${attribute}]`;
          }
          return `${trimmed}[${attribute}]`;
        }
        if (trimmed.startsWith('.')) {
          return `${trimmed}[${attribute}]`;
        }
        if (trimmed.startsWith('#')) {
          return trimmed;
        }
        if (trimmed === '') {
          return `[${attribute}]`;
        }
        return `${trimmed}[${attribute}]`;
      });

      return `${scopedSelectors.join(', ')} ${rules}`;
    }
  );
}