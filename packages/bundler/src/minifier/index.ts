/**
 * Minifier - minifies JavaScript, CSS, and HTML
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
   * Preserve certain functions
   */
  preserve?: string[];
}

export interface MinifyResult {
  /**
   * Minified code
   */
  code: string;

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
 * Minify JavaScript code
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
    minified = minified.replace(/\/\/.*$/gm, '');
  }

  // Collapse whitespace
  if (options.collapseWhitespace !== false) {
    minified = minified.replace(/\s+/g, ' ');
    minified = minified.replace(/;\s*;/g, ';');
    minified = minified.replace(/{\s+/g, '{');
    minified = minified.replace(/\s+}/g, '}');
    minified = minified.replace(/\(\s+/g, '(');
    minified = minified.replace(/\s+\)/g, ')');
  }

  // Shorten variable names
  if (options.shortenNames) {
    // Simple variable shortening
    const varRegex = /(?:let|const|var)\s+(\w+)/g;
    const vars: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = varRegex.exec(minified)) !== null) {
      vars.push(match[1]);
    }
    
    // Replace with shorter names
    for (let i = 0; i < vars.length; i++) {
      const short = String.fromCharCode(97 + (i % 26)) + (Math.floor(i / 26) || '');
      minified = minified.replace(new RegExp(`\\b${vars[i]}\\b`, 'g'), short);
    }
  }

  const minifiedSize = minified.length;
  const reduction = ((originalSize - minifiedSize) / originalSize) * 100;

  return {
    code: minified,
    originalSize,
    minifiedSize,
    reduction,
    ratio: minifiedSize / originalSize,
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
    minified = minified.replace(/\s+/g, ' ');
    minified = minified.replace(/;\s*/g, ';');
    minified = minified.replace(/{\s+/g, '{');
    minified = minified.replace(/\s+}/g, '}');
    minified = minified.replace(/:\s+/g, ':');
    minified = minified.replace(/,\s+/g, ',');
  }

  const minifiedSize = minified.length;
  const reduction = ((originalSize - minifiedSize) / originalSize) * 100;

  return {
    code: minified,
    originalSize,
    minifiedSize,
    reduction,
    ratio: minifiedSize / originalSize,
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

  // Remove unnecessary quotes
  minified = minified.replace(/="([^"]*?)"/g, (match, content) => {
    if (/^[a-zA-Z0-9_-]+$/.test(content)) {
      return `=${content}`;
    }
    return match;
  });

  const minifiedSize = minified.length;
  const reduction = ((originalSize - minifiedSize) / originalSize) * 100;

  return {
    code: minified,
    originalSize,
    minifiedSize,
    reduction,
    ratio: minifiedSize / originalSize,
  };
}

/**
 * General code optimization
 */
export function optimizeCode(
  code: string,
  options: MinifyOptions = {}
): string {
  let result = code;

  // Apply all optimizations
  if (options.removeComments) {
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    result = result.replace(/\/\/.*$/gm, '');
  }

  if (options.collapseWhitespace) {
    result = result.replace(/\s+/g, ' ');
    result = result.replace(/;\s*;/g, ';');
    result = result.replace(/{\s+/g, '{');
    result = result.replace(/\s+}/g, '}');
    result = result.replace(/\(\s+/g, '(');
    result = result.replace(/\s+\)/g, ')');
  }

  if (options.removeUnused) {
    // Remove unused variables (simplified)
    result = result.replace(/(?:let|const|var)\s+\w+\s*=\s*[^;]+;/g, '');
  }

  return result;
}

/**
 * Minify code with auto-detection
 */
export function minify(
  code: string | string[],
  options: MinifyOptions = {}
): MinifyResult {
  const codes = Array.isArray(code) ? code : [code];
  let combined = codes.join('\n');
  let type: 'js' | 'css' | 'html' = 'js';

  // Detect type
  if (combined.includes('</') || combined.includes('<!DOCTYPE')) {
    type = 'html';
  } else if (combined.includes('{') && combined.includes('}') && combined.includes(':')) {
    type = 'css';
  }

  switch (type) {
    case 'html':
      return minifyHTML(combined, options);
    case 'css':
      return minifyCSS(combined, options);
    default:
      return minifyJavaScript(combined, options);
  }
}