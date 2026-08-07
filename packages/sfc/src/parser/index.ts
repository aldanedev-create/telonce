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
 * Helper to extract content and attributes of a SFC block
 */
function parseBlock(source: string, tag: string): { content: string; lang?: string } | null {
  // Check for self-closing tag (e.g. <style src="..." />)
  const selfCloseRegex = new RegExp(`<${tag}\\b([^>]*)\\/\\s*>`, 'i');
  const selfMatch = source.match(selfCloseRegex);
  if (selfMatch) {
    const attrs = selfMatch[1];
    let lang: string | undefined;
    const langMatch = attrs.match(/lang\s*=\s*(["'])([^"']+)\1/i);
    if (langMatch) {
      lang = langMatch[2];
    }
    return { content: '', lang };
  }

  // Find opening tag
  const openRegex = new RegExp(`<${tag}\\b([^>]*)>`, 'i');
  const openMatch = source.match(openRegex);
  if (!openMatch || openMatch.index === undefined) return null;

  const attrs = openMatch[1];
  let lang: string | undefined;
  const langMatch = attrs.match(/lang\s*=\s*(["'])([^"']+)\1/i);
  if (langMatch) {
    lang = langMatch[2];
  }

  const startIndex = openMatch.index + openMatch[0].length;
  const closeTag = `</${tag}>`;

  // Use a balanced tag scanning approach to avoid truncating at inner closing tags
  const combinedRegex = new RegExp(`(<${tag}\\b[^>]*>)|(<\\/${tag}>)`, 'gi');
  combinedRegex.lastIndex = startIndex;

  let depth = 1;
  let endIndex = -1;
  let match: RegExpExecArray | null;

  while ((match = combinedRegex.exec(source)) !== null) {
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
  }

  if (endIndex === -1) {
    const fallbackIndex = source.toLowerCase().indexOf(closeTag.toLowerCase(), startIndex);
    if (fallbackIndex === -1) return null;
    endIndex = fallbackIndex;
  }

  const content = source.slice(startIndex, endIndex).trim();
  return { content, lang };
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
    const objContent = scriptFromExport.slice(startIndex, endIndex + 1);
    const nameMatch = objContent.match(/name\s*:\s*(['"])([^'"]+)\1/);
    if (nameMatch) {
      return nameMatch[2];
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

  // Parse Style Section
  const styleBlock = parseBlock(source, 'style');
  if (styleBlock) {
    style = styleBlock.content;
    styleLang = styleBlock.lang;
  }

  return {
    name,
    template,
    script,
    style,
    styleLang,
    scriptLang,
    diagnostics,
  };
}