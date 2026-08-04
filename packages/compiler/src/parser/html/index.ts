/**
 * HTML parser - parses standard HTML elements
 */

import { TokenType, type Token } from '../../lexer';
import { ASTNodeType, type ElementNode, type TextNode } from '../ast';

/**
 * Parse HTML content
 */
export function parseHTML(tokens: Token[]): ElementNode[] {
  const elements: ElementNode[] = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];
    
    if (token.type === TokenType.EOF) {
      break;
    }

    if (token.type === TokenType.OpenTag) {
      const result = parseHTMLElement(tokens, index);
      elements.push(result.element);
      index = result.index;
    } else {
      index++;
    }
  }

  return elements;
}

/**
 * Parse an HTML element
 */
function parseHTMLElement(
  tokens: Token[],
  start: number
): { element: ElementNode; index: number } {
  let index = start;
  const tagToken = tokens[index];
  const tagName = tagToken.value;
  const attributes: Record<string, string> = {};
  const children: ElementNode[] = [];

  index++;

  // Parse attributes
  while (index < tokens.length) {
    const token = tokens[index];
    if (token.type === TokenType.Attribute) {
      const attrName = token.value;
      const nextToken = tokens[index + 1];
      if (nextToken && nextToken.type === TokenType.AttributeValue) {
        attributes[attrName] = nextToken.value;
        index += 2;
      } else {
        attributes[attrName] = '';
        index++;
      }
    } else {
      break;
    }
  }

  // Skip >
  if (tokens[index] && tokens[index].type === TokenType.CloseTag) {
    index++;
  }

  // Parse children
  while (index < tokens.length) {
    const token = tokens[index];
    
    if (token.type === TokenType.CloseTag) {
      if (token.value === tagName) {
        index++;
        break;
      }
      break;
    }

    if (token.type === TokenType.OpenTag) {
      const child = parseHTMLElement(tokens, index);
      children.push(child.element);
      index = child.index;
      continue;
    }

    if (token.type === TokenType.Text) {
      if (token.value.trim()) {
        children.push({
          type: ASTNodeType.Text,
          value: token.value,
          position: token.position,
          line: token.line,
          column: token.column,
        } as TextNode);
      }
      index++;
      continue;
    }

    index++;
  }

  return {
    element: {
      type: ASTNodeType.Element,
      tag: tagName,
      attributes,
      children,
      position: tagToken.position,
      line: tagToken.line,
      column: tagToken.column,
    },
    index,
  };
}