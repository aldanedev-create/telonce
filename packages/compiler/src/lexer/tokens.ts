/**
 * Token types for the lexer
 */

export enum TokenType {
  // HTML tokens
  OpenTag = 'OpenTag',
  CloseTag = 'CloseTag',
  SelfCloseTag = 'SelfCloseTag',
  Text = 'Text',
  Comment = 'Comment',
  Doctype = 'Doctype',

  // Teloce directives
  Interpolation = 'Interpolation', // {{ }}
  For = 'For',                     // <for>
  If = 'If',                       // <if>
  Else = 'Else',                   // <else>
  Switch = 'Switch',               // <switch>
  Case = 'Case',                   // <case>
  Default = 'Default',             // <default>
  Show = 'Show',                   // <show>
  Hide = 'Hide',                   // <hide>

  // Event directives (attributes)
  AtClick = '@click',
  AtSubmit = '@submit',
  AtChange = '@change',
  AtInput = '@input',
  AtKeyup = '@keyup',
  AtKeydown = '@keydown',
  AtFocus = '@focus',
  AtBlur = '@blur',
  AtMouseover = '@mouseover',
  AtMouseout = '@mouseout',

  // Binding directives (attributes)
  ColonModel = ':model',
  ColonClass = ':class',
  ColonStyle = ':style',
  ColonShow = ':show',
  ColonHide = ':hide',
  ColonDisabled = ':disabled',
  ColonChecked = ':checked',
  ColonValue = ':value',
  ColonHref = ':href',
  ColonSrc = ':src',

  // Attributes
  Attribute = 'Attribute',
  AttributeValue = 'AttributeValue',

  // Identifiers
  Identifier = 'Identifier',
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',

  // Operators
  Equals = 'Equals',
  Colon = 'Colon',
  Comma = 'Comma',
  Dot = 'Dot',

  // Special
  EOF = 'EOF',
}

/**
 * Token structure
 */
export interface Token {
  type: TokenType;
  value: string;
  position: number;
  line: number;
  column: number;
}