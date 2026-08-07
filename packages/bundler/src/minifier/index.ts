/**
 * Minifier - minifies JavaScript, CSS, and HTML safely
 */

export interface MinifyOptions {
  /**
   * Remove comments
   */
  removeComments?: boolean;

  /**
   * Collapse whitespace
   */
  collapseWhitespace?: boolean;

  /**
   * Remove unused variables
   */
  removeUnused?: boolean;

  /**
   * Shorten variable names
   */
  shortenNames?: boolean;

  /**
   * Merge duplicate code
   */
  mergeDuplicates?: boolean;

  /**
   * Target environment
   */
  target?: 'browser' | 'node' | 'esm';

  /**
   * Preserve certain functions or variables
   */
  preserve?: string[];

  /**
   * Force file type ('js' | 'css' | 'html')
   */
  type?: 'js' | 'css' | 'html';
}

export interface MinifyResult {
  /**
   * Minified code
   */
  code: string | string[];

  /**
   * Original size
   */
  originalSize: number;

  /**
   * Minified size
   */
  minifiedSize: number;

  /**
   * Size reduction percentage
   */
  reduction: number;

  /**
   * Compression ratio
   */
  ratio: number;

  /**
   * Source map
   */
  map?: string;
}

/**
 * Minifier plugin interface
 */
export interface MinifierPlugin {
  /**
   * Plugin name
   */
  name: string;

  /**
   * Transform function
   */
  transform: (code: string, options: MinifyOptions) => string;

  /**
   * Should the plugin run?
   */
  shouldRun?: (code: string, options: MinifyOptions) => boolean;
}

/**
 * Minify JavaScript code safely without corrupting property access
 */
export function minifyJavaScript(
  code: string,
  options: MinifyOptions = {}
): MinifyResult {
  const originalSize = code.length;
  let minified = code;

  // Remove comments
  if (options.removeComments !== false) {
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    minified = minified.replace(/\/\/.*/gm, '');
  }

  // Collapse whitespace
  if (options.collapseWhitespace !== false) {
    minified = minified
      .replace(/\s+/g, ' ')
      .replace(/;\s*;/g, ';')
      .replace(/{\s+/g, '{')
      .replace(/\s+}/g, '}')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')');
  }

  // Shorten variable names safely avoiding property accesses (e.g. foo.data -> foo.a)
  if (options.shortenNames) {
    const varRegex = /(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const vars: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = varRegex.exec(minified)) !== null) {
      if (!vars.includes(match[1])) {
        vars.push(match[1]);
      }
    }
    
    for (let i = 0; i < vars.length; i++) {
      const short = String.fromCharCode(97 + (i % 26)) + (Math.floor(i / 26) || '');
      const varName = vars[i];
      if (options.preserve && options.preserve.includes(varName)) continue;

      try {
        // Negative lookbehind ensures we don't match after a dot (.)
        const safeRegex = new RegExp(`(?<!\\.)\\b${varName}\\b`, 'g');
        minified = minified.replace(safeRegex, short);
      } catch {
        const wordRegex = new RegExp(`\\b${varName}\\b`, 'g');
        minified = minified.replace(wordRegex, (m, offset, str) => {
          if (offset > 0 && str[offset - 1] === '.') {
            return m;
          }
          return short;
        });
      }
    }
  }

  const minifiedSize = minified.length;
  const reduction = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;

  return {
    code: minified,
    originalSize,
    minifiedSize,
    reduction,
    ratio: originalSize > 0 ? minifiedSize / originalSize : 1,
  };
}

/**
 * Minify CSS code
 */
export function minifyCSS(
  code: string,
  options: MinifyOptions = {}
): MinifyResult {
  let minified = code;
  const originalSize = code.length;

  // Remove comments
  if (options.removeComments !== false) {
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  // Collapse whitespace
  if (options.collapseWhitespace !== false) {
    minified = minified
      .replace(/\s+/g, ' ')
      .replace(/;\s*/g, ';')
      .replace(/{\s+/g, '{')
      .replace(/\s+}/g, '}')
      .replace(/:\s+/g, ':')
      .replace(/,\s+/g, ',');
  }

  const minifiedSize = minified.length;
  const reduction = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;

  return {
    code: minified,
    originalSize,
    minifiedSize,
    reduction,
    ratio: originalSize > 0 ? minifiedSize / originalSize : 1,
  };
}

/**
 * Minify HTML code
 */
export function minifyHTML(
  code: string,
  options: MinifyOptions = {}
): MinifyResult {
  let minified = code;
  const originalSize = code.length;

  // Remove comments
  if (options.removeComments !== false) {
    minified = minified.replace(/<!--[\s\S]*?-->/g, '');
  }

  // Collapse whitespace
  if (options.collapseWhitespace !== false) {
    minified = minified.replace(/\s+/g, ' ');
    minified = minified.replace(/>\s+</g, '><');
  }

  // Remove unnecessary quotes safely
  minified = minified.replace(/="([^"]*?)"/g, (match, content) => {
    if (/^[a-zA-Z0-9_-]+$/.test(content)) {
      return `=${content}`;
    }
    return match;
  });

  const minifiedSize = minified.length;
  const reduction = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;

  return {
    code: minified,
    originalSize,
    minifiedSize,
    reduction,
    ratio: originalSize > 0 ? minifiedSize / originalSize : 1,
  };
}

/**
 * General code optimization (safely avoiding destructive variable removal)
 */
export function optimizeCode(
  code: string,
  options: MinifyOptions = {}
): string {
  let result = code;

  if (options.removeComments) {
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    result = result.replace(/\/\/.*/gm, '');
  }

  if (options.collapseWhitespace) {
    result = result
      .replace(/\s+/g, ' ')
      .replace(/;\s*;/g, ';')
      .replace(/{\s+/g, '{')
      .replace(/\s+}/g, '}')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')');
  }

  return result;
}

/**
 * Minify code with robust auto-detection
 */
export function minify(
  code: string | string[],
  options: MinifyOptions = {}
): MinifyResult {
  const isArray = Array.isArray(code);
  const codes = isArray ? code : [code];
  const combined = codes.join('\n');
  const originalSize = combined.length;

  let type: 'js' | 'css' | 'html' = options.type || 'js';

  if (!options.type) {
    // Robust detection avoiding false positives from JS object literals
    if (combined.includes('<!DOCTYPE') || (combined.includes('<html') && combined.includes('</html>')) || (combined.includes('<template') && combined.includes('</template>'))) {
      type = 'html';
    } else if (/^\s*[a-zA-Z0-9#class_.-]+\s*\{[^}]*:[^}]*\}/.test(combined) && !combined.includes('function') && !combined.includes('=>') && !combined.includes('const ') && !combined.includes('let ')) {
      type = 'css';
    } else {
      type = 'js';
    }
  }

  let minifiedResult: MinifyResult;
  if (type === 'html') {
    minifiedResult = minifyHTML(combined, options);
  } else if (type === 'css') {
    minifiedResult = minifyCSS(combined, options);
  } else {
    minifiedResult = minifyJavaScript(combined, options);
  }

  let finalCode: string | string[] = minifiedResult.code;
  if (isArray && typeof minifiedResult.code === 'string') {
    finalCode = codes.map(c => minifyJavaScript(c, options).code as string);
  }

  const minifiedSize = typeof finalCode === 'string' ? finalCode.length : finalCode.reduce((acc, s) => acc + s.length, 0);
  const reduction = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;

  return {
    code: finalCode,
    originalSize,
    minifiedSize,
    reduction,
    ratio: originalSize > 0 ? minifiedSize / originalSize : 1,
  };
}