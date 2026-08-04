/**
 * Autocomplete - Provides completion items for Teloce templates
 */

import { ASTNodeType, type ASTNode, type ElementNode } from '@teloce/compiler';

export interface CompletionItem {
  /**
   * Label to display
   */
  label: string;

  /**
   * Kind of completion (snippet, keyword, directive, etc.)
   */
  kind: CompletionKind;

  /**
   * Detail information
   */
  detail?: string;

  /**
   * Documentation
   */
  documentation?: string;

  /**
   * Insert text
   */
  insertText?: string;

  /**
   * Sort text
   */
  sortText?: string;

  /**
   * Additional text edits
   */
  additionalTextEdits?: Array<{
    range: { start: number; end: number };
    newText: string;
  }>;

  /**
   * Command to execute after insertion
   */
  command?: {
    command: string;
    arguments?: any[];
  };
}

export type CompletionKind =
  | 'keyword'
  | 'directive'
  | 'attribute'
  | 'event'
  | 'binding'
  | 'component'
  | 'variable'
  | 'function'
  | 'snippet'
  | 'text';

export interface CompletionContext {
  /**
   * Current file content
   */
  content: string;

  /**
   * Current position (cursor)
   */
  position: number;

  /**
   * Current line
   */
  line: number;

  /**
   * Current column
   */
  column: number;

  /**
   * Current word being typed
   */
  word?: string;

  /**
   * AST of the document
   */
  ast?: ASTNode[];
}

export interface CompletionProvider {
  /**
   * Get completions for the current context
   */
  getCompletions: (context: CompletionContext) => CompletionItem[];
}

/**
 * Built-in Teloce directives
 */
const TELOCE_DIRECTIVES: CompletionItem[] = [
  // Template directives
  {
    label: 'for',
    kind: 'directive',
    detail: 'For loop directive',
    documentation: 'Loop over a collection of items',
    insertText: 'for key="id" item="item" in="items"',
    sortText: '00',
  },
  {
    label: 'if',
    kind: 'directive',
    detail: 'Conditional directive',
    documentation: 'Conditionally render content',
    insertText: 'if condition="condition"',
    sortText: '00',
  },
  {
    label: 'else',
    kind: 'directive',
    detail: 'Else directive',
    documentation: 'Else branch for if directive',
    insertText: 'else',
    sortText: '00',
  },
  {
    label: 'show',
    kind: 'directive',
    detail: 'Show directive',
    documentation: 'Show/hide element based on condition',
    insertText: 'show="condition"',
    sortText: '00',
  },
  {
    label: 'hide',
    kind: 'directive',
    detail: 'Hide directive',
    documentation: 'Hide/show element based on condition',
    insertText: 'hide="condition"',
    sortText: '00',
  },

  // Event bindings
  {
    label: '@click',
    kind: 'event',
    detail: 'Click event binding',
    documentation: 'Bind click event handler',
    insertText: '@click="handler"',
    sortText: '10',
  },
  {
    label: '@submit',
    kind: 'event',
    detail: 'Submit event binding',
    documentation: 'Bind submit event handler',
    insertText: '@submit="handler"',
    sortText: '10',
  },
  {
    label: '@change',
    kind: 'event',
    detail: 'Change event binding',
    documentation: 'Bind change event handler',
    insertText: '@change="handler"',
    sortText: '10',
  },
  {
    label: '@input',
    kind: 'event',
    detail: 'Input event binding',
    documentation: 'Bind input event handler',
    insertText: '@input="handler"',
    sortText: '10',
  },
  {
    label: '@keyup',
    kind: 'event',
    detail: 'Keyup event binding',
    documentation: 'Bind keyup event handler',
    insertText: '@keyup="handler"',
    sortText: '10',
  },
  {
    label: '@keydown',
    kind: 'event',
    detail: 'Keydown event binding',
    documentation: 'Bind keydown event handler',
    insertText: '@keydown="handler"',
    sortText: '10',
  },
  {
    label: '@focus',
    kind: 'event',
    detail: 'Focus event binding',
    documentation: 'Bind focus event handler',
    insertText: '@focus="handler"',
    sortText: '10',
  },
  {
    label: '@blur',
    kind: 'event',
    detail: 'Blur event binding',
    documentation: 'Bind blur event handler',
    insertText: '@blur="handler"',
    sortText: '10',
  },

  // Property bindings
  {
    label: ':model',
    kind: 'binding',
    detail: 'Two-way binding',
    documentation: 'Two-way data binding for form inputs',
    insertText: ':model="variable"',
    sortText: '20',
  },
  {
    label: ':class',
    kind: 'binding',
    detail: 'Class binding',
    documentation: 'Dynamic class binding',
    insertText: ':class="{ active: isActive }"',
    sortText: '20',
  },
  {
    label: ':style',
    kind: 'binding',
    detail: 'Style binding',
    documentation: 'Dynamic style binding',
    insertText: ':style="{ color: textColor }"',
    sortText: '20',
  },
  {
    label: ':show',
    kind: 'binding',
    detail: 'Show binding',
    documentation: 'Conditional show/hide',
    insertText: ':show="condition"',
    sortText: '20',
  },
  {
    label: ':hide',
    kind: 'binding',
    detail: 'Hide binding',
    documentation: 'Conditional hide/show',
    insertText: ':hide="condition"',
    sortText: '20',
  },
  {
    label: ':disabled',
    kind: 'binding',
    detail: 'Disabled binding',
    documentation: 'Dynamic disabled state',
    insertText: ':disabled="condition"',
    sortText: '20',
  },
  {
    label: ':checked',
    kind: 'binding',
    detail: 'Checked binding',
    documentation: 'Dynamic checked state for checkboxes',
    insertText: ':checked="condition"',
    sortText: '20',
  },
  {
    label: ':value',
    kind: 'binding',
    detail: 'Value binding',
    documentation: 'Dynamic value binding',
    insertText: ':value="variable"',
    sortText: '20',
  },
  {
    label: ':href',
    kind: 'binding',
    detail: 'Href binding',
    documentation: 'Dynamic href binding',
    insertText: ':href="url"',
    sortText: '20',
  },
  {
    label: ':src',
    kind: 'binding',
    detail: 'Src binding',
    documentation: 'Dynamic src binding',
    insertText: ':src="imageUrl"',
    sortText: '20',
  },

  // Filters
  {
    label: '| capitalize',
    kind: 'function',
    detail: 'Capitalize filter',
    documentation: 'Capitalize first letter',
    insertText: '| capitalize',
    sortText: '30',
  },
  {
    label: '| uppercase',
    kind: 'function',
    detail: 'Uppercase filter',
    documentation: 'Convert to uppercase',
    insertText: '| uppercase',
    sortText: '30',
  },
  {
    label: '| lowercase',
    kind: 'function',
    detail: 'Lowercase filter',
    documentation: 'Convert to lowercase',
    insertText: '| lowercase',
    sortText: '30',
  },
  {
    label: '| truncate',
    kind: 'function',
    detail: 'Truncate filter',
    documentation: 'Truncate string to length',
    insertText: '| truncate(30, "...")',
    sortText: '30',
  },
  {
    label: '| currency',
    kind: 'function',
    detail: 'Currency filter',
    documentation: 'Format as currency',
    insertText: '| currency("$", 2)',
    sortText: '30',
  },
  {
    label: '| percent',
    kind: 'function',
    detail: 'Percent filter',
    documentation: 'Format as percentage',
    insertText: '| percent(0)',
    sortText: '30',
  },
  {
    label: '| dateFormat',
    kind: 'function',
    detail: 'Date format filter',
    documentation: 'Format date string',
    insertText: '| dateFormat("YYYY-MM-DD")',
    sortText: '30',
  },
  {
    label: '| timeAgo',
    kind: 'function',
    detail: 'Time ago filter',
    documentation: 'Show relative time',
    insertText: '| timeAgo',
    sortText: '30',
  },
  {
    label: '| join',
    kind: 'function',
    detail: 'Join filter',
    documentation: 'Join array elements',
    insertText: '| join(", ")',
    sortText: '30',
  },
  {
    label: '| pluck',
    kind: 'function',
    detail: 'Pluck filter',
    documentation: 'Extract property from array',
    insertText: '| pluck("name")',
    sortText: '30',
  },
  {
    label: '| orderBy',
    kind: 'function',
    detail: 'Order by filter',
    documentation: 'Sort array by property',
    insertText: '| orderBy("name", "asc")',
    sortText: '30',
  },

  // Built-in variables
  {
    label: 'index',
    kind: 'variable',
    detail: 'Loop index',
    documentation: 'Current index in for loop',
    sortText: '40',
  },
  {
    label: 'item',
    kind: 'variable',
    detail: 'Loop item',
    documentation: 'Current item in for loop',
    sortText: '40',
  },
  {
    label: 'key',
    kind: 'variable',
    detail: 'Loop key',
    documentation: 'Current key in for loop',
    sortText: '40',
  },

  // Snippets
  {
    label: 'for loop',
    kind: 'snippet',
    detail: 'For loop snippet',
    documentation: 'Create a for loop directive',
    insertText: '<for key="id" item="item" in="items">\n  ${1}\n</for>',
    sortText: '50',
  },
  {
    label: 'if/else',
    kind: 'snippet',
    detail: 'If/else snippet',
    documentation: 'Create an if/else directive',
    insertText: '<if condition="condition">\n  ${1}\n  <else>\n  ${2}\n</if>',
    sortText: '50',
  },
  {
    label: 'if',
    kind: 'snippet',
    detail: 'If snippet',
    documentation: 'Create an if directive',
    insertText: '<if condition="condition">\n  ${1}\n</if>',
    sortText: '50',
  },
  {
    label: 'model binding',
    kind: 'snippet',
    detail: 'Model binding snippet',
    documentation: 'Create a two-way binding',
    insertText: '<input :model="${1:variable}" />',
    sortText: '50',
  },
  {
    label: 'event handler',
    kind: 'snippet',
    detail: 'Event handler snippet',
    documentation: 'Create an event binding',
    insertText: '<button @click="${1:handler}">${2:Click me}</button>',
    sortText: '50',
  },
  {
    label: 'component',
    kind: 'snippet',
    detail: 'Component snippet',
    documentation: 'Create a Teloce component',
    insertText: '<${1:ComponentName} ${2:prop}="${3:value}" />',
    sortText: '50',
  },
];

/**
 * Get completions for a context
 */
export function getCompletions(
  context: CompletionContext
): CompletionItem[] {
  const { content, position, word = '' } = context;
  const results: CompletionItem[] = [];

  // Check if we're inside a directive (starting with @ or :)
  const before = content.substring(0, position);
  const lastChar = before[before.length - 1] || '';
  const prevChar = before[before.length - 2] || '';

  // Inside an attribute value
  if (lastChar === '=' || lastChar === '"' || lastChar === "'") {
    // Return attribute value completions
    return getAttributeValueCompletions(context);
  }

  // Starting a directive (@ or :)
  if (lastChar === '@' || (lastChar === ':' && prevChar !== ':')) {
    return getDirectiveCompletions(context);
  }

  // Inside interpolation {{ }}
  if (isInsideInterpolation(content, position)) {
    return getInterpolationCompletions(context);
  }

  // Inside tag name
  if (lastChar === '<') {
    return getTagCompletions(context);
  }

  // Filter suggestions
  if (word.startsWith('|')) {
    return getFilterCompletions(context);
  }

  // Variable suggestions
  if (word.length > 0) {
    return getVariableCompletions(context);
  }

  // Return all completions
  return TELOCE_DIRECTIVES;
}

/**
 * Get completions for directives
 */
function getDirectiveCompletions(
  context: CompletionContext
): CompletionItem[] {
  const { word = '' } = context;
  const all = [
    ...TELOCE_DIRECTIVES.filter(d => d.kind === 'event'),
    ...TELOCE_DIRECTIVES.filter(d => d.kind === 'binding'),
  ];

  if (word) {
    return all.filter(d => d.label.includes(word));
  }

  return all;
}

/**
 * Get completions for attribute values
 */
function getAttributeValueCompletions(
  context: CompletionContext
): CompletionItem[] {
  const { content, position } = context;
  const before = content.substring(0, position);
  
  // Check what attribute we're in
  const attrMatch = before.match(/([@:]\w+)\s*=\s*["']?$/);
  if (attrMatch) {
    const attr = attrMatch[1];
    
    // If it's a binding attribute, suggest variables
    if (attr.startsWith(':')) {
      return getVariableCompletions(context);
    }
    
    // If it's an event attribute, suggest functions
    if (attr.startsWith('@')) {
      return getFunctionCompletions(context);
    }
  }

  return [];
}

/**
 * Get completions for interpolation {{ }}
 */
function getInterpolationCompletions(
  context: CompletionContext
): CompletionItem[] {
  const { word = '' } = context;
  
  const interpolationItems: CompletionItem[] = [
    {
      label: '{{ }}',
      kind: 'snippet',
      detail: 'Interpolation',
      documentation: 'Insert a variable',
      insertText: '{{ ${1:variable} }}',
      sortText: '00',
    },
    ...getVariableCompletions(context),
    ...getFilterCompletions(context),
  ];

  if (word) {
    return interpolationItems.filter(d => 
      d.label.includes(word) || (d.insertText && d.insertText.includes(word))
    );
  }

  return interpolationItems;
}

/**
 * Get completions for tags
 */
function getTagCompletions(
  context: CompletionContext
): CompletionItem[] {
  const tags: CompletionItem[] = [
    {
      label: 'div',
      kind: 'keyword',
      detail: 'HTML div element',
      documentation: 'Generic container',
      sortText: '00',
    },
    {
      label: 'span',
      kind: 'keyword',
      detail: 'HTML span element',
      documentation: 'Inline container',
      sortText: '00',
    },
    {
      label: 'button',
      kind: 'keyword',
      detail: 'HTML button element',
      documentation: 'Clickable button',
      sortText: '00',
    },
    {
      label: 'input',
      kind: 'keyword',
      detail: 'HTML input element',
      documentation: 'Form input',
      sortText: '00',
    },
    {
      label: 'form',
      kind: 'keyword',
      detail: 'HTML form element',
      documentation: 'Form container',
      sortText: '00',
    },
    {
      label: 'ul',
      kind: 'keyword',
      detail: 'HTML unordered list',
      documentation: 'List container',
      sortText: '00',
    },
    {
      label: 'li',
      kind: 'keyword',
      detail: 'HTML list item',
      documentation: 'List item',
      sortText: '00',
    },
    {
      label: 'a',
      kind: 'keyword',
      detail: 'HTML anchor element',
      documentation: 'Hyperlink',
      sortText: '00',
    },
    {
      label: 'img',
      kind: 'keyword',
      detail: 'HTML image element',
      documentation: 'Image',
      sortText: '00',
    },
    ...TELOCE_DIRECTIVES.filter(d => 
      d.kind === 'directive' || d.kind === 'component'
    ),
  ];

  return tags;
}

/**
 * Get completions for variables
 */
function getVariableCompletions(
  context: CompletionContext
): CompletionItem[] {
  const { content, word = '' } = context;
  const variables: CompletionItem[] = [];

  // Extract variables from the content
  const varRegex = /(?:let|const|var)\s+(\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = varRegex.exec(content)) !== null) {
    const varName = match[1];
    if (!word || varName.includes(word)) {
      variables.push({
        label: varName,
        kind: 'variable',
        detail: 'Variable',
        documentation: `Variable: ${varName}`,
        insertText: varName,
        sortText: '10',
      });
    }
  }

  // Extract variables from template
  const templateVarRegex = /\{\{\s*(\w+)/g;
  while ((match = templateVarRegex.exec(content)) !== null) {
    const varName = match[1];
    if (!word || varName.includes(word)) {
      variables.push({
        label: varName,
        kind: 'variable',
        detail: 'Template variable',
        documentation: `Template variable: ${varName}`,
        insertText: varName,
        sortText: '10',
      });
    }
  }

  // Add common variables
  const commonVars = ['data', 'props', 'state', 'computed', 'methods'];
  for (const varName of commonVars) {
    if (!variables.some(v => v.label === varName)) {
      if (!word || varName.includes(word)) {
        variables.push({
          label: varName,
          kind: 'variable',
          detail: 'Common variable',
          documentation: `Common variable: ${varName}`,
          insertText: varName,
          sortText: '20',
        });
      }
    }
  }

  return variables;
}

/**
 * Get completions for filters
 */
function getFilterCompletions(
  context: CompletionContext
): CompletionItem[] {
  return TELOCE_DIRECTIVES.filter(d => d.kind === 'function');
}

/**
 * Get completions for functions
 */
function getFunctionCompletions(
  context: CompletionContext
): CompletionItem[] {
  const { content, word = '' } = context;
  const functions: CompletionItem[] = [];

  // Extract functions from the content
  const funcRegex = /(?:function|const)\s+(\w+)\s*[=\(]/g;
  let match: RegExpExecArray | null;
  while ((match = funcRegex.exec(content)) !== null) {
    const funcName = match[1];
    if (!word || funcName.includes(word)) {
      functions.push({
        label: funcName,
        kind: 'function',
        detail: 'Function',
        documentation: `Function: ${funcName}()`,
        insertText: `${funcName}()`,
        sortText: '10',
      });
    }
  }

  // Extract methods from object
  const methodRegex = /(\w+)\s*:\s*function/g;
  while ((match = methodRegex.exec(content)) !== null) {
    const methodName = match[1];
    if (!word || methodName.includes(word)) {
      functions.push({
        label: methodName,
        kind: 'function',
        detail: 'Method',
        documentation: `Method: ${methodName}()`,
        insertText: `${methodName}()`,
        sortText: '10',
      });
    }
  }

  // Add common event handlers
  const commonHandlers = ['handleClick', 'handleSubmit', 'handleChange', 'handleInput', 'onClick', 'onSubmit', 'onChange'];
  for (const handler of commonHandlers) {
    if (!functions.some(f => f.label === handler)) {
      if (!word || handler.includes(word)) {
        functions.push({
          label: handler,
          kind: 'function',
          detail: 'Common event handler',
          documentation: `Event handler: ${handler}()`,
          insertText: `${handler}()`,
          sortText: '20',
        });
      }
    }
  }

  return functions;
}

/**
 * Check if position is inside interpolation
 */
function isInsideInterpolation(content: string, position: number): boolean {
  const before = content.substring(0, position);
  const openCount = (before.match(/\{\{/g) || []).length;
  const closeCount = (before.match(/\}\}/g) || []).length;
  return openCount > closeCount;
}

/**
 * Create a completion provider
 */
export function createCompletionProvider(): CompletionProvider {
  return {
    getCompletions(context: CompletionContext): CompletionItem[] {
      return getCompletions(context);
    },
  };
}

/**
 * Get completion items (alias)
 */
export function getCompletionItems(
  context: CompletionContext
): CompletionItem[] {
  return getCompletions(context);
}