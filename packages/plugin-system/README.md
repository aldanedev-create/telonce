# Teloce Plugin System




<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo "
   width="200"/>
</p>



**Author:** Aldane Hutchinson

 teloce:  A JavaScript template engine for Python web developers.

> Extend the Teloce template engine with custom directives, filters, components, transforms, and lifecycle hooks.

---

## Overview

The Teloce Plugin System is a **small-scale, tech-neutral** plugin architecture that allows developers to extend the template engine.

Plugins can add:

* Custom directives
* Custom filters
* Custom components
* AST transforms
* Lifecycle hooks
* Helper functions
* Plugin configuration

### Philosophy

> **"Plugins should be simple to write, easy to share, and work everywhere."**

* **Tech-Neutral** — Plugins work with CDN, npm, and build tools.
* **Small Footprint** — Lightweight plugin API.
* **Composable** — Multiple plugins can work together.
* **Versioned** — Plugins declare compatibility.

---

## Installation

```bash
npm install @teloce/plugin-system
```

### Using pnpm

```bash
pnpm add @teloce/plugin-system
```

### Using yarn

```bash
yarn add @teloce/plugin-system
```

---

## Plugin Capabilities

| Feature               | Description                                        |
| --------------------- | -------------------------------------------------- |
| **Custom Directives** | Add directives such as `@animate` and `@validate`. |
| **Custom Filters**    | Add filters such as `\|markdown` and `\|truncate`. |
| **Custom Components** | Register reusable components.                      |
| **Transform Hooks**   | Modify the AST before or after compilation.        |
| **Render Hooks**      | Intercept the rendering process.                   |
| **Helpers**           | Add utility functions to templates.                |
| **Configuration**     | Provide plugin-specific configuration.             |

---

# Writing a Plugin

## Basic Plugin Structure

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
        // Transform the node.
        return node;
      },

      render: (node, context) => {
        // Render the node.
        return node;
      }
    }
  ],

  filters: [
    {
      name: 'reverse',

      transform: (value) => {
        return value.split('').reverse().join('');
      }
    }
  ],

  hooks: {
    init: (api) => {
      console.log('Plugin initialized!');

      api.registerHelper(
        'hello',
        () => 'Hello from plugin!'
      );
    }
  }
};
```

---

## TypeScript Plugin

```typescript
// my-plugin.ts
import {
  Plugin,
  PluginAPI
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
      }
    }
  ],

  filters: [
    {
      name: 'capitalize',

      transform: (value: string) => {
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
    }
  ],

  hooks: {
    init: (api: PluginAPI) => {
      api.registerHelper(
        'formatDate',
        (date: Date) => date.toLocaleDateString()
      );
    }
  }
};

export default MyPlugin;
```

---

# Plugin Components

## Directives

Custom directives add new behavior to elements.

```javascript
{
  name: 'focus',
  priority: 10,

  transform: (node, context) => {
    // Transform the AST node before rendering.
    return node;
  },

  render: (el, binding) => {
    // Render logic.
    el.focus();
  },

  validate: (node, context) => {
    // Validate directive usage.
    return [];
  },

  description: 'Focuses the element',
  example: '<input v-focus />'
}
```

---

## Filters

Custom filters transform data in templates.

```javascript
{
  name: 'markdown',

  transform: (value) => {
    return marked(value);
  },

  description: 'Converts Markdown to HTML',
  example: '{{ content | markdown }}'
}
```

---

## Components

Custom components can be registered with the plugin system.

```javascript
{
  name: 'Chart',
  component: ChartComponent,
  description: 'Data visualization component'
}
```

---

## Transforms

AST transforms modify the compilation process.

```javascript
{
  name: 'auto-import',
  priority: 5,

  transform: (ast) => {
    // Modify the AST.
    return ast;
  },

  nodeTypes: ['Element']
}
```

---

## Helpers

Helpers provide reusable utility functions.

```javascript
{
  helpers: {
    formatDate: (date) => date.toLocaleDateString(),
    sum: (a, b) => a + b,
    uuid: () => crypto.randomUUID()
  }
}
```

---

# Lifecycle Hooks

| Hook            | When It Runs                | Parameters        |
| --------------- | --------------------------- | ----------------- |
| `init`          | Plugin is first loaded      | `api: PluginAPI`  |
| `destroy`       | Plugin is removed           | `()`              |
| `beforeCompile` | Before template compilation | `ast, context`    |
| `afterCompile`  | After template compilation  | `code, context`   |
| `beforeRender`  | Before DOM rendering        | `state, context`  |
| `afterRender`   | After DOM rendering         | `dom, context`    |
| `transformNode` | For each AST node           | `node, context`   |
| `complete`      | Compilation is complete     | `result, context` |

## Example: Using Hooks

```javascript
const MyPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  hooks: {
    init: (api) => {
      console.log('Plugin initialized');
    },

    beforeCompile: (ast, context) => {
      console.log('Before compilation:', context.file);

      // Modify AST.
      return ast;
    },

    afterCompile: (code, context) => {
      console.log('After compilation:', context.file);

      // Modify generated code.
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
    }
  }
};
```

---

# Plugin API

The `PluginAPI` provides methods for interacting with the plugin system.

## API Methods

| Method                         | Description                       |
| ------------------------------ | --------------------------------- |
| `registerDirective(directive)` | Register a custom directive.      |
| `registerFilter(filter)`       | Register a custom filter.         |
| `registerComponent(component)` | Register a custom component.      |
| `registerHelper(name, value)`  | Register a helper.                |
| `registerHook(name, handler)`  | Register a lifecycle hook.        |
| `getConfig(key)`               | Get plugin configuration.         |
| `setConfig(key, value)`        | Set plugin configuration.         |
| `hasDirective(name)`           | Check whether a directive exists. |
| `hasFilter(name)`              | Check whether a filter exists.    |
| `hasComponent(name)`           | Check whether a component exists. |
| `log(message, level)`          | Log a message.                    |

## Example: Using the API

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
        }
      });

      api.registerFilter({
        name: 'truncate',

        transform: (value, length) => {
          return value.length > length
            ? value.slice(0, length) + '...'
            : value;
        }
      });

      api.registerHelper(
        'random',
        () => Math.random()
      );

      api.registerHook(
        'afterCompile',
        (code) => code + '// Plugin processed'
      );

      const prefix = api.getConfig(
        'prefix',
        'default'
      );

      api.log(
        `Plugin configured with prefix: ${prefix}`,
        'info'
      );
    }
  },

  config: {
    schema: {
      prefix: {
        type: 'string',
        default: 'default'
      },

      enabled: {
        type: 'boolean',
        default: true
      }
    },

    defaults: {
      prefix: 'my-plugin',
      enabled: true
    }
  }
};
```

---

# Using Plugins

## With CDN

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.teloce.dev/teloce.min.js"></script>
  <script src="https://cdn.teloce.dev/plugins/markdown.min.js"></script>
</head>

<body>
  <div id="app">
    <div>{{ content | markdown }}</div>
  </div>

  <script>
    teloce.use(MarkdownPlugin);

    teloce.createApp('#app', {
      content: '# Hello World\n\nThis is **Markdown**!'
    });
  </script>
</body>
</html>
```

---

## With npm

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
  content: '# Hello World'
});
```

---

## With Vite or Rollup

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import teloce from '@teloce/vite-plugin';

export default defineConfig({
  plugins: [
    teloce({
      plugins: [
        '@teloce/plugin-markdown',
        '@teloce/plugin-forms'
      ]
    })
  ]
});
```

---

## Programmatic Usage

```javascript
import { createPluginSystem } from '@teloce/plugin-system';
import myPlugin from './my-plugin';

const system = createPluginSystem({
  debug: true,
  plugins: [myPlugin]
});

// Initialize the plugin system.
await system.init();

// Access the plugin API.
const api = system.getAPI();

console.log(api.getHelpers().hello());
```

---

# Built-in Plugins

## Markdown Plugin

Adds a `|markdown` filter and `v-markdown` directive.

```javascript
import markdownPlugin from '@teloce/plugin-markdown';

teloce.use(markdownPlugin);
```

Use it in templates:

```html
{{ content | markdown }}

<div v-markdown="content"></div>
```

---

## Forms Plugin

Adds form validation directives.

```javascript
import formsPlugin from '@teloce/plugin-forms';

teloce.use(formsPlugin);
```

Use it in templates:

```html
<input v-validate="'required|email'" />

<span v-show="errors.email">
  {{ errors.email }}
</span>
```

---

## Charts Plugin

Adds data visualization components.

```javascript
import chartsPlugin from '@teloce/plugin-charts';

teloce.use(chartsPlugin);
```

Use it in templates:

```html
<Chart type="bar" :data="salesData" />

<Chart type="line" :data="trendData" />
```

---

# Publishing Plugins

## Package Structure

```text
my-teloce-plugin/
├── src/
│   └── index.js
├── package.json
├── README.md
└── LICENSE
```

## `package.json`

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
    "build": "tsup"
  },
  "peerDependencies": {
    "teloce": "^0.1.0"
  },
  "keywords": [
    "teloce",
    "plugin"
  ],
  "license": "MIT"
}
```

## Publishing to npm

Build the plugin:

```bash
pnpm build
```

Publish it:

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
      }
    }
  ],

  directives: [
    {
      name: 'markdown',

      render: (el, binding) => {
        el.innerHTML = marked(binding.value);
      }
    }
  ],

  hooks: {
    init: (api) => {
      api.registerHelper(
        'markdown',
        (value) => marked(value)
      );
    }
  }
};
```

---

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

          // Show or hide the error.
        });
      }
    }
  ],

  helpers: {
    validators: {
      required: (value) =>
        value && value.trim().length > 0,

      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),

      minLength: (value, min) =>
        value.length >= min,

      maxLength: (value, max) =>
        value.length <= max
    }
  }
};
```

---

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
          `opacity ${duration}ms`;

        el.style.opacity = '0';

        requestAnimationFrame(() => {
          el.style.opacity = '1';
        });
      }
    },

    {
      name: 'slide',

      render: (el, binding) => {
        const duration = binding.value || 300;

        el.style.transition =
          `transform ${duration}ms, height ${duration}ms`;

        el.style.transform = 'translateY(-100%)';
        el.style.height = '0';

        requestAnimationFrame(() => {
          el.style.transform = 'translateY(0)';
          el.style.height = `${el.scrollHeight}px`;
        });
      }
    }
  ],

  helpers: {
    animations: {
      fadeIn: (el, duration = 300) => {
        el.style.transition =
          `opacity ${duration}ms`;

        el.style.opacity = '1';
      },

      fadeOut: (el, duration = 300) => {
        el.style.transition =
          `opacity ${duration}ms`;

        el.style.opacity = '0';
      }
    }
  }
};
```

---

# Troubleshooting

## Plugin Not Found

```text
Error: Plugin "my-plugin" not found
```

Make sure the plugin is installed and registered:

```bash
npm install @teloce/plugin-my-plugin
```

```javascript
import myPlugin from '@teloce/plugin-my-plugin';

teloce.use(myPlugin);
```

---

## Version Mismatch

```text
Error: Plugin "my-plugin" requires teloce@^0.1.0
```

Update Teloce or the plugin to compatible versions:

```bash
npm update teloce @teloce/plugin-my-plugin
```

---

## Duplicate Plugin

```text
Error: Plugin "my-plugin" is already registered
```

Check whether the plugin is already registered.

If duplicate plugins are intentionally allowed, enable them explicitly:

```javascript
const system = createPluginSystem({
  registry: {
    allowDuplicates: true
  }
});
```

---

# License

MIT

---

# Links

* [Teloce Website](https://telonce-website.vercel.app/#/)