/**
 * Expression parser - parses {{ mustache }} expressions
 */

import { TokenType, type Token } from '../../lexer';
import { ASTNodeType, type InterpolationNode } from '../ast';

/**
 * Parse expressions
 */
export function parseExpression(tokens: Token[]): InterpolationNode[] {
  const expressions: InterpolationNode[] = [];

  for (const token of tokens) {
    if (token.type === TokenType.Interpolation) {
      expressions.push({
        type: ASTNodeType.Interpolation,
        value: token.value,
        position: token.position,
        line: token.line,
        column: token.column,
      });
    }
  }

  return expressions;
}

/**
 * Parse a single expression
 */
export function parseSingleExpression(value: string): {
  type: 'identifier' | 'member' | 'call' | 'binary' | 'literal';
  value: string;
  children?: any[];
} {
  // Simple expression parsing
  const trimmed = value.trim();
  
  // Check for literals
  if (/^["'].*["']$/.test(trimmed)) {
    return { type: 'literal', value: trimmed.slice(1, -1) };
  }
  if (/^\d+$/.test(trimmed)) {
    return { type: 'literal', value: Number(trimmed) };
  }

  // Check for member access (foo.bar)
  if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    return {
      type: 'member',
      value: parts[0],
      children: parts.slice(1).map(p => ({ type: 'identifier', value: p })),
    };
  }

  // Check for function call
  if (trimmed.includes('(')) {
    const match = trimmed.match(/^(\w+)\(\)$/);
    if (match) {
      return { type: 'call', value: match[1] };
    }
  }

  // Check for binary operators
  for (const op of ['+', '-', '*', '/', '===', '!==', '==', '!=', '>', '<', '>=', '<=']) {
    if (trimmed.includes(op)) {
      const [left, right] = trimmed.split(op).map(s => s.trim());
      return {
        type: 'binary',
        value: op,
        children: [
          { type: 'identifier', value: left },
          { type: 'identifier', value: right },
        ],
      };
    }
  }

  // Default: identifier
  return { type: 'identifier', value: trimmed };
}