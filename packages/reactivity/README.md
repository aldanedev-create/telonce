# @teloce/reactivity

Reactivity system for Teloce - Signals, Effects, and Computed values.

## Installation

```bash
npm install @teloce/reactivity
What is Reactivity?
Teloce uses a Signals-based reactivity system. Signals are reactive values that automatically track dependencies and update the DOM when they change.

Signals
A signal is a reactive value that can be read and written:

javascript
import { createSignal } from '@teloce/reactivity';

// Create a signal
const [count, setCount] = createSignal(0);

// Read the value
console.log(count()); // 0

// Write the value
setCount(10);
console.log(count()); // 10

// Update based on current value
count.update(prev => prev + 1);
console.log(count()); // 11
Effects
An effect runs automatically whenever its dependencies change:

javascript
import { createSignal, createEffect } from '@teloce/reactivity';

const [count, setCount] = createSignal(0);

createEffect(() => {
  console.log('Count is:', count());
  // This runs whenever count changes
});

setCount(1); // Logs: Count is: 1
setCount(2); // Logs: Count is: 2
Computed Values
A computed value is derived from other signals and updates automatically:

javascript
import { createSignal, createComputed } from '@teloce/reactivity';

const [firstName] = createSignal('John');
const [lastName] = createSignal('Doe');

const fullName = createComputed(() => {
  return `${firstName()} ${lastName()}`;
});

console.log(fullName()); // John Doe

firstName.set('Jane');
console.log(fullName()); // Jane Doe
Batch Updates
Batch multiple updates together to prevent unnecessary re-renders:

javascript
import { createSignal, batch } from '@teloce/reactivity';

const [count, setCount] = createSignal(0);
const [name, setName] = createSignal('John');

// Both updates trigger only one re-render
batch(() => {
  setCount(10);
  setName('Jane');
});
Untracked
Read values without creating dependencies:

javascript
import { createSignal, untracked } from '@teloce/reactivity';

const [count, setCount] = createSignal(0);

createEffect(() => {
  // This effect depends on count
  console.log('Count:', count());
  
  // But this read is untracked
  const current = untracked(() => count());
  console.log('Untracked:', current);
});
API Reference
createSignal(initial)
Creates a new signal.

typescript
function createSignal<T>(initial: T): Signal<T>
Returns:

get(): T - Read the current value

set(value: T | ((prev: T) => T)): void - Set the value

update(fn: (prev: T) => T): void - Update based on current value

peek(): T - Read without tracking dependencies

createEffect(fn)
Creates an effect that runs whenever dependencies change.

typescript
function createEffect(fn: () => void): Effect
Returns:

run(): void - Manually run the effect

stop(): void - Stop the effect from running

createComputed(fn)
Creates a computed value that updates when dependencies change.

typescript
function createComputed<T>(fn: () => T): Computed<T>
Returns:

get(): T - Read the current value

peek(): T - Read without tracking dependencies

createMemo(fn)
Alias for createComputed.

typescript
function createMemo<T>(fn: () => T): Memo<T>
batch(fn)
Batches multiple updates together.

typescript
function batch(fn: () => void): void
untracked(fn)
Runs a function without tracking dependencies.

typescript
function untracked<T>(fn: () => T): T
Advanced Features
Dependency Tracking
javascript
import { track, trigger } from '@teloce/reactivity';

const target = { count: 0 };
const key = 'count';

// Track the dependency
createEffect(() => {
  track(target, key);
  console.log('Count:', target.count);
});

// Trigger the effect
target.count = 1;
trigger(target, key);
Utility Functions
javascript
import { isSignal, isComputed, toSignal, getValue } from '@teloce/reactivity';

const signal = createSignal(0);
const computed = createComputed(() => signal() * 2);

console.log(isSignal(signal)); // true
console.log(isComputed(computed)); // true

const signalLike = toSignal(computed);
console.log(getValue(signalLike)); // 0
Performance Tips
Use computed values instead of recalculating in effects

Batch updates when making multiple changes

Use untracked when reading values that shouldn't trigger effects

Memoize expensive computations with createMemo

License