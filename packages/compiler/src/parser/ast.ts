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
 * Base AST node properties shared by all nodes
 */
export interface BaseASTNode {
  type: ASTNodeType;
  position: number;
  line: number;
  column: number;
}

/**
 * Element node
 */
export interface ElementNode extends BaseASTNode {
  type: ASTNodeType.Element;
  tag: string;
  attributes: Record<string, string>;
  children: ASTNode[];
}

/**
 * Text node
 */
export interface TextNode extends BaseASTNode {
  type: ASTNodeType.Text;
  value: string;
}

/**
 * Interpolation node ({{ }})
 */
export interface InterpolationNode extends BaseASTNode {
  type: ASTNodeType.Interpolation;
  value: string;
}

/**
 * For loop node
 */
export interface ForNode extends BaseASTNode {
  type: ASTNodeType.For;
  item: string;
  collection: string;
  key?: string;
  children: ASTNode[];
}

/**
 * If condition node
 */
export interface IfNode extends BaseASTNode {
  type: ASTNodeType.If;
  condition: string;
  children: ASTNode[];
  elseChildren?: ASTNode[];
}

/**
 * Show/Hide node
 */
export interface ShowHideNode extends BaseASTNode {
  type: ASTNodeType.Show | ASTNodeType.Hide;
  condition: string;
  children: ASTNode[];
}

/**
 * Directive node
 */
export interface DirectiveNode extends BaseASTNode {
  type: ASTNodeType.Element;
  tag: string;
  attributes: Record<string, string>;
  children: ASTNode[];
  isDirective: true;
  directiveType: 'for' | 'if' | 'show' | 'hide';
}

/**
 * Union type representing any valid AST node
 */
export type ASTNode =
  | ElementNode
  | TextNode
  | InterpolationNode
  | ForNode
  | IfNode
  | ShowHideNode
  | DirectiveNode;