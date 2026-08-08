# @teloce/vite-plugin

> Vite plugin for Teloce — compile `.vel` Single File Components and Teloce templates.

---

## Installation

```bash
npm install -D @teloce/vite-plugin
```

---

## Usage

### Basic Setup

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import teloce from '@teloce/vite-plugin';

export default defineConfig({
  plugins: [
    teloce({
      sourceMap: true,
      scoped: true,
    }),
  ],
});
```

### With Custom Directives

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import teloce from '@teloce/vite-plugin';

export default defineConfig({
  plugins: [
    teloce({
      directives: [
        {
          name: 'animate',
          transform: (node, context) => {
            // Transform directive
            return node;
          },
        },
      ],
    }),
  ],
});
```

### With Custom Filters

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import teloce from '@teloce/vite-plugin';

export default defineConfig({
  plugins: [
    teloce({
      filters: [
        {
          name: 'markdown',
          transform: (value) => {
            // Convert Markdown to HTML
            return value;
          },
        },
      ],
    }),
  ],
});
```

### With Custom Plugins

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import teloce from '@teloce/vite-plugin';

export default defineConfig({
  plugins: [
    teloce({
      plugins: [
        {
          name: 'custom-transform',
          transform: (code, id) => {
            // Modify compiled code
            return code;
          },
        },
      ],
    }),
  ],
});
```

---

## Using `.vel` Files

Teloce Single File Components use the `.vel` extension.

### Example Component

```html
<!-- Component.vel -->
<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <p>{{ content }}</p>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',

  data() {
    return {
      title: 'Hello World',
      content: 'This is a Teloce component',
    };
  },

  methods: {
    handleClick() {
      alert('Clicked!');
    },
  },
};
</script>

<style scoped>
.card {
  padding: 20px;
  border: 1px solid #ccc;
}
</style>
```

### Importing Components

```javascript
// app.js
import MyComponent from './Component.vel';

const app = teloce.createApp('#app', {
  components: {
    MyComponent,
  },
});
```

---

## Options

| Option       | Type                        | Default                                  | Description              |
| ------------ | --------------------------- | ---------------------------------------- | ------------------------ |
| `include`    | `string \| RegExp \| Array` | `['**/*.teloce', '**/*.vel']`            | File patterns to include |
| `exclude`    | `string \| RegExp \| Array` | `['node_modules/**', 'dist/**']`         | File patterns to exclude |
| `sourceMap`  | `boolean`                   | `true`                                   | Enable source maps       |
| `minify`     | `boolean`                   | `process.env.NODE_ENV === 'production'`  | Enable minification      |
| `dev`        | `boolean`                   | `process.env.NODE_ENV === 'development'` | Enable development mode  |
| `scoped`     | `boolean`                   | `true`                                   | Enable scoped CSS        |
| `plugins`    | `Array`                     | `[]`                                     | Custom plugins           |
| `directives` | `Array`                     | `[]`                                     | Custom directives        |
| `filters`    | `Array`                     | `[]`                                     | Custom filters           |

---

## Hot Module Replacement (HMR)

The plugin supports **Hot Module Replacement (HMR)** for `.vel` files.

When a `.vel` file changes during development, the affected component can be updated without requiring a full page reload.

This provides a faster development workflow while preserving the application's current state where possible.

---

## Project Structure

A typical package structure looks like this:

```text
packages/
└── plugins/
    └── vite/
        ├── package.json
        ├── tsconfig.json
        ├── src/
        │   └── index.ts
        └── README.md
```

---

## File Summary

| File            | Purpose                                     |
| --------------- | ------------------------------------------- |
| `package.json`  | Package metadata, dependencies, and scripts |
| `tsconfig.json` | TypeScript configuration                    |
| `src/index.ts`  | Main Vite plugin implementation             |
| `README.md`     | Package documentation                       |

---

## License

MIT

---

## Links

* [Teloce Website](https://telonce-website.vercel.app/#/)


---

**The Vite plugin is ready to be added to `packages/plugins/vite/`.**
