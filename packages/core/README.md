# @teloce/core

Core library for Teloce - composable API for bundler/tree-shaking users.

## Installation

```bash
npm install @teloce/core
Usage
javascript
import { createApp, defineComponent, createSignal } from '@teloce/core';

// Create an app
const app = createApp('#app', {
  count: 0,
  name: 'Teloce'
});

// Define a component
const MyComponent = defineComponent({
  name: 'MyComponent',
  data() {
    return {
      message: 'Hello World'
    };
  },
  methods: {
    greet() {
      console.log(this.message);
    }
  }
});

// Create a signal
const [count, setCount] = createSignal(0);

// Create an effect
createEffect(() => {
  console.log('Count changed:', count());
});

// Create a computed value
const double = createComputed(() => count() * 2);
API
createApp
Creates a new Teloce application.

javascript
const app = createApp('#app', {
  count: 0,
  name: 'Teloce'
});
defineComponent
Defines a component.

javascript
const MyComponent = defineComponent({
  name: 'MyComponent',
  data() {
    return {
      message: 'Hello World'
    };
  },
  methods: {
    greet() {
      console.log(this.message);
    }
  }
});
createSignal
Creates a reactive signal.

javascript
const [count, setCount] = createSignal(0);
createEffect
Creates an effect that runs when dependencies change.

javascript
createEffect(() => {
  console.log('Count changed:', count());
});
createComputed
Creates a computed value.

javascript
const double = createComputed(() => count() * 2);
License
MIT