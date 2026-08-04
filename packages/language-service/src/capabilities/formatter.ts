/**
 * Formatter - Formats Teloce templates
 */

export interface FormatOptions {
  /**
   * Indent size
   */
  indentSize?: number;

  /**
   * Use tabs or spaces
   */
  useTabs?: boolean;

  /**
   * Indent HTML content
   */
  indentHTML?: boolean;

  /**
   * Max line length
   */
  maxLineLength?: number;

  /**
   * Preserve newlines
   */
  preserveNewlines?: boolean;
}

export interface FormatterProvider {
  /**
   * Format a template
   */
  format: (content: string, options?: FormatOptions) => string;
}

/**
 * Format a template
 */
export function formatTemplate(
  content: string,
  options: FormatOptions = {}
): string {
  const {
    indentSize = 2,
    useTabs = false,
    indentHTML = true,
    maxLineLength = 80,
    preserveNewlines = true,
  } = options;

  const indent = useTabs ? '\t' : ' '.repeat(indentSize);
  let result = '';
  let depth = 0;
  let inTag = false;
  let inInterpolation = false;
  let inString = false;
  let stringChar = '';
  let word = '';
  let lastChar = '';

  const lines = content.split('\n');
  
  for (const line of lines) {
    let trimmed = line.trim();
    if (!trimmed) {
      if (preserveNewlines) {
        result += '\n';
      }
      continue;
    }

    // Calculate indentation based on tags
    let lineDepth = depth;
    
    // Check for closing tags
    if (trimmed.startsWith('</')) {
      lineDepth = Math.max(0, lineDepth - 1);
    }

    // Add indentation
    if (indentHTML) {
      result += indent.repeat(lineDepth);
    }

    // Process the line
    let processedLine = trimmed;

    // Check for inline elements that shouldn't be indented
    const inlineElements = ['span', 'a', 'strong', 'em', 'b', 'i', 'u', 'code', 'label'];
    const isInline = inlineElements.some(el => {
      const open = `<${el}`;
      const close = `</${el}>`;
      return trimmed.includes(open) || trimmed.includes(close);
    });

    if (!isInline) {
      // Format attributes
      processedLine = formatAttributes(processedLine, maxLineLength);
    }

    result += processedLine + '\n';

    // Update depth based on tags
    const openTags = (trimmed.match(/<\w+[^>]*>/g) || []).filter(t => !t.startsWith('</') && !t.endsWith('/>'));
    const closeTags = (trimmed.match(/<\/\w+>/g) || []).length;
    
    depth += openTags.length - closeTags;
    if (depth < 0) depth = 0;
  }

  return result.trimEnd();
}

/**
 * Format attributes to be more readable
 */
function formatAttributes(line: string, maxLength: number): string {
  // Check if the line is too long
  if (line.length <= maxLength) {
    return line;
  }

  // Find the opening tag
  const tagMatch = line.match(/^<(\w+)([^>]*)/);
  if (!tagMatch) return line;

  const tagName = tagMatch[1];
  const rest = tagMatch[2];
  const closing = line.endsWith('/>') ? '/>' : '>';

  // Extract attributes
  const attrRegex = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  const attributes: string[] = [];
  let match: RegExpExecArray | null;
  let remaining = rest.trim();
  
  while ((match = attrRegex.exec(rest)) !== null) {
    const name = match[1];
    const value = match[2] || match[3] || '';
    attributes.push(`${name}="${value}"`);
    remaining = remaining.replace(match[0], '');
  }

  // If we have attributes, format them
  if (attributes.length > 0) {
    const indent = '  ';
    const lines = [`<${tagName}`];
    for (const attr of attributes) {
      lines.push(`${indent}${attr}`);
    }
    if (remaining.trim()) {
      lines.push(`${indent}${remaining.trim()}`);
    }
    const closingLine = closing === '/>' ? '/>' : '>';
    lines[lines.length - 1] = lines[lines.length - 1] + (lines.length === 1 ? closing : ` ${closing}`);
    return lines.join('\n');
  }

  return line;
}

/**
 * Create a formatter provider
 */
export function createFormatterProvider(): FormatterProvider {
  return {
    format(content: string, options: FormatOptions = {}): string {
      return formatTemplate(content, options);
    },
  };
}