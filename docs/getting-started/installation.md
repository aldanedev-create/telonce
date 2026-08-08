# Installation

There are several ways to install **Teloce**, depending on your project and workflow.

> **Recommended:** Use the CDN for Python-backed applications and quick prototypes.

---

## CDN

The CDN build requires no package manager or build step.

### Production

Use the minified production build for deployed applications:

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
```

### Development

Use the debug build during development for more readable error messages:

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.debug.js"></script>
```

### ESM

For modern browser applications, use the ESM build:

```html
<script type="module">
  import { createApp } from
    'https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.esm.js';

  // ...
</script>
```

---

## npm

For projects using Node.js and modern build tools:

```bash
npm install teloce
```

### Individual Packages

Teloce is modular, allowing advanced users to install only the packages they need.

```bash
# Core
npm install @teloce/core

# Reactivity
npm install @teloce/reactivity

# DOM runtime
npm install @teloce/runtime-dom

# Template compiler
npm install @teloce/compiler

# CLI
npm install @teloce/cli

# Debugger
npm install @teloce/debugger
```

### pnpm

```bash
pnpm add teloce
```

### Yarn

```bash
yarn add teloce
```

---

## CLI

Install the Teloce CLI globally:

```bash
npm install -g @teloce/cli
```

### Create a Project

Create a new Teloce project:

```bash
teloce create my-app
```

### Start the Development Server

Start the development server from your project directory:

```bash
teloce dev
```

---

## Installation Flow

Choose the installation method that best fits your project:

```text
Teloce
├── CDN
│   ├── Production
│   ├── Development
│   └── ESM
│
├── Package Manager
│   ├── npm
│   ├── pnpm
│   └── Yarn
│
└── CLI
    └── @teloce/cli
```

---

## Compatibility

### Python Frameworks

| Framework | Version | Status         |
| :-------- | ------: | :------------- |
| Flask     |    2.0+ | ✅ Full Support |
| Django    |    3.2+ | ✅ Full Support |
| FastAPI   |   0.80+ | ✅ Full Support |
| Quart     |   0.18+ | ✅ Full Support |
| Flaxon    |    0.1+ | ✅ Full Support |

### Browsers

| Browser | Version | Status      |
| :------ | ------: | :---------- |
| Chrome  |     90+ | ✅ Supported |
| Firefox |     88+ | ✅ Supported |
| Safari  |     14+ | ✅ Supported |
| Edge    |     90+ | ✅ Supported |

---

## What's Next?

Once Teloce is installed, you're ready to start building.

### Using npm

```bash
npm install teloce
```

### Using the CLI

```bash
teloce create my-app
cd my-app
teloce dev
```

---

**Ready to build?**

**Welcome to Teloce. ⚡**
