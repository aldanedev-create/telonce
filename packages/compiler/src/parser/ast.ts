/**
 * Abstract Syntax Tree (AST) node definitions
 */

export enum ASTNodeType {
  Element = 'Element',
  Text = 'Text',
  Interpolation = 'Interpolation',
  For = 'For',
  If = 'If',
  Else = 'Else',
  Show = 'Show',
  Hide = 'Hide',
  Component = 'Component',
  Slot = 'Slot',
  Fragment = 'Fragment',
}

/**
 * Base AST node
 */
export interface ASTNode {
  type: ASTNodeType;
  position: number;
  line: number;
  column: number;
}

/**
 * Element node
 */
export interface ElementNode extends ASTNode {
  type: ASTNodeType.Element;
  tag: string;
  attributes: Record<string, string>;
  children: ASTNode[];
}

/**
 * Text node
 */
export interface TextNode extends ASTNode {
  type: ASTNodeType.Text;
  value: string;
}

/**
 * Interpolation node ({{ }})
 */
export interface InterpolationNode extends ASTNode {
  type: ASTNodeType.Interpolation;
  value: string;
}

/**
 * For loop node
 */
export interface ForNode extends ASTNode {
  type: ASTNodeType.For;
  item: string;
  collection: string;
  key?: string;
  children: ASTNode[];
}

/**
 * If condition node
 */
export interface IfNode extends ASTNode {
  type: ASTNodeType.If;
  condition: string;
  children: ASTNode[];
  elseChildren?: ASTNode[];
}

/**
 * Show/Hide node
 */
export interface ShowHideNode extends ASTNode {
  type: ASTNodeType.Show | ASTNodeType.Hide;
  condition: string;
  children: ASTNode[];
}

/**
 * Directive node
 */
export interface DirectiveNode extends ASTNode {
  type: ASTNodeType.Element;
  tag: string;
  attributes: Record<string, string>;
  children: ASTNode[];
  isDirective: true;
  directiveType: 'for' | 'if' | 'show' | 'hide';
}