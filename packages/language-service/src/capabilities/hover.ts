/**
 * Hover - Provides hover information for Teloce templates
 */

import { ASTNodeType, type ASTNode, type ElementNode } from '@teloce/compiler';

export interface HoverInfo {
  /**
   * Hover content
   */
  content: string;

  /**
   * Range covered by the hover
   */
  range?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };

  /**
   * Documentation
   */
  documentation?: string;

  /**
   * Example usage
   */
  example?: string;

  /**
   * Related links
   */
  links?: string[];
}

export interface HoverProvider {
  /**
   * Get hover information for a position
   */
  getHoverInfo: (
    content: string,
    line: number,
    character: number
  ) => HoverInfo | null;
}

/**
 * Directive documentation map
 */
const DIRECTIVE_DOCS: Record<string, { docs: string; example: string }> = {
  for: {
    docs: 'Loop over a collection of items to render them repeatedly.',
    example: '<for key="id" item="product" in="products">\n  <div>{{ product.name }}</div>\n</for>',
  },
  if: {
    docs: 'Conditionally render content based on a condition.',
    example: '<if loggedIn>\n  <h1>Welcome back!</h1>\n</if>',
  },
  else: {
    docs: 'Else branch for an if directive.',
    example: '<if loggedIn>\n  <h1>Welcome back!</h1>\n  <else>\n  <button>Login</button>\n</if>',
  },
  show: {
    docs: 'Show or hide an element based on a condition.',
    example: '<div :show="isVisible">Content</div>',
  },
  hide: {
    docs: 'Hide or show an element based on a condition.',
    example: '<div :hide="isHidden">Content</div>',
  },
};

/**
 * Event documentation map
 */
const EVENT_DOCS: Record<string, { docs: string; example: string }> = {
  '@click': {
    docs: 'Handle click events on an element.',
    example: '<button @click="handleClick">Click me</button>',
  },
  '@submit': {
    docs: 'Handle form submission events.',
    example: '<form @submit="handleSubmit">...</form>',
  },
  '@change': {
    docs: 'Handle change events on form inputs.',
    example: '<input @change="handleChange" />',
  },
  '@input': {
    docs: 'Handle input events on form inputs.',
    example: '<input @input="handleInput" />',
  },
  '@keyup': {
    docs: 'Handle keyup events on an element.',
    example: '<input @keyup.enter="handleEnter" />',
  },
  '@keydown': {
    docs: 'Handle keydown events on an element.',
    example: '<input @keydown="handleKeyDown" />',
  },
  '@focus': {
    docs: 'Handle focus events on an element.',
    example: '<input @focus="handleFocus" />',
  },
  '@blur': {
    docs: 'Handle blur events on an element.',
    example: '<input @blur="handleBlur" />',
  },
};

/**
 * Binding documentation map
 */
const BINDING_DOCS: Record<string, { docs: string; example: string }> = {
  ':model': {
    docs: 'Two-way data binding for form inputs.',
    example: '<input :model="username" />\n<p>Hello {{ username }}</p>',
  },
  ':class': {
    docs: 'Dynamic class binding with object syntax.',
    example: '<div :class="{ active: isActive, \'text-bold\': isBold }">Content</div>',
  },
  ':style': {
    docs: 'Dynamic style binding with object syntax.',
    example: '<div :style="{ color: textColor, fontSize: textSize + \'px\' }">Content</div>',
  },
  ':show': {
    docs: 'Conditional show/hide of an element.',
    example: '<div :show="isVisible">Content</div>',
  },
  ':hide': {
    docs: 'Conditional hide/show of an element.',
    example: '<div :hide="isHidden">Content</div>',
  },
  ':disabled': {
    docs: 'Dynamic disabled state for form elements.',
    example: '<button :disabled="isLoading">Submit</button>',
  },
  ':checked': {
    docs: 'Dynamic checked state for checkboxes and radio buttons.',
    example: '<input type="checkbox" :checked="isChecked" />',
  },
  ':value': {
    docs: 'Dynamic value binding for inputs.',
    example: '<input :value="value" />',
  },
  ':href': {
    docs: 'Dynamic href binding for links.',
    example: '<a :href="url">Link</a>',
  },
  ':src': {
    docs: 'Dynamic src binding for images.',
    example: '<img :src="imageUrl" />',
  },
};

/**
 * Get hover information for a position
 */
export function getHoverInfo(
  content: string,
  line: number,
  character: number
): HoverInfo | null {
  // Find the word at the position
  const lines = content.split('\n');
  const currentLine = lines[line] || '';
  
  // Get the word at position
  let start = character;
  let end = character;
  
  while (start > 0 && /[\w@:]/.test(currentLine[start - 1])) {
    start--;
  }
  while (end < currentLine.length && /[\w@:]/.test(currentLine[end])) {
    end++;
  }
  
  const word = currentLine.substring(start, end);
  if (!word) return null;

  // Check if it's a directive
  if (word in DIRECTIVE_DOCS) {
    const info = DIRECTIVE_DOCS[word];
    return {
      content: `**${word}**\n\n${info.docs}`,
      documentation: info.docs,
      example: info.example,
      range: {
        start: { line, character: start },
        end: { line, character: end },
      },
    };
  }

  // Check if it's an event
  if (word in EVENT_DOCS) {
    const info = EVENT_DOCS[word];
    return {
      content: `**${word}**\n\n${info.docs}`,
      documentation: info.docs,
      example: info.example,
      range: {
        start: { line, character: start },
        end: { line, character: end },
      },
    };
  }

  // Check if it's a binding
  if (word in BINDING_DOCS) {
    const info = BINDING_DOCS[word];
    return {
      content: `**${word}**\n\n${info.docs}`,
      documentation: info.docs,
      example: info.example,
      range: {
        start: { line, character: start },
        end: { line, character: end },
      },
    };
  }

  // Check if it's a variable name
  if (isVariableName(content, word, line, character)) {
    return {
      content: `**${word}**\n\nVariable in scope`,
      documentation: 'This variable is defined in the current scope.',
      range: {
        start: { line, character: start },
        end: { line, character: end },
      },
    };
  }

  // Check if it's a component name
  if (isComponentName(content, word, line, character)) {
    return {
      content: `**${word}**\n\nComponent`,
      documentation: 'This is a Teloce component.',
      range: {
        start: { line, character: start },
        end: { line, character: end },
      },
    };
  }

  return null;
}

/**
 * Check if a word is a variable name
 */
function isVariableName(
  content: string,
  word: string,
  line: number,
  character: number
): boolean {
  // Check if it appears in interpolation
  const lines = content.split('\n');
  const currentLine = lines[line] || '';
  const before = currentLine.substring(0, character);
  
  // Check if it's inside {{ }}
  const openInterp = before.lastIndexOf('{{');
  const closeInterp = before.lastIndexOf('}}');
  if (openInterp > closeInterp) {
    return true;
  }

  // Check if it's defined as a variable
  const varRegex = new RegExp(`(?:let|const|var)\\s+${word}\\b`);
  return varRegex.test(content);
}

/**
 * Check if a word is a component name
 */
function isComponentName(
  content: string,
  word: string,
  line: number,
  character: number
): boolean {
  // Check if it's used as a tag
  const lines = content.split('\n');
  const currentLine = lines[line] || '';
  const before = currentLine.substring(0, character);
  
  // Check if it's after <
  if (before.endsWith('<')) {
    // Check if it's a component (capitalized)
    return /^[A-Z]/.test(word);
  }

  // Check for component registration
  const componentRegex = new RegExp(`component\\(['"]${word}['"]`);
  return componentRegex.test(content);
}

/**
 * Create a hover provider
 */
export function createHoverProvider(): HoverProvider {
  return {
    getHoverInfo(
      content: string,
      line: number,
      character: number
    ): HoverInfo | null {
      return getHoverInfo(content, line, character);
    },
  };
}