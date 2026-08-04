# Teloce

> A TypeScript template engine for Python web developers.

## What is Teloce?

Teloce is a modern, production-grade JavaScript template engine built in TypeScript, specifically designed for Python web developers using Flask, Django, FastAPI, and other Python frameworks.

### Key Features

- **Python-First Philosophy**: Write JavaScript, not TypeScript. No Node.js required.
- **Signals-Based Reactivity**: Fine-grained updates without Virtual DOM.
- **Keyed Loops**: Fast list rendering with node reuse.
- **Human-Friendly Debugger**: Translates cryptic JavaScript errors into plain English.
- **CDN First**: Start with one `<script>` tag, no build tools needed.
- **Jinja/JinjaX Compatible**: Works seamlessly with your existing templates.
- **14 npm Packages**: Modular architecture, install only what you need.

## Quick Start

### CDN (No build tools)

```html
<script src="https://cdn.teloce.dev/teloce.min.js"></script>
<div id="app">
    <h1>Hello {{ name }}</h1>
    <button @click="count++">{{ count }}</button>
</div>
<script>
    teloce.create('#app', {
        name: 'Python Developer',
        count: 0
    });
</script>


npm
bash
npm install teloce
javascript
import { createApp } from 'teloce';

createApp('#app', {
    name: 'Python Developer',
    count: 0
});
CLI
bash
npm install -g @teloce/cli
teloce create my-app
teloce dev
Documentation
Getting Started

API Reference

Examples

Packages
Package	npm	Description
teloce	teloce	Umbrella package (CDN + npm)
core	@teloce/core	Core library
compiler	@teloce/compiler	Template compiler
reactivity	@teloce/reactivity	Signals system
runtime-dom	@teloce/runtime-dom	DOM runtime
cli	@teloce/cli	Command-line interface
debugger	@teloce/debugger	Human-friendly debugger
License
MIT

Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

Support
GitHub Issues

Discord

Twitter