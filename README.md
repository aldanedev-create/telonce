# Teloce

> A modern TypeScript-powered JavaScript template engine built for Python web developers.

## What is Teloce?

Teloce is a production-grade JavaScript template engine written in **TypeScript** and designed specifically for **Python web frameworks** such as **Flask**, **Flaxon**, **Django**, **FastAPI**, and **Quart**.

Its goal is to make client-side development simple, fast, and enjoyable without forcing Python developers into a complex JavaScript ecosystem.

check our website: https://telonce-website.vercel.app/#/

---

## Features

- 🚀 **Python-First Philosophy** — Write JavaScript, not TypeScript.
- 🌐 **CDN First** — Start with a single `<script>` tag. No build tools required.
- ⚡ **Signals-Based Reactivity** — Fine-grained updates without a Virtual DOM.
- 🔑 **Keyed Loops** — Efficient DOM updates with node reuse.
- 🧩 **Single File Components** — Organize applications using `.tel` components.
- 🐍 **Jinja & Jinax Compatible** — Works alongside your existing Python templates.
- 🛠️ **Human-Friendly Debugger** — Converts JavaScript errors into easy-to-understand messages.
- 📦 **Modular Packages** — Install only what your application needs.
- 🎯 **Built for Flask, Flaxon, Django, FastAPI, and Quart.**

---

# Quick Start

## CDN (No Build Tools)

```html
<script src="https://cdn.teloce.dev/teloce.min.js"></script>

<div id="app">
    <h1>Hello {{ name }}</h1>

    <button @click="count++">
        {{ count }}
    </button>
</div>

<script>
teloce.create("#app", {
    name: "Python Developer",
    count: 0
});
</script>
```

---

## Install with npm

```bash
npm install teloce
```

```javascript
import { create } from "teloce";

create("#app", {
    name: "Python Developer",
    count: 0
});
```

---

## CLI

Install the CLI globally.

```bash
npm install -g @teloce/cli
```

Create a new project.

```bash
teloce create my-app
```

Start the development server.

```bash
teloce dev
```

Build for production.

```bash
teloce build
```

---

# Documentation

- Getting Started
- Installation
- API Reference
- Examples
- Guides
- CLI Documentation
- Debugger Guide

---

# Packages

| Package | npm | Description |
|---------|-----|-------------|
| Teloce | `teloce` | Complete framework package |
| Core | `@teloce/core` | Core API |
| Compiler | `@teloce/compiler` | Template compiler |
| Runtime | `@teloce/runtime` | Runtime engine |
| Reactivity | `@teloce/reactivity` | Signals-based reactivity |
| Runtime DOM | `@teloce/runtime-dom` | DOM renderer |
| CLI | `@teloce/cli` | Command-line interface |
| Debugger | `@teloce/debugger` | Human-friendly debugger |

---

# Philosophy

Teloce is designed to feel natural for Python developers.

Start small with a CDN:

```html
<script src="https://cdn.teloce.dev/teloce.min.js"></script>
```

As your project grows, migrate to npm and the CLI without changing how you write templates.

The API stays the same.

---

# Browser Support

- Chrome
- Edge
- Firefox
- Safari
- Opera

---

# License

Licensed under the **MIT License**.

---

# Contributing

Contributions are welcome!

Please read **CONTRIBUTING.md** before submitting issues or pull requests.

---

# Support

- GitHub Issues
- Discussions
- Discord Community

---

# Roadmap

- ✅ CDN Support
- ✅ npm Packages
- 🚧 Single File Components (`.tel`)
- 🚧 VS Code Extension
- 🚧 Browser DevTools
- 🚧 Plugin System
- 🚧 Python Framework Integrations
