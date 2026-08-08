# Single File Components (`.vel`)

Single File Components (SFCs) provide a structured way to keep a component's **template, logic, and styles** together in a single `.vel` file.

```text
Component.vel
│
├── <template>   → UI
├── <script>     → Logic
└── <style>      → Styles
```

This makes `.vel` files especially useful for larger applications where components need to remain isolated, reusable, and easy to maintain.

---

## What Is a `.vel` File?

A `.vel` file contains the three main layers of a component:

| Section          | Responsibility                              |
| :--------------- | :------------------------------------------ |
| `<template>`     | Component markup and Teloce directives      |
| `<script>`       | State, props, methods, lifecycle, and logic |
| `<style>`        | Component styling                           |
| `<style scoped>` | Automatically scoped component styling      |

### Complete Example

```html
<!-- MyComponent.vel -->

<template>
    <div class="component">
        <h2>{{ title }}</h2>

        <p>{{ message }}</p>

        <button @click="handleClick">
            Click Me
        </button>
    </div>
</template>

<script>
export default {
    name: 'MyComponent',

    data() {
        return {
            title: 'Hello World',
            message: 'This is a SFC'
        };
    },

    methods: {
        handleClick() {
            this.message = 'Clicked!';
        }
    }
};
</script>

<style scoped>
.component {
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
}

h2 {
    color: blue;
}
</style>
```

---

## Sections

### `<template>`

The `<template>` section defines the component's UI.

```html
<template>
    <div class="card">
        <h2>{{ title }}</h2>

        <p>{{ content }}</p>

        <slot></slot>
    </div>
</template>
```

Templates can use the full Teloce template system, including:

* Interpolation
* Components
* Events
* Directives
* Loops
* Conditions
* Slots
* Reactive state

---

### `<script>`

The `<script>` section contains the component's behavior.

```html
<script>
export default {
    name: 'Card',

    props: {
        title: String,
        content: String
    },

    data() {
        return {
            isExpanded: true
        };
    },

    methods: {
        toggle() {
            this.isExpanded = !this.isExpanded;
        }
    }
};
</script>
```

This is where you define:

* Component state
* Props
* Methods
* Computed values
* Lifecycle hooks
* Event handling
* Async operations

---

### `<style>`

The `<style>` section contains component CSS.

```html
<style>
.card {
    padding: 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}
</style>
```

You can also scope styles to the component:

```html
<style scoped>
.card {
    padding: 20px;
}
</style>
```

---

# Scoped CSS

Scoped styles prevent component styles from unintentionally affecting unrelated elements.

```html
<style scoped>
.card {
    padding: 20px;
}
</style>
```

Teloce can compile this into an internally scoped selector similar to:

```css
.card[data-v-abc123] {
    padding: 20px;
}
```

The exact generated scope identifier may differ between builds.

### Deep Selectors

Use `::deep()` when you intentionally need to target content inside child components.

```css
::deep(.child-class) {
    color: red;
}
```

> Use deep selectors carefully because they intentionally cross the component's style boundary.

---

# Using `.vel` Files

## With Vite

The recommended development workflow is to use the Teloce Vite integration.

```javascript
// vite.config.js

import teloce from '@teloce/vite-plugin';

export default {
    plugins: [
        teloce()
    ]
};
```

Then import components normally:

```javascript
import MyComponent from './components/MyComponent.vel';

const app = teloce.createApp('#app', {
    components: {
        MyComponent
    }
});
```

Your project can then use:

```text
src/
├── components/
│   ├── Navbar.vel
│   ├── UserCard.vel
│   └── Dashboard.vel
│
├── App.vel
└── main.js
```

---

## With the Teloce CLI

For projects using the Teloce CLI:

```bash
teloce build
```

The compiler processes `.vel` files and prepares them for production.

A typical production flow is:

```text
.vel source
    ↓
Teloce compiler
    ↓
JavaScript + CSS
    ↓
Bundler
    ↓
Optimized assets
    ↓
Production server
```

---

## With CDN

`.vel` files are normally compiled before deployment when using the CDN build.

For example:

```html
<script src="/components/MyComponent.js"></script>
```

The browser receives the compiled JavaScript rather than needing to understand the `.vel` source format.

This makes CDN deployment suitable for applications where the build step happens during CI/CD.

---

# Production Usage

SFCs are designed to work well in production applications.

A typical production architecture might look like:

```text
                    Teloce Application
                           │
                           ▼
                    ┌─────────────┐
                    │  Components │
                    └──────┬──────┘
                           │
                ┌──────────┼──────────┐
                ▼          ▼          ▼
             Navbar      Cards      Forms
              .vel        .vel       .vel
                │          │          │
                └──────────┼──────────┘
                           ▼
                    Teloce Compiler
                           │
                           ▼
                     Production JS
                           │
                           ▼
                       Browser
```

### Recommended Production Workflow

```text
Development
    │
    ▼
Write .vel components
    │
    ▼
Run development server
    │
    ▼
Test application
    │
    ▼
teloce build
    │
    ▼
Optimize / bundle
    │
    ▼
Deploy static assets
```

### Production Benefits

Using `.vel` components gives you:

* **Component isolation**
* **Scoped styling**
* **Reusable UI**
* **Cleaner project structure**
* **Build-time optimization**
* **Better maintainability**
* **Easy team collaboration**

---

# SFC Compilation

## Vite

```javascript
// vite.config.js

import teloce from '@teloce/vite-plugin';

export default {
    plugins: [
        teloce()
    ]
};
```

Vite can process `.vel` files during development and production builds.

---

## CLI

```bash
teloce build
```

The CLI can compile the application's SFC files as part of the production build.

---

## Webpack

If your application uses Webpack, configure the `.vel` loader:

```javascript
// webpack.config.js

module.exports = {
    module: {
        rules: [
            {
                test: /\.vel$/,
                use: '@teloce/webpack-loader'
            }
        ]
    }
};
```

---

# Example Components

## Counter

```html
<!-- Counter.vel -->

<template>
    <div class="counter">
        <h2>{{ title }}</h2>

        <p>
            Count: {{ count }}
        </p>

        <button @click="increment">
            +
        </button>

        <button @click="decrement">
            -
        </button>
    </div>
</template>

<script>
export default {
    name: 'Counter',

    data() {
        return {
            title: 'Counter',
            count: 0
        };
    },

    methods: {
        increment() {
            this.count++;
        },

        decrement() {
            if (this.count > 0) {
                this.count--;
            }
        }
    }
};
</script>

<style scoped>
.counter {
    padding: 20px;
    border-radius: 12px;
}

button {
    padding: 8px 16px;
    margin: 0 4px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
</style>
```

---

## Todo Item

```html
<!-- TodoItem.vel -->

<template>
    <div
        class="todo-item"
        :class="{ done: todo.done }"
    >
        <input
            type="checkbox"
            :checked="todo.done"
            @change="toggle"
        />

        <span>
            {{ todo.text }}
        </span>

        <button @click="$emit('delete')">
            ✕
        </button>
    </div>
</template>

<script>
export default {
    name: 'TodoItem',

    props: {
        todo: {
            type: Object,
            required: true
        }
    },

    methods: {
        toggle() {
            this.$emit('toggle', this.todo.id);
        }
    }
};
</script>

<style scoped>
.todo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 4px;
}

.todo-item.done span {
    text-decoration: line-through;
    opacity: .6;
}

.todo-item button {
    background: none;
    border: none;
    cursor: pointer;
}
</style>
```

---

# Organizing SFCs

For larger applications, organize components by responsibility.

```text
src/
│
├── components/
│   ├── common/
│   │   ├── Button.vel
│   │   ├── Modal.vel
│   │   └── Card.vel
│   │
│   ├── layout/
│   │   ├── Navbar.vel
│   │   ├── Sidebar.vel
│   │   └── Footer.vel
│   │
│   └── dashboard/
│       ├── StatsCard.vel
│       ├── ActivityList.vel
│       └── Chart.vel
│
├── pages/
│   ├── Home.vel
│   ├── Dashboard.vel
│   └── Settings.vel
│
├── App.vel
└── main.js
```

This structure scales from small applications to larger production projects.

---

# Best Practices

### 1. Keep Components Focused

A component should generally have one clear responsibility.

```text
❌ Dashboard.vel
   ├── navigation
   ├── authentication
   ├── charts
   ├── forms
   └── API logic

✅ Dashboard.vel
   └── dashboard layout

   StatsCard.vel
   └── statistics

   Chart.vel
   └── chart visualization
```

---

### 2. Use Scoped CSS

Prefer:

```html
<style scoped>
.card {
    padding: 20px;
}
</style>
```

when component-specific styling should not leak outside the component.

---

### 3. Validate Props

Define expected prop types whenever possible.

```javascript
props: {
    title: {
        type: String,
        required: true
    },

    count: {
        type: Number,
        default: 0
    }
}
```

---

### 4. Use Components for Repeated UI

Instead of duplicating:

```html
<div class="card">...</div>
<div class="card">...</div>
<div class="card">...</div>
```

create:

```text
Card.vel
```

and reuse:

```html
<Card />
<Card />
<Card />
```

---

### 5. Keep Business Logic Separate

Components should coordinate UI behavior rather than becoming massive containers for unrelated application logic.

For larger applications, move reusable logic into services, composables, or dedicated modules.

---

# When Should You Use `.vel`?

Use Single File Components when a component contains enough UI, behavior, or styling to benefit from being isolated into its own file.

### Good Use Cases

* Reusable UI components
* Components with their own styles
* Components with local state and methods
* Large applications with many components
* Teams working on separate UI features
* Applications that use a build pipeline
* Components that need scoped CSS

### When a `.vel` File May Be Unnecessary

For very small applications or simple pages, inline templates may be enough.

For example:

```javascript
const app = teloce.createApp('#app', {
    message: 'Hello World'
});
```

You do not need to create a `.vel` file for every piece of markup.

A useful rule is:

> **Use `.vel` when a piece of UI becomes a reusable or independently maintained component.**

---

# `.vel` at a Glance

```text
                    Component.vel
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
        <template>    <script>     <style>
             │           │           │
             ▼           ▼           ▼
             UI        Logic       CSS
             │           │           │
             └───────────┼───────────┘
                         ▼
                  Teloce Compiler
                         │
                         ▼
               JavaScript + CSS
                         │
                         ▼
                     Browser
```

| Feature          | Purpose                                    |
| :--------------- | :----------------------------------------- |
| `<template>`     | Defines the component UI                   |
| `<script>`       | Defines state, props, methods, and logic   |
| `<style>`        | Defines component styles                   |
| `<style scoped>` | Limits styles to the component             |
| Vite             | Development and production integration     |
| CLI              | Build `.vel` files from the command line   |
| Webpack          | Integrate `.vel` files into Webpack builds |

---

# Next Steps

* [Components](components.md) — Learn the component system.
* [Reactivity](reactivity.md) — Understand reactive state and signals.
* [Directives](directives.md) — Connect templates to state and events.
* [Templates](templates.md) — Learn the Teloce template syntax.
* [Python Guide](python.md) — Use Teloce with Python backends.
* [Examples](../examples/) — Explore complete Teloce applications.

---

## Build Once. Compose Everywhere.

`.vel` brings **template + logic + styling** into one component format while remaining compatible with a modern production build pipeline.

**⚡ One file. One component. One place to build.**
