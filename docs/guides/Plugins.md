# Plugin System

> Extend the Teloce template engine with custom directives, filters, components, transforms, helpers, and lifecycle hooks.

---

## Overview

The Teloce Plugin System is a **small, tech-neutral extension system** for adding functionality without modifying the core template engine.

Plugins can provide:

* Custom directives
* Custom filters
* Reusable components
* AST transforms
* Rendering hooks
* Template helpers
* Configuration
* Lifecycle hooks

### Philosophy

> **Plugins should be simple to write, easy to share, and work everywhere.**

* **Tech-neutral** — Works with CDN, npm, Vite, Rollup, and other build tools.
* **Small footprint** — Lightweight plugin API.
* **Composable** — Multiple plugins can work together.
* **Versioned** — Plugins can declare compatibility requirements.

---

## Installation

### npm

```bash
npm install @teloce/plugin-system
```

### pnpm

```bash
pnpm add @teloce/plugin-system
```

### Yarn

```bash
yarn add @teloce/plugin-system
```

---

## Plugin Capabilities

| Feature               | Description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| **Custom Directives** | Add directives such as `v-animate` or `v-validate`.              |
| **Custom Filters**    | Add filters such as `markdown` or `truncate`.                    |
| **Custom Components** | Register reusable UI components.                                 |
| **Transforms**        | Modify the AST before or after compilation.                      |
| **Render Hooks**      | Intercept rendering operations.                                  |
| **Helpers**           | Add utility functions available to templates.                    |
| **Configuration**     | Provide configurable plugin options.                             |
| **Lifecycle Hooks**   | React to initialization, compilation, rendering, and completion. |

---

## Writing a Plugin

### Basic Plugin

A plugin is an object containing metadata and optional extension points.

```javascript
// my-plugin.js
export default {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'Adds custom directives and filters',
  author: 'Your Name',
  license: 'MIT',

  directives: [
    {
      name: 'custom',

      transform: (node, context) => {
        return node;
      },

      render: (node, context) => {
        return node;
      },
    },
  ],

  filters: [
    {
      name: 'reverse',
      transform: (value) =>
        String(value).split('').reverse().join(''),
    },
  ],

  hooks: {
    init: (api) => {
      console.log('Plugin initialized!');

      api.registerHelper(
        'hello',
        () => 'Hello from plugin!'
      );
    },
  },
};
```

### TypeScript Plugin

```typescript
// my-plugin.ts
import type {
  Plugin,
  PluginAPI,
} from '@teloce/plugin-system';

const MyPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'TypeScript plugin example',

  directives: [
    {
      name: 'focus',
      priority: 10,

      render: (el, binding) => {
        el.focus();
      },
    },
  ],

  filters: [
    {
      name: 'capitalize',

      transform: (value: string) => {
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },
  ],

  hooks: {
    init: (api: PluginAPI) => {
      api.registerHelper('formatDate', (date: Date) => {
        return date.toLocaleDateString();
      });
    },
  },
};

export default MyPlugin;
```

---

## Plugin Components

### Directives

Directives add custom behavior to elements.

```javascript
{
  name: 'focus',
  priority: 10,

  transform: (node, context) => {
    return node;
  },

  render: (el, binding) => {
    el.focus();
  },

  validate: (node, context) => {
    return [];
  },

  description: 'Focuses an element',
  example: '<input v-focus />',
}
```

### Filters

Filters transform values inside templates.

```javascript
{
  name: 'markdown',

  transform: (value) => {
    return marked(value);
  },

  description: 'Converts Markdown to HTML',
  example: '{{ content | markdown }}',
}
```

### Components

Plugins can register reusable components.

```javascript
{
  name: 'Chart',
  component: ChartComponent,
  description: 'Data visualization component',
}
```

### AST Transforms

Transforms modify the AST during compilation.

```javascript
{
  name: 'auto-import',
  priority: 5,

  transform: (ast) => {
    return ast;
  },

  nodeTypes: ['Element'],
}
```

### Helpers

Helpers expose utility functions to templates.

```javascript
{
  helpers: {
    formatDate: (date) => date.toLocaleDateString(),
    sum: (a, b) => a + b,
    uuid: () => crypto.randomUUID(),
  },
}
```

---

## Lifecycle Hooks

| Hook            | When It Runs            | Parameters        |
| --------------- | ----------------------- | ----------------- |
| `init`          | Plugin is initialized   | `api`             |
| `destroy`       | Plugin is removed       | None              |
| `beforeCompile` | Before compilation      | `ast, context`    |
| `afterCompile`  | After compilation       | `code, context`   |
| `beforeRender`  | Before rendering        | `state, context`  |
| `afterRender`   | After rendering         | `dom, context`    |
| `transformNode` | For each AST node       | `node, context`   |
| `complete`      | Compilation is complete | `result, context` |

### Hook Example

```javascript
const MyPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  hooks: {
    init: (api) => {
      console.log('Plugin initialized');
    },

    beforeCompile: (ast, context) => {
      console.log('Compiling:', context.file);
      return ast;
    },

    afterCompile: (code, context) => {
      console.log('Compiled:', context.file);
      return code;
    },

    transformNode: (node, context) => {
      if (
        node.type === 'Element' &&
        node.tag === 'div'
      ) {
        node.attributes['data-plugin'] = 'true';
      }

      return node;
    },

    complete: (result, context) => {
      console.log('Compilation complete!');
      return result;
    },
  },
};
```

---

## Plugin API

The `PluginAPI` allows plugins to register functionality and interact with the plugin system.

### API Methods

| Method                         | Description                       |
| ------------------------------ | --------------------------------- |
| `registerDirective(directive)` | Register a directive.             |
| `registerFilter(filter)`       | Register a filter.                |
| `registerComponent(component)` | Register a component.             |
| `registerHelper(name, value)`  | Register a template helper.       |
| `registerHook(name, handler)`  | Register a lifecycle hook.        |
| `getConfig(key)`               | Read plugin configuration.        |
| `setConfig(key, value)`        | Update plugin configuration.      |
| `hasDirective(name)`           | Check whether a directive exists. |
| `hasFilter(name)`              | Check whether a filter exists.    |
| `hasComponent(name)`           | Check whether a component exists. |
| `log(message, level)`          | Write a plugin log message.       |

### API Example

```javascript
const MyPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  hooks: {
    init: (api) => {
      api.registerDirective({
        name: 'tooltip',

        render: (el, binding) => {
          el.title = binding.value;
        },
      });

      api.registerFilter({
        name: 'truncate',

        transform: (value, length) => {
          return value.length > length
            ? value.slice(0, length) + '...'
            : value;
        },
      });

      api.registerHelper(
        'random',
        () => Math.random()
      );

      api.registerHook(
        'afterCompile',
        (code) => `${code}\n// Plugin processed`
      );

      const prefix = api.getConfig(
        'prefix',
        'default'
      );

      api.log(
        `Plugin configured with prefix: ${prefix}`,
        'info'
      );
    },
  },

  config: {
    schema: {
      prefix: {
        type: 'string',
        default: 'default',
      },

      enabled: {
        type: 'boolean',
        default: true,
      },
    },

    defaults: {
      prefix: 'my-plugin',
      enabled: true,
    },
  },
};
```

---

## Using Plugins

### CDN

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@teloce/plugin-markdown/dist/index.min.js"></script>
</head>

<body>
  <div id="app">
    <div>{{ content | markdown }}</div>
  </div>

  <script>
    teloce.use(MarkdownPlugin);

    teloce.createApp('#app', {
      content: '# Hello World\n\nThis is **Markdown**!',
    });
  </script>
</body>
</html>
```

### npm

Install the plugin:

```bash
npm install @teloce/plugin-markdown
```

Then register it:

```javascript
import teloce from 'teloce';
import markdownPlugin from '@teloce/plugin-markdown';

teloce.use(markdownPlugin);

teloce.createApp('#app', {
  content: '# Hello World',
});
```

### Vite / Rollup

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import teloce from '@teloce/vite-plugin';

export default defineConfig({
  plugins: [
    teloce({
      plugins: [
        '@teloce/plugin-markdown',
        '@teloce/plugin-forms',
      ],
    }),
  ],
});
```

### Programmatic

```javascript
import {
  createPluginSystem,
} from '@teloce/plugin-system';

import myPlugin from './my-plugin';

const system = createPluginSystem({
  debug: true,
  plugins: [myPlugin],
});

await system.init();

const api = system.getAPI();

console.log(
  api.getHelpers().hello()
);
```

---

## Plugin Loader

The plugin loader can load plugins from different sources.

### npm Package

```javascript
import {
  PluginLoader,
} from '@teloce/plugin-system';

const loader = new PluginLoader();

const plugin = await loader.loadPackage(
  '@teloce/plugin-markdown'
);
```

### File

```javascript
const plugin = await loader.loadModule(
  './my-plugin.js'
);
```

### Function

```javascript
const plugin = loader.loadFunction((api) => {
  api.registerFilter({
    name: 'custom',

    transform: (value) => value,
  });
});
```

### Multiple Plugins

```javascript
const result = await loader.loadMany([
  '@teloce/plugin-markdown',
  '@teloce/plugin-forms',
  './my-plugin.js',
  (api) => {
    // Inline plugin
  },
]);

console.log('Loaded:', result.plugins.length);
console.log('Failed:', result.failed.length);
```

---

## Built-in Plugins

### Markdown Plugin

Adds Markdown support through a filter and directive.

```javascript
import markdownPlugin from '@teloce/plugin-markdown';

teloce.use(markdownPlugin);
```

Use it in templates:

```html
{{ content | markdown }}

<div v-markdown="content"></div>
```

### Forms Plugin

Adds form validation functionality.

```javascript
import formsPlugin from '@teloce/plugin-forms';

teloce.use(formsPlugin);
```

Example:

```html
<input v-validate="'required|email'" />

<span v-show="errors.email">
  {{ errors.email }}
</span>
```

### Charts Plugin

Adds chart components.

```javascript
import chartsPlugin from '@teloce/plugin-charts';

teloce.use(chartsPlugin);
```

Example:

```html
<Chart type="bar" :data="salesData" />
<Chart type="line" :data="trendData" />
```

---

## Publishing Plugins

### Recommended Package Structure

```text
my-teloce-plugin/
├── src/
│   └── index.ts
├── dist/
│   ├── index.js
│   ├── index.mjs
│   └── index.d.ts
├── tests/
├── package.json
├── README.md
└── LICENSE
```

### package.json

```json
{
  "name": "@teloce/plugin-my-plugin",
  "version": "1.0.0",
  "description": "My Teloce plugin",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "test": "vitest",
    "prepublishOnly": "pnpm build"
  },
  "peerDependencies": {
    "teloce": "^0.1.0"
  },
  "keywords": [
    "teloce",
    "plugin"
  ],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/telocejs/plugin-my-plugin.git"
  },
  "bugs": {
    "url": "https://github.com/telocejs/plugin-my-plugin/issues"
  },
  "homepage": "https://github.com/telocejs/plugin-my-plugin#readme"
}
```

### Publishing to npm

Build the plugin:

```bash
pnpm build
```

Log in:

```bash
npm login
```

Publish:

```bash
npm publish --access public
```

---

# Plugin Examples

## Example 1: Markdown Plugin

```javascript
export default {
  name: 'markdown',
  version: '1.0.0',
  description: 'Adds Markdown support to templates',

  filters: [
    {
      name: 'markdown',

      transform: (value) => {
        return marked(value);
      },
    },
  ],

  directives: [
    {
      name: 'markdown',

      render: (el, binding) => {
        el.innerHTML = marked(binding.value);
      },
    },
  ],

  hooks: {
    init: (api) => {
      api.registerHelper(
        'markdown',
        (value) => marked(value)
      );
    },
  },
};
```

## Example 2: Validation Plugin

```javascript
export default {
  name: 'validation',
  version: '1.0.0',

  directives: [
    {
      name: 'validate',
      priority: 5,

      render: (el, binding) => {
        const rules = binding.value;

        el.addEventListener('input', () => {
          const valid = validate(
            el.value,
            rules
          );

          // Show or hide the validation error.
        });
      },
    },
  ],

  helpers: {
    validators: {
      required: (value) =>
        Boolean(value && value.trim().length > 0),

      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),

      minLength: (value, min) =>
        value.length >= min,

      maxLength: (value, max) =>
        value.length <= max,

      number: (value) =>
        !isNaN(value),

      min: (value, min) =>
        Number(value) >= min,

      max: (value, max) =>
        Number(value) <= max,

      pattern: (value, pattern) =>
        new RegExp(pattern).test(value),
    },
  },
};
```

## Example 3: Animation Plugin

```javascript
export default {
  name: 'animations',
  version: '1.0.0',

  directives: [
    {
      name: 'fade',

      render: (el, binding) => {
        const duration = binding.value || 300;

        el.style.transition =
          `opacity ${duration}ms ease`;

        el.style.opacity = '0';

        requestAnimationFrame(() => {
          el.style.opacity = '1';
        });
      },
    },

    {
      name: 'slide',

      render: (el, binding) => {
        const duration = binding.value || 300;

        el.style.transition =
          `transform ${duration}ms ease, height ${duration}ms ease`;

        el.style.transform = 'translateY(-100%)';
        el.style.height = '0';

        requestAnimationFrame(() => {
          el.style.transform = 'translateY(0)';
          el.style.height = `${el.scrollHeight}px`;
        });
      },
    },

    {
      name: 'scale',

      render: (el, binding) => {
        const duration = binding.value || 300;

        el.style.transition =
          `transform ${duration}ms ease`;

        el.style.transform = 'scale(0)';

        requestAnimationFrame(() => {
          el.style.transform = 'scale(1)';
        });
      },
    },
  ],

  helpers: {
    animations: {
      fadeIn: (el, duration = 300) => {
        el.style.transition =
          `opacity ${duration}ms ease`;

        el.style.opacity = '1';
      },

      fadeOut: (el, duration = 300) => {
        el.style.transition =
          `opacity ${duration}ms ease`;

        el.style.opacity = '0';
      },
    },
  },
};
```

## Example 4: E-commerce Plugin

```javascript
export default {
  name: 'ecommerce',
  version: '1.0.0',

  components: [
    {
      name: 'ProductCard',
      component: ProductCardComponent,
      description: 'Product card with add to cart',
    },

    {
      name: 'CartWidget',
      component: CartWidgetComponent,
      description: 'Shopping cart widget',
    },

    {
      name: 'CheckoutForm',
      component: CheckoutFormComponent,
      description: 'Checkout form with validation',
    },
  ],

  directives: [
    {
      name: 'price',

      render: (el, binding) => {
        el.textContent =
          `$${Number(binding.value).toFixed(2)}`;
      },
    },
  ],

  filters: [
    {
      name: 'currency',

      transform: (value, symbol = '$') => {
        return `${symbol}${Number(value).toFixed(2)}`;
      },
    },

    {
      name: 'discount',

      transform: (value, discount) => {
        return value * (1 - discount / 100);
      },
    },
  ],

  helpers: {
    cart: {
      addItem(cart, item) {
        const existing = cart.find(
          (i) => i.id === item.id
        );

        if (existing) {
          existing.quantity++;
        } else {
          cart.push({
            ...item,
            quantity: 1,
          });
        }

        return cart;
      },

      removeItem(cart, id) {
        return cart.filter(
          (i) => i.id !== id
        );
      },

      updateQuantity(cart, id, quantity) {
        const item = cart.find(
          (i) => i.id === id
        );

        if (item) {
          item.quantity = quantity;
        }

        return cart;
      },

      total(cart) {
        return cart.reduce(
          (sum, item) =>
            sum + item.price * item.quantity,
          0
        );
      },

      count(cart) {
        return cart.reduce(
          (sum, item) =>
            sum + item.quantity,
          0
        );
      },
    },
  },
};
```

---

# Troubleshooting

## Plugin Not Found

```text
Error: Plugin "my-plugin" not found
```

Make sure the plugin is installed:

```bash
npm install @teloce/plugin-my-plugin
```

Then register it:

```javascript
import myPlugin from '@teloce/plugin-my-plugin';

teloce.use(myPlugin);
```

## Version Mismatch

```text
Error: Plugin "my-plugin" requires teloce@^0.1.0
```

Update Teloce and the plugin:

```bash
npm update teloce @teloce/plugin-my-plugin
```

## Duplicate Plugin

```text
Error: Plugin "my-plugin" is already registered
```

Check whether the plugin is already registered.

If duplicate registration is intentionally required:

```javascript
const system = createPluginSystem({
  registry: {
    allowDuplicates: true,
  },
});
```

> Only enable duplicate plugins when the plugin is designed to support multiple registrations.

## Plugin Loading Failure

```text
Error: Plugin "my-plugin" failed to load
```

Check the plugin's dependencies and export:

```javascript
export default {
  name: 'my-plugin',
  version: '1.0.0',
};
```

---

# Plugin System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         Plugin System                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Plugin Registry                        │  │
│  │                                                           │  │
│  │   Plugin 1       Plugin 2       Plugin 3       ...       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Hook System                           │  │
│  │                                                           │  │
│  │ beforeCompile │ afterCompile │ transformNode             │  │
│  │ beforeRender  │ afterRender  │ complete                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                       Plugin API                            │  │
│  │                                                           │  │
│  │ registerDirective │ registerFilter │ registerComponent   │  │
│  │ registerHelper    │ registerHook   │ getConfig           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Plugin Loader                         │  │
│  │                                                           │  │
│  │ loadPackage │ loadModule │ loadFunction │ loadMany       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Plugin Development Best Practices

## 1. Version Your Plugin

Always provide a plugin version and declare the supported Teloce version when supported by the plugin API.

```javascript
export default {
  name: 'my-plugin',
  version: '1.0.0',
  teloce: '^0.1.0',
};
```

## 2. Document Your Plugin

A plugin should provide installation, usage, configuration, and compatibility information.

````markdown
# @teloce/plugin-my-plugin

## Installation

```bash
npm install @teloce/plugin-my-plugin
```

## Usage

```javascript
import myPlugin from '@teloce/plugin-my-plugin';

teloce.use(myPlugin);
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `option` | `string` | `'default'` | Description |
````

## 3. Write Tests

Use a test runner such as Vitest.

```javascript
import {
  describe,
  it,
  expect,
  vi,
} from 'vitest';

import myPlugin from '../src';

describe('my-plugin', () => {
  it('registers a directive', () => {
    const api = {
      registerDirective: vi.fn(),
    };

    myPlugin.hooks.init(api);

    expect(
      api.registerDirective
    ).toHaveBeenCalled();
  });
});
```

## 4. Handle Errors Gracefully

Plugins should avoid crashing the entire application when optional functionality fails.

```javascript
hooks: {
  init: (api) => {
    try {
      // Plugin initialization.
    } catch (error) {
      api.log(
        `Plugin error: ${error.message}`,
        'error'
      );
    }
  },
}
```

## 5. Use Semantic Versioning

Follow [Semantic Versioning](https://semver.org/) for plugin releases.

| Version | Change                          |
| ------- | ------------------------------- |
| `1.0.0` | Initial release                 |
| `1.0.1` | Bug fix                         |
| `1.1.0` | New backward-compatible feature |
| `2.0.0` | Breaking change                 |

## 6. Keep Plugins Focused

A plugin should generally have one clear responsibility.

Good examples:

* Markdown rendering
* Form validation
* Animation utilities
* Chart components
* Authentication helpers
* Internationalization
* Developer tooling

Avoid creating one large plugin that combines unrelated features.

## 7. Avoid Modifying Teloce Internals

Prefer the public Plugin API:

```javascript
api.registerDirective(...);
api.registerFilter(...);
api.registerComponent(...);
api.registerHelper(...);
api.registerHook(...);
```

This makes plugins more portable across Teloce releases.

---

# License

MIT

---

# Links

* [Teloce Website](https://telonce-website.vercel.app/#/)