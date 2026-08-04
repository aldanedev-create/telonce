# Teloce

> A TypeScript template engine for Python web developers.

## What is Teloce?

Teloce is a modern, production-grade JavaScript template engine built in TypeScript, specifically designed for Python web developers using Flask, Django, FastAPI, and other Python frameworks.

## Installation

### CDN (Recommended for most Python projects)

```html
<script src="https://cdn.teloce.dev/teloce.min.js"></script>
ESM (for modern browsers)
html
<script type="module">
import { createApp } from 'https://cdn.teloce.dev/teloce.esm.js';
// ...
</script>
npm
bash
npm install teloce
javascript
import { createApp, createSignal } from 'teloce';
Quick Start
CDN Example
html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.teloce.dev/teloce.min.js"></script>
</head>
<body>
    <div id="app">
        <h1>Hello {{ name }}</h1>
        <button @click="count++">Count: {{ count }}</button>
    </div>

    <script>
        const app = teloce.createApp('#app', {
            name: 'Python Developer',
            count: 0
        });
    </script>
</body>
</html>
With Flask/Jinja
html
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
        products: {{ products|tojson }}
    });
</script>
Features
Signals-Based Reactivity: Fine-grained updates without Virtual DOM

Keyed Loops: Fast list rendering with node reuse

Human-Friendly Debugger: Translates cryptic JavaScript errors into plain English

No Build Tools Required: Start with one <script> tag

Jinja/JinjaX Compatible: Works seamlessly with your existing templates

14 npm Packages: Modular architecture, install only what you need

API Reference
createApp
Creates a new Teloce application.

javascript
const app = teloce.createApp('#app', {
    name: 'John',
    count: 0
});
createSignal
Creates a reactive signal.

javascript
const [count, setCount] = teloce.createSignal(0);
createEffect
Creates an effect that runs when dependencies change.

javascript
teloce.createEffect(() => {
    console.log('Count changed:', count());
});
createComputed
Creates a computed value.

javascript
const double = teloce.createComputed(() => count() * 2);
Directives
For Loop
html
<for key="id" item="product" in="products">
    <li>{{ product.name }}</li>
</for>
If Condition
html
<if loggedIn>
    <h1>Welcome back!</h1>
    <else>
        <button>Login</button>
</if>
Event Handling
html
<button @click="handleClick()">Click Me</button>
Two-Way Binding
html
<input :model="username">
<h2>Hello {{ username }}</h2>
License
MIT