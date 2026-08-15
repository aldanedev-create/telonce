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

  function advance(str: string) {
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
    position += str.length;
  }

  function advanceChars(count: number) {
    for (let i = 0; i < count; i++) {
      if (position < input.length) {
        const char = input[position];
        if (char === '\n') {
          line++;
          column = 1;
        } else {
          column++;
        }
        position++;
      }
    }
  }

  while (position < input.length) {
    const char = input[position];

    // 1. Handle HTML Comments <!-- ... -->
    if (input.startsWith('<!--', position)) {
      const end = input.indexOf('-->', position + 4);
      const commentStr = end !== -1 ? input.substring(position, end + 3) : input.substring(position);
      advance(commentStr);
      continue;
    }

    // 2. Handle Interpolation {{ ... }}
    if (char === '{' && input[position + 1] === '{') {
      const end = input.indexOf('}}', position + 2);
      if (end !== -1) {
        const fullExprBlock = input.substring(position, end + 2);
        const expression = input.substring(position + 2, end).trim();
        tokens.push({
          type: TokenType.Interpolation,
          value: expression,
          position,
          line,
          column,
        });
        advance(fullExprBlock);
        continue;
      }
    }

    // 3. Handle HTML Tags
    if (char === '<' && isTagStart(input, position)) {
      const next = input[position + 1];

      // Closing Tag </tag>
      if (next === '/') {
        const tagStartPos = position;
        const tagStartLine = line;
        const tagStartCol = column;

        advanceChars(2); // consume '</'
        const tagName = readTagName(input, position);
        advance(tagName);

        // Skip whitespace before '>'
        while (position < input.length && isWhitespace(input[position])) {
          advanceChars(1);
        }

        if (input[position] === '>') {
          advanceChars(1); // consume '>'
        }

        tokens.push({
          type: TokenType.CloseTag,
          value: tagName,
          position: tagStartPos,
          line: tagStartLine,
          column: tagStartCol,
        });
        continue;
      }

      // Opening or Self-Closing Tag <tag attr="val" />
      const tagStartPos = position;
      const tagStartLine = line;
      const tagStartCol = column;

      advanceChars(1); // consume '<'
      const tagName = readTagName(input, position);
      advance(tagName);

      let isSelfClosing = false;

      tokens.push({
        type: TokenType.OpenTag,
        value: tagName,
        position: tagStartPos,
        line: tagStartLine,
        column: tagStartCol,
      });
      const openTagIndex = tokens.length - 1;

      while (position < input.length) {
        // Skip whitespace
        while (position < input.length && isWhitespace(input[position])) {
          advanceChars(1);
        }

        if (position >= input.length) break;

        if (input[position] === '>') {
          advanceChars(1); // consume '>'
          break;
        }

        if (input[position] === '/' && input[position + 1] === '>') {
          advanceChars(2); // consume '/>'
          isSelfClosing = true;
          break;
        }

        const attrStart = position;
        const attr = readAttribute(input, position);
        if (attr && attr.length > 0) {
          tokens.push({
            type: TokenType.Attribute,
            value: attr.name,
            position: attrStart,
            line,
            column,
          });

          const consumedAttrStr = input.substring(attrStart, attrStart + attr.length);
          advance(consumedAttrStr);

          if (attr.value !== undefined && attr.value !== '') {
            tokens.push({
              type: TokenType.AttributeValue,
              value: attr.value,
              position: attrStart + attr.name.length,
              line,
              column,
            });
          }
        } else {
          // readAttribute matched nothing here (an unrecognized character
          // sitting where an attribute name was expected). Previously this
          // fell through to the same `advanceChars(1)` below regardless -
          // that part was fine. The bug was `attr && ...` alone: a
          // *zero-length but non-null* result (attr.length === 0) used to
          // pass the old `if (attr)` check, get pushed as a bogus empty
          // Attribute token, and add 0 to position - looping forever
          // without ever reaching this else branch's advance at all. Now
          // any non-positive-length match is treated the same as no match,
          // guaranteeing this loop always makes forward progress.
          advanceChars(1);
        }
      }

      // The OpenTag token was pushed before its attributes (so the parser,
      // which starts reading attributes right after seeing OpenTag, sees
      // them in the same order they appear in the source). If this turned
      // out to be self-closing, patch that same token's type in place
      // instead of pushing a second one.
      if (isSelfClosing) {
        tokens[openTagIndex].type = TokenType.SelfCloseTag;
      }
      continue;
    }

    // 4. Handle Text Nodes (preserves whitespace and handles literal '<')
    let text = '';
    const textStartPos = position;
    const textStartLine = line;
    const textStartCol = column;

    while (position < input.length) {
      if (
        (input[position] === '<' && isTagStart(input, position)) ||
        (input[position] === '{' && input[position + 1] === '{') ||
        input.startsWith('<!--', position)
      ) {
        break;
      }
      text += input[position];
      advanceChars(1);
    }

    if (text.length > 0) {
      tokens.push({
        type: TokenType.Text,
        value: text,
        position: textStartPos,
        line: textStartLine,
        column: textStartCol,
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

function isTagStart(input: string, pos: number): boolean {
  if (input[pos] !== '<') return false;
  const next = input[pos + 1];
  return /[a-zA-Z\/!]/.test(next);
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
  // Includes '.' so modifier syntax like @keyup.enter reads as one
  // attribute name, not two. Previously '.' wasn't in this set at all: the
  // name-reading loop stopped dead at the '.', the *next* readAttribute
  // call then started sitting exactly on that '.' character, matched
  // nothing (not a name char, not '=', not whitespace), returned a
  // zero-length result, and the caller's position never advanced -
  // an infinite loop (confirmed via an actual OOM crash on
  // `<input @keyup.enter="x" />`).
  let name = '';
  while (pos < input.length && /[a-zA-Z0-9_:@.-]/.test(input[pos])) {
    name += input[pos];
    pos++;
  }

  let value = '';

  // Skip whitespace before =
  while (pos < input.length && isWhitespace(input[pos])) {
    pos++;
  }

  // Check for = value
  if (input[pos] === '=') {
    pos++;
    // Skip whitespace after =
    while (pos < input.length && isWhitespace(input[pos])) {
      pos++;
    }

    const quote = input[pos];
    if (quote === '"' || quote === "'") {
      pos++;
      while (pos < input.length && input[pos] !== quote) {
        value += input[pos];
        pos++;
      }
      if (pos < input.length) {
        pos++; // consume closing quote
      }
    } else {
      while (pos < input.length && !isWhitespace(input[pos]) && input[pos] !== '>' && input[pos] !== '/') {
        value += input[pos];
        pos++;
      }
    }
  }

  return { name, value, length: pos - start };
}