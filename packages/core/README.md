# @teloce/core




<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo "
   width="200"/>
</p>



**Author:** Aldane Hutchinson

 teloce:  A JavaScript template engine for Python web developers.
 

Core library for Teloce — provides a composable API for applications, bundlers, and tree-shaking users.

## Installation

```bash
npm install @teloce/core
```

## Usage

```javascript
import {
  createApp,
  defineComponent,
  createSignal,
  createEffect,
  createComputed
} from '@teloce/core';

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
```

## API Reference

### `createApp()`

Creates a new Teloce application.

```javascript
const app = createApp('#app', {
  count: 0,
  name: 'Teloce'
});
```

### `defineComponent()`

Defines a reusable Teloce component.

```javascript
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
```

### `createSignal()`

Creates a reactive signal.

```javascript
const [count, setCount] = createSignal(0);

console.log(count());

setCount(10);

console.log(count());
```

### `createEffect()`

Creates a reactive effect that automatically runs whenever its dependencies change.

```javascript
createEffect(() => {
  console.log('Count changed:', count());
});
```

### `createComputed()`

Creates a computed reactive value based on other signals.

```javascript
const double = createComputed(() => count() * 2);
```

## License

MIT
