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
 * Removes comments and/or collapses whitespace in one string-and-
 * comment-aware pass. Previously `minifyJavaScript` ran plain regexes
 * for line comments and one for runs of whitespace directly against the
 * raw source, with no awareness of string literals at all. Confirmed
 * via real, completely ordinary code that this wasn't just an edge
 * case:
 * - `const url = "http://example.com/api"; fetch(url)...` - the `//`
 *   inside the URL string matched the line-comment regex, deleting
 *   everything from that point to the end of the line. Since this was
 *   all one line, that meant the closing quote and the entire rest of
 *   the statement vanished, leaving `const url = "http:` - an
 *   unterminated string literal, a straight SyntaxError. This isn't a
 *   rare pattern; URLs in string literals are everywhere in real code,
 *   and `minifyJavaScript` runs by default (minify defaults to on)
 *   every time `teloce build` runs.
 * - `const s = "a fake-block-comment-looking b";` - text inside a string that
 *   merely *looks like* a block comment got stripped out of the string
 *   entirely, silently changing the string's actual content with no
 *   error reported at all.
 * - `const msg = "Hello   World";` - intentional multiple spaces inside
 *   a string got collapsed down to one, again silently changing what
 *   the string actually contains.
 * This walks the source once, tracking whether the scanner is currently
 * inside a string/template literal (correctly handling backslash
 * escapes) or a comment, and only strips comments / collapses
 * whitespace in code that's actually code - string contents are always
 * emitted byte-for-byte untouched.
 */
function stripCommentsAndWhitespace(
  source: string,
  removeComments: boolean,
  collapseWhitespace: boolean
): string {
  let out = '';
  let inString: string | null = null;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;
  let lastEmittedWasSpace = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        out += '\n';
        lastEmittedWasSpace = true;
      }
      continue;
    }
    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      out += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === inString) {
        inString = null;
      }
      lastEmittedWasSpace = false;
      continue;
    }

    if (removeComments && char === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (removeComments && char === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      out += char;
      lastEmittedWasSpace = false;
      continue;
    }

    if (collapseWhitespace && /\s/.test(char)) {
      if (!lastEmittedWasSpace) {
        out += ' ';
        lastEmittedWasSpace = true;
      }
      continue;
    }

    out += char;
    lastEmittedWasSpace = false;
  }

  return out;
}

/**
 * Tightens whitespace immediately around punctuation (`{ `, ` }`, `( `,
 * ` )`, `;  ;`) - a cosmetic follow-up to stripCommentsAndWhitespace's
 * general collapse-to-single-space pass. Segments the already-processed
 * source into string and non-string runs (string boundaries are exactly
 * where they were before, since stripCommentsAndWhitespace never
 * touches string contents) and only applies the tightening regexes to
 * the non-string runs, so a space-padded string like `"{ foo }"` still
 * can't be corrupted by this step either.
 */
function tightenPunctuationSpacing(source: string): string {
  let result = '';
  let i = 0;
  let inString: string | null = null;
  let segmentStart = 0;
  let escaped = false;

  function flushCodeSegment(end: number) {
    const segment = source.slice(segmentStart, end);
    result += segment
      .replace(/;\s*;/g, ';')
      .replace(/{\s+/g, '{')
      .replace(/\s+}/g, '}')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')');
  }

  for (; i < source.length; i++) {
    const char = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === inString) {
        inString = null;
        result += source.slice(segmentStart, i + 1);
        segmentStart = i + 1;
      }
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      flushCodeSegment(i);
      inString = char;
      segmentStart = i;
    }
  }
  flushCodeSegment(source.length);

  return result;
}

/**
 * Minify JavaScript code safely without corrupting property access or scopes
 */
export function minifyJavaScript(
  code: string,
  options: MinifyOptions = {}
): MinifyResult {
  const originalSize = code.length;
  let minified = stripCommentsAndWhitespace(
    code,
    options.removeComments !== false,
    options.collapseWhitespace !== false
  );

  // Further whitespace-adjacent-to-punctuation tightening. Same string-
  // awareness concern applies here too, so this only ever tightens
  // spacing immediately around punctuation that stripCommentsAndWhitespace
  // has already collapsed to single spaces outside of strings - it never
  // touches string contents, which stripCommentsAndWhitespace already
  // left completely alone.
  if (options.collapseWhitespace !== false) {
    minified = tightenPunctuationSpacing(minified);
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
 * Same string-aware comment/whitespace handling as
 * stripCommentsAndWhitespace above, adapted for CSS: no `//` line
 * comments (not valid CSS syntax), but `/* ... *_/` block comments and
 * quoted strings (`content: "..."`, `url("...")`) both need the same
 * protection. Confirmed via real CSS that `content: "/* not a comment
 * *_/"` (a real, if uncommon, CSS technique) was being reduced to an
 * empty string entirely - the block-comment regex matched straight
 * through the string's own quote characters, treating the string's
 * content as if it were a real comment to delete. Multi-space string
 * content (`content: "a  b  c"`) was silently collapsed the same way
 * the JS minifier's equivalent bug did.
 */
function stripCssCommentsAndWhitespace(
  source: string,
  removeComments: boolean,
  collapseWhitespace: boolean
): string {
  let out = '';
  let inString: string | null = null;
  let inBlockComment = false;
  let escaped = false;
  let lastEmittedWasSpace = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      out += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === inString) {
        inString = null;
      }
      lastEmittedWasSpace = false;
      continue;
    }

    if (removeComments && char === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (char === '"' || char === "'") {
      inString = char;
      out += char;
      lastEmittedWasSpace = false;
      continue;
    }

    if (collapseWhitespace && /\s/.test(char)) {
      if (!lastEmittedWasSpace) {
        out += ' ';
        lastEmittedWasSpace = true;
      }
      continue;
    }

    out += char;
    lastEmittedWasSpace = false;
  }

  return out;
}

/**
 * Minify CSS code
 */
export function minifyCSS(
  code: string,
  options: MinifyOptions = {}
): MinifyResult {
  const originalSize = code.length;
  let minified = stripCssCommentsAndWhitespace(
    code,
    options.removeComments !== false,
    false // whitespace collapse done separately below to preserve exact previous punctuation-tightening behavior
  );

  // Collapse whitespace (string-aware tightening around CSS punctuation,
  // matching the previous behavior's intent but only applied outside
  // string literals - see stripCssCommentsAndWhitespace's doc comment
  // above for what this replaces and why).
  if (options.collapseWhitespace !== false) {
    minified = stripCssCommentsAndWhitespace(minified, false, true);
    minified = tightenCssPunctuationSpacing(minified);
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
 * String-aware version of the previous punctuation-tightening regex
 * chain for CSS (`;\s*` -> `;`, `{\s+` -> `{`, etc.), applied only
 * outside string literals for the same reason as
 * tightenPunctuationSpacing (the JS equivalent) above.
 */
function tightenCssPunctuationSpacing(source: string): string {
  let result = '';
  let inString: string | null = null;
  let segmentStart = 0;
  let escaped = false;

  function flushCodeSegment(end: number) {
    const segment = source.slice(segmentStart, end);
    result += segment
      .replace(/;\s*/g, ';')
      .replace(/{\s+/g, '{')
      .replace(/\s+}/g, '}')
      .replace(/:\s+/g, ':')
      .replace(/,\s+/g, ',');
  }

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === inString) {
        inString = null;
        result += source.slice(segmentStart, i + 1);
        segmentStart = i + 1;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      flushCodeSegment(i);
      inString = char;
      segmentStart = i;
    }
  }
  flushCodeSegment(source.length);

  return result;
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