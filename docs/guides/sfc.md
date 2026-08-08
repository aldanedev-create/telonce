# Single File Components (`.vel`)

<div class="vel-hero">
  <div class="vel-glow vel-glow-a"></div>
  <div class="vel-glow vel-glow-b"></div>

  <div class="vel-file">
    <div class="vel-file-top">
      <span class="vel-dot"></span>
      <span class="vel-dot"></span>
      <span class="vel-dot"></span>
      <code>MyComponent.vel</code>
    </div>

```
<div class="vel-code">
  <span>&lt;<b>template</b>&gt;</span>
  <span class="indent">&lt;div&gt;{{ message }}&lt;/div&gt;</span>
  <span>&lt;/<b>template</b>&gt;</span>
  <br>
  <span>&lt;<b>script</b>&gt;</span>
  <span class="indent">export default { data() { ... } }</span>
  <span>&lt;/<b>script</b>&gt;</span>
  <br>
  <span>&lt;<b>style</b> scoped&gt;</span>
  <span class="indent">.component { ... }</span>
  <span>&lt;/<b>style</b>&gt;</span>
</div>
```

  </div>

  <div class="vel-hero-content">
    <div class="vel-badge">⚡ Teloce SFC</div>

```
<h1>One File.<br>One Component.</h1>

<p>
  Build complete Teloce components with their
  template, logic, and styles together in a
  single <code>.vel</code> file.
</p>
```

  </div>
</div>

<style>
.vel-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  min-height: 520px;
  margin: 20px 0 50px;
  padding: 55px 30px;
  border-radius: 26px;
  background:
    radial-gradient(circle at 75% 25%, rgba(56,189,248,.14), transparent 35%),
    radial-gradient(circle at 20% 80%, rgba(168,85,247,.12), transparent 35%),
    linear-gradient(135deg, #0f172a, #111827);
  border: 1px solid rgba(255,255,255,.08);
}

.vel-hero-content {
  position: relative;
  z-index: 4;
  max-width: 700px;
  margin: 180px auto 0;
  text-align: center;
  animation: velHeroIn .9s ease-out both;
}

.vel-badge {
  display: inline-block;
  padding: 7px 15px;
  margin-bottom: 18px;
  border-radius: 999px;
  border: 1px solid rgba(56,189,248,.3);
  background: rgba(56,189,248,.08);
  animation: velBadgePulse 3s ease-in-out infinite;
}

.vel-hero h1 {
  margin: 0;
  font-size: clamp(2.4rem, 7vw, 4.4rem);
  line-height: 1;
  letter-spacing: -2px;
}

.vel-hero p {
  max-width: 650px;
  margin: 20px auto 0;
  opacity: .7;
  font-size: 1.05rem;
}

.vel-file {
  position: absolute;
  z-index: 3;
  top: 35px;
  left: 50%;
  width: min(520px, 82%);
  transform: translateX(-50%) perspective(900px) rotateX(8deg) rotateY(-7deg);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(15,23,42,.88);
  border: 1px solid rgba(56,189,248,.22);
  box-shadow:
    0 30px 80px rgba(0,0,0,.45),
    0 0 60px rgba(56,189,248,.08);
  animation: velFileFloat 5s ease-in-out infinite;
}

.vel-file-top {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 14px;
  background: rgba(255,255,255,.035);
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.vel-file-top code {
  margin-left: 8px;
  opacity: .7;
}

.vel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  opacity: .7;
}

.vel-code {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 20px;
  font-family: monospace;
  font-size: .8rem;
  line-height: 1.5;
  opacity: .85;
}

.vel-code b {
  opacity: 1;
}

.vel-code .indent {
  padding-left: 20px;
  opacity: .65;
}

.vel-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: .18;
  pointer-events: none;
}

.vel-glow-a {
  width: 220px;
  height: 220px;
  left: 10%;
  bottom: 5%;
  background: #38bdf8;
  animation: velGlowA 8s ease-in-out infinite;
}

.vel-glow-b {
  width: 180px;
  height: 180px;
  right: 5%;
  top: 35%;
  background: #a855f7;
  animation: velGlowB 9s ease-in-out infinite;
}

@keyframes velHeroIn {
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes velFileFloat {
  0%, 100% {
    transform:
      translateX(-50%)
      perspective(900px)
      rotateX(8deg)
      rotateY(-7deg)
      translateY(0);
  }

  50% {
    transform:
      translateX(-50%)
      perspective(900px)
      rotateX(8deg)
      rotateY(-7deg)
      translateY(-10px);
  }
}

@keyframes velBadgePulse {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes velGlowA {
  50% {
    transform: translate(100px, -50px) scale(1.2);
  }
}

@keyframes velGlowB {
  50% {
    transform: translate(-80px, 70px) scale(.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .vel-hero-content,
  .vel-file,
  .vel-badge,
  .vel-glow {
    animation: none;
  }
}
</style>

Single File Components give you a structured way to keep everything required by a component together.

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
| ---------------- | ------------------------------------------- |
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

<div class="vel-pipeline">

<div class="vel-pipeline-card">
  <span>01</span>
  <strong>Write</strong>
  <small>Component.vel</small>
</div>

<div class="vel-pipeline-arrow">→</div>

<div class="vel-pipeline-card">
  <span>02</span>
  <strong>Compile</strong>
  <small>Teloce compiler</small>
</div>

<div class="vel-pipeline-arrow">→</div>

<div class="vel-pipeline-card">
  <span>03</span>
  <strong>Bundle</strong>
  <small>JavaScript + CSS</small>
</div>

<div class="vel-pipeline-arrow">→</div>

<div class="vel-pipeline-card">
  <span>04</span>
  <strong>Deploy</strong>
  <small>Production</small>
</div>

</div>

<style>
.vel-pipeline {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 35px 0;
}

.vel-pipeline-card {
  min-width: 125px;
  padding: 18px;
  text-align: center;
  border-radius: 15px;
  border: 1px solid rgba(56,189,248,.16);
  background: rgba(56,189,248,.035);
  transition:
    transform .3s ease,
    border-color .3s ease;
}

.vel-pipeline-card:hover {
  transform: translateY(-7px);
  border-color: rgba(56,189,248,.4);
}

.vel-pipeline-card span,
.vel-pipeline-card strong,
.vel-pipeline-card small {
  display: block;
}

.vel-pipeline-card span {
  opacity: .4;
  font-size: .7rem;
}

.vel-pipeline-card strong {
  margin: 5px 0;
}

.vel-pipeline-card small {
  opacity: .55;
}

.vel-pipeline-arrow {
  opacity: .45;
  animation: velPipelineArrow 1.5s ease-in-out infinite;
}

@keyframes velPipelineArrow {
  50% {
    transform: translateX(5px);
    opacity: 1;
  }
}
</style>

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

You can also scope styles to the component.

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

<div class="vel-choice-grid">

<div class="vel-choice-card">
  <div class="choice-icon">📦</div>
  <strong>Small App</strong>
  <p>Optional, but useful when components begin growing.</p>
</div>

<div class="vel-choice-card">
  <div class="choice-icon">🏗️</div>
  <strong>Medium App</strong>
  <p>Recommended for reusable component architecture.</p>
</div>

<div class="vel-choice-card">
  <div class="choice-icon">🚀</div>
  <strong>Production App</strong>
  <p>Ideal for structured, scalable component systems.</p>
</div>

<div class="vel-choice-card">
  <div class="choice-icon">🧩</div>
  <strong>Component Library</strong>
  <p>Excellent for reusable UI packages.</p>
</div>

</div>

<style>
.vel-choice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin: 30px 0;
}

.vel-choice-card {
  padding: 22px;
  border-radius: 17px;
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  transition:
    transform .3s ease,
    border-color .3s ease;
}

.vel-choice-card:hover {
  transform: translateY(-7px);
  border-color: rgba(56,189,248,.35);
}

.choice-icon {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.vel-choice-card strong {
  display: block;
}

.vel-choice-card p {
  margin: 7px 0 0;
  opacity: .6;
  font-size: .9rem;
}
</style>

---

# `.vel` at a Glance

<div class="vel-summary">

<div>
<strong>Template</strong>
<code>&lt;template&gt;</code>
<span>Build your UI</span>
</div>

<div>
<strong>Logic</strong>
<code>&lt;script&gt;</code>
<span>Control behavior</span>
</div>

<div>
<strong>Styles</strong>
<code>&lt;style&gt;</code>
<span>Design the component</span>
</div>

<div>
<strong>Build</strong>
<code>teloce build</code>
<span>Ship to production</span>
</div>

</div>

<style>
.vel-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin: 30px 0;
}

.vel-summary > div {
  padding: 20px;
  text-align: center;
  border-radius: 15px;
  border: 1px solid rgba(56,189,248,.12);
  background: rgba(56,189,248,.025);
  transition: transform .3s ease;
}

.vel-summary > div:hover {
  transform: translateY(-5px);
}

.vel-summary strong,
.vel-summary code,
.vel-summary span {
  display: block;
}

.vel-summary code {
  margin: 8px 0;
}

.vel-summary span {
  opacity: .55;
  font-size: .8rem;
}
</style>

---

## Next Steps

<div class="vel-next">

<a href="/guides/cheatsheet" class="vel-next-card">
  <strong>📋 Cheatsheet</strong>
  <span>Quickly reference Teloce syntax and APIs.</span>
</a>

<a href="/guides/python-guide" class="vel-next-card">
  <strong>🐍 Python Guide</strong>
  <span>Use Teloce with Flask, Django, FastAPI, and other Python backends.</span>
</a>

<a href="/contributing" class="vel-next-card">
  <strong>🛠️ Contributing</strong>
  <span>Build components and extend the Teloce ecosystem.</span>
</a>

</div>

<style>
.vel-next {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-top: 30px;
}

.vel-next-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  border-radius: 17px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.025);
  text-decoration: none;
  transition:
    transform .3s ease,
    border-color .3s ease,
    box-shadow .3s ease;
}

.vel-next-card:hover {
  transform: translateY(-7px);
  border-color: rgba(56,189,248,.35);
  box-shadow: 0 15px 40px rgba(0,0,0,.2);
}

.vel-next-card span {
  opacity: .6;
  font-size: .9rem;
}
</style>

---

<div class="vel-footer">

### Build once. Compose everywhere.

`.vel` brings **template + logic + styling** into one component format while remaining compatible with a modern production build pipeline.

</div>

<style>
.vel-footer {
  margin-top: 50px;
  padding: 45px 25px;
  text-align: center;
  border-radius: 22px;
  border: 1px solid rgba(56,189,248,.14);
  background:
    radial-gradient(
      circle,
      rgba(56,189,248,.1),
      transparent 65%
    ),
    rgba(255,255,255,.02);
  animation: velFooterGlow 4s ease-in-out infinite;
}

@keyframes velFooterGlow {
  0%, 100% {
    box-shadow: 0 0 0 rgba(56,189,248,0);
  }

  50% {
    box-shadow: 0 0 45px rgba(56,189,248,.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .vel-footer {
    animation: none;
  }
}
</style>
