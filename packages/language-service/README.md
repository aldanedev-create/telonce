# @teloce/language-service

> Language service for Teloce templates - autocomplete, diagnostics, hover, and formatting

⚠️ **Note:** This package is currently designed to be consumed by editor extensions (VS Code, Neovim, etc.) but can also be used programmatically.

---

## Features

- **🔍 Autocomplete** - Smart completions for directives, events, bindings, variables, and more
- **📋 Diagnostics** - Real-time error detection and validation
- **💡 Hover Information** - Documentation on hover for directives and bindings
- **🎨 Formatting** - Auto-format Teloce templates
- **📝 JSDoc Bridge** - Parse and validate JSDoc annotations

---

## Installation

```bash
npm install @teloce/language-service
Usage
Programmatic API
javascript
import {
  getCompletions,
  getDiagnostics,
  getHoverInfo,
  formatTemplate,
  parseJSDoc,
} from '@teloce/language-service';

// Get completions
const completions = getCompletions({
  content: '<for ',
  position: 5,
  line: 0,
  column: 5,
});

// Get diagnostics
const diagnostics = getDiagnostics('<for key="id" item="item" in="items">');

// Get hover info
const hover = getHoverInfo('<div @click="handleClick">', 0, 6);

// Format template
const formatted = formatTemplate('<div><h1>Hello</h1></div>');

// Parse JSDoc
const jsdoc = parseJSDoc(`
  /**
   * @param {string} name
   * @returns {string}
   */
`);
Completion Items
Kind	Examples
directive	for, if, else, show, hide
event	@click, @submit, @change, @input, @keyup
binding	:model, :class, :style, :show, :hide
function	| capitalize, | uppercase, | currency
variable	index, item, custom variables
snippet	for loop, if/else, model binding
Diagnostics
Error Types
Type	Description
Unclosed tags	Missing closing </for> or </if>
Missing key	For loop missing key attribute
Empty interpolation	{{ }} with no variable
Unclosed braces	Missing }}
Parse errors	Invalid syntax
Example
javascript
const diagnostics = getDiagnostics('<for item="item" in="items">');
// Returns warning: 'For loop missing "key" attribute'
Hover Information
Hover provides documentation for:

Directives (for, if, else, show, hide)

Events (@click, @submit, @change, etc.)

Bindings (:model, :class, :style, etc.)

Variables (shows type information when available)

Components (shows component documentation)

Example
javascript
const hover = getHoverInfo('<button @click="handleClick">', 0, 8);
// Returns:
// {
//   content: '**@click**\n\nHandle click events on an element.',
//   example: '<button @click="handleClick">Click me</button>'
// }
JSDoc Support
The language service can parse and validate JSDoc annotations.

Supported Tags
Tag	Description
@type	Type annotation
@param	Function parameter
@returns	Function return type
@typedef	Type definition
@property	Object property
Example
javascript
const jsdoc = parseJSDoc(`
  /**
   * @typedef {Object} User
   * @property {number} id
   * @property {string} name
   * @property {string} email
   */
`);
// Returns parsed tags, validated types, and generated TypeScript definitions
Integration with VS Code
The language service powers the Teloce VS Code extension:

typescript
// In your VS Code extension
import { getCompletions, getDiagnostics, getHoverInfo } from '@teloce/language-service';

// Register completion provider
vscode.languages.registerCompletionItemProvider('teloce', {
  provideCompletionItems(document, position) {
    const content = document.getText();
    const line = position.line;
    const character = position.character;
    return getCompletions({ content, position: document.offsetAt(position), line, character });
  }
});
License
MIT