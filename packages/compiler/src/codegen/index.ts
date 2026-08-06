/**
 * Code Generator - generates JavaScript from the AST
 * 
 * This module converts the optimized AST into executable JavaScript code.
 */

import { ASTNodeType, type ASTNode, type ElementNode } from '../parser';

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
 * Escapes characters that would break JS single-quoted string literals.
 */
function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
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

  const { target = 'browser' } = options;

  // Add imports
  if (target === 'browser') {
    code += `// Teloce generated code\n\n`;
  }

  // Generate the code
  // Top level nodes are separated by commas if this is meant to be a single render return, 
  // or just statement-level. We'll join them safely.
  const children = ast.map(node => 
    generateNode(node, { options, imports, exports, indent: 1 })
  ).join(',\n');
  
  code += children;

  // Wrap in IIFE if needed
  if (options.format === 'iife') {
    code = `(function() {\n  return [\n${code}\n  ];\n})();`;
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
  const { indent } = context;
  const ind = '  '.repeat(indent);
  const tag = node.tag;
  
  // Joined by ',\n' instead of '\n' to form valid comma-separated arguments
  const children = node.children.map(child =>
    generateNode(child, { ...context, indent: indent + 1 })
  ).join(',\n');

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
  const { indent } = context;
  const ind = '  '.repeat(indent);

  // Escape strings to prevent literal breakout and injection
  if (node.folded) {
    return `${ind}createText('${escapeString(node.foldedValue)}')`;
  }

  return `${ind}createText('${escapeString(node.value.trim())}')`;
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
  const { indent } = context;
  const ind = '  '.repeat(indent);
  const item = node.item;
  const collection = node.collection;

  // Joined children properly with commas
  const children = node.children.map((child: ASTNode) =>
    generateNode(child, { ...context, indent: indent + 1 })
  ).join(',\n');

  // Syntactically correct options object for key
  const keyed = node.key ? `, { key: '${escapeString(node.key)}' }` : '';

  // Removed quotes around ${collection} to pass it as a reference, not a literal string.
  // Returns an array `[...]` to enclose multiple children properly without missing braces.
  return `${ind}createFor(${collection}, (${item}, index) => [\n${children}\n${ind}]${keyed})`;
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
  const { indent } = context;
  const ind = '  '.repeat(indent);

  // Joined children properly with commas
  const children = node.children.map((child: ASTNode) =>
    generateNode(child, { ...context, indent: indent + 1 })
  ).join(',\n');

  const elseChildren = node.elseChildren?.map((child: ASTNode) =>
    generateNode(child, { ...context, indent: indent + 1 })
  ).join(',\n');

  // Wrapped both branches in `() => [...]` to enforce lazy evaluation and correct syntax.
  if (elseChildren) {
    return `${ind}createIf(() => ${node.condition}, () => [\n${children}\n${ind}], () => [\n${elseChildren}\n${ind}])`;
  }

  return `${ind}createIf(() => ${node.condition}, () => [\n${children}\n${ind}])`;
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
      // Handle regular attributes safely by escaping strings
      return `${key}: '${escapeString(value)}'`;
    })
    .join(', ');

  return `{ ${attrs} }`;
}