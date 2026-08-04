/**
 * Template parser - parses Teloce directives (<for>, <if>, etc.)
 */

import { TokenType, type Token } from '../../lexer';
import { ASTNodeType, type ASTNode, type ForNode, type IfNode } from '../ast';

/**
 * Parse template directives
 */
export function parseTemplate(tokens: Token[]): ASTNode[] {
  const nodes: ASTNode[] = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];
    
    if (token.type === TokenType.For) {
      const result = parseFor(tokens, index);
      nodes.push(result.node);
      index = result.index;
    } else if (token.type === TokenType.If) {
      const result = parseIf(tokens, index);
      nodes.push(result.node);
      index = result.index;
    } else {
      index++;
    }
  }

  return nodes;
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
  
  // Extract attributes (item, collection, key)
  let item = '';
  let collection = '';
  let key = '';

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

  // Parse children
  const children: ASTNode[] = [];
  // ... parse children until closing </for>

  return {
    node: {
      type: ASTNodeType.For,
      item,
      collection,
      key,
      children,
      position: token.position,
      line: token.line,
      column: token.column,
    },
    index,
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
  
  // Extract condition
  let condition = '';

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

  // Parse children
  const children: ASTNode[] = [];
  // ... parse children until closing </if>

  return {
    node: {
      type: ASTNodeType.If,
      condition,
      children,
      position: token.position,
      line: token.line,
      column: token.column,
    },
    index,
  };
}