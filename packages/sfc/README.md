# @teloce/sfc




<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo "
   width="200"/>
</p>



**Author:** Aldane Hutchinson

 teloce:  A JavaScript template engine for Python web developers.

> Single File Component (SFC) compiler for Teloce. Compiles `.vel` files into JavaScript and CSS.

---

## Installation

```bash
npm install @teloce/sfc
```

---

## What Is a `.vel` File?

A `.vel` file is a **Single File Component (SFC)** that keeps the template, script, and styles together in one file.

### Example

```html
<!-- Component.vel -->
<template>
  <div class="component">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <button @click="handleClick">Click Me</button>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',

  data() {
    return {
      title: 'Hello World',
      message: 'This is a SFC',
    };
  },

  methods: {
    handleClick() {
      this.message = 'Clicked!';
    },
  },
};
</script>

<style scoped>
.component {
  padding: 20px;
  border: 1px solid #ccc;
}

h1 {
  color: blue;
}
</style>
```

---

## Usage

### Compile a `.vel` File

```javascript
import fs from 'node:fs';
import { compile } from '@teloce/sfc';

const source = fs.readFileSync('Component.vel', 'utf-8');

const result = compile(source, {
  filename: 'Component.vel',
  sourceMap: true,
  minify: true,
  scoped: true,
});

console.log(result.code);
console.log(result.css);
```

---

### Parse Only

Use `parseSFC()` when you only need to extract the sections of an SFC without compiling them.

```javascript
import { parseSFC } from '@teloce/sfc';

const result = parseSFC(source);

console.log('Template:', result.template);
console.log('Script:', result.script);
console.log('Style:', result.style);
console.log('Name:', result.name);
console.log('Diagnostics:', result.diagnostics);
```

---

## API Reference

### `compile(source, options)`

Compiles a complete `.vel` file.

#### Options

| Option      | Type      | Description                                  |
| ----------- | --------- | -------------------------------------------- |
| `filename`  | `string`  | Filename used for error reporting            |
| `sourceMap` | `boolean` | Enable source maps                           |
| `minify`    | `boolean` | Enable minification                          |
| `dev`       | `boolean` | Enable development mode                      |
| `target`    | `string`  | Target platform: `browser`, `node`, or `esm` |
| `scoped`    | `boolean` | Enable scoped CSS                            |

#### Returns

| Property      | Description                     |
| ------------- | ------------------------------- |
| `code`        | Compiled JavaScript             |
| `css`         | Compiled CSS                    |
| `name`        | Component name                  |
| `sfc`         | Parsed SFC result               |
| `script`      | Script compilation result       |
| `style`       | Style compilation result        |
| `template`    | Template compilation result     |
| `diagnostics` | Compilation errors and warnings |

---

### `parseSFC(source, options)`

Parses a `.vel` file into its individual sections.

#### Options

| Option     | Type     | Description                       |
| ---------- | -------- | --------------------------------- |
| `filename` | `string` | Filename used for error reporting |

#### Returns

| Property      | Description                 |
| ------------- | --------------------------- |
| `template`    | Template section            |
| `script`      | Script section              |
| `style`       | Style section               |
| `name`        | Component name              |
| `diagnostics` | Parsing errors and warnings |

---

## Scoped CSS

When `scoped: true` is enabled, CSS selectors are automatically scoped to the component.

### Original CSS

```css
.component {
  padding: 20px;
}

h1 {
  color: blue;
}
```

### Compiled Scoped CSS

```css
.component[data-teloce-component-abc123] {
  padding: 20px;
}

h1[data-teloce-component-abc123] {
  color: blue;
}
```

The compiler adds a unique `data-teloce-component-*` attribute to component elements so that styles remain isolated from other components.

---

## Compilation Flow

A `.vel` file is processed through the following stages:

```text
.vel file
   │
   ├── Template ──> Teloce Template Compiler ──> JavaScript
   │
   ├── Script ───> JavaScript Compiler ────────> JavaScript
   │
   └── Style ────> CSS Processor ──────────────> CSS
                              │
                              ▼
                     Compiled SFC Output
```

---

## License

MIT

```
```
