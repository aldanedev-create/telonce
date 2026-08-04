/**
 * Lexer - Tokenizes the input template
 */

import { TokenType, type Token } from './tokens';

export { TokenType, type Token };

/**
 * Tokenize a template string
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;
  let line = 1;
  let column = 1;

  while (position < input.length) {
    const char = input[position];

    // Skip whitespace
    if (isWhitespace(char)) {
      if (char === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
      position++;
      continue;
    }

    // Handle HTML tags
    if (char === '<') {
      const next = input[position + 1];
      
      // Check for closing tag
      if (next === '/') {
        const tagName = readTagName(input, position + 2);
        tokens.push({
          type: TokenType.CloseTag,
          value: tagName,
          position: position,
          line,
          column,
        });
        position += tagName.length + 3;
        column += tagName.length + 3;
        continue;
      }

      // Check for self-closing tag
      const tagName = readTagName(input, position + 1);
      const closing = input[position + 1 + tagName.length];
      if (closing === '/') {
        tokens.push({
          type: TokenType.SelfCloseTag,
          value: tagName,
          position: position,
          line,
          column,
        });
        position += tagName.length + 3;
        column += tagName.length + 3;
        continue;
      }

      // Opening tag
      tokens.push({
        type: TokenType.OpenTag,
        value: tagName,
        position: position,
        line,
        column,
      });
      position += tagName.length + 2;
      column += tagName.length + 2;

      // Parse attributes
      while (position < input.length && input[position] !== '>') {
        const attr = readAttribute(input, position);
        if (attr) {
          tokens.push({
            type: TokenType.Attribute,
            value: attr.name,
            position: position,
            line,
            column,
          });
          if (attr.value) {
            tokens.push({
              type: TokenType.AttributeValue,
              value: attr.value,
              position: position + attr.name.length + 1,
              line,
              column: column + attr.name.length + 1,
            });
          }
          position += attr.length;
          column += attr.length;
        } else {
          break;
        }
      }

      // Skip closing >
      if (input[position] === '>') {
        position++;
        column++;
      }
      continue;
    }

    // Handle interpolation {{ }}
    if (char === '{' && input[position + 1] === '{') {
      const end = input.indexOf('}}', position + 2);
      if (end !== -1) {
        const expression = input.substring(position + 2, end).trim();
        tokens.push({
          type: TokenType.Interpolation,
          value: expression,
          position: position,
          line,
          column,
        });
        position = end + 2;
        column += expression.length + 4;
        continue;
      }
    }

    // Handle text
    let text = '';
    while (position < input.length && input[position] !== '<' && !(input[position] === '{' && input[position + 1] === '{')) {
      text += input[position];
      position++;
      column++;
    }
    if (text.trim()) {
      tokens.push({
        type: TokenType.Text,
        value: text,
        position: position - text.length,
        line,
        column: column - text.length,
      });
    }
  }

  // Add EOF token
  tokens.push({
    type: TokenType.EOF,
    value: '',
    position: input.length,
    line,
    column,
  });

  return tokens;
}

function isWhitespace(char: string): boolean {
  return char === ' ' || char === '\n' || char === '\t' || char === '\r';
}

function readTagName(input: string, start: number): string {
  let end = start;
  while (end < input.length && /[a-zA-Z0-9_-]/.test(input[end])) {
    end++;
  }
  return input.substring(start, end);
}

function readAttribute(input: string, start: number): { name: string; value: string; length: number } | null {
  let pos = start;
  // Skip whitespace
  while (pos < input.length && isWhitespace(input[pos])) {
    pos++;
  }
  if (pos >= input.length || input[pos] === '>' || input[pos] === '/') {
    return null;
  }

  // Read attribute name
  let name = '';
  while (pos < input.length && /[a-zA-Z0-9_:@-]/.test(input[pos])) {
    name += input[pos];
    pos++;
  }

  let value = '';
  let length = name.length;

  // Check for = value
  if (input[pos] === '=') {
    pos++;
    length++;
    // Skip whitespace
    while (pos < input.length && isWhitespace(input[pos])) {
      pos++;
      length++;
    }

    const quote = input[pos];
    if (quote === '"' || quote === "'") {
      pos++;
      length++;
      while (pos < input.length && input[pos] !== quote) {
        value += input[pos];
        pos++;
        length++;
      }
      if (pos < input.length) {
        pos++;
        length++;
      }
    } else {
      while (pos < input.length && !isWhitespace(input[pos]) && input[pos] !== '>' && input[pos] !== '/') {
        value += input[pos];
        pos++;
        length++;
      }
    }
  }

  return { name, value, length };
}