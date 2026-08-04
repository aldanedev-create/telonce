/**
 * Validator - validates the AST for errors and warnings
 */

import { ASTNodeType, type ASTNode, type ElementNode } from '../parser';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate an AST
 */
export function validate(ast: ASTNode[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const node of ast) {
    validateNode(node, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a single node
 */
function validateNode(
  node: ASTNode,
  errors: string[],
  warnings: string[]
): void {
  switch (node.type) {
    case ASTNodeType.Element:
      validateElement(node as ElementNode, errors, warnings);
      break;
    case ASTNodeType.For:
      validateFor(node as any, errors, warnings);
      break;
    case ASTNodeType.If:
      validateIf(node as any, errors, warnings);
      break;
    case ASTNodeType.Interpolation:
      validateInterpolation(node as any, errors, warnings);
      break;
  }
}

/**
 * Validate an element
 */
function validateElement(
  node: ElementNode,
  errors: string[],
  warnings: string[]
): void {
  // Check for invalid attributes
  for (const [name, value] of Object.entries(node.attributes)) {
    if (name.startsWith('@') && !value) {
      warnings.push(`Event handler '@${name.slice(1)}' has no handler`);
    }
  }

  // Validate children
  for (const child of node.children) {
    validateNode(child, errors, warnings);
  }
}

/**
 * Validate a for loop
 */
function validateFor(
  node: any,
  errors: string[],
  warnings: string[]
): void {
  if (!node.item) {
    errors.push(`For loop missing 'item' attribute at line ${node.line}`);
  }
  if (!node.collection) {
    errors.push(`For loop missing 'in' attribute at line ${node.line}`);
  }
  if (!node.key) {
    warnings.push(`For loop at line ${node.line} has no 'key' attribute - performance may be affected`);
  }

  for (const child of node.children) {
    validateNode(child, errors, warnings);
  }
}

/**
 * Validate an if statement
 */
function validateIf(
  node: any,
  errors: string[],
  warnings: string[]
): void {
  if (!node.condition) {
    errors.push(`If statement missing 'condition' attribute at line ${node.line}`);
  }

  for (const child of node.children) {
    validateNode(child, errors, warnings);
  }
}

/**
 * Validate an interpolation
 */
function validateInterpolation(
  node: any,
  errors: string[],
  warnings: string[]
): void {
  if (!node.value || node.value.trim() === '') {
    errors.push(`Empty interpolation at line ${node.line}`);
  }
}