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
  let brackets = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (char === '(') parens++;
      else if (char === ')') parens--;
      else if (char === '[') brackets++;
      else if (char === ']') brackets--;
      else if (char === delimiter && parens === 0 && brackets === 0) {
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
  let brackets = 0;
  let lastIdx = -1;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (char === '(') parens++;
      else if (char === ')') parens--;
      else if (char === '[') brackets++;
      else if (char === ']') brackets--;
      else if (parens === 0 && brackets === 0) {
        let match = true;
        for (let j = 0; j < op.length; j++) {
          if (str[i + j] !== op[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          const nextChar = str[i + op.length];
          const isPartial = 
            (op === '==' && (nextChar === '=' || nextChar === '>')) ||
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
 * Helper to find the top-level ternary operator index (? and matching :)
 */
function findTernaryIndex(str: string): { qIdx: number; cIdx: number } | null {
  let inSingle = false;
  let inDouble = false;
  let parens = 0;
  let brackets = 0;
  let qIdx = -1;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (char === '(') parens++;
      else if (char === ')') parens--;
      else if (char === '[') brackets++;
      else if (char === ']') brackets--;
      else if (parens === 0 && brackets === 0 && char === '?') {
        qIdx = i;
        break;
      }
    }
  }

  if (qIdx === -1) return null;

  let colonIdx = -1;
  let ternaryDepth = 0;
  for (let i = qIdx + 1; i < str.length; i++) {
    const char = str[i];
    if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (char === '(') parens++;
      else if (char === ')') parens--;
      else if (char === '[') brackets++;
      else if (char === ']') brackets--;
      else if (parens === 0 && brackets === 0) {
        if (char === '?') ternaryDepth++;
        else if (char === ':') {
          if (ternaryDepth === 0) {
            colonIdx = i;
            break;
          } else {
            ternaryDepth--;
          }
        }
      }
    }
  }

  return colonIdx !== -1 ? { qIdx, cIdx: colonIdx } : null;
}

/**
 * Helper to check if a string is perfectly wrapped in quotes
 */
function isStringLiteral(str: string): boolean {
  if (str.length < 2) return false;
  const quote = str[0];
  if (quote !== "'" && quote !== '"') return false;
  if (str[str.length - 1] !== quote) return false;
  
  for (let i = 1; i < str.length - 1; i++) {
    if (str[i] === '\\') i++;
    else if (str[i] === quote) return false;
  }
  return true;
}

/**
 * Parse a single expression recursively with full operator precedence
 */
export function parseSingleExpression(value: string): {
  type: 'identifier' | 'member' | 'call' | 'binary' | 'literal' | 'ternary' | 'unary';
  value: string;
  children?: any[];
} {
  const trimmed = value.trim();
  if (!trimmed) return { type: 'identifier', value: '' };

  // 1. Unwrap full parentheses block safely: e.g. "(a + b)" -> "a + b"
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

  // 2. Check for Ternary Operator (? :)
  const ternary = findTernaryIndex(trimmed);
  if (ternary) {
    const condition = trimmed.slice(0, ternary.qIdx).trim();
    const consequent = trimmed.slice(ternary.qIdx + 1, ternary.cIdx).trim();
    const alternate = trimmed.slice(ternary.cIdx + 1).trim();
    return {
      type: 'ternary',
      value: '?',
      children: [
        parseSingleExpression(condition),
        parseSingleExpression(consequent),
        parseSingleExpression(alternate),
      ],
    };
  }

  // 3. Check for Binary / Logical Operators (Lowest to Highest Precedence)
  const operatorGroups = [
    ['||'],
    ['&&'],
    ['===', '!==', '==', '!='],
    ['>=', '<=', '>', '<'],
    ['+', '-'],
    ['*', '/']
  ];

  for (const group of operatorGroups) {
    for (const op of group) {
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
  }

  // 4. Check for Unary Operators (!, -)
  if (trimmed.startsWith('!') || (trimmed.startsWith('-') && !/^\d/.test(trimmed))) {
    const op = trimmed[0];
    const arg = trimmed.slice(1).trim();
    return {
      type: 'unary',
      value: op,
      children: [parseSingleExpression(arg)],
    };
  }

  // 5. Check for Function Call: e.g. foo(arg1, arg2)
  if (trimmed.endsWith(')')) {
    let parens = 0;
    let callOpenIdx = -1;
    for (let i = trimmed.length - 1; i >= 0; i--) {
      if (trimmed[i] === ')') parens++;
      else if (trimmed[i] === '(') parens--;
      if (parens === 0) {
        callOpenIdx = i;
        break;
      }
    }
    if (callOpenIdx > 0) {
      const callee = trimmed.slice(0, callOpenIdx).trim();
      const argsStr = trimmed.slice(callOpenIdx + 1, -1);
      const args = argsStr.trim() ? splitTopLevel(argsStr, ',').map(parseSingleExpression) : [];
      return {
        type: 'call',
        value: callee,
        children: [parseSingleExpression(callee), ...args],
      };
    }
  }

  // 6. Check for Member Access (dot notation: foo.bar)
  let lastDotIdx = -1;
  let inSingle = false;
  let inDouble = false;
  let pCount = 0;
  let bCount = 0;
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (char === '(') pCount++;
      else if (char === ')') pCount--;
      else if (char === '[') bCount++;
      else if (char === ']') bCount--;
      else if (pCount === 0 && bCount === 0 && char === '.') {
        lastDotIdx = i;
      }
    }
  }

  if (lastDotIdx > 0) {
    const left = trimmed.slice(0, lastDotIdx).trim();
    const right = trimmed.slice(lastDotIdx + 1).trim();
    if (left && right) {
      return {
        type: 'member',
        value: '.',
        children: [
          parseSingleExpression(left),
          { type: 'identifier', value: right },
        ],
      };
    }
  }

  // 7. Check for Literals (Strings, Decimals/Negative Numbers, Booleans, Null/Undefined)
  if (isStringLiteral(trimmed)) {
    return { type: 'literal', value: trimmed.slice(1, -1) };
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { type: 'literal', value: trimmed };
  }
  if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null' || trimmed === 'undefined') {
    return { type: 'literal', value: trimmed };
  }

  // 8. Default: Identifier
  return { type: 'identifier', value: trimmed };
}