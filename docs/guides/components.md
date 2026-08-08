# Components

<div class="teloce-components-hero">
  <div class="component-orbit orbit-one"></div>
  <div class="component-orbit orbit-two"></div>
  <div class="component-particle particle-one"></div>
  <div class="component-particle particle-two"></div>
  <div class="component-particle particle-three"></div>

  <div class="components-hero-content">
    <div class="components-badge">🧩 Teloce Components</div>
    <h1>Build Once.<br>Reuse Everywhere.</h1>
    <p>
      Components are reusable building blocks for creating
      scalable Teloce applications.
    </p>
  </div>
</div>

<style>
.teloce-components-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: 80px 30px;
  margin: 20px 0 45px;
  border-radius: 24px;
  text-align: center;
  background:
    radial-gradient(circle at center, rgba(56,189,248,.13), transparent 55%),
    linear-gradient(135deg, #0f172a, #111827);
  border: 1px solid rgba(255,255,255,.08);
}

.components-hero-content {
  position: relative;
  z-index: 5;
  max-width: 720px;
  margin: auto;
  animation: componentHeroIn .9s ease-out both;
}

.components-badge {
  display: inline-block;
  padding: 7px 14px;
  margin-bottom: 18px;
  border-radius: 999px;
  border: 1px solid rgba(56,189,248,.3);
  background: rgba(56,189,248,.1);
  animation: componentBadgePulse 3s ease-in-out infinite;
}

.teloce-components-hero h1 {
  margin: 0;
  font-size: clamp(2.2rem, 6vw, 4rem);
  line-height: 1.05;
  letter-spacing: -2px;
}

.teloce-components-hero p {
  max-width: 620px;
  margin: 18px auto 0;
  opacity: .75;
  font-size: 1.05rem;
}

.component-orbit {
  position: absolute;
  left: 50%;
  top: 50%;
  border: 1px solid rgba(56,189,248,.13);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.orbit-one {
  width: 330px;
  height: 330px;
  animation: orbitRotate 14s linear infinite;
}

.orbit-two {
  width: 500px;
  height: 500px;
  border-style: dashed;
  animation: orbitRotateReverse 20s linear infinite;
}

.component-particle {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 18px rgba(255,255,255,.9);
}

.particle-one {
  top: 22%;
  left: 18%;
  animation: particleOne 5s ease-in-out infinite;
}

.particle-two {
  top: 68%;
  right: 18%;
  animation: particleTwo 6s ease-in-out infinite;
}

.particle-three {
  bottom: 16%;
  left: 33%;
  animation: particleThree 7s ease-in-out infinite;
}

@keyframes componentHeroIn {
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes componentBadgePulse {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }
}

@keyframes orbitRotate {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes orbitRotateReverse {
  to {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
}

@keyframes particleOne {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(100px, 45px);
  }
}

@keyframes particleTwo {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(-90px, -40px);
  }
}

@keyframes particleThree {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(70px, -50px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .components-hero-content,
  .components-badge,
  .component-orbit,
  .component-particle {
    animation: none;
  }
}
</style>

Components are reusable building blocks for your Teloce applications.

<div class="component-flow">

<div class="component-node">
  <span>📦</span>
  <strong>Component</strong>
  <small>Reusable logic</small>
</div>

<div class="component-arrow">→</div>

<div class="component-node">
  <span>⚡</span>
  <strong>Reactive State</strong>
  <small>Data + methods</small>
</div>

<div class="component-arrow">→</div>

<div class="component-node">
  <span>🖥️</span>
  <strong>UI</strong>
  <small>Rendered output</small>
</div>

</div>

<style>
.component-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 30px 0;
}

.component-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 140px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(56,189,248,.18);
  background: rgba(56,189,248,.04);
  animation: componentNodeFloat 3s ease-in-out infinite;
}

.component-node:nth-of-type(3) {
  animation-delay: .4s;
}

.component-node:nth-of-type(5) {
  animation-delay: .8s;
}

.component-node span {
  font-size: 1.5rem;
}

.component-node small {
  opacity: .55;
}

.component-arrow {
  opacity: .5;
  font-size: 1.4rem;
  animation: componentArrow 1.5s ease-in-out infinite;
}

@keyframes componentNodeFloat {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

@keyframes componentArrow {
  50% {
    transform: translateX(5px);
    opacity: 1;
  }
}
</style>

---

## Defining a Component

### With `defineComponent`

Use `defineComponent()` to create a reusable component with state, methods, and a template.

```javascript
import { defineComponent } from '@teloce/core';

const MyComponent = defineComponent({
  name: 'MyComponent',

  data() {
    return {
      count: 0
    };
  },

  methods: {
    increment() {
      this.count++;
    }
  },

  template: `
    <div>
      <h2>My Component</h2>

      <button @click="increment">
        Count: {{ count }}
      </button>
    </div>
  `
});
```

### As a Function

Components can also be created as functions that receive props.

```javascript
const MyComponent = (props) => ({
  name: 'MyComponent',
  props,

  data() {
    return {
      count: 0
    };
  },

  template: `
    <div>
      <h2>{{ props.title }}</h2>

      <button @click="count++">
        Count: {{ count }}
      </button>
    </div>
  `
});
```

---

## Props

Props allow a parent component to pass data into a child component.

### Defining Props

```javascript
const MyComponent = defineComponent({
  name: 'MyComponent',

  props: {
    title: {
      type: String,
      required: true
    },

    count: {
      type: Number,
      default: 0
    },

    items: {
      type: Array,
      default: () => []
    }
  }
});
```

### Using Props

```html
<MyComponent
  title="Hello"
  :count="10"
  :items="list"
/>
```

### Prop Validation

| Type       | Validator                       |
| ---------- | ------------------------------- |
| `String`   | `type: String`                  |
| `Number`   | `type: Number`                  |
| `Boolean`  | `type: Boolean`                 |
| `Array`    | `type: Array`                   |
| `Object`   | `type: Object`                  |
| `Function` | `type: Function`                |
| Custom     | `validator: (value) => boolean` |

<div class="props-card">
  <div class="props-icon">↓</div>
  <div>
    <strong>Parent → Child</strong>
    <span>Props provide a predictable way to pass data down the component tree.</span>
  </div>
</div>

<style>
.props-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px;
  margin: 25px 0;
  border-radius: 16px;
  border: 1px solid rgba(56,189,248,.18);
  background: rgba(56,189,248,.04);
  animation: propsIn .7s ease-out both;
}

.props-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(56,189,248,.1);
  font-size: 1.3rem;
  animation: propsArrow 2s ease-in-out infinite;
}

.props-card span {
  display: block;
  margin-top: 4px;
  opacity: .65;
  font-size: .9rem;
}

@keyframes propsIn {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes propsArrow {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(5px);
  }
}
</style>

---

## Data

### Component State

Define component state with the `data()` function.

```javascript
const MyComponent = defineComponent({
  data() {
    return {
      message: 'Hello World',
      count: 0,
      items: []
    };
  }
});
```

### Reactive Data

All data properties become reactive automatically.

```html
<div>
  <p>{{ message }}</p>

  <button @click="count++">
    {{ count }}
  </button>
</div>
```

When reactive data changes, Teloce updates the relevant parts of the component.

---

## Methods

### Defining Methods

Methods provide reusable behavior for your components.

```javascript
const MyComponent = defineComponent({
  methods: {
    handleClick() {
      this.count++;
    },

    async fetchData() {
      const response = await fetch('/api/data');
      this.data = await response.json();
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString();
    }
  }
});
```

### Using Methods

Methods can be called from templates.

```html
<button @click="handleClick">
  Click
</button>

<button @click="fetchData">
  Fetch Data
</button>

<p>
  {{ formatDate(date) }}
</p>
```

<div class="method-pipeline">

<div>Event</div>
<div class="method-arrow">→</div>
<div>Method</div>
<div class="method-arrow">→</div>
<div>State</div>
<div class="method-arrow">→</div>
<div>UI</div>

</div>

<style>
.method-pipeline {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 30px 0;
}

.method-pipeline > div:not(.method-arrow) {
  padding: 10px 15px;
  border-radius: 10px;
  border: 1px solid rgba(56,189,248,.18);
  background: rgba(56,189,248,.05);
}

.method-arrow {
  opacity: .5;
  animation: methodArrow 1.4s ease-in-out infinite;
}

@keyframes methodArrow {
  50% {
    transform: translateX(4px);
  }
}
</style>

---

## Lifecycle Hooks

Lifecycle hooks allow you to run code at specific stages of a component's lifetime.

| Hook            | When It Runs                      |
| --------------- | --------------------------------- |
| `beforeMount`   | Before the component is mounted   |
| `mounted`       | After the component is mounted    |
| `beforeUpdate`  | Before the component updates      |
| `updated`       | After the component updates       |
| `beforeUnmount` | Before the component is unmounted |
| `unmounted`     | After the component is unmounted  |

```javascript
const MyComponent = defineComponent({
  beforeMount() {
    console.log('Before mount');
  },

  mounted() {
    console.log('Mounted!');
  },

  beforeUpdate() {
    console.log('Before update');
  },

  updated() {
    console.log('Updated!');
  },

  beforeUnmount() {
    console.log('Before unmount');
  },

  unmounted() {
    console.log('Unmounted!');
  }
});
```

<div class="lifecycle">

<div class="life-step">
  <span>01</span>
  <strong>Mount</strong>
</div>

<div class="life-line"></div>

<div class="life-step">
  <span>02</span>
  <strong>Update</strong>
</div>

<div class="life-line"></div>

<div class="life-step">
  <span>03</span>
  <strong>Unmount</strong>
</div>

</div>

<style>
.lifecycle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 30px 0;
}

.life-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 15px 20px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.025);
}

.life-step span {
  font-size: .7rem;
  opacity: .5;
}

.life-line {
  width: 35px;
  height: 1px;
  background: rgba(255,255,255,.2);
  animation: lifeLine 1.5s ease-in-out infinite;
}

@keyframes lifeLine {
  50% {
    opacity: .3;
  }
}
</style>

---

## Slots

Slots allow components to receive and render content from their parent.

### Default Slot

```html
<!-- Component -->
<div class="card">
  <div class="header">
    <slot></slot>
  </div>
</div>

<!-- Usage -->
<Card>
  <h2>Hello World</h2>
</Card>
```

### Named Slots

```html
<!-- Component -->
<div class="layout">
  <header>
    <slot name="header"></slot>
  </header>

  <main>
    <slot name="main"></slot>
  </main>

  <footer>
    <slot name="footer"></slot>
  </footer>
</div>

<!-- Usage -->
<Layout>

  <template #header>
    <h1>Page Title</h1>
  </template>

  <template #main>
    <p>Main content</p>
  </template>

</Layout>
```

### Scoped Slots

Scoped slots expose data from the child component to the slot content.

```html
<!-- Component -->
<div>
  <slot
    :item="item"
    :index="index"
  ></slot>
</div>

<!-- Usage -->
<ItemList :items="items">

  <template #default="{ item, index }">
    <div>
      {{ index }}: {{ item.name }}
    </div>
  </template>

</ItemList>
```

<div class="slot-visual">

<div class="slot-parent">
  <strong>Parent</strong>
  <span>Provides content</span>
</div>

<div class="slot-arrow">↓</div>

<div class="slot-child">
  <strong>Child</strong>
  <span>Renders slot</span>
</div>

</div>

<style>
.slot-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 30px 0;
}

.slot-parent,
.slot-child {
  width: min(100%, 240px);
  padding: 18px;
  text-align: center;
  border-radius: 15px;
  border: 1px solid rgba(56,189,248,.18);
  background: rgba(56,189,248,.04);
}

.slot-parent span,
.slot-child span {
  display: block;
  margin-top: 4px;
  opacity: .6;
  font-size: .85rem;
}

.slot-arrow {
  animation: slotArrow 1.5s ease-in-out infinite;
}

@keyframes slotArrow {
  50% {
    transform: translateY(6px);
  }
}
</style>

---

## Component Communication

### Props Down, Events Up

A common component communication pattern is to pass data down through props and send events back up.

```html
<!-- Parent -->
<Child
  :value="parentData"
  @update="handleUpdate"
/>

<!-- Child -->
<script>
props: ['value'],

methods: {
  updateParent() {
    this.$emit('update', newValue);
  }
}
</script>
```

<div class="communication-flow">

<div class="communication-node">
  <strong>Parent</strong>
  <span>↓ Props</span>
</div>

<div class="communication-center">
  ↕
</div>

<div class="communication-node">
  <strong>Child</strong>
  <span>↑ Events</span>
</div>

</div>

<style>
.communication-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;
  margin: 30px 0;
}

.communication-node {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 18px 25px;
  border-radius: 15px;
  border: 1px solid rgba(56,189,248,.2);
  background: rgba(56,189,248,.05);
  text-align: center;
}

.communication-node span {
  opacity: .6;
  font-size: .8rem;
}

.communication-center {
  font-size: 1.7rem;
  animation: communicationPulse 2s ease-in-out infinite;
}

@keyframes communicationPulse {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.15);
  }
}
</style>

### Provide / Inject

Use `provide` and `inject` to share values across component boundaries.

```javascript
// Parent
provide() {
  return {
    theme: 'dark',
    user: this.user
  };
}

// Child
inject: ['theme', 'user']
```

---

## Dynamic Components

Render different components dynamically using `:is`.

```html
<component
  :is="currentComponent"
  :props="componentProps"
/>
```

### Component Switching

```html
<div>
  <button @click="current = 'TabA'">
    Tab A
  </button>

  <button @click="current = 'TabB'">
    Tab B
  </button>

  <component :is="current" />
</div>

<script>
const app = teloce.createApp('#app', {
  current: 'TabA',

  components: {
    TabA: {
      template: '<div>Tab A Content</div>'
    },

    TabB: {
      template: '<div>Tab B Content</div>'
    }
  }
});
</script>
```

<div class="dynamic-tabs">

<div class="dynamic-tab active">Tab A</div>
<div class="dynamic-tab">Tab B</div>
<div class="dynamic-tab">Tab C</div>

</div>

<style>
.dynamic-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 25px 0;
}

.dynamic-tab {
  padding: 10px 17px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.08);
  opacity: .55;
  transition: all .3s ease;
}

.dynamic-tab.active {
  opacity: 1;
  border-color: rgba(56,189,248,.35);
  background: rgba(56,189,248,.08);
  animation: dynamicTabPulse 2s ease-in-out infinite;
}

@keyframes dynamicTabPulse {
  50% {
    box-shadow: 0 0 20px rgba(56,189,248,.1);
  }
}
</style>

---

## Async Components

Components can perform asynchronous setup work before rendering their content.

```javascript
const AsyncComponent = defineComponent({
  async setup() {
    const data = await fetchData();

    return {
      data
    };
  },

  template: `
    <div>
      {{ data }}
    </div>
  `
});
```

<div class="async-status">
  <span class="async-loader"></span>
  <strong>Async Component</strong>
  <span>Loading → Resolving → Rendering</span>
</div>

<style>
.async-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 18px;
  margin: 25px 0;
  border-radius: 15px;
  border: 1px solid rgba(56,189,248,.15);
  background: rgba(56,189,248,.04);
}

.async-status > span:last-child {
  opacity: .6;
  font-size: .85rem;
}

.async-loader {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(56,189,248,.25);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: asyncSpin .8s linear infinite;
}

@keyframes asyncSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>

---

## Component Architecture

<div class="architecture-grid">

<div>
  <span>📥</span>
  <strong>Props</strong>
  <small>Receive data</small>
</div>

<div>
  <span>⚡</span>
  <strong>Data</strong>
  <small>Reactive state</small>
</div>

<div>
  <span>🛠️</span>
  <strong>Methods</strong>
  <small>Component logic</small>
</div>

<div>
  <span>🔌</span>
  <strong>Hooks</strong>
  <small>Lifecycle control</small>
</div>

<div>
  <span>🎰</span>
  <strong>Slots</strong>
  <small>Flexible content</small>
</div>

<div>
  <span>🔄</span>
  <strong>Dynamic</strong>
  <small>Runtime switching</small>
</div>

</div>

<style>
.architecture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin: 30px 0;
}

.architecture-grid > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 18px;
  border-radius: 15px;
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  transition:
    transform .3s ease,
    border-color .3s ease;
}

.architecture-grid > div:hover {
  transform: translateY(-6px);
  border-color: rgba(56,189,248,.35);
}

.architecture-grid span {
  font-size: 1.4rem;
}

.architecture-grid small {
  opacity: .55;
}
</style>

---

## Next Steps

<div class="teloce-next">

<a href="/guides/directives" class="next-card">
  <strong>🎯 Directives</strong>
  <span>Explore the complete directive system.</span>
</a>

<a href="/guides/sfc" class="next-card">
  <strong>📦 SFC (.vel)</strong>
  <span>Build Single File Components.</span>
</a>

<a href="/guides/cheatsheet" class="next-card">
  <strong>📋 Cheatsheet</strong>
  <span>Keep the component API close at hand.</span>
</a>

</div>

<style>
.teloce-next {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin-top: 30px;
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

<div class="components-footer">

### 🧩 Compose. Reuse. Scale.

Teloce components combine reactive state, props,
methods, slots, lifecycle hooks, and dynamic rendering
into reusable UI building blocks.

</div>

<style>
.components-footer {
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
  animation: componentFooterGlow 4s ease-in-out infinite;
}

@keyframes componentFooterGlow {
  0%, 100% {
    box-shadow: 0 0 0 rgba(56,189,248,0);
  }

  50% {
    box-shadow: 0 0 40px rgba(56,189,248,.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .components-footer {
    animation: none;
  }
}
</style>
