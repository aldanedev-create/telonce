# @teloce/compiler

> The core template compiler for Teloce — parses, transforms, and generates JavaScript from Teloce templates.

---

## Overview

The Teloce compiler is the heart of the template engine. It takes HTML templates with Teloce directives such as `{{ }}`, `<for>`, `<if>`, `@click`, and `:model`, then compiles them into efficient, reactive JavaScript that runs in the browser.

---

## Installation

```bash
npm install @teloce/compiler
```

### Using pnpm

```bash
pnpm add @teloce/compiler
```

### Using yarn

```bash
yarn add @teloce/compiler
```

---

## How It Works

The compiler transforms templates through a **pipeline of stages**:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         Input Template                              │
│                                                                     │
│  <div id="app">                                                     │
│    <h1>Hello {{ name }}</h1>                                        │
│    <button @click="count++">{{ count }}</button>                    │
│  </div>                                                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     1. Lexer (Tokenization)                         │
│                                                                     │
│  [OpenTag, Text, Interpolation, Text, OpenTag, Event, ...]         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      2. Parser (AST Construction)                   │
│                                                                     │
│  ElementNode { tag: 'div', children: [                              │
│    ElementNode { tag: 'h1', children: [ InterpolationNode ] },     │
│    ElementNode { tag: 'button', attributes: { '@click': ... } }    │
│  ] }                                                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    3. Transformer (Optimization)                    │
│                                                                     │
│  - Static hoisting                                                  │
│  - Constant folding                                                 │
│  - Scope analysis                                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      4. Optimizer (Patch Flags)                     │
│                                                                     │
│  - Static nodes: PATCH_FLAG.NONE                                    │
│  - Dynamic nodes: PATCH_FLAG.TEXT | PATCH_FLAG.EVENT               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       5. Code Generator (Output)                    │
│                                                                     │
│  // Generated JavaScript                                            │
│  import { createElement, createText, effect } from 'teloce'        │
│                                                                     │
│  const element = createElement('div')                               │
│  const h1 = createElement('h1')                                     │
│  const text = createText(() => "Hello " + state.name)               │
│  h1.appendChild(text)                                               │
│  element.appendChild(h1)                                            │
│  // ...                                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Compilation Pipeline

### 1. Lexer

The lexer (tokenizer) scans the input template and converts it into a stream of tokens.

```typescript
import { tokenize, TokenType } from '@teloce/compiler';

const tokens = tokenize('<div>{{ name }}</div>');

// Returns: [OpenTag, Text, Interpolation, CloseTag]
```

### 2. Parser

The parser builds an Abstract Syntax Tree (AST) from the tokens.

```typescript
import { parse, ASTNodeType } from '@teloce/compiler';

const ast = parse(tokens);

// Returns: [ElementNode { tag: 'div', children: [...] }]
```

### 3. Transformer

The transformer applies optimizations such as static hoisting and constant folding.

```typescript
import { transform } from '@teloce/compiler';

const transformed = transform(ast, {
  hoistStatic: true,
  foldConstants: true,
});
```

### 4. Optimizer

The optimizer adds patch flags for fine-grained updates.

```typescript
import { optimize, PatchFlag } from '@teloce/compiler';

const optimized = optimize(transformed, {
  staticHoisting: true,
  patchFlags: true,
});
```

### 5. Code Generator

The code generator emits JavaScript from the optimized AST.

```typescript
import { generate } from '@teloce/compiler';

const output = generate(optimized, {
  target: 'browser',
  minify: false,
});
```

---

## Usage

### Basic Compilation

```typescript
import { compile } from '@teloce/compiler';

const template = `
  <div id="app">
    <h1>Hello {{ name }}</h1>
    <button @click="count++">{{ count }}</button>
  </div>
`;

const result = compile(template, {
  filename: 'app.teloce',
  sourceMap: true,
  dev: true,
});

console.log(result.code);
// Generated JavaScript code

console.log(result.map);
// Source map (if enabled)

console.log(result.diagnostics);
// Compilation errors and warnings

console.log(result.stats);
// Compilation statistics
```

### Compile Options

```typescript
interface CompileOptions {
  /** Filename for error reporting */
  filename?: string;

  /** Enable source maps */
  sourceMap?: boolean;

  /** Enable optimization */
  optimize?: boolean;

  /** Minify output */
  minify?: boolean;

  /** Target platform */
  target?: 'browser' | 'node' | 'esm';

  /** Development mode (verbose errors) */
  dev?: boolean;
}
```

### Compile Result

```typescript
interface CompileResult {
  /** Generated JavaScript code */
  code: string;

  /** Source map (if enabled) */
  map?: string;

  /** Compiled AST */
  ast: any;

  /** Diagnostics */
  diagnostics: {
    warnings: string[];
    errors: string[];
  };

  /** Statistics */
  stats: {
    tokens: number;
    nodes: number;
    time: number;
  };
}
```

---

## AST Nodes

### Supported Node Types

| Node Type           | Description           | Example                 |
| ------------------- | --------------------- | ----------------------- |
| `ElementNode`       | HTML element          | `<div>`                 |
| `TextNode`          | Plain text            | `Hello World`           |
| `InterpolationNode` | Dynamic variable      | `{{ name }}`            |
| `ForNode`           | Loop directive        | `<for item in items>`   |
| `IfNode`            | Conditional directive | `<if loggedIn>`         |
| `ShowHideNode`      | Show/hide directive   | `<div :show="visible">` |

### AST Example

```typescript
// Input: <div id="app"><h1>Hello {{ name }}</h1></div>

const ast = [
  {
    type: 'Element',
    tag: 'div',
    attributes: {
      id: 'app',
    },
    children: [
      {
        type: 'Element',
        tag: 'h1',
        attributes: {},
        children: [
          {
            type: 'Interpolation',
            value: 'name',
            position: 0,
            line: 1,
            column: 1,
          },
        ],
      },
    ],
  },
];
```

---

## Patch Flags

Patch flags enable fine-grained DOM updates without requiring a Virtual DOM.

| Flag        | Description               | Value    |
| ----------- | ------------------------- | -------- |
| `NONE`      | No patch needed (static)  | `0`      |
| `TEXT`      | Text content changed      | `1 << 0` |
| `CLASS`     | Class binding changed     | `1 << 1` |
| `STYLE`     | Style binding changed     | `1 << 2` |
| `ATTR`      | Attribute binding changed | `1 << 3` |
| `EVENT`     | Event listener changed    | `1 << 4` |
| `PROP`      | Property binding changed  | `1 << 5` |
| `FULL`      | Full re-render needed     | `1 << 6` |
| `COMPONENT` | Component props changed   | `1 << 7` |
| `CHILDREN`  | Child array changed       | `1 << 8` |

### Example

```typescript
import { PatchFlag } from '@teloce/compiler';

function getPatchFlag(node: ElementNode): PatchFlag {
  let flag = PatchFlag.NONE;

  for (const attr of node.attributes) {
    if (attr.startsWith('@')) {
      flag |= PatchFlag.EVENT;
    }

    if (attr.startsWith(':class')) {
      flag |= PatchFlag.CLASS;
    }

    if (attr.startsWith(':style')) {
      flag |= PatchFlag.STYLE;
    }

    if (
      attr.startsWith(':') &&
      !attr.startsWith(':class') &&
      !attr.startsWith(':style')
    ) {
      flag |= PatchFlag.PROP;
    }
  }

  return flag;
}
```

---

## Diagnostics

The compiler provides detailed diagnostics for errors and warnings.

### Error Codes

| Code                 | Description                |
| -------------------- | -------------------------- |
| `PARSE_ERROR`        | Template parsing failed    |
| `SYNTAX_ERROR`       | Invalid syntax             |
| `UNDEFINED_VARIABLE` | Variable not defined       |
| `INVALID_EXPRESSION` | Invalid expression         |
| `MISSING_ATTRIBUTE`  | Required attribute missing |
| `INVALID_ATTRIBUTE`  | Invalid attribute          |
| `INVALID_CHILDREN`   | Invalid child nodes        |

### Example

```typescript
import { validate } from '@teloce/compiler';

const result = validate(ast);

if (!result.valid) {
  for (const error of result.errors) {
    console.error(`Error: ${error}`);
  }

  for (const warning of result.warnings) {
    console.warn(`Warning: ${warning}`);
  }
}
```

---

## Source Maps

Generate source maps to map compiled JavaScript back to the original template.

```typescript
import {
  generateSourceMap,
  toBase64,
  toDataURL,
} from '@teloce/compiler';

const map = generateSourceMap(compiledCode, template, {
  file: 'app.js',
  sources: ['app.teloce'],
});

// Convert to base64
const base64 = toBase64(map);

// Convert to data URL
const dataURL = toDataURL(map);
```

---

## API Reference

### Compilation API

```typescript
// Tokenize
function tokenize(input: string): Token[];

// Parse
function parse(
  tokens: Token[],
  options?: ParseOptions
): ASTNode[];

// Transform
function transform(
  ast: ASTNode[],
  options?: TransformOptions
): TransformResult;

// Optimize
function optimize(
  ast: ASTNode[],
  options?: OptimizeOptions
): OptimizeResult;

// Generate
function generate(
  ast: ASTNode[],
  options?: GenerateOptions
): GenerateResult;

// Compile the full pipeline
function compile(
  template: string,
  options?: CompileOptions
): CompileResult;
```

### Validation API

```typescript
// Validate AST
function validate(ast: ASTNode[]): ValidationResult;

// Validate scope
function analyzeScope(ast: ASTNode[]): ScopeAnalysis;

// Create a diagnostic
function createDiagnostic(
  type: string,
  code: string,
  message: string,
  options?: object
): Diagnostic;
```

### Source Map API

```typescript
// Generate source map
function generateSourceMap(
  generated: string,
  source: string,
  options?: SourceMapOptions
): SourceMap;

// Convert to base64
function toBase64(map: SourceMap): string;

// Convert to data URL
function toDataURL(map: SourceMap): string;

// Get mapping for a position
function getMapping(
  map: SourceMap,
  line: number,
  column: number
): {
  source: string;
  line: number;
  column: number;
} | null;
```

---

## Performance

The compiler is designed for fast template compilation.

| Metric                      |        Target |
| --------------------------- | ------------: |
| **Initial Compilation**     |     `< 100ms` |
| **Incremental Compilation** |      `< 20ms` |
| **Memory Usage**            |      `< 50MB` |
| **Bundle Size**             | ~15KB gzipped |

> Performance targets may vary depending on template complexity, hardware, and build configuration.

---

## Integration

### With Vite

```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import teloce from '@teloce/vite-plugin';

export default defineConfig({
  plugins: [
    teloce({
      compiler: {
        sourceMap: true,
        dev: process.env.NODE_ENV === 'development',
      },
    }),
  ],
});
```

### With Rollup

```typescript
// rollup.config.js

import teloce from '@teloce/rollup-plugin';

export default {
  plugins: [
    teloce({
      compiler: {
        minify: true,
        target: 'browser',
      },
    }),
  ],
};
```

### With Webpack

```javascript
// webpack.config.js

module.exports = {
  module: {
    rules: [
      {
        test: /\.(teloce|vel)$/,
        use: [
          {
            loader: '@teloce/webpack-loader',
            options: {
              compiler: {
                sourceMap: true,
              },
            },
          },
        ],
      },
    ],
  },
};
```

---

## Troubleshooting

### Compilation Error: Unexpected Token

```text
Error: Unexpected token '{{'
```

**Fix:** Check for unclosed tags or invalid template syntax.

### Compilation Warning: Missing Key

```text
Warning: For loop missing "key" attribute
```

**Fix:** Add a `key` attribute to your `<for>` loops:

```html
<for key="id" item="product" in="products">
  <div>{{ product.name }}</div>
</for>
```

### Compilation Warning: Empty Interpolation

```text
Warning: Empty interpolation found
```

**Fix:** Add a variable or expression inside `{{ }}`:

```html
<!-- Bad -->
<p>{{ }}</p>

<!-- Good -->
<p>{{ name }}</p>
```

---

## License

MIT

---

## Links

* [Teloce Website](https://telonce-website.vercel.app/#/)

