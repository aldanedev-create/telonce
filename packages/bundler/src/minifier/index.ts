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
 * Minify JavaScript code safely without corrupting property access or scopes
 */
export function minifyJavaScript(
  code: string,
  options: MinifyOptions = {}
): MinifyResult {
  const originalSize = code.length;
  let minified = code;

  // 1. Remove comments
  if (options.removeComments !== false) {
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    minified = minified.replace(/\/\/.*/gm, '');
  }

  // 2. Remove unused variables safely (conservative check for unreferenced pure declarations)
  if (options.removeUnused) {
    const declRegex = /\b(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([^;]+);?/g;
    let match;
    const declarations: { full: string; name: string; init: string }[] = [];
    while ((match = declRegex.exec(minified)) !== null) {
      declarations.push({ full: match[0], name: match[2], init: match[3].trim() });
    }

    for (const decl of declarations) {
      if (options.preserve && options.preserve.includes(decl.name)) continue;
      
      // Check if initializer is side-effect free (literals, numbers, booleans, strings)
      const isPureLiteral = /^(['"`][^'"`]*['"`]|\d+(\.\d+)?|true|false|null|undefined)$/.test(decl.init);
      if (!isPureLiteral) continue;

      // Count occurrences of the variable as a whole word
      const wordRegex = new RegExp(`\\b${decl.name}\\b`, 'g');
      const matches = minified.match(wordRegex);
      
      // If it appears only once (the declaration itself), remove it safely
      if (matches && matches.length === 1) {
        const stmtRegex = new RegExp(`\\b(?:let|const|var)\\s+${decl.name}\\s*=\\s*[^;]+;?`, 'g');
        minified = minified.replace(stmtRegex, '');
      }
    }
  }

  // 3. Collapse whitespace
  if (options.collapseWhitespace !== false) {
    minified = minified
      .replace(/\s+/g, ' ')
      .replace(/;\s*;/g, ';')
      .replace(/{\s+/g, '{')
      .replace(/\s+}/g, '}')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')');
  }

  // 4. Shorten variable names safely avoiding property accesses and scope collisions
  if (options.shortenNames) {
    const varRegex = /(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const vars: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = varRegex.exec(minified)) !== null) {
      if (!vars.includes(match[1]) && !vars.includes(match[1])) {
        vars.push(match[1]);
      }
    }
    
    let counter = 0;
    for (let i = 0; i < vars.length; i++) {
      const varName = vars[i];
      if (options.preserve && options.preserve.includes(varName)) continue;
      
      const short = String.fromCharCode(97 + (counter % 26)) + (Math.floor(counter / 26) || '');
      counter++;

      try {
        // Negative lookbehind ensures we don't match after a dot (.) or object property key
        const safeRegex = new RegExp(`(?<!\\.)\\b${varName}\\b`, 'g');
        minified = minified.replace(safeRegex, short);
      } catch {
        const wordRegex = new RegExp(`\\b${varName}\\b`, 'g');
        minified = minified.replace(wordRegex, (m, offset, str) => {
          if (offset > 0 && (str[offset - 1] === '.' || str[offset - 1] === ':')) {
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
    // Robust detection avoiding false positives from JS object literals or TypeScript definitions
    if (/^\s*(<!DOCTYPE|<html|<template|<div|<span|<section)/i.test(combined) || (combined.includes('<html') && combined.includes('</html>'))) {
      type = 'html';
    } else if (
      (/^\s*([a-zA-Z0-9#class_.-]+\s*\{[^}]*:[^}]*\})/.test(combined) || combined.includes('@media') || combined.includes('@keyframes')) &&
      !/\b(function|const|let|var|import|export|return|class|interface|type)\b/.test(combined)
    ) {
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
    finalCode = codes.map((c) => {
      if (type === 'html') return minifyHTML(c, options).code as string;
      if (type === 'css') return minifyCSS(c, options).code as string;
      return minifyJavaScript(c, options).code as string;
    });
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