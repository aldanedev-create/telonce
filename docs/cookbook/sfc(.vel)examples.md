# @teloce/vite-plugin

<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo" width="200"/>
</p>

**Author:** Aldane Hutchinson

teloce: A JavaScript template engine for Python web developers.

> Vite plugin for Teloce — compile `.vel` Single File Components and Teloce templates.

---

## Table of Contents

* [Installation](#installation)
* [Usage](#usage)

  * [Basic Setup](#basic-setup)
  * [With Custom Directives](#with-custom-directives)
  * [With Custom Filters](#with-custom-filters)
  * [With Custom Plugins](#with-custom-plugins)



  - [Usage](#usage)
  - [Basic Setup](#basic-setup)
  - [With Custom Directives](#with-custom-directives)
  - [With Custom Filters](#with-custom-filters)
  - [With Custom Plugins](#with-custom-plugins)
- [Using `.vel` Files](#using-vel-files)
  - [Example Component](#example-component)
  - [Importing Components](#importing-components)
- [Compiling `.vel` Files with Vite](#compiling-vel-files-with-vite)
  - [1. Create a Vite Project](#1-create-a-vite-project)
  - [2. Install the Teloce Vite Plugin](#2-install-the-teloce-vite-plugin)
  - [3. Configure Vite](#3-configure-vite)
  - [4. Create a `.vel` Component](#4-create-a-vel-component)
  - [5. Import the `.vel` Component](#5-import-the-vel-component)
  - [6. Start the Vite Development Server](#6-start-the-vite-development-server)
  - [7. Build for Production](#7-build-for-production)
  - [8. Preview the Production Build](#8-preview-the-production-build)
- [Complete Vite Example](#complete-vite-example)
  - [`vite.config.js`](#viteconfigjs)
  - [`src/components/Counter.vel`](#srccomponentscountervel)
  - [`src/main.js`](#srcmainjs)
  - [`index.html`](#indexhtml)
  - [Development](#development)
  - [Production Build](#production-build)
  - [Preview](#preview)
- [Using Custom Directives with Vite](#using-custom-directives-with-vite)
- [Using Custom Filters with Vite](#using-custom-filters-with-vite)
- [Using Custom Plugins with Vite](#using-custom-plugins-with-vite)
- [Vite Workflow](#vite-workflow)
- [Options](#options)
- [Hot Module Replacement (HMR)](#hot-module-replacement-hmr)
- [Project Structure](#project-structure)
- [File Summary](#file-summary)
- [License](#license)
- [Links](#links)

  

  * [Example Component](#example-component)
  * [Importing Components](#importing-components)
* [Compiling `.vel` Files with Vite](#compiling-vel-files-with-vite)
* [Options](#options)
* [Hot Module Replacement (HMR)](#hot-module-replacement-hmr)
* [Project Structure](#project-structure)
* [File Summary](#file-summary)
* [License](#license)
* [Links](#links)
* [@teloce/sfc](#telocesfc)

  * [What Is a `.vel` File?](#what-is-a-vel-file)
  * [Usage](#usage-1)
  * [API Reference](#api-reference)
  * [Scoped CSS](#scoped-css)
  * [Compilation Flow](#compilation-flow)
* [Flask Usage](#flask-usage)

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

## Compiling `.vel` Files with Vite

The Vite plugin allows `.vel` files to be handled through Vite.

### 1. Install the plugin

```bash
npm install -D @teloce/vite-plugin
```

### 2. Add the plugin to `vite.config.js`

```javascript
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

### 3. Create a `.vel` component

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

### 4. Import the component

```javascript
import MyComponent from './Component.vel';
```

The `.vel` file can then be used as part of the Vite application.

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

---

# @teloce/sfc

<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo" width="200"/>
</p>

**Author:** Aldane Hutchinson

teloce: A JavaScript template engine for Python web developers.

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

---

## Flask Usage

### 1. Create `counter.vel`

```html
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
export default {
  data() {
    return { count: 0 };
  },
  methods: {
    increment() {
      this.count++;
    }
  }
};
</script>
```

### 2. Compile it once

This needs `@teloce/sfc` installed:

```bash
npm install @teloce/sfc
```

```javascript
// build.js
const { compile } = require('@teloce/sfc');
const fs = require('fs');

const source = fs.readFileSync('counter.vel', 'utf-8');
const result = compile(source, { filename: 'counter.vel' });
fs.writeFileSync('static/counter.compiled.mjs', result.code);
```

```bash
node build.js
```

### 3. `app.py`

```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')
```

### 4. `templates/index.html`

```html
<!DOCTYPE html>
<html>
<head><title>Teloce + Flask</title></head>
<body>
  <div id="app"></div>
  <script type="module">
    import { createApp } from 'https://cdn.jsdelivr.net/npm/teloce@latest/dist/teloce.esm.js';
    import Counter from '/static/counter.compiled.mjs';

    const app = createApp('#app', Counter);
    app.mount();
  </script>
</body>
</html>
```


## Compiling `.vel` Files with Vite

The `@teloce/vite-plugin` package allows Teloce `.vel` Single File Components to be used directly in a Vite project.

Instead of manually compiling each `.vel` file with `@teloce/sfc`, the Vite plugin integrates `.vel` compilation into the Vite development and build workflow.

### 1. Create a Vite Project

Create a Vite project using your preferred setup.

For example:

```bash
npm create vite@latest my-teloce-app
```

Then enter the project directory:

```bash
cd my-teloce-app
```

Install the project dependencies:

```bash
npm install
```

### 2. Install the Teloce Vite Plugin

Install `@teloce/vite-plugin` as a development dependency:

```bash
npm install -D @teloce/vite-plugin
```

### 3. Configure Vite

Create or update `vite.config.js`:

```javascript
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

The plugin is now registered with Vite.

### 4. Create a `.vel` Component

Create a component such as:

```text
src/
├── components/
│   └── Counter.vel
├── App.js
└── main.js
```

Example `src/components/Counter.vel`:

```html
<template>
  <div class="counter">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',

  data() {
    return {
      title: 'Teloce Counter',
      count: 0,
    };
  },

  methods: {
    increment() {
      this.count++;
    },
  },
};
</script>

<style scoped>
.counter {
  padding: 20px;
  border: 1px solid #ccc;
}
</style>
```

### 5. Import the `.vel` Component

Import the component from your JavaScript application:

```javascript
import Counter from './components/Counter.vel';
```

You can then use the component with Teloce.

For example:

```javascript
import { createApp } from 'teloce';
import Counter from './components/Counter.vel';

const app = createApp('#app', {
  components: {
    Counter,
  },
});

app.mount();
```

### 6. Start the Vite Development Server

Run:

```bash
npm run dev
```

Vite will start the development server and the Teloce Vite plugin will process `.vel` files used by the application.

When a `.vel` file changes during development, the plugin supports Hot Module Replacement (HMR).

### 7. Build for Production

When the application is ready for production, run:

```bash
npm run build
```

Vite will create the production build in the configured output directory.

### 8. Preview the Production Build

You can preview the production build with:

```bash
npm run preview
```

---

## Complete Vite Example

A basic project using `@teloce/vite-plugin` can look like this:

```text
my-teloce-app/
├── src/
│   ├── components/
│   │   └── Counter.vel
│   ├── App.js
│   └── main.js
├── index.html
├── package.json
└── vite.config.js
```

### `vite.config.js`

```javascript
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

### `src/components/Counter.vel`

```html
<template>
  <div class="counter">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',

  data() {
    return {
      title: 'Teloce Counter',
      count: 0,
    };
  },

  methods: {
    increment() {
      this.count++;
    },
  },
};
</script>

<style scoped>
.counter {
  padding: 20px;
  border: 1px solid #ccc;
}
</style>
```

### `src/main.js`

```javascript
import { createApp } from 'teloce';
import Counter from './components/Counter.vel';

const app = createApp('#app', {
  components: {
    Counter,
  },
});

app.mount();
```

### `index.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Teloce + Vite</title>
</head>
<body>
  <div id="app"></div>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

---

## Using Custom Directives with Vite

The plugin can be configured with custom directives.

```javascript
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

A `.vel` component can then use Teloce directives supported by the compiler/plugin.

---

## Using Custom Filters with Vite

Custom filters can be registered through the Vite plugin:

```javascript
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

---

## Using Custom Plugins with Vite

Additional custom transformations can be registered through the `plugins` option:

```javascript
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

## Vite Workflow

The typical workflow is:

```text
Create Vite Project
       │
       ▼
Install @teloce/vite-plugin
       │
       ▼
Configure vite.config.js
       │
       ▼
Create .vel Components
       │
       ▼
Import .vel Components
       │
       ▼
npm run dev
       │
       ├── Development
       │      │
       │      └── HMR
       │
       ▼
npm run build
       │
       ▼
Production Build
```

This workflow allows `.vel` components to be part of the Vite application's normal development and production build process.
