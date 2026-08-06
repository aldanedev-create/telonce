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
 * Helper to safely split strings respecting string quotes and parentheses
 */
function splitTopLevel(str: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let parens = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (char === '(') parens++;
      else if (char === ')') parens--;
      else if (char === delimiter && parens === 0) {
        result.push(current.trim());
        current = '';
        continue;
      }
    }
    current += char;
  }
  result.push(current.trim());
  return result.filter(Boolean);
}

/**
 * Helper to find the last occurrence of an operator respecting quotes and parens.
 * Returns the index for left-associative tree construction.
 */
function findLastOperatorIndex(str: string, op: string): number {
  let inSingle = false;
  let inDouble = false;
  let parens = 0;
  let lastIdx = -1;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (char === '(') parens++;
      else if (char === ')') parens--;
      else if (parens === 0) {
        let match = true;
        for (let j = 0; j < op.length; j++) {
          if (str[i + j] !== op[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          const nextChar = str[i + op.length];
          // Prevent matching partial operators like '=' inside '==' or '==='
          const isPartial = 
            (op === '==' && nextChar === '=') ||
            (op === '!=' && nextChar === '=') ||
            ((op === '<' || op === '>') && nextChar === '=');
            
          if (!isPartial) {
            lastIdx = i;
            i += op.length - 1;
          }
        }
      }
    }
  }
  return lastIdx;
}

/**
 * Helper to check if a string is perfectly wrapped in quotes (avoids false positive on "a" + "b")
 */
function isStringLiteral(str: string): boolean {
  if (str.length < 2) return false;
  const quote = str[0];
  if (quote !== "'" && quote !== '"') return false;
  if (str[str.length - 1] !== quote) return false;
  
  for (let i = 1; i < str.length - 1; i++) {
    if (str[i] === '\\') i++; // skip escaped char
    else if (str[i] === quote) return false; // prematurely unescaped quote inside string
  }
  return true;
}

/**
 * Parse a single expression recursively
 */
export function parseSingleExpression(value: string): {
  type: 'identifier' | 'member' | 'call' | 'binary' | 'literal';
  value: string;
  children?: any[];
} {
  const trimmed = value.trim();
  if (!trimmed) return { type: 'identifier', value: '' };

  // Unwrap full parentheses block safely: e.g. "(a + b)" -> "a + b"
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    let p = 0;
    let valid = true;
    for (let i = 0; i < trimmed.length - 1; i++) {
      if (trimmed[i] === '(') p++;
      else if (trimmed[i] === ')') p--;
      if (p === 0) { valid = false; break; }
    }
    if (valid) return parseSingleExpression(trimmed.slice(1, -1));
  }
  
  // 1. Check for literals (Strings & Numbers)
  if (isStringLiteral(trimmed)) {
    return { type: 'literal', value: trimmed.slice(1, -1) };
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { type: 'literal', value: trimmed };
  }

  // 2. Check for binary operators (Ordered explicitly from lowest to highest precedence)
  const ops = [
    '===', '!==', '==', '!=', 
    '>=', '<=', '>', '<', 
    '+', '-', 
    '*', '/'
  ];
  
  for (const op of ops) {
    const opIdx = findLastOperatorIndex(trimmed, op);
    if (opIdx > 0) {
      const left = trimmed.slice(0, opIdx).trim();
      const right = trimmed.slice(opIdx + op.length).trim();
      
      if (left && right) {
        return {
          type: 'binary',
          value: op,
          children: [
            parseSingleExpression(left),
            parseSingleExpression(right),
          ],
        };
      }
    }
  }

  // 3. Check for function call
  if (trimmed.endsWith(')')) {
    const match = trimmed.match(/^([\w.]+)\((.*)\)$/);
    if (match) {
      const argsStr = match[2];
      const args = argsStr.trim() ? splitTopLevel(argsStr, ',').map(parseSingleExpression) : [];
      return { 
        type: 'call', 
        value: match[1], 
        children: args 
      };
    }
  }

  // 4. Check for member access (foo.bar)
  if (trimmed.includes('.')) {
    const parts = splitTopLevel(trimmed, '.');
    if (parts.length > 1) {
      return {
        type: 'member',
        value: parts[0],
        children: parts.slice(1).map(p => ({ type: 'identifier', value: p })),
      };
    }
  }

  // 5. Default: identifier
  return { type: 'identifier', value: trimmed };
}