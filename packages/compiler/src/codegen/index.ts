/**
 * Code Generator - generates JavaScript from the AST
 * 
 * This module converts the optimized AST into executable JavaScript code.
 */

import { ASTNodeType, type ASTNode, type ElementNode } from '../parser';
import { PatchFlag } from '../optimizer';

export interface GenerateOptions {
  /**
   * Minify output
   */
  minify?: boolean;

  /**
   * Target platform
   */
  target?: 'browser' | 'node' | 'esm';

  /**
   * Development mode
   */
  dev?: boolean;

  /**
   * Include comments
   */
  comments?: boolean;

  /**
   * Output format
   */
  format?: 'iife' | 'esm' | 'cjs';
}

export interface GenerateResult {
  code: string;
  map?: string;
  imports: string[];
  exports: string[];
}

/**
 * Generate JavaScript code from the AST
 */
export function generate(
  ast: ASTNode[],
  options: GenerateOptions = {}
): GenerateResult {
  const imports: string[] = [];
  const exports: string[] = [];
  let code = '';

  const { target = 'browser', dev = false, minify = false } = options;

  // Add imports
  if (target === 'browser') {
    code += `// Teloce generated code\n\n`;
  }

  // Generate the code
  for (const node of ast) {
    code += generateNode(node, { options, imports, exports, indent: 0 });
  }

  // Wrap in IIFE if needed
  if (options.format === 'iife') {
    code = `(function() {\n${code}\n})();`;
  }

  return {
    code,
    imports,
    exports,
  };
}

/**
 * Generate code for a single node
 */
function generateNode(
  node: ASTNode,
  context: {
    options: GenerateOptions;
    imports: string[];
    exports: string[];
    indent: number;
  }
): string {
  const indent = '  '.repeat(context.indent);

  switch (node.type) {
    case ASTNodeType.Element:
      return generateElement(node as ElementNode, context);
    case ASTNodeType.Text:
      return generateText(node as any, context);
    case ASTNodeType.Interpolation:
      return generateInterpolation(node as any, context);
    case ASTNodeType.For:
      return generateFor(node as any, context);
    case ASTNodeType.If:
      return generateIf(node as any, context);
    default:
      return '';
  }
}

/**
 * Generate code for an element
 */
function generateElement(
  node: ElementNode,
  context: {
    options: GenerateOptions;
    imports: string[];
    exports: string[];
    indent: number;
  }
): string {
  const { options, indent } = context;
  const ind = '  '.repeat(indent);
  const tag = node.tag;
  const children = node.children.map(child =>
    generateNode(child, { ...context, indent: indent + 1 })
  ).join('\n');

  // Check for self-closing tags
  const isVoid = ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tag);

  if (isVoid) {
    return `${ind}createElement('${tag}', ${generateAttributes(node.attributes)})`;
  }

  return `${ind}createElement('${tag}', ${generateAttributes(node.attributes)},\n${children}\n${ind})`;
}

/**
 * Generate code for text
 */
function generateText(
  node: any,
  context: {
    options: GenerateOptions;
    imports: string[];
    exports: string[];
    indent: number;
  }
): string {
  const { options, indent } = context;
  const ind = '  '.repeat(indent);

  if (node.folded) {
    return `${ind}createText('${node.foldedValue}')`;
  }

  return `${ind}createText('${node.value.trim()}')`;
}

/**
 * Generate code for interpolation
 */
function generateInterpolation(
  node: any,
  context: {
    options: GenerateOptions;
    imports: string[];
    exports: string[];
    indent: number;
  }
): string {
  const { options, indent } = context;
  const ind = '  '.repeat(indent);

  // For dev mode, add debugging
  if (options.dev) {
    return `${ind}createText(() => ${node.value}, { debug: true })`;
  }

  return `${ind}createText(() => ${node.value})`;
}

/**
 * Generate code for for loop
 */
function generateFor(
  node: any,
  context: {
    options: GenerateOptions;
    imports: string[];
    exports: string[];
    indent: number;
  }
): string {
  const { options, indent } = context;
  const ind = '  '.repeat(indent);
  const item = node.item;
  const collection = node.collection;
  const key = node.key || 'index';

  const children = node.children.map((child: ASTNode) =>
    generateNode(child, { ...context, indent: indent + 1 })
  ).join('\n');

  const keyed = node.key ? `, key: '${node.key}'` : '';

  return `${ind}createFor('${collection}', (${item}, index) => {\n${children}\n${ind})${keyed}`;
}

/**
 * Generate code for if statement
 */
function generateIf(
  node: any,
  context: {
    options: GenerateOptions;
    imports: string[];
    exports: string[];
    indent: number;
  }
): string {
  const { options, indent } = context;
  const ind = '  '.repeat(indent);

  const children = node.children.map((child: ASTNode) =>
    generateNode(child, { ...context, indent: indent + 1 })
  ).join('\n');

  const elseChildren = node.elseChildren?.map((child: ASTNode) =>
    generateNode(child, { ...context, indent: indent + 1 })
  ).join('\n');

  if (elseChildren) {
    return `${ind}createIf(() => ${node.condition},\n${children}\n${ind}, () => {\n${elseChildren}\n${ind})`;
  }

  return `${ind}createIf(() => ${node.condition},\n${children}\n${ind})`;
}

/**
 * Generate attributes
 */
function generateAttributes(attributes: Record<string, string>): string {
  const attrs = Object.entries(attributes)
    .map(([key, value]) => {
      // Handle event bindings (@click)
      if (key.startsWith('@')) {
        const event = key.slice(1);
        return `on${event.charAt(0).toUpperCase() + event.slice(1)}: ${value}`;
      }
      // Handle property bindings (:model)
      if (key.startsWith(':')) {
        const prop = key.slice(1);
        return `${prop}: ${value}`;
      }
      // Handle regular attributes
      return `${key}: '${value}'`;
    })
    .join(', ');

  return `{ ${attrs} }`;
}