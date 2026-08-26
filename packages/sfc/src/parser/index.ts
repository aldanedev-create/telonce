/**
 * SFC Parser - splits .vel file into template/script/style sections
 */

export interface SFCResult {
  /**
   * Component name (from script export)
   */
  name?: string;

  /**
   * Template section content
   */
  template: string;

  /**
   * Script section content
   */
  script: string;

  /**
   * Style section content
   */
  style?: string;

  /**
   * Style language (css, scss, less)
   */
  styleLang?: string;

  /**
   * Whether the <style> tag had the `scoped` attribute (e.g.
   * `<style scoped>`). Previously this was parsed and then silently
   * discarded - parseBlock only ever checked for `lang="..."` on a
   * block's opening tag, never `scoped`, so writing `<style scoped>` vs
   * plain `<style>` had zero effect on whether that component's CSS
   * actually got scoped: scoping was controlled entirely by an external,
   * global compile option instead, with no way for an individual .vel
   * file to opt in or out for itself - exactly the kind of per-component
   * control that attribute syntax (borrowed from the same convention
   * other component frameworks use) implies exists.
   */
  styleScoped: boolean;

  /**
   * All <style> blocks found in the file, in source order. A single
   * .vel file can legitimately contain more than one (e.g. one scoped +
   * one global) - `style`/`styleLang`/`styleScoped` above only reflect
   * the first one, kept for existing code that reads those singular
   * fields; this is the complete list.
   */
  styleBlocks: Array<{ content: string; lang?: string; scoped: boolean }>;

  /**
   * Script language (js, ts)
   */
  scriptLang?: string;

  /**
   * Diagnostics
   */
  diagnostics: {
    errors: string[];
    warnings: string[];
  };
}

export interface SFCParserOptions {
  /**
   * Filename for error reporting
   */
  filename?: string;
}

/**
 * Same string/comment-aware scanning technique already used elsewhere in
 * this codebase (see findMatchingBrace in ../script/index.ts) - tracks
 * whether the scanner is currently inside a string literal or comment so
 * tag-like text there doesn't get mistaken for a real tag boundary.
 * Returns the index of the first un-quoted/un-commented match for
 * `pattern` at or after `from`, or -1.
 *
 * This matters specifically for `<script>` blocks: a plain regex/text
 * scan for `</script>` (the previous approach) would match that literal
 * text anywhere in the remaining source, including inside a JS string
 * literal - e.g. `data() { return { note: 'closing tag: </script>' }; }`
 * - causing the block to be truncated right there, silently dropping
 * everything genuinely after it with no error reported at all (confirmed:
 * an entire `methods: {...}` block vanished from compiled output with
 * zero diagnostics). Regex literals are a known, accepted gap here (
 * distinguishing a regex literal from division syntax needs real
 * parsing, not just scanning) - narrower and much less likely to contain
 * tag-like text than an ordinary string.
 */
function findUnquoted(source: string, pattern: RegExp, from: number): RegExpExecArray | null {
  let inString: string | null = null;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  pattern.lastIndex = from;

  for (let i = from; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }

    pattern.lastIndex = i;
    const m = pattern.exec(source);
    if (m && m.index === i) {
      return m;
    }
  }

  return null;
}

/**
 * Helper to extract content and attributes of a SFC block. `fromIndex`
 * lets callers search starting partway through `source`, so repeated
 * calls (see findAllBlocks below) can locate more than one block of the
 * same tag - needed because a single .vel file can legitimately have
 * more than one <style> block (e.g. one scoped + one global, a real,
 * common SFC pattern), which parseSFC previously had no way to see past
 * the first of at all.
 */
function parseBlock(
  source: string,
  tag: string,
  fromIndex = 0
): { content: string; lang?: string; scoped?: boolean; matchEnd: number } | null {
  // Check for self-closing tag (e.g. <style src="..." />)
  const selfCloseRegex = new RegExp(`<${tag}\\b([^>]*)\\/\\s*>`, 'i');
  selfCloseRegex.lastIndex = fromIndex;
  const selfMatch = selfCloseRegex.exec(source.slice(fromIndex));
  const openRegexProbe = new RegExp(`<${tag}\\b([^>]*)>`, 'i');
  const openMatchProbe = openRegexProbe.exec(source.slice(fromIndex));

  // Prefer whichever form (self-closing vs normal open tag) appears
  // first in the remaining source, so a self-closing block doesn't
  // wrongly take priority over an earlier normal block (or vice versa).
  if (
    selfMatch &&
    (!openMatchProbe || selfMatch.index <= openMatchProbe.index)
  ) {
    const attrs = selfMatch[1];
    let lang: string | undefined;
    const langMatch = attrs.match(/lang\s*=\s*(["'])([^"']+)\1/i);
    if (langMatch) {
      lang = langMatch[2];
    }
    const scoped = /(^|\s)scoped(\s|=|$)/i.test(attrs);
    return { content: '', lang, scoped, matchEnd: fromIndex + selfMatch.index + selfMatch[0].length };
  }

  // Find opening tag
  const openRegex = new RegExp(`<${tag}\\b([^>]*)>`, 'i');
  openRegex.lastIndex = fromIndex;
  const openMatchRel = openRegex.exec(source.slice(fromIndex));
  if (!openMatchRel) return null;
  const openMatchIndex = fromIndex + openMatchRel.index;
  const openMatchFull = openMatchRel[0];
  const openMatchAttrs = openMatchRel[1];

  const attrs = openMatchAttrs;
  let lang: string | undefined;
  const langMatch = attrs.match(/lang\s*=\s*(["'])([^"']+)\1/i);
  if (langMatch) {
    lang = langMatch[2];
  }
  const scoped = /(^|\s)scoped(\s|=|$)/i.test(attrs);

  const startIndex = openMatchIndex + openMatchFull.length;
  const closeTag = `</${tag}>`;

  // Use a balanced tag scanning approach to avoid truncating at inner
  // closing tags - and, for the <script> block specifically, skip over
  // string literals and comments while scanning (see findUnquoted above)
  // so tag-like text inside actual JS source (a string, a comment) is
  // never mistaken for a real tag boundary. <template>/<style> content
  // isn't JS, so this scans them the same way as before - unaffected.
  const combinedRegex = new RegExp(`(<${tag}\\b[^>]*>)|(<\\/${tag}>)`, 'gi');
  const skipStringsAndComments = tag === 'script';

  let depth = 1;
  let endIndex = -1;
  let searchFrom = startIndex;

  while (searchFrom <= source.length) {
    const match = skipStringsAndComments
      ? findUnquoted(source, combinedRegex, searchFrom)
      : (() => {
          combinedRegex.lastIndex = searchFrom;
          return combinedRegex.exec(source);
        })();

    if (!match) break;

    if (match[1]) {
      const tagStr = match[1].trim();
      if (!tagStr.endsWith('/>')) {
        depth++;
      }
    } else if (match[2]) {
      depth--;
      if (depth === 0) {
        endIndex = match.index;
        break;
      }
    }

    searchFrom = match.index + match[0].length;
  }

  if (endIndex === -1) {
    const fallbackIndex = source.toLowerCase().indexOf(closeTag.toLowerCase(), startIndex);
    if (fallbackIndex === -1) return null;
    endIndex = fallbackIndex;
  }

  const content = source.slice(startIndex, endIndex).trim();
  return { content, lang, scoped, matchEnd: endIndex + closeTag.length };
}

/**
 * Finds every occurrence of `tag`'s block in `source`, not just the
 * first. Needed for <style>, where more than one block in a single file
 * is a real, common pattern (e.g. one scoped + one global) - previously
 * parseSFC only ever looked at the first <style> block found and any
 * additional ones were silently dropped with no warning at all.
 */
function findAllBlocks(
  source: string,
  tag: string
): Array<{ content: string; lang?: string; scoped?: boolean }> {
  const results: Array<{ content: string; lang?: string; scoped?: boolean }> = [];
  let searchFrom = 0;

  while (searchFrom < source.length) {
    const block = parseBlock(source, tag, searchFrom);
    if (!block) break;
    results.push({ content: block.content, lang: block.lang, scoped: block.scoped });
    if (block.matchEnd <= searchFrom) break; // safety net against a zero-progress match
    searchFrom = block.matchEnd;
  }

  return results;
}

/**
 * Same string/comment-aware, depth-aware top-level-key detection used in
 * ../script/index.ts's findTopLevelKey (duplicated rather than imported,
 * to keep this file's SFC-block-splitting concern independent from that
 * file's property-extraction internals). Finds `name` as an actual
 * top-level key of `objContent`, not matching if it happens to appear
 * nested inside some other property's value.
 */
function findTopLevelNameValue(objContent: string): string | undefined {
  let depth = 0;
  let inString: string | null = null;
  let inCommentLine = false;
  let inCommentBlock = false;
  let escaped = false;
  let atKeyPosition = true;

  for (let i = 0; i < objContent.length; i++) {
    const char = objContent[i];
    const nextChar = objContent[i + 1];

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

    if (depth === 0 && atKeyPosition && objContent.startsWith('name', i)) {
      let j = i + 4;
      while (j < objContent.length && /\s/.test(objContent[j])) j++;
      if (objContent[j] === ':') {
        j++;
        while (j < objContent.length && /\s/.test(objContent[j])) j++;
        const quote = objContent[j];
        if (quote === '"' || quote === "'") {
          const closeIdx = objContent.indexOf(quote, j + 1);
          if (closeIdx !== -1) {
            return objContent.slice(j + 1, closeIdx);
          }
        }
      }
    }

    atKeyPosition = false;
  }

  return undefined;
}

/**
 * Extract component name safely from export default object using brace balancing
 */
function extractComponentName(script: string): string | undefined {
  const exportIdx = script.search(/export\s+default/);
  if (exportIdx === -1) {
    // Fallback search anywhere in script
    const nameMatch = script.match(/name\s*:\s*(['"])([^'"]+)\1/);
    return nameMatch ? nameMatch[2] : undefined;
  }

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
    // Previously this used a plain `objContent.match(/name\s*:\s*...)`
    // search that matched *anywhere* in the export object text,
    // including nested inside another property's value - confirmed via
    // a real case: `data() { return { user: { name: 'Alice' } }; },
    // name: 'RealComponentName'` (data() appearing before the real
    // top-level name, as many style guides actually recommend ordering)
    // extracted "Alice" as the component's name instead of
    // "RealComponentName". Since this extracted name also becomes the
    // exported const's actual variable name in generated code, a wrong
    // value isn't just a wrong label - if it contained characters
    // invalid in a JS identifier (spaces, punctuation - both totally
    // plausible for arbitrary nested string data), it could produce
    // outright broken, non-compiling generated code.
    const objContent = scriptFromExport.slice(startIndex, endIndex + 1);
    // Strip the outer braces before scanning so findTopLevelNameValue's
    // depth===0 check means the same thing it means in
    // ../script/index.ts's findTopLevelKey: "a direct top-level property
    // of the component options object", not "one level inside the outer
    // braces this slice happens to include".
    const found = findTopLevelNameValue(objContent.slice(1, -1));
    if (found) {
      return found;
    }
  }

  // Fallback search in entire script
  const fallbackMatch = script.match(/name\s*:\s*(['"])([^'"]+)\1/);
  return fallbackMatch ? fallbackMatch[2] : undefined;
}

/**
 * Parse a .vel Single File Component
 */
export function parseSFC(source: string, options: SFCParserOptions = {}): SFCResult {
  const { filename = 'component.vel' } = options;
  const diagnostics = {
    errors: [] as string[],
    warnings: [] as string[],
  };
  const errorPrefix = `[${filename}] `;

  let template = '';
  let script = '';
  let style: string | undefined;
  let styleLang: string | undefined;
  let styleScoped = false;
  let scriptLang: string | undefined;
  let name: string | undefined;

  // Parse Template Section
  const templateBlock = parseBlock(source, 'template');
  if (templateBlock) {
    template = templateBlock.content;
  } else {
    diagnostics.errors.push(`${errorPrefix}Missing <template> section`);
  }

  // Parse Script Section
  const scriptBlock = parseBlock(source, 'script');
  if (scriptBlock) {
    script = scriptBlock.content;
    scriptLang = scriptBlock.lang;
    name = extractComponentName(script);
  } else {
    diagnostics.warnings.push(`${errorPrefix}No <script> section found`);
  }

  // Parse Style Section - a .vel file can legitimately have more than one
  // <style> block (e.g. one scoped + one global), so this finds all of
  // them, not just the first. `style`/`styleLang`/`styleScoped` below
  // still reflect just the first block, for any existing code reading
  // those singular fields; `styleBlocks` carries the complete list.
  const styleBlocksFound = findAllBlocks(source, 'style');
  const styleBlocks = styleBlocksFound.map((b) => ({
    content: b.content,
    lang: b.lang,
    scoped: b.scoped ?? false,
  }));
  const styleBlock = styleBlocksFound[0];
  if (styleBlock) {
    style = styleBlock.content;
    styleLang = styleBlock.lang;
    styleScoped = styleBlock.scoped ?? false;
  }

  return {
    name,
    template,
    script,
    style,
    styleLang,
    styleScoped,
    styleBlocks,
    scriptLang,
    diagnostics,
  };
}