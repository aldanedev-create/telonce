/**
 * Scope analysis - analyzes variable scope in templates
 */

import { ASTNodeType, type ASTNode, type ElementNode } from '../parser';

export interface Scope {
  variables: Set<string>;
  parent?: Scope;
}

export interface ScopeAnalysis {
  scopes: Scope[];
  variables: string[];
  references: string[];
}

/**
 * Analyze scope in an AST
 */
export function analyzeScope(ast: ASTNode[]): ScopeAnalysis {
  const scopes: Scope[] = [];
  const variables: Set<string> = new Set();
  const references: Set<string> = new Set();

  const rootScope: Scope = { variables: new Set() };
  scopes.push(rootScope);

  for (const node of ast) {
    analyzeNode(node, rootScope, variables, references);
  }

  return {
    scopes,
    variables: Array.from(variables),
    references: Array.from(references),
  };
}

/**
 * Analyze a single node
 */
function analyzeNode(
  node: ASTNode,
  scope: Scope,
  variables: Set<string>,
  references: Set<string>
): void {
  switch (node.type) {
    case ASTNodeType.For:
      analyzeFor(node as any, scope, variables, references);
      break;
    case ASTNodeType.Interpolation:
      analyzeInterpolation(node as any, references);
      break;
    case ASTNodeType.Element:
      analyzeElement(node as ElementNode, scope, variables, references);
      break;
  }
}

/**
 * Analyze a for loop
 */
function analyzeFor(
  node: any,
  scope: Scope,
  variables: Set<string>,
  references: Set<string>
): void {
  const newScope: Scope = { variables: new Set(), parent: scope };
  
  // Add item variable
  if (node.item) {
    newScope.variables.add(node.item);
    variables.add(node.item);
  }

  // Add collection reference
  if (node.collection) {
    references.add(node.collection);
  }

  for (const child of node.children) {
    analyzeNode(child, newScope, variables, references);
  }
}

/**
 * Analyze an interpolation
 */
function analyzeInterpolation(
  node: any,
  references: Set<string>
): void {
  // Extract variable names from expression
  const expr = node.value || '';
  const matches = expr.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g) || [];
  for (const match of matches) {
    if (!['true', 'false', 'null', 'undefined'].includes(match)) {
      references.add(match);
    }
  }
}

/**
 * Analyze an element
 */
function analyzeElement(
  node: ElementNode,
  scope: Scope,
  variables: Set<string>,
  references: Set<string>
): void {
  // Check attributes for references
  for (const [name, value] of Object.entries(node.attributes)) {
    // Event handlers
    if (name.startsWith('@') && value) {
      const matches = value.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g) || [];
      for (const match of matches) {
        references.add(match);
      }
    }
    // Bindings
    if (name.startsWith(':') && value) {
      const matches = value.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g) || [];
      for (const match of matches) {
        references.add(match);
      }
    }
  }

  for (const child of node.children) {
    analyzeNode(child, scope, variables, references);
  }
}