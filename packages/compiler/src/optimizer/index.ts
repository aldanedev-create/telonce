/**
 * Optimizer - optimizes the AST for performance
 */

import { ASTNodeType, type ASTNode, type ElementNode } from '../parser';

export { PatchFlag } from '../types';

export interface OptimizeOptions {
  staticHoisting?: boolean;
  patchFlags?: boolean;
  treeShaking?: boolean;
}

export interface OptimizeResult {
  ast: ASTNode[];
  flags: Record<string, number>;
  stats: {
    staticNodes: number;
    dynamicNodes: number;
    hoistedNodes: number;
  };
}

/**
 * Optimize the AST
 */
export function optimize(
  ast: ASTNode[],
  options: OptimizeOptions = {}
): OptimizeResult {
  const flags: Record<string, number> = {};
  let staticNodes = 0;
  let dynamicNodes = 0;
  let hoistedNodes = 0;

  const optimized = ast.map(node => {
    const result = optimizeNode(node, {
      options,
      flags,
      stats: { staticNodes, dynamicNodes, hoistedNodes },
      depth: 0,
    });
    staticNodes = result.stats.staticNodes;
    dynamicNodes = result.stats.dynamicNodes;
    hoistedNodes = result.stats.hoistedNodes;
    return result.node;
  });

  return {
    ast: optimized,
    flags,
    stats: {
      staticNodes,
      dynamicNodes,
      hoistedNodes,
    },
  };
}

/**
 * Optimize a single node
 */
function optimizeNode(
  node: ASTNode,
  context: {
    options: OptimizeOptions;
    flags: Record<string, number>;
    stats: {
      staticNodes: number;
      dynamicNodes: number;
      hoistedNodes: number;
    };
    depth: number;
  }
): { node: ASTNode; stats: typeof context.stats } {
  switch (node.type) {
    case ASTNodeType.Element:
      return optimizeElement(node as ElementNode, context);
    case ASTNodeType.For:
      return optimizeFor(node as any, context);
    case ASTNodeType.If:
      return optimizeIf(node as any, context);
    default:
      return { node, stats: context.stats };
  }
}

/**
 * Optimize an element
 */
function optimizeElement(
  node: ElementNode,
  context: {
    options: OptimizeOptions;
    flags: Record<string, number>;
    stats: {
      staticNodes: number;
      dynamicNodes: number;
      hoistedNodes: number;
    };
    depth: number;
  }
): { node: ElementNode; stats: typeof context.stats } {
  const stats = { ...context.stats };
  let isStatic = true;

  // Check for dynamic attributes
  for (const [name] of Object.entries(node.attributes)) {
    if (name.startsWith('@') || name.startsWith(':')) {
      isStatic = false;
      stats.dynamicNodes++;
      // Set patch flag
      if (name.startsWith('@')) {
        context.flags[`${node.tag}-${name}`] = 1; // EVENT flag
      } else if (name.startsWith(':')) {
        context.flags[`${node.tag}-${name}`] = 2; // PROP flag
      }
    }
  }

  // Optimize children
  const optimizedChildren = node.children.map(child => {
    const result = optimizeNode(child, {
      ...context,
      depth: context.depth + 1,
      stats,
    });
    stats.staticNodes = result.stats.staticNodes;
    stats.dynamicNodes = result.stats.dynamicNodes;
    stats.hoistedNodes = result.stats.hoistedNodes;
    return result.node;
  });

  // Hoist static elements
  if (isStatic && context.options.staticHoisting && context.depth === 0) {
    stats.hoistedNodes++;
  }

  if (isStatic) {
    stats.staticNodes++;
  }

  return {
    node: {
      ...node,
      children: optimizedChildren,
    },
    stats,
  };
}

/**
 * Optimize for loop
 */
function optimizeFor(
  node: any,
  context: {
    options: OptimizeOptions;
    flags: Record<string, number>;
    stats: {
      staticNodes: number;
      dynamicNodes: number;
      hoistedNodes: number;
    };
    depth: number;
  }
): { node: any; stats: typeof context.stats } {
  const stats = { ...context.stats };
  
  // For loops are always dynamic
  stats.dynamicNodes++;

  // Optimize children
  const optimizedChildren = node.children.map((child: ASTNode) => {
    const result = optimizeNode(child, {
      ...context,
      depth: context.depth + 1,
      stats,
    });
    stats.staticNodes = result.stats.staticNodes;
    stats.dynamicNodes = result.stats.dynamicNodes;
    stats.hoistedNodes = result.stats.hoistedNodes;
    return result.node;
  });

  return {
    node: {
      ...node,
      children: optimizedChildren,
    },
    stats,
  };
}

/**
 * Optimize if statement
 */
function optimizeIf(
  node: any,
  context: {
    options: OptimizeOptions;
    flags: Record<string, number>;
    stats: {
      staticNodes: number;
      dynamicNodes: number;
      hoistedNodes: number;
    };
    depth: number;
  }
): { node: any; stats: typeof context.stats } {
  const stats = { ...context.stats };
  
  // If statements are dynamic
  stats.dynamicNodes++;

  // Optimize children
  const optimizedChildren = node.children.map((child: ASTNode) => {
    const result = optimizeNode(child, {
      ...context,
      depth: context.depth + 1,
      stats,
    });
    stats.staticNodes = result.stats.staticNodes;
    stats.dynamicNodes = result.stats.dynamicNodes;
    stats.hoistedNodes = result.stats.hoistedNodes;
    return result.node;
  });

  const optimizedElse = node.elseChildren?.map((child: ASTNode) => {
    const result = optimizeNode(child, {
      ...context,
      depth: context.depth + 1,
      stats,
    });
    stats.staticNodes = result.stats.staticNodes;
    stats.dynamicNodes = result.stats.dynamicNodes;
    stats.hoistedNodes = result.stats.hoistedNodes;
    return result.node;
  });

  return {
    node: {
      ...node,
      children: optimizedChildren,
      elseChildren: optimizedElse,
    },
    stats,
  };
}