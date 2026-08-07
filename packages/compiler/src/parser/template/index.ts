/**
 * Template parser - parses Teloce directives (<for>, <if>, etc.)
 */

import { TokenType, type Token } from '../../lexer';
import { ASTNodeType, type ASTNode, type ForNode, type IfNode, type ElementNode } from '../ast';

/**
 * Parse template directives and nodes
 */
export function parseTemplate(tokens: Token[]): ASTNode[] {
  const { children } = parseBlock(tokens, 0, null);
  return children;
}

/**
 * Helper to parse nodes within a block until a specific closing tag is met
 */
function parseBlock(
  tokens: Token[],
  start: number,
  closingTag: string | null
): { children: ASTNode[]; index: number } {
  const children: ASTNode[] = [];
  let index = start;

  while (index < tokens.length) {
    const token = tokens[index];

    if (token.type === TokenType.EOF) {
      break;
    }

    // Check for matching closing tag
    if (token.type === TokenType.CloseTag && closingTag && token.value === closingTag) {
      index++; // Consume the closing tag
      break;
    }

    if (token.type === TokenType.For || (token.type === TokenType.OpenTag && token.value === 'for')) {
      const result = parseFor(tokens, index);
      children.push(result.node);
      index = result.index;
    } else if (token.type === TokenType.If || (token.type === TokenType.OpenTag && token.value === 'if')) {
      const result = parseIf(tokens, index);
      children.push(result.node);
      index = result.index;
    } else if (token.type === TokenType.OpenTag) {
      const result = parseElement(tokens, index);
      children.push(result.node);
      index = result.index;
    } else if (token.type === TokenType.Text) {
      children.push({
        type: ASTNodeType.Text,
        value: token.value,
        position: token.position,
        line: token.line,
        column: token.column,
      });
      index++;
    } else if (token.type === TokenType.Interpolation) {
      children.push({
        type: ASTNodeType.Interpolation,
        value: token.value,
        position: token.position,
        line: token.line,
        column: token.column,
      });
      index++;
    } else {
      index++;
    }
  }

  return { children, index };
}

/**
 * Parse a for loop directive
 */
function parseFor(
  tokens: Token[],
  start: number
): { node: ForNode; index: number } {
  let index = start;
  const token = tokens[index];
  
  let item = '';
  let collection = '';
  let key = '';

  index++; // Move past the opening tag/directive token

  // Extract attributes (item, collection/in, key)
  while (index < tokens.length) {
    const t = tokens[index];
    if (t.type === TokenType.Attribute) {
      const attrName = t.value;
      const nextToken = tokens[index + 1];
      if (nextToken && nextToken.type === TokenType.AttributeValue) {
        const value = nextToken.value;
        if (attrName === 'item') item = value;
        else if (attrName === 'in' || attrName === 'collection') collection = value;
        else if (attrName === 'key') key = value;
        index += 2;
      } else {
        index++;
      }
    } else {
      break;
    }
  }

  // Parse children recursively until closing </for>
  const parsedBlock = parseBlock(tokens, index, 'for');

  return {
    node: {
      type: ASTNodeType.For,
      item,
      collection,
      key,
      children: parsedBlock.children,
      position: token.position,
      line: token.line,
      column: token.column,
    },
    index: parsedBlock.index,
  };
}

/**
 * Parse an if directive
 */
function parseIf(
  tokens: Token[],
  start: number
): { node: IfNode; index: number } {
  let index = start;
  const token = tokens[index];
  
  let condition = '';

  index++; // Move past opening tag/directive token

  // Extract condition
  while (index < tokens.length) {
    const t = tokens[index];
    if (t.type === TokenType.Attribute) {
      const attrName = t.value;
      const nextToken = tokens[index + 1];
      if (nextToken && nextToken.type === TokenType.AttributeValue) {
        if (attrName === 'condition' || attrName === 'test') {
          condition = nextToken.value;
        }
        index += 2;
      } else {
        index++;
      }
    } else {
      break;
    }
  }

  // Parse children recursively until closing </if>
  const parsedBlock = parseBlock(tokens, index, 'if');

  return {
    node: {
      type: ASTNodeType.If,
      condition,
      children: parsedBlock.children,
      position: token.position,
      line: token.line,
      column: token.column,
    },
    index: parsedBlock.index,
  };
}

/**
 * Parse standard element nodes
 */
function parseElement(
  tokens: Token[],
  start: number
): { node: ElementNode; index: number } {
  let index = start;
  const token = tokens[index];
  const tagName = token.value;

  index++;
  const attributes: Record<string, string> = {};

  while (index < tokens.length) {
    const t = tokens[index];
    if (t.type === TokenType.Attribute) {
      const attrName = t.value;
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

  if (token.type === TokenType.SelfCloseTag) {
    return {
      node: {
        type: ASTNodeType.Element,
        tag: tagName,
        attributes,
        children: [],
        position: token.position,
        line: token.line,
        column: token.column,
      },
      index: index,
    };
  }

  const parsedBlock = parseBlock(tokens, index, tagName);

  return {
    node: {
      type: ASTNodeType.Element,
      tag: tagName,
      attributes,
      children: parsedBlock.children,
      position: token.position,
      line: token.line,
      column: token.column,
    },
    index: parsedBlock.index,
  };
}