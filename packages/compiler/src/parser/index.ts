/**
 * Parser - Builds an AST from tokens
 */

import { TokenType, type Token } from '../lexer';
import { 
  ASTNodeType, 
  type ASTNode, 
  type ElementNode, 
  type TextNode, 
  type InterpolationNode, 
  type ForNode, 
  type IfNode, 
  type DirectiveNode 
} from './ast';

export { 
  ASTNodeType, 
  type ASTNode, 
  type ElementNode, 
  type TextNode, 
  type InterpolationNode, 
  type ForNode, 
  type IfNode, 
  type DirectiveNode 
};

export interface ParseOptions {
  filename?: string;
}

/**
 * Parse tokens into an AST
 */
export function parse(tokens: Token[], options: ParseOptions = {}): ASTNode[] {
  const nodes: ASTNode[] = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];
    
    if (token.type === TokenType.EOF) {
      break;
    }

    if (token.type === TokenType.OpenTag) {
      const result = parseElement(tokens, index, options);
      nodes.push(result.node);
      index = result.index;
    } else if (token.type === TokenType.Interpolation) {
      nodes.push({
        type: ASTNodeType.Interpolation,
        value: token.value,
        position: token.position,
        line: token.line,
        column: token.column,
      } as InterpolationNode);
      index++;
    } else if (token.type === TokenType.Text) {
      if (token.value.trim()) {
        nodes.push({
          type: ASTNodeType.Text,
          value: token.value,
          position: token.position,
          line: token.line,
          column: token.column,
        } as TextNode);
      }
      index++;
    } else {
      index++;
    }
  }

  return nodes;
}

/**
 * Parse an element
 */
function parseElement(
  tokens: Token[],
  start: number,
  options: ParseOptions
): { node: ElementNode; index: number } {
  let index = start;
  const tagToken = tokens[index];
  const tagName = tagToken.value;
  const attributes: Record<string, string> = {};
  const children: ASTNode[] = [];

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
    } else if (token.type === TokenType.AttributeValue) {
      index++;
    } else {
      break;
    }
  }

  // Check for self-closing or void tags
  const isVoidElement = ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName);
  let isSelfClosing = isVoidElement;

  if (tokens[index] && tokens[index].type === TokenType.SelfCloseTag) {
    isSelfClosing = true;
    index++;
  } else if (tokens[index] && tokens[index].type === TokenType.CloseTag) {
    index++;
  }

  // If self-closing, return immediately without parsing children
  if (isSelfClosing) {
    return {
      node: {
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

  // Parse children until matching closing tag
  while (index < tokens.length) {
    const token = tokens[index];
    
    if (token.type === TokenType.CloseTag) {
      if (token.value === tagName) {
        index++;
        break;
      }
      // Mismatched closing tag - consume and break to prevent infinite loops
      index++;
      break;
    }

    if (token.type === TokenType.OpenTag) {
      const child = parseElement(tokens, index, options);
      children.push(child.node);
      index = child.index;
      continue;
    }

    if (token.type === TokenType.Interpolation) {
      children.push({
        type: ASTNodeType.Interpolation,
        value: token.value,
        position: token.position,
        line: token.line,
        column: token.column,
      } as InterpolationNode);
      index++;
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
    node: {
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