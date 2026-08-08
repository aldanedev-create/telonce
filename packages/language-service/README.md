# @teloce/language-service

> Language service for Teloce templates — autocomplete, diagnostics, hover information, and formatting.

⚠️ **Note:** This package is primarily designed to be consumed by editor extensions such as VS Code and Neovim, but it can also be used programmatically.

---

## Features

* **🔍 Autocomplete** — Smart completions for directives, events, bindings, variables, and more.
* **📋 Diagnostics** — Real-time error detection and template validation.
* **💡 Hover Information** — Documentation for directives, bindings, variables, and components.
* **🎨 Formatting** — Automatically format Teloce templates.
* **📝 JSDoc Bridge** — Parse and validate JSDoc annotations.

---

## Installation

```bash
npm install @teloce/language-service
```

---

## Usage

### Programmatic API

```javascript
import {
  getCompletions,
  getDiagnostics,
  getHoverInfo,
  formatTemplate,
  parseJSDoc
} from '@teloce/language-service';

// Get completions
const completions = getCompletions({
  content: '<for ',
  position: 5,
  line: 0,
  column: 5
});

// Get diagnostics
const diagnostics = getDiagnostics(
  '<for key="id" item="item" in="items">'
);

// Get hover information
const hover = getHoverInfo(
  '<div @click="handleClick">',
  0,
  6
);

// Format a template
const formatted = formatTemplate(
  '<div><h1>Hello</h1></div>'
);

// Parse JSDoc
const jsdoc = parseJSDoc(`
  /**
   * @param {string} name
   * @returns {string}
   */
`);
```

---

## Completion Items

The language service provides context-aware completion suggestions.

| Kind          | Examples                                           |
| ------------- | -------------------------------------------------- |
| **Directive** | `for`, `if`, `else`, `show`, `hide`                |
| **Event**     | `@click`, `@submit`, `@change`, `@input`, `@keyup` |
| **Binding**   | `:model`, `:class`, `:style`, `:show`, `:hide`     |
| **Filter**    | `\|capitalize`, `\|uppercase`, `\|currency`        |
| **Variable**  | `index`, `item`, and custom variables              |
| **Snippet**   | `for` loop, `if/else`, model binding               |

---

## Diagnostics

The language service detects common Teloce template errors and warnings.

### Error Types

| Type                    | Description                                 |
| ----------------------- | ------------------------------------------- |
| **Unclosed tags**       | Missing closing `</for>` or `</if>`         |
| **Missing key**         | A `<for>` loop is missing a `key` attribute |
| **Empty interpolation** | `{{ }}` contains no variable or expression  |
| **Unclosed braces**     | Missing closing `}}`                        |
| **Parse errors**        | Invalid template syntax                     |

### Example

```javascript
const diagnostics = getDiagnostics(
  '<for item="item" in="items">'
);

// Returns a warning:
// 'For loop missing "key" attribute'
```

---

## Hover Information

Hover information provides documentation for:

* Directives such as `for`, `if`, `else`, `show`, and `hide`
* Events such as `@click`, `@submit`, `@change`, and `@input`
* Bindings such as `:model`, `:class`, and `:style`
* Variables, including type information when available
* Components and their documentation

### Example

```javascript
const hover = getHoverInfo(
  '<button @click="handleClick">',
  0,
  8
);

console.log(hover);
```

Example result:

```text
{
  content: '**@click**\n\nHandle click events on an element.',
  example: '<button @click="handleClick">Click me</button>'
}
```

---

## JSDoc Support

The language service can parse and validate JSDoc annotations.

### Supported Tags

| Tag         | Description          |
| ----------- | -------------------- |
| `@type`     | Type annotation      |
| `@param`    | Function parameter   |
| `@returns`  | Function return type |
| `@typedef`  | Type definition      |
| `@property` | Object property      |

### Example

```javascript
const jsdoc = parseJSDoc(`
  /**
   * @typedef {Object} User
   * @property {number} id
   * @property {string} name
   * @property {string} email
   */
`);
```

The result contains parsed tags, validated types, and generated TypeScript definitions.

---

## Integration with VS Code

The language service can power a Teloce VS Code extension.

```typescript
import * as vscode from 'vscode';

import {
  getCompletions,
  getDiagnostics,
  getHoverInfo
} from '@teloce/language-service';

vscode.languages.registerCompletionItemProvider('teloce', {
  provideCompletionItems(document, position) {
    const content = document.getText();
    const offset = document.offsetAt(position);

    return getCompletions({
      content,
      position: offset,
      line: position.line,
      column: position.character
    });
  }
});
```

---

## License

MIT
