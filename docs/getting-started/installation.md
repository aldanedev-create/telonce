# Installation

<div class="teloce-install-hero">
  <div class="teloce-orbit orbit-1"></div>
  <div class="teloce-orbit orbit-2"></div>
  <div class="teloce-glow"></div>

  <div class="teloce-hero-content">
    <div class="teloce-badge">⚡ Teloce 0.3</div>
    <h1>Install Teloce</h1>
    <p>Get started with a lightweight, reactive frontend in seconds.</p>
  </div>
</div>

<style>
.teloce-install-hero {
  position: relative;
  overflow: hidden;
  padding: 70px 30px;
  margin: 20px 0 45px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 24px;
  background: linear-gradient(135deg, #0f172a, #111827, #0f172a);
  text-align: center;
  isolation: isolate;
}

.teloce-hero-content {
  position: relative;
  z-index: 3;
  animation: teloceFadeUp .9s ease-out both;
}

.teloce-badge {
  display: inline-block;
  padding: 7px 14px;
  margin-bottom: 18px;
  border-radius: 999px;
  background: rgba(56,189,248,.12);
  border: 1px solid rgba(56,189,248,.25);
  font-size: .85rem;
  animation: telocePulse 3s ease-in-out infinite;
}

.teloce-install-hero h1 {
  margin: 0;
  font-size: clamp(2.2rem, 6vw, 4rem);
  letter-spacing: -2px;
}

.teloce-install-hero p {
  margin: 14px auto 0;
  max-width: 560px;
  opacity: .75;
  font-size: 1.05rem;
}

.teloce-glow {
  position: absolute;
  z-index: 0;
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #38bdf8;
  filter: blur(100px);
  opacity: .16;
  animation: teloceGlow 5s ease-in-out infinite;
}

.teloce-orbit {
  position: absolute;
  z-index: 1;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 18px rgba(255,255,255,.8);
}

.orbit-1 {
  top: 25%;
  left: 20%;
  animation: teloceOrbitOne 6s ease-in-out infinite;
}

.orbit-2 {
  bottom: 25%;
  right: 20%;
  animation: teloceOrbitTwo 7s ease-in-out infinite;
}

@keyframes teloceFadeUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes telocePulse {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }
}

@keyframes teloceGlow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(.9);
    opacity: .12;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: .25;
  }
}

@keyframes teloceOrbitOne {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(120px, 45px);
  }
}

@keyframes teloceOrbitTwo {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(-100px, -40px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .teloce-hero-content,
  .teloce-badge,
  .teloce-glow,
  .teloce-orbit {
    animation: none;
  }
}
</style>

There are several ways to install **Teloce**, depending on your project and workflow.

> **Recommended:** Use the CDN for Python-backed applications and quick prototypes.

---

## CDN

The CDN build requires no package manager or build step.

### Production

Use the minified production build for deployed applications.

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
```

### Development

The debug build provides more readable errors during development.

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.debug.js"></script>
```

### ESM

For modern browser applications, use the ESM build.

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

```bash
teloce create my-app
```

### Start the Development Server

```bash
teloce dev
```

---

## Installation Flow

<div class="teloce-steps">

<div class="teloce-step">
  <div class="teloce-step-number">01</div>
  <div>
    <strong>Install</strong>
    <p>Choose CDN, npm, pnpm, yarn, or the Teloce CLI.</p>
  </div>
</div>

<div class="teloce-step">
  <div class="teloce-step-number">02</div>
  <div>
    <strong>Create</strong>
    <p>Create your application or add Teloce to an existing project.</p>
  </div>
</div>

<div class="teloce-step">
  <div class="teloce-step-number">03</div>
  <div>
    <strong>Build</strong>
    <p>Start building reactive and animated interfaces.</p>
  </div>
</div>

</div>

<style>
.teloce-steps {
  display: grid;
  gap: 14px;
  margin: 25px 0;
}

.teloce-step {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.025);
  transition: transform .25s ease, border-color .25s ease;
  animation: teloceStepIn .7s ease both;
}

.teloce-step:nth-child(2) {
  animation-delay: .12s;
}

.teloce-step:nth-child(3) {
  animation-delay: .24s;
}

.teloce-step:hover {
  transform: translateX(8px);
  border-color: rgba(56,189,248,.45);
}

.teloce-step-number {
  min-width: 45px;
  height: 45px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(56,189,248,.1);
  font-weight: 700;
}

.teloce-step p {
  margin: 4px 0 0;
  opacity: .7;
}

@keyframes teloceStepIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .teloce-step {
    animation: none;
    transition: none;
  }
}
</style>

---

## Compatibility

### Python Frameworks

| Framework | Version | Status         |
| --------- | ------: | -------------- |
| Flask     |    2.0+ | ✅ Full Support |
| Django    |    3.2+ | ✅ Full Support |
| FastAPI   |   0.80+ | ✅ Full Support |
| Quart     |   0.18+ | ✅ Full Support |
| Flaxon    |    0.1+ | ✅ Full Support |

### Browsers

| Browser | Version | Status      |
| ------- | ------: | ----------- |
| Chrome  |     90+ | ✅ Supported |
| Firefox |     88+ | ✅ Supported |
| Safari  |     14+ | ✅ Supported |
| Edge    |     90+ | ✅ Supported |

---

## What's Next?

<div class="teloce-next">

<div class="teloce-next-card">
  <strong>🚀 Quick Start</strong>
  <p>Build your first Teloce application.</p>
</div>

<div class="teloce-next-card">
  <strong>⚡ CDN Usage</strong>
  <p>Learn how to configure and deploy Teloce through a CDN.</p>
</div>

<div class="teloce-next-card">
  <strong>🐍 Python Guide</strong>
  <p>Use Teloce with Flask, Django, FastAPI, and Flaxon.</p>
</div>

</div>

<style>
.teloce-next {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin-top: 25px;
}

.teloce-next-card {
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.025);
  transition: transform .3s ease, box-shadow .3s ease;
}

.teloce-next-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 12px 35px rgba(0,0,0,.2);
}

.teloce-next-card p {
  margin-bottom: 0;
  opacity: .7;
}
</style>

---

<div class="teloce-footer">

**Ready to build?**

```bash
npm install teloce
```

**Welcome to Teloce. ⚡**

</div>

<style>
.teloce-footer {
  margin-top: 50px;
  padding: 35px;
  text-align: center;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(56,189,248,.08), rgba(99,102,241,.08));
  animation: teloceFooterGlow 4s ease-in-out infinite;
}

.teloce-footer code {
  display: inline-block;
  margin: 12px 0;
}

@keyframes teloceFooterGlow {
  0%, 100% {
    box-shadow: 0 0 0 rgba(56,189,248,0);
  }

  50% {
    box-shadow: 0 0 35px rgba(56,189,248,.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .teloce-footer {
    animation: none;
  }
}
</style>
