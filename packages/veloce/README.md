# Teloce

> A TypeScript template engine for Python web developers.

---

## What is Teloce?

Teloce is a modern, production-grade JavaScript template engine built with TypeScript and designed specifically for Python web developers using Flask, Django, FastAPI, and other Python frameworks.

It provides fine-grained reactivity, template directives, keyed loops, two-way bindings, and a developer-friendly debugging experience without requiring a complex frontend build setup.

---

## Installation

### CDN

The CDN is recommended for most Python projects because it requires no build step.

```html
<script src="https://cdn.teloce.dev/teloce.min.js"></script>
```

### ESM

For modern browsers using JavaScript modules:

```html
<script type="module">
  import { createApp } from 'https://cdn.teloce.dev/teloce.esm.js';

  // ...
</script>
```

### npm

Install Teloce through npm:

```bash
npm install teloce
```

Then import the APIs you need:

```javascript
import {
  createApp,
  createSignal,
} from 'teloce';
```

---

## Quick Start

### CDN Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teloce Example</title>

  <script src="https://cdn.teloce.dev/teloce.min.js"></script>
</head>

<body>
  <div id="app">
    <h1>Hello {{ name }}</h1>

    <button @click="count++">
      Count: {{ count }}
    </button>
  </div>

  <script>
    const app = teloce.createApp('#app', {
      name: 'Python Developer',
      count: 0,
    });
  </script>
</body>
</html>
```

---

## Flask / Jinja Integration

Teloce can be used inside existing Flask/Jinja templates.

```html
<div id="app">
  <h1>Hello {{ user.name }}</h1>

  <ul>
    <for key="id" item="product" in="products">
      <li>{{ product.name }}</li>
    </for>
  </ul>
</div>

<script>
  teloce.createApp('#app', {
    user: {{ user|tojson }},
    products: {{ products|tojson }},
  });
</script>
```

> **Note:** Both Jinja and Teloce use `{{ }}` interpolation syntax. When integrating the two systems, make sure server-side Jinja expressions are rendered before Teloce processes the template.

---

## Features

* **Signals-Based Reactivity** — Fine-grained updates without requiring a Virtual DOM.
* **Keyed Loops** — Efficient list rendering with DOM node reuse.
* **Human-Friendly Debugger** — Translates cryptic JavaScript errors into plain-English explanations.
* **No Build Tools Required** — Start with a single `<script>` tag.
* **Jinja/JinjaX Compatible** — Designed to work alongside existing Python templates.
* **Modular Architecture** — Distributed across multiple npm packages so you can install only what you need.
* **TypeScript-Based** — Written with TypeScript for a typed and maintainable development experience.
* **Python-Friendly** — Designed around workflows familiar to Flask, Django, FastAPI, and similar frameworks.

---

## API Reference

### `createApp`

Creates a new Teloce application.

```javascript
const app = teloce.createApp('#app', {
  name: 'John',
  count: 0,
});
```

---

### `createSignal`

Creates a reactive signal.

```javascript
const [count, setCount] = teloce.createSignal(0);
```

Read the signal:

```javascript
console.log(count());
```

Update the signal:

```javascript
setCount(10);
```

---

### `createEffect`

Creates an effect that runs whenever its dependencies change.

```javascript
teloce.createEffect(() => {
  console.log('Count changed:', count());
});
```

---

### `createComputed`

Creates a computed value derived from reactive state.

```javascript
const double = teloce.createComputed(() => count() * 2);

console.log(double());
```

---

## Directives

### For Loop

Render a collection using a keyed loop:

```html
<for key="id" item="product" in="products">
  <li>{{ product.name }}</li>
</for>
```

The `key` attribute allows Teloce to efficiently reuse and move existing DOM nodes when the collection changes.

---

### If Condition

Render content conditionally:

```html
<if loggedIn>
  <h1>Welcome back!</h1>

  <else>
    <button>Login</button>
  </else>
</if>
```

---

### Event Handling

Attach event handlers with `@` directives:

```html
<button @click="handleClick()">
  Click Me
</button>
```

You can also use expressions:

```html
<button @click="count++">
  Count: {{ count }}
</button>
```

---

### Two-Way Binding

Bind form controls to reactive state:

```html
<input :model="username">

<h2>
  Hello {{ username }}
</h2>
```

Changes to the input update the associated state, and state changes update the input.

---

## Template Syntax

Teloce supports several core template features:

| Syntax        | Purpose                         |
| ------------- | ------------------------------- |
| `{{ value }}` | Interpolation                   |
| `<for>`       | Keyed loops                     |
| `<if>`        | Conditional rendering           |
| `<else>`      | Alternative conditional content |
| `@click`      | Event handling                  |
| `:model`      | Two-way binding                 |
| `:class`      | Dynamic classes                 |
| `:style`      | Dynamic styles                  |

---

## Python Framework Integration

Teloce is designed to complement Python backend frameworks rather than replace them.

Typical integrations include:

* **Flask**
* **Django**
* **FastAPI**
* **Quart**
* **Flaxon**
* Other Python web frameworks capable of serving HTML and static assets.

The Python framework remains responsible for server-side routing, APIs, authentication, databases, and business logic, while Teloce handles reactive client-side templates and interactions.

---

## License

MIT
