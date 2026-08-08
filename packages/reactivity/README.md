# @teloce/reactivity

> Reactivity system for Teloce — Signals, Effects, and Computed values.

---

## Installation

```bash
npm install @teloce/reactivity
```

---

## What Is Reactivity?

Teloce uses a **Signals-based reactivity system**. Signals are reactive values that automatically track dependencies and trigger updates when their values change.

The reactivity package provides:

* **Signals** — Reactive state values
* **Effects** — Automatically run code when dependencies change
* **Computed Values** — Derived reactive values
* **Batching** — Group multiple updates together
* **Untracked Reads** — Read values without creating dependencies
* **Dependency Tracking** — Low-level dependency management utilities

---

## Signals

A signal is a reactive value that can be read and written.

```javascript
import { createSignal } from '@teloce/reactivity';

// Create a signal
const [count, setCount] = createSignal(0);

// Read the value
console.log(count()); // 0

// Write the value
setCount(10);

console.log(count()); // 10

// Update based on the current value
count.update((prev) => prev + 1);

console.log(count()); // 11
```

---

## Effects

An effect runs automatically whenever one of its dependencies changes.

```javascript
import { createSignal, createEffect } from '@teloce/reactivity';

const [count, setCount] = createSignal(0);

createEffect(() => {
  console.log('Count is:', count());
  // Runs whenever count changes
});

setCount(1); // Logs: Count is: 1
setCount(2); // Logs: Count is: 2
```

---

## Computed Values

A computed value is derived from other signals and updates automatically when its dependencies change.

```javascript
import { createSignal, createComputed } from '@teloce/reactivity';

const [firstName, setFirstName] = createSignal('John');
const [lastName] = createSignal('Doe');

const fullName = createComputed(() => {
  return `${firstName()} ${lastName()}`;
});

console.log(fullName()); // John Doe

setFirstName('Jane');

console.log(fullName()); // Jane Doe
```

---

## Batch Updates

Use `batch()` to group multiple updates together and prevent unnecessary intermediate reactions.

```javascript
import { createSignal, batch } from '@teloce/reactivity';

const [count, setCount] = createSignal(0);
const [name, setName] = createSignal('John');

batch(() => {
  setCount(10);
  setName('Jane');
});
```

---

## Untracked Reads

Use `untracked()` to read a reactive value without creating a dependency.

```javascript
import { createSignal, createEffect, untracked } from '@teloce/reactivity';

const [count, setCount] = createSignal(0);

createEffect(() => {
  // This effect depends on count
  console.log('Count:', count());

  // This read does not create an additional dependency
  const current = untracked(() => count());

  console.log('Untracked:', current);
});
```

---

# API Reference

## `createSignal(initial)`

Creates a new reactive signal.

```typescript
function createSignal<T>(initial: T): Signal<T>;
```

### Signal Methods

| Method       | Description                                  |
| ------------ | -------------------------------------------- |
| `get()`      | Read the current value                       |
| `set(value)` | Set a new value                              |
| `update(fn)` | Update the value based on the previous value |
| `peek()`     | Read the value without tracking dependencies |

### Example

```javascript
const [count, setCount] = createSignal(0);

console.log(count());

setCount(5);

count.update((previous) => previous + 1);

console.log(count());
```

---

## `createEffect(fn)`

Creates an effect that runs whenever its dependencies change.

```typescript
function createEffect(fn: () => void): Effect;
```

### Returns

| Method   | Description                  |
| -------- | ---------------------------- |
| `run()`  | Manually run the effect      |
| `stop()` | Stop the effect from running |

### Example

```javascript
const [count, setCount] = createSignal(0);

const effect = createEffect(() => {
  console.log(count());
});

setCount(1);

effect.stop();
```

---

## `createComputed(fn)`

Creates a computed value derived from reactive dependencies.

```typescript
function createComputed<T>(fn: () => T): Computed<T>;
```

### Returns

| Method   | Description                        |
| -------- | ---------------------------------- |
| `get()`  | Read the computed value            |
| `peek()` | Read without tracking dependencies |

### Example

```javascript
const [count] = createSignal(5);

const double = createComputed(() => count() * 2);

console.log(double()); // 10
```

---

## `createMemo(fn)`

Alias for `createComputed()`.

```typescript
function createMemo<T>(fn: () => T): Memo<T>;
```

Example:

```javascript
const [count] = createSignal(5);

const double = createMemo(() => count() * 2);

console.log(double()); // 10
```

---

## `batch(fn)`

Batches multiple reactive updates together.

```typescript
function batch(fn: () => void): void;
```

Example:

```javascript
batch(() => {
  setCount(10);
  setName('Jane');
});
```

---

## `untracked(fn)`

Runs a function without tracking reactive dependencies.

```typescript
function untracked<T>(fn: () => T): T;
```

Example:

```javascript
const value = untracked(() => count());
```

---

# Advanced Features

## Dependency Tracking

The package provides low-level `track()` and `trigger()` utilities for advanced integrations.

```javascript
import {
  createEffect,
  track,
  trigger,
} from '@teloce/reactivity';

const target = {
  count: 0,
};

const key = 'count';

createEffect(() => {
  track(target, key);

  console.log('Count:', target.count);
});

// Update the value
target.count = 1;

// Notify dependents
trigger(target, key);
```

> **Note:** Direct use of `track()` and `trigger()` is intended for advanced integrations and custom reactive systems.

---

## Utility Functions

Teloce provides utilities for working with reactive values.

```javascript
import {
  createSignal,
  createComputed,
  isSignal,
  isComputed,
  toSignal,
  getValue,
} from '@teloce/reactivity';

const [count] = createSignal(0);

const computed = createComputed(() => count() * 2);

console.log(isSignal(count)); // true
console.log(isComputed(computed)); // true

const signalLike = toSignal(computed);

console.log(getValue(signalLike)); // 0
```

### Utility API

| Function            | Description                                  |
| ------------------- | -------------------------------------------- |
| `isSignal(value)`   | Checks whether a value is a signal           |
| `isComputed(value)` | Checks whether a value is computed           |
| `toSignal(value)`   | Converts a compatible value into a signal    |
| `getValue(value)`   | Gets the current value from a reactive value |

---

# Performance Tips

For the best performance:

1. **Use computed values** instead of repeatedly recalculating derived values inside effects.
2. **Batch updates** when making multiple state changes.
3. **Use `untracked()`** when reading values that should not create reactive dependencies.
4. **Memoize expensive computations** with `createMemo()`.
5. **Keep reactive state focused** to avoid unnecessary updates.
6. **Prefer fine-grained signals** for frequently changing state.

---

## License

MIT
