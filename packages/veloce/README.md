# Teloce



<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo "
   width="200"/>
</p>


**Author:** Aldane Hutchinson

A JavaScript template engine for Python web developers.

* [Teloce Website](https://telonce-website.vercel.app/#/)

---

## Table of Contents

* [What Is Teloce?](#what-is-teloce)
* [Key Features](#key-features)
* [Python Framework Compatibility](#python-framework-compatibility)
* [Jinja & JinjaX Compatibility](#jinja--jinjax-compatibility)

  * [Jinja Compatibility](#jinja-compatibility)
  * [JinjaX Compatibility](#jinjax-compatibility)
  * [Using Jinja and JinjaX Together](#using-jinja-and-jinjax-together)
  * [Jinja Filters](#jinja-filters)
  * [Keyed Loops](#keyed-loops)
* [Why Teloce Works with Jinja and JinjaX](#why-teloce-works-with-jinja-and-jinjax)
* [Quick Start](#quick-start)

  * [CDN — No Build Tools](#cdn--no-build-tools)
  * [Flask + Jinja](#flask--jinja)
  * [JinjaX](#jinjax)
  * [npm](#npm)
  * [CLI](#cli)
* [Plugin System](#plugin-system)

  * [What Plugins Can Do](#what-plugins-can-do)
  * [Example Plugin](#example-plugin)
* [Packages](#packages)
* [License](#license)
* [Contributing](#contributing)
* [Support](#support)

---

## What Is Teloce?

**Teloce** is a modern JavaScript template engine designed specifically for Python web developers using Flask, Django, FastAPI, Quart, Flaxon, and other Python web frameworks.

Teloce provides a reactive client-side layer while allowing the server to continue using familiar Python template engines such as Jinja and JinjaX.

The goal is simple:

> **Keep Python on the backend and add a lightweight, reactive JavaScript layer to your templates.**

---

## Key Features

* **Python-First Philosophy** — Write JavaScript without requiring TypeScript for browser usage.
* **No Node.js Required** — Use Teloce directly in the browser through a CDN.
* **Signals-Based Reactivity** — Fine-grained updates without relying on a Virtual DOM.
* **Keyed Loops** — Efficient list rendering with DOM node reuse.
* **Human-Friendly Debugger** — Makes difficult JavaScript and Teloce errors easier to understand.
* **CDN First** — Start with a single `<script>` tag and no build tools.
* **Jinja / JinjaX Compatible** — Works alongside existing Python templates.
* **Modular Packages** — Install only the functionality your project needs.
* **Plugin System** — Extend Teloce with directives, filters, components, transforms, hooks, and helpers.
* **Single File Components** — Build reusable `.vel` components with the Teloce SFC system.

---

## Python Framework Compatibility

Teloce can be used with major Python web frameworks:

| Framework   | Description                      | Integration                      |
| ----------- | -------------------------------- | -------------------------------- |
| **Flask**   | Lightweight Python web framework | `render_template()` + Teloce CDN |
| **Django**  | High-level Python web framework  | Django templates + Teloce CDN    |
| **FastAPI** | Modern Python web framework      | `Jinja2Templates` + Teloce CDN   |
| **Quart**   | Async Python web framework       | `render_template()` + Teloce CDN |
| **Flaxon**  | Python web framework             | `render_template()` + Teloce CDN |

Teloce is not tied to any particular backend framework. It only requires HTML, data, and a browser environment.

---

## Jinja & JinjaX Compatibility

### Jinja Compatibility

Teloce works directly with Jinja templates.

Python data can be safely transferred from the backend to JavaScript using Jinja's `tojson` filter.

```html
<!-- templates/index.html -->

<div id="app">
    <h1>Hello {{ user.name }}</h1>

    <ul>
        {% for product in products %}
            <li>{{ product.name }}</li>
        {% endfor %}
    </ul>
</div>

<script>
    teloce.createApp("#app", {
        user: {{ user|tojson }},
        products: {{ products|tojson }}
    });
</script>
```

### JinjaX Compatibility

Teloce can also be used inside JinjaX components.

```jinja
{# components/ProductList.jinja #}
{#def title, products #}

<div id="app">
    <h2>{{ title }}</h2>

    <ul>
        {% for product in products %}
            <li>{{ product.name }}</li>
        {% endfor %}
    </ul>
</div>

<script>
    teloce.createApp("#app", {
        title: {{ title|tojson }},
        products: {{ products|tojson }}
    });
</script>
```

### Using Jinja and JinjaX Together

Teloce does not depend on which server-side template engine generates the HTML.

It only needs:

1. HTML to render.
2. Data from the backend.
3. A Teloce runtime.
4. A call to initialize the application.

For example:

```html
<!-- templates/index.html -->

{% from 'components/ProductList.jinja' import ProductList %}

<header>
    <h1>{{ page_title }}</h1>
</header>

<main id="app">
    {{ ProductList(products=products) }}
</main>

<script>
    teloce.createApp("#app", {
        products: {{ products|tojson }},
        cart: []
    });
</script>
```

### Jinja Filters

Server-side Jinja filters can be used normally:

```html
<div id="app">
    <p>{{ product.price|currency }}</p>
    <p>{{ product.name|uppercase }}</p>
    <p>{{ date|dateFormat("YYYY-MM-DD") }}</p>
</div>
```

Client-side Teloce filters can also be provided through the plugin system.

### Keyed Loops

Teloce supports keyed loops for efficient client-side rendering:

```html
<ul>
    <for key="id" item="product" in="products">
        <li>{{ product.name }}</li>
    </for>
</ul>
```

Keys allow Teloce to identify existing DOM nodes and reuse them when lists change.

---

## Why Teloce Works with Jinja and JinjaX

| Feature                     | Jinja       | JinjaX         | Teloce              |
| --------------------------- | ----------- | -------------- | ------------------- |
| **Renders HTML**            | ✅           | ✅              | ✅                   |
| **Passes Data**             | `{{ var }}` | `{#def var #}` | `{{ var\|tojson }}` |
| **Reactivity**              | ❌           | ❌              | ✅ Signals           |
| **Event Handling**          | ❌           | ❌              | ✅ `@click`          |
| **Two-Way Binding**         | ❌           | ❌              | ✅ `:model`          |
| **Keyed Loops**             | ❌           | ❌              | ✅ `<for key="id">`  |
| **Human-Friendly Debugger** | ❌           | ❌              | ✅                   |

### The Key Idea

Teloce focuses on the **client-side JavaScript layer**.

The server can generate HTML using:

* Jinja
* JinjaX
* Flask
* Django
* FastAPI
* Quart
* Flaxon
* Static HTML
* Another Python template system

The server generates the initial HTML and data, while Teloce provides client-side reactivity, events, bindings, and interaction.

---

# Quick Start

## CDN — No Build Tools

Add the Teloce runtime to your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@latest/dist/teloce.global.min.js"></script>

<div id="app">
    <h1>Hello {{ name }}</h1>

    <button @click="count++">
        {{ count }}
    </button>
</div>

<script>
    teloce.createApp("#app", {
        name: "Python Developer",
        count: 0
    });
</script>
```

For production applications, it is recommended to pin a specific Teloce version instead of using `@latest`:

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@1.0.0/dist/teloce.global.min.js"></script>
```

---

## Flask + Jinja

### Flask Application

```python
# app.py

from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template(
        "index.html",
        user={"name": "John"},
        products=[
            {"id": 1, "name": "Product A"},
            {"id": 2, "name": "Product B"},
        ],
    )


if __name__ == "__main__":
    app.run(debug=True)
```

### Jinja Template

```html
<!-- templates/index.html -->

<script src="https://cdn.jsdelivr.net/npm/teloce@latest/dist/teloce.global.min.js"></script>

<div id="app">
    <h1>Hello {{ user.name }}</h1>

    <ul>
        <for key="id" item="product" in="products">
            <li>{{ product.name }}</li>
        </for>
    </ul>
</div>

<script>
    teloce.createApp("#app", {
        user: {{ user|tojson }},
        products: {{ products|tojson }}
    });
</script>
```

---

## JinjaX

Example JinjaX component:

```jinja
{# components/UserCard.jinja #}
{#def user #}

<div class="card">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
</div>
```

The parent template can initialize Teloce:

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@latest/dist/teloce.global.min.js"></script>

<div id="app">
    {{ UserCard(user=user) }}
</div>

<script>
    teloce.createApp("#app", {
        user: {{ user|tojson }}
    });
</script>
```

---

## npm

Install Teloce using npm:

```bash
npm install teloce
```

Then import and initialize it:

```javascript
import { createApp } from "teloce";

createApp("#app", {
    name: "Python Developer",
    count: 0
});
```

---

## CLI

Install the Teloce CLI globally:

```bash
npm install -g @teloce/cli
```

Create a new project:

```bash
teloce create my-app
```

Start the development server:

```bash
teloce dev
```

Open the debugger:

```bash
teloce debug
```

---

# Plugin System

Teloce includes a **small, technology-neutral plugin system** that allows developers to extend the template engine without modifying the core.

## What Plugins Can Do

| Feature               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| **Custom Directives** | Add directives such as `@animate` and `@validate`.    |
| **Custom Filters**    | Add filters such as `markdown` and `truncate`.        |
| **Custom Components** | Register reusable components.                         |
| **Transform Hooks**   | Modify templates or AST nodes during compilation.     |
| **Render Hooks**      | Intercept parts of the rendering lifecycle.           |
| **Helpers**           | Add utility functions for templates and applications. |

Plugins can be used to build functionality for specific applications without making the Teloce core larger.

## Example Plugin

```javascript
const MarkdownPlugin = {
    name: "markdown",
    version: "1.0.0",

    filters: [
        {
            name: "markdown",
            transform: (value) => marked(value)
        }
    ],

    directives: [
        {
            name: "markdown",
            render: (el, binding) => {
                el.innerHTML = marked(binding.value);
            }
        }
    ]
};

// Register the plugin
teloce.use(MarkdownPlugin);
```

---

# Packages

Teloce is organized into small, modular npm packages.

| Package           | npm Package             | Description                             |
| ----------------- | ----------------------- | --------------------------------------- |
| **Teloce**        | `teloce`                | Main package for CDN and npm usage      |
| **Core**          | `@teloce/core`          | Core runtime functionality              |
| **Compiler**      | `@teloce/compiler`      | Template compiler                       |
| **Reactivity**    | `@teloce/reactivity`    | Signals-based reactivity system         |
| **Runtime DOM**   | `@teloce/runtime-dom`   | Browser DOM runtime                     |
| **CLI**           | `@teloce/cli`           | Command-line interface                  |
| **Debugger**      | `@teloce/debugger`      | Human-friendly debugging tools          |
| **Bundler**       | `@teloce/bundler`       | Production bundling and optimization    |
| **SFC**           | `@teloce/sfc`           | Single File Component (`.vel`) compiler |
| **Server**        | `@teloce/server`        | Development server with HMR             |
| **Plugin System** | `@teloce/plugin-system` | Plugin architecture and APIs            |

> **Note:** Package availability and APIs may change as Teloce evolves.

---

# License

Teloce is released under the **MIT License**.

See the `LICENSE` file for the complete license text.

---

# Contributing

Contributions are welcome.

Please read `CONTRIBUTING.md` for information about:

* Code of conduct
* Development setup
* Project structure
* Pull requests
* Bug reports
* Feature requests

---

# Support

If you need help or want to follow Teloce development:

* **GitHub Issues** — Report bugs and request features.
* **Discord** — Join the community and get help.
* **Twitter / X** — Follow Teloce updates.
* **Website** — Visit the [Teloce Website](https://telonce-website.vercel.app/#/).
