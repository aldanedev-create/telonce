# Reactivity

Teloce uses a **signals-based reactivity system** for fine-grained updates without requiring a Virtual DOM.

---

## What Are Signals?

Signals are reactive values that automatically track dependencies and update the DOM when they change.

```javascript
const [count, setCount] = teloce.createSignal(0);

// Read the value
console.log(count()); // 0

// Write the value
setCount(10);

console.log(count()); // 10
```

A signal consists of a getter and a setter:

* The **getter** reads the current value.
* The **setter** updates the value.
* Reactive consumers automatically track signals they read.

---

## Creating Signals

### With `createSignal`

Create a signal with an initial value:

```javascript
const [count, setCount] = createSignal(0);

// Update based on the current value
count.update(prev => prev + 1);
```

### With `createApp`

Application state can also be declared directly when creating an app:

```javascript
const app = teloce.createApp('#app', {
  count: 0,
  name: 'John'
});
```

### In Components

Components can define reactive state:

```javascript
const MyComponent = teloce.defineComponent({
  data() {
    return {
      count: 0,
      name: 'John'
    };
  }
});
```

---

## Effects

An effect runs automatically whenever one of its dependencies changes.

### Basic Effect

```javascript
import { createEffect } from '@teloce/reactivity';

const [count, setCount] = createSignal(0);

createEffect(() => {
  console.log('Count is:', count());
});

setCount(1); // Logs: Count is: 1
setCount(2); // Logs: Count is: 2
```

### Multiple Dependencies

An effect can depend on multiple signals.

```javascript
const [firstName, setFirstName] = createSignal('John');
const [lastName, setLastName] = createSignal('Doe');

createEffect(() => {
  console.log(
    'Full name:',
    firstName(),
    lastName()
  );
});
```

Whenever either `firstName` or `lastName` changes, the effect runs again.

### Cleanup

Effects can be stopped when they are no longer needed.

```javascript
const effect = createEffect(() => {
  // Do something
});

// Stop the effect
effect.stop();
```

---

## Computed Values

A computed value derives its result from other signals and updates automatically when those dependencies change.

```javascript
import { createComputed } from '@teloce/reactivity';

const [firstName, setFirstName] = createSignal('John');
const [lastName, setLastName] = createSignal('Doe');

const fullName = createComputed(() => {
  return `${firstName()} ${lastName()}`;
});

console.log(fullName()); // John Doe

setFirstName('Jane');

console.log(fullName()); // Jane Doe
```

### Memoization

Use `createMemo` to memoize expensive computations.

```javascript
import { createMemo } from '@teloce/reactivity';

const expensive = createMemo(() => {
  // Expensive calculation
  return heavyCalculation(data());
});
```

---

## Batch Updates

Batch multiple updates together to prevent unnecessary intermediate updates.

```javascript
import { batch } from '@teloce/reactivity';

const [count, setCount] = createSignal(0);
const [name, setName] = createSignal('John');

batch(() => {
  setCount(10);
  setName('Jane');
});
```

Batching is useful when several related values need to change as part of the same operation.

---

## Untracked

Use `untracked()` when a value should be read without creating a reactive dependency.

```javascript
import { untracked } from '@teloce/reactivity';

const [count, setCount] = createSignal(0);

createEffect(() => {
  // This effect depends on count
  console.log('Count:', count());

  // This read is untracked
  const current = untracked(() => count());

  console.log('Untracked:', current);
});
```

The untracked read does not cause the effect to re-run when that value changes.

---

## Reactivity in Templates

### Automatic DOM Updates

Teloce automatically updates the relevant DOM nodes when reactive state changes.

```html
<div id="app">
  <h1>{{ name }}</h1>

  <p>
    Count: {{ count }}
  </p>

  <button @click="count++">
    Increment
  </button>
</div>

<script>
const app = teloce.createApp('#app', {
  name: 'John',
  count: 0
});
</script>
```

When `count` changes, only the affected count text needs to update rather than re-rendering the entire page.

### Computed in Templates

Computed values can also be exposed directly to templates.

```html
<div id="app">
  <p>
    Double: {{ doubleCount }}
  </p>
</div>

<script>
const app = teloce.createApp('#app', {
  count: 0,

  computed: {
    doubleCount() {
      return this.count * 2;
    }
  }
});
</script>
```

---

## Reactive Best Practices

### 1. Use Computed for Derived State

Avoid manually calculating derived state when a computed value can track its dependencies.

```javascript
// ❌ Avoid
const total = () => price() * quantity();

// ✅ Prefer
const total = createComputed(
  () => price() * quantity()
);
```

Computed values make dependencies explicit and allow Teloce to track the values used by the calculation.

### 2. Batch Multiple Updates

Group related state changes together.

```javascript
// ❌ Avoid
setCount(count() + 1);
setName('Jane');

// ✅ Prefer
batch(() => {
  setCount(count() + 1);
  setName('Jane');
});
```

### 3. Untrack Unnecessary Dependencies

Use `untracked()` when a read should not become a dependency.

```javascript
createEffect(() => {
  console.log('Count:', count());

  const other = untracked(
    () => otherSignal()
  );
});
```

---

## Reactivity API Reference

| Function                | Description                                          |
| :---------------------- | :--------------------------------------------------- |
| `createSignal(initial)` | Creates a reactive signal                            |
| `createEffect(fn)`      | Creates an effect that runs when dependencies change |
| `createComputed(fn)`    | Creates a derived reactive value                     |
| `createMemo(fn)`        | Memoizes a computed value                            |
| `batch(fn)`             | Batches multiple updates                             |
| `untracked(fn)`         | Reads a value without tracking dependencies          |

---

## Reactivity at a Glance

```text
                    Reactive State
                         │
                         ▼
                  ┌──────────────┐
                  │    Signal    │
                  │              │
                  │ count = 0    │
                  └──────┬───────┘
                         │
               tracks dependencies
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        ┌───────────┐         ┌───────────┐
        │  Effect   │         │  Computed │
        │           │         │           │
        │ Side      │         │ Derived   │
        │ effects   │         │ values    │
        └─────┬─────┘         └─────┬─────┘
              │                     │
              └──────────┬──────────┘
                         ▼
                   DOM Updates
                         │
                         ▼
                    Browser UI
```

### Core Concepts

| Concept       | Purpose                                   |
| :------------ | :---------------------------------------- |
| **Signal**    | Stores reactive state                     |
| **Effect**    | Runs code when dependencies change        |
| **Computed**  | Derives values from reactive state        |
| **Memo**      | Caches expensive computations             |
| **Batch**     | Groups multiple state updates             |
| **Untracked** | Reads state without creating a dependency |

---

## Next Steps

* [Components](components.md) — Build reusable reactive components.
* [Directives](directives.md) — Connect state and behavior to your templates.
* [Templates](templates.md) — Learn the Teloce template syntax.
* [Python Guide](python.md) — Use Teloce with Flask, Django, FastAPI, and other Python backends.
* [Examples](../examples/) — Explore complete Teloce applications.

---

## Fine-Grained. Reactive. Efficient.

Teloce tracks dependencies at the signal level and updates only the parts of the interface that need to change.

**⚡ Build reactive interfaces without a Virtual DOM.**
