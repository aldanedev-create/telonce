/**
 * Transformer - transforms the AST for optimization
 */

import { ASTNodeType, type ASTNode, type ElementNode, type TextNode } from '../parser';

export interface TransformOptions {
  hoistStatic?: boolean;
  foldConstants?: boolean;
  removeComments?: boolean;
}

export interface TransformResult {
  ast: ASTNode[];
  hoisted: ASTNode[];
  constants: Record<string, any>;
}

/**
 * Transform the AST
 */
export function transform(
  ast: ASTNode[],
  options: TransformOptions = {}
): TransformResult {
  const hoisted: ASTNode[] = [];
  const constants: Record<string, any> = {};

  const transformed = ast.map(node => 
    transformNode(node, { 
      hoisted, 
      constants, 
      options,
      depth: 0 
    })
  );

  return {
    ast: transformed,
    hoisted,
    constants,
  };
}

/**
 * Transform a single node
 */
function transformNode(
  node: ASTNode,
  context: {
    hoisted: ASTNode[];
    constants: Record<string, any>;
    options: TransformOptions;
    depth: number;
  }
): ASTNode {
  switch (node.type) {
    case ASTNodeType.Element:
      return transformElement(node as ElementNode, context);
    case ASTNodeType.Text:
      return transformText(node as TextNode, context);
    case ASTNodeType.Interpolation:
      return transformInterpolation(node as any, context);
    case ASTNodeType.For:
      return transformFor(node as any, context);
    case ASTNodeType.If:
      return transformIf(node as any, context);
    default:
      return node;
  }
}

/**
 * Transform an element
 */
function transformElement(
  node: ElementNode,
  context: {
    hoisted: ASTNode[];
    constants: Record<string, any>;
    options: TransformOptions;
    depth: number;
  }
): ElementNode {
  // Hoist static elements
  if (context.options.hoistStatic && isStaticElement(node)) {
    context.hoisted.push(node);
  }

  // Transform children
  const transformedChildren = node.children.map(child =>
    transformNode(child, {
      ...context,
      depth: context.depth + 1,
    })
  );

  return {
    ...node,
    children: transformedChildren,
  };
}

/**
 * Transform text
 */
function transformText(
  node: TextNode,
  context: {
    hoisted: ASTNode[];
    constants: Record<string, any>;
    options: TransformOptions;
    depth: number;
  }
): TextNode {
  // Fold constants
  if (context.options.foldConstants) {
    const trimmed = node.value.trim();
    if (trimmed && !isNaN(Number(trimmed))) {
      context.constants[node.position] = Number(trimmed);
    }
  }

  return node;
}

/**
 * Transform interpolation
 */
function transformInterpolation(
  node: any,
  context: {
    hoisted: ASTNode[];
    constants: Record<string, any>;
    options: TransformOptions;
    depth: number;
  }
): any {
  // Check if it's a constant expression
  if (context.options.foldConstants) {
    const expr = node.value.trim();
    if (/^\d+$/.test(expr) || /^["'].*["']$/.test(expr)) {
      context.constants[node.position] = JSON.parse(expr);
    }
  }

  return node;
}

/**
 * Transform for loop
 */
function transformFor(
  node: any,
  context: {
    hoisted: ASTNode[];
    constants: Record<string, any>;
    options: TransformOptions;
    depth: number;
  }
): any {
  const transformedChildren = node.children.map((child: ASTNode) =>
    transformNode(child, {
      ...context,
      depth: context.depth + 1,
    })
  );

  return {
    ...node,
    children: transformedChildren,
  };
}

/**
 * Transform if statement
 */
function transformIf(
  node: any,
  context: {
    hoisted: ASTNode[];
    constants: Record<string, any>;
    options: TransformOptions;
    depth: number;
  }
): any {
  const transformedChildren = node.children.map((child: ASTNode) =>
    transformNode(child, {
      ...context,
      depth: context.depth + 1,
    })
  );

  const transformedElse = node.elseChildren?.map((child: ASTNode) =>
    transformNode(child, {
      ...context,
      depth: context.depth + 1,
    })
  );

  return {
    ...node,
    children: transformedChildren,
    elseChildren: transformedElse,
  };
}

/**
 * Check if an element is static (no dynamic content)
 */
function isStaticElement(node: ElementNode): boolean {
  // Check for dynamic attributes
  for (const [name] of Object.entries(node.attributes)) {
    if (name.startsWith('@') || name.startsWith(':')) {
      return false;
    }
  }

  // Check for dynamic children
  for (const child of node.children) {
    if (child.type === ASTNodeType.Interpolation) {
      return false;
    }
    if (child.type === ASTNodeType.Element) {
      if (!isStaticElement(child as ElementNode)) {
        return false;
      }
    }
  }

  return true;
}