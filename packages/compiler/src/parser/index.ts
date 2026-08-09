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
  type ShowHideNode,
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
  type ShowHideNode,
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

    if (token.type === TokenType.OpenTag || token.type === TokenType.SelfCloseTag) {
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
): { node: ASTNode; index: number } {
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
      node: buildNode(tagName, attributes, children, [], tagToken),
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

    if (token.type === TokenType.OpenTag || token.type === TokenType.SelfCloseTag) {
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

  // Split out a top-level <else> child (for <if>...<else>...</if>) before
  // building the final node, so buildNode() can hand it to IfNode as
  // elseChildren rather than leaving it as a nonsensical regular child.
  const elseIndex = children.findIndex(
    child => child.type === ASTNodeType.Element && (child as ElementNode).tag === 'else'
  );
  let realChildren = children;
  let elseChildren: ASTNode[] | undefined;
  if (elseIndex !== -1) {
    realChildren = children.slice(0, elseIndex);
    elseChildren = (children[elseIndex] as ElementNode).children;
  }

  return {
    node: buildNode(tagName, attributes, realChildren, elseChildren, tagToken),
    index,
  };
}

/**
 * Turn a parsed tag name + attributes into the right AST node type.
 * <for>/<if>/<show>/<hide> get their dedicated node shapes (as defined in
 * ./ast) instead of being treated as generic elements - previously every
 * tag, directive or not, produced a plain ElementNode, so `condition`,
 * `collection`/`item`/`key`, etc. were silently lost.
 */
function buildNode(
  tagName: string,
  attributes: Record<string, string>,
  children: ASTNode[],
  elseChildren: ASTNode[] | undefined,
  tagToken: Token
): ASTNode {
  const base = {
    position: tagToken.position,
    line: tagToken.line,
    column: tagToken.column,
  };

  if (tagName === 'for') {
    return {
      ...base,
      type: ASTNodeType.For,
      item: attributes.item ?? 'item',
      collection: attributes.in ?? '',
      key: attributes.key,
      children,
    } as ForNode;
  }

  if (tagName === 'if') {
    return {
      ...base,
      type: ASTNodeType.If,
      condition: attributes.condition ?? '',
      children,
      elseChildren,
    } as IfNode;
  }

  if (tagName === 'show' || tagName === 'hide') {
    return {
      ...base,
      type: tagName === 'show' ? ASTNodeType.Show : ASTNodeType.Hide,
      condition: attributes.condition ?? '',
      children,
    } as ShowHideNode;
  }

  return {
    ...base,
    type: ASTNodeType.Element,
    tag: tagName,
    attributes,
    children,
  } as ElementNode;
}
