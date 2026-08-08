# Reactivity

<div class="teloce-reactivity-hero">
  <div class="reactivity-grid"></div>
  <div class="signal signal-one"></div>
  <div class="signal signal-two"></div>
  <div class="signal signal-three"></div>

  <div class="reactivity-hero-content">
    <div class="reactivity-badge">⚡ Fine-Grained Reactivity</div>
    <h1>Reactive Without the Virtual DOM</h1>
    <p>
      Teloce uses a signals-based reactivity system to update only
      the parts of the interface that actually change.
    </p>
  </div>
</div>

<style>
.teloce-reactivity-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: 80px 30px;
  margin: 20px 0 45px;
  border-radius: 24px;
  text-align: center;
  background:
    radial-gradient(circle at center, rgba(56,189,248,.12), transparent 55%),
    linear-gradient(135deg, #0f172a, #111827);
  border: 1px solid rgba(255,255,255,.08);
}

.reactivity-hero-content {
  position: relative;
  z-index: 5;
  max-width: 760px;
  margin: auto;
  animation: reactivityFadeUp .9s ease-out both;
}

.reactivity-badge {
  display: inline-block;
  padding: 7px 14px;
  margin-bottom: 18px;
  border-radius: 999px;
  border: 1px solid rgba(56,189,248,.3);
  background: rgba(56,189,248,.1);
  animation: reactivityPulse 3s ease-in-out infinite;
}

.teloce-reactivity-hero h1 {
  margin: 0;
  font-size: clamp(2.2rem, 6vw, 4rem);
  line-height: 1.05;
  letter-spacing: -2px;
}

.teloce-reactivity-hero p {
  max-width: 650px;
  margin: 18px auto 0;
  opacity: .75;
  font-size: 1.05rem;
}

.reactivity-grid {
  position: absolute;
  inset: 0;
  opacity: .12;
  background-image:
    linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px);
  background-size: 35px 35px;
  mask-image: radial-gradient(circle, black, transparent 70%);
  animation: gridMove 15s linear infinite;
}

.signal {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 20px rgba(255,255,255,.9);
}

.signal-one {
  top: 25%;
  left: 18%;
  animation: signalOne 5s ease-in-out infinite;
}

.signal-two {
  top: 65%;
  right: 18%;
  animation: signalTwo 6s ease-in-out infinite;
}

.signal-three {
  bottom: 18%;
  left: 35%;
  animation: signalThree 7s ease-in-out infinite;
}

@keyframes reactivityFadeUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes reactivityPulse {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }
}

@keyframes gridMove {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(35px);
  }
}

@keyframes signalOne {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(120px, 45px);
  }
}

@keyframes signalTwo {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(-100px, -40px);
  }
}

@keyframes signalThree {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(80px, -50px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reactivity-hero-content,
  .reactivity-badge,
  .reactivity-grid,
  .reactivity-hero-content ~ .signal {
    animation: none;
  }
}
</style>

Teloce uses a **signals-based reactivity system** for fine-grained updates without requiring a Virtual DOM.

<div class="reactivity-flow">

<div class="flow-box">
  <strong>Signal</strong>
  <span>State changes</span>
</div>

<div class="flow-arrow">→</div>

<div class="flow-box">
  <strong>Dependency</strong>
  <span>Tracks usage</span>
</div>

<div class="flow-arrow">→</div>

<div class="flow-box">
  <strong>DOM</strong>
  <span>Updates precisely</span>
</div>

</div>

<style>
.reactivity-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 30px 0;
}

.flow-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 130px;
  padding: 16px;
  text-align: center;
  border-radius: 14px;
  border: 1px solid rgba(56,189,248,.2);
  background: rgba(56,189,248,.05);
  animation: flowBox 2.5s ease-in-out infinite;
}

.flow-box:nth-child(3) {
  animation-delay: .3s;
}

.flow-box:nth-child(5) {
  animation-delay: .6s;
}

.flow-box span {
  font-size: .8rem;
  opacity: .6;
}

.flow-arrow {
  opacity: .5;
  font-size: 1.4rem;
  animation: arrowPulse 1.5s ease-in-out infinite;
}

@keyframes flowBox {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes arrowPulse {
  50% {
    transform: translateX(5px);
    opacity: 1;
  }
}
</style>

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

<div class="signal-demo">
  <div class="signal-value">0</div>
  <div class="signal-line"></div>
  <div class="signal-value active">10</div>
</div>

<style>
.signal-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin: 25px 0;
}

.signal-value {
  display: grid;
  place-items: center;
  width: 65px;
  height: 65px;
  border-radius: 16px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.1);
  font-size: 1.3rem;
  font-weight: 700;
}

.signal-value.active {
  border-color: rgba(56,189,248,.4);
  background: rgba(56,189,248,.1);
  animation: signalValuePulse 2s ease-in-out infinite;
}

.signal-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(56,189,248,.8),
    transparent
  );
  animation: signalLine 1.2s linear infinite;
}

@keyframes signalValuePulse {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.08);
  }
}

@keyframes signalLine {
  from {
    opacity: .3;
  }

  50% {
    opacity: 1;
  }

  to {
    opacity: .3;
  }
}
</style>

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

### Cleanup

Effects can be stopped when they are no longer needed.

```javascript
const effect = createEffect(() => {
  // Do something
});

// Stop the effect
effect.stop();
```

<div class="effect-card">
  <div class="effect-dot"></div>
  <div>
    <strong>Effect Active</strong>
    <span>Listening for dependency changes...</span>
  </div>
</div>

<style>
.effect-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 17px;
  margin: 25px 0;
  border-radius: 14px;
  border: 1px solid rgba(34,197,94,.18);
  background: rgba(34,197,94,.05);
}

.effect-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 15px rgba(34,197,94,.7);
  animation: effectPulse 1.5s ease-in-out infinite;
}

.effect-card span {
  display: block;
  margin-top: 3px;
  opacity: .65;
  font-size: .85rem;
}

@keyframes effectPulse {
  0%, 100% {
    transform: scale(1);
    opacity: .6;
  }

  50% {
    transform: scale(1.35);
    opacity: 1;
  }
}
</style>

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

<div class="batch-visual">

<div class="batch-item">Update 1</div>
<div class="batch-plus">+</div>
<div class="batch-item">Update 2</div>
<div class="batch-arrow">→</div>
<div class="batch-result">One Update</div>

</div>

<style>
.batch-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 30px 0;
}

.batch-item,
.batch-result {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(56,189,248,.2);
  background: rgba(56,189,248,.06);
}

.batch-result {
  border-color: rgba(34,197,94,.25);
  background: rgba(34,197,94,.06);
  animation: batchPulse 2s ease-in-out infinite;
}

.batch-plus,
.batch-arrow {
  opacity: .5;
}

@keyframes batchPulse {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.07);
  }
}
</style>

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

<div class="dom-update">
  <div class="dom-page">
    <span>Page</span>
    <div class="dom-element">Header</div>
    <div class="dom-element highlighted">Count: 10</div>
    <div class="dom-element">Footer</div>
  </div>

  <div class="dom-label">
    <span class="pulse-dot"></span>
    Only the reactive node changes
  </div>
</div>

<style>
.dom-update {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin: 30px 0;
}

.dom-page {
  display: grid;
  gap: 7px;
  width: min(100%, 300px);
  padding: 15px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.025);
}

.dom-page > span {
  font-size: .75rem;
  opacity: .5;
}

.dom-element {
  padding: 10px;
  border-radius: 8px;
  background: rgba(255,255,255,.04);
}

.dom-element.highlighted {
  border: 1px solid rgba(56,189,248,.35);
  background: rgba(56,189,248,.08);
  animation: domHighlight 2s ease-in-out infinite;
}

.dom-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: .85rem;
  opacity: .7;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  animation: domDot 1.5s ease-in-out infinite;
}

@keyframes domHighlight {
  0%, 100% {
    box-shadow: 0 0 0 rgba(56,189,248,0);
  }

  50% {
    box-shadow: 0 0 20px rgba(56,189,248,.12);
  }
}

@keyframes domDot {
  50% {
    transform: scale(1.4);
  }
}
</style>

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

<div class="best-practice">

<div>
  <span>✓</span>
  <strong>Computed</strong>
  <small>For derived state</small>
</div>

<div>
  <span>✓</span>
  <strong>Batch</strong>
  <small>For grouped updates</small>
</div>

<div>
  <span>✓</span>
  <strong>Untracked</strong>
  <small>For non-dependencies</small>
</div>

</div>

<style>
.best-practice {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin: 25px 0;
}

.best-practice > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  transition: transform .25s ease;
}

.best-practice > div:hover {
  transform: translateY(-5px);
}

.best-practice span {
  font-size: 1.2rem;
}

.best-practice small {
  opacity: .6;
}
</style>

---

## Reactivity API Reference

| Function                | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `createSignal(initial)` | Creates a reactive signal                            |
| `createEffect(fn)`      | Creates an effect that runs when dependencies change |
| `createComputed(fn)`    | Creates a derived reactive value                     |
| `createMemo(fn)`        | Memoizes a computed value                            |
| `batch(fn)`             | Batches multiple updates                             |
| `untracked(fn)`         | Reads a value without tracking dependencies          |

---

## Reactivity at a Glance

<div class="reactivity-summary">

<div class="summary-card">
  <strong>Signals</strong>
  <span>Reactive state</span>
</div>

<div class="summary-card">
  <strong>Effects</strong>
  <span>Automatic side effects</span>
</div>

<div class="summary-card">
  <strong>Computed</strong>
  <span>Derived state</span>
</div>

<div class="summary-card">
  <strong>Batch</strong>
  <span>Efficient updates</span>
</div>

</div>

<style>
.reactivity-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin: 30px 0;
}

.summary-card {
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(56,189,248,.12);
  background: rgba(56,189,248,.035);
  transition:
    transform .3s ease,
    border-color .3s ease;
}

.summary-card:hover {
  transform: translateY(-6px);
  border-color: rgba(56,189,248,.35);
}

.summary-card span {
  display: block;
  margin-top: 5px;
  opacity: .6;
  font-size: .85rem;
}
</style>

---

## Next Steps

<div class="teloce-next">

<a href="/guides/components" class="next-card">
  <strong>🧩 Components</strong>
  <span>Build reusable reactive components.</span>
</a>

<a href="/guides/directives" class="next-card">
  <strong>🎯 Directives</strong>
  <span>Explore the complete directive system.</span>
</a>

<a href="/guides/sfc" class="next-card">
  <strong>📦 SFC (.vel)</strong>
  <span>Build Single File Components.</span>
</a>

</div>

<style>
.teloce-next {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin-top: 25px;
}

.next-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.025);
  text-decoration: none;
  transition:
    transform .3s ease,
    border-color .3s ease,
    box-shadow .3s ease;
}

.next-card:hover {
  transform: translateY(-7px);
  border-color: rgba(56,189,248,.4);
  box-shadow: 0 15px 40px rgba(0,0,0,.2);
}

.next-card span {
  opacity: .65;
  font-size: .9rem;
}
</style>

<div class="reactivity-footer">

### ⚡ Fine-Grained. Reactive. Efficient.

Teloce tracks dependencies at the signal level and updates
only the parts of the interface that need to change.

</div>

<style>
.reactivity-footer {
  margin-top: 50px;
  padding: 42px 25px;
  text-align: center;
  border-radius: 22px;
  background:
    radial-gradient(
      circle,
      rgba(56,189,248,.1),
      transparent 65%
    ),
    rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.07);
  animation: reactivityFooterGlow 4s ease-in-out infinite;
}

@keyframes reactivityFooterGlow {
  0%, 100% {
    box-shadow: 0 0 0 rgba(56,189,248,0);
  }

  50% {
    box-shadow: 0 0 40px rgba(56,189,248,.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reactivity-footer {
    animation: none;
  }
}
</style>
