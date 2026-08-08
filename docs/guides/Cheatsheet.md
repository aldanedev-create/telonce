# Teloce Cheatsheet

> **Quick reference for Teloce templates, reactivity, components, directives, filters, CLI commands, and CDN builds.**

<style>
.teloce-hero {
  position: relative;
  overflow: hidden;
  padding: 42px 28px;
  margin: 20px 0 36px;
  border: 1px solid rgba(99, 102, 241, .25);
  border-radius: 18px;
  background: linear-gradient(135deg, #0f172a, #172554, #111827);
  color: #fff;
  text-align: center;
  box-shadow: 0 12px 40px rgba(15, 23, 42, .18);
}

.teloce-hero::before,
.teloce-hero::after {
  content: "";
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  filter: blur(45px);
  opacity: .35;
  animation: teloce-float 6s ease-in-out infinite;
}

.teloce-hero::before {
  background: #6366f1;
  top: -80px;
  left: -60px;
}

.teloce-hero::after {
  background: #06b6d4;
  right: -60px;
  bottom: -80px;
  animation-delay: -3s;
}

.teloce-hero-content {
  position: relative;
  z-index: 1;
}

.teloce-hero h2 {
  margin: 0 0 10px;
  font-size: 2rem;
  letter-spacing: -.03em;
}

.teloce-hero p {
  margin: 0;
  opacity: .8;
}

.teloce-badge {
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 14px;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 999px;
  background: rgba(255,255,255,.08);
  font-size: .8rem;
  animation: teloce-pulse 2.5s ease-in-out infinite;
}

.teloce-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin: 24px 0 34px;
}

.teloce-card {
  padding: 18px;
  border: 1px solid rgba(127,127,127,.2);
  border-radius: 14px;
  background: rgba(127,127,127,.05);
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}

.teloce-card:hover {
  transform: translateY(-5px);
  border-color: rgba(99,102,241,.5);
  box-shadow: 0 12px 30px rgba(0,0,0,.12);
}

.teloce-card strong {
  display: block;
  margin-bottom: 5px;
}

.teloce-card code {
  font-size: .8rem;
}

.teloce-section {
  scroll-margin-top: 30px;
}

.teloce-code {
  transition: transform .2s ease;
}

.teloce-code:hover {
  transform: translateY(-2px);
}

@keyframes teloce-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(25px, -18px) scale(1.12); }
}

@keyframes teloce-pulse {
  0%, 100% { opacity: .7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.04); }
}

@media (prefers-reduced-motion: reduce) {
  .teloce-hero::before,
  .teloce-hero::after,
  .teloce-badge {
    animation: none;
  }

  .teloce-card,
  .teloce-code {
    transition: none;
  }
}
</style>

<div class="teloce-hero">
  <div class="teloce-hero-content">
    <div class="teloce-badge">⚡ Teloce Reference</div>
    <h2>Build Fast. React Fast.</h2>
    <p>Everything you need to quickly build Teloce applications.</p>
  </div>
</div>

<div class="teloce-grid">
  <div class="teloce-card">
    <strong>🧩 Templates</strong>
    <code>{{ }}</code>, loops, conditions and bindings
  </div>

  <div class="teloce-card">
    <strong>⚡ Reactivity</strong>
    Signals, effects, computed values and batching
  </div>

  <div class="teloce-card">
    <strong>🧱 Components</strong>
    Props, slots, lifecycle and composition
  </div>

  <div class="teloce-card">
    <strong>🎯 Directives</strong>
    Events, bindings and custom behavior
  </div>
</div>

---

## Template Syntax

### Interpolation

```html
{{ variable }}
{{ user.name }}
{{ count * 2 }}
```

### Filters

```html
{{ value | uppercase }}
{{ value | currency }}
{{ value | dateFormat('YYYY-MM-DD') }}
```

### Loops

```html
<for product in products">
    <div>{{ product.name }}</div>
</for>

<!-- Keyed -->
<for key="id" item="product" in="products">
    <div>{{ product.name }}</div>
</for>
```

### Conditions

```html
<if loggedIn">
    <h1>Welcome</h1>
    <else>
        <button>Login</button>
</if>
```

### Events

```html
<button @click="handle">Click</button>
<form @submit="handle">Submit</form>
<input @input="handle" />
<input @keyup.enter="handle" />
```

### Bindings

```html
<input :model="username" />

<div :class="{ active: isActive }">Content</div>

<div :style="{ color: textColor }">Content</div>

<div :show="isVisible">Content</div>

<button :disabled="isLoading">Submit</button>

<a :href="url">Link</a>

<img :src="imageUrl" />
```

### Components

```html
<MyComponent :prop="value" @event="handler">
    <template #slot>
        <p>Slot content</p>
    </template>
</MyComponent>
```

---

## Reactivity API

### Signals

```javascript
const [count, setCount] = createSignal(0);

count(); // Get value
setCount(10); // Set value

count.update(prev => prev + 1); // Update
```

### Effects

```javascript
createEffect(() => {
    console.log(count());
});
```

### Computed

```javascript
const double = createComputed(() => count() * 2);
```

### Batch

```javascript
batch(() => {
    setCount(10);
    setName('John');
});
```

### Untracked

```javascript
untracked(() => count());
```

---

## Component API

### Options

```javascript
defineComponent({
    name: 'MyComponent',

    props: {
        title: {
            type: String,
            required: true
        }
    },

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

    computed: {
        double() {
            return this.count * 2;
        }
    },

    template: '<div>{{ count }}</div>'
});
```

### Lifecycle

```javascript
{
    beforeMount() {},
    mounted() {},
    beforeUpdate() {},
    updated() {},
    beforeUnmount() {},
    unmounted() {}
}
```

### Slots

```html
<!-- Component -->
<slot></slot>
<slot name="header"></slot>

<!-- Usage -->
<Component>
    <template #header>
        Content
    </template>
</Component>
```

---

## Directives Reference

| Directive   | Description     |
| ----------- | --------------- |
| `@click`    | Click event     |
| `@submit`   | Submit event    |
| `@input`    | Input event     |
| `@change`   | Change event    |
| `@keyup`    | Keyup event     |
| `@focus`    | Focus event     |
| `@blur`     | Blur event      |
| `:model`    | Two-way binding |
| `:class`    | Class binding   |
| `:style`    | Style binding   |
| `:show`     | Show/hide       |
| `:hide`     | Hide/show       |
| `:disabled` | Disabled state  |
| `:checked`  | Checked state   |
| `:value`    | Value binding   |
| `:href`     | Link binding    |
| `:src`      | Image binding   |

### Event Modifiers

| Modifier   | Description                        |
| ---------- | ---------------------------------- |
| `.stop`    | Stop propagation                   |
| `.prevent` | Prevent default                    |
| `.once`    | Trigger once                       |
| `.self`    | Trigger only on the element itself |
| `.passive` | Passive event listener             |
| `.capture` | Capture phase                      |

---

## Filters Reference

### String Filters

| Filter       | Description             |
| ------------ | ----------------------- |
| `capitalize` | Capitalize first letter |
| `uppercase`  | Convert to uppercase    |
| `lowercase`  | Convert to lowercase    |
| `trim`       | Trim whitespace         |
| `truncate`   | Truncate to length      |
| `slugify`    | Convert to slug         |
| `kebabCase`  | Convert to kebab-case   |
| `camelCase`  | Convert to camelCase    |
| `snakeCase`  | Convert to snake_case   |
| `startCase`  | Convert to Start Case   |

### Number Filters

| Filter     | Description          |
| ---------- | -------------------- |
| `currency` | Format as currency   |
| `percent`  | Format as percentage |
| `number`   | Format with commas   |
| `decimal`  | Format to decimals   |
| `round`    | Round number         |
| `floor`    | Floor number         |
| `ceil`     | Ceil number          |
| `abs`      | Absolute value       |

### Date Filters

| Filter         | Description      |
| -------------- | ---------------- |
| `dateFormat`   | Format date      |
| `timeAgo`      | Relative time    |
| `dateFromISO`  | Parse ISO date   |
| `relativeTime` | Past/future time |

### Array Filters

| Filter    | Description         |
| --------- | ------------------- |
| `join`    | Join array elements |
| `first`   | Get first element   |
| `last`    | Get last element    |
| `pluck`   | Extract property    |
| `where`   | Filter array        |
| `orderBy` | Sort array          |
| `groupBy` | Group array         |

---

## CLI Commands

| Command         | Description              |
| --------------- | ------------------------ |
| `teloce dev`    | Start development server |
| `teloce build`  | Build for production     |
| `teloce debug`  | Open debugger dashboard  |
| `teloce create` | Create a new project     |
| `teloce doctor` | Check the environment    |
| `teloce lint`   | Lint templates           |
| `teloce watch`  | Watch and rebuild        |

---

## CDN Builds

### Production

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
```

### Debug

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.debug.js"></script>
```

### ESM

```html
<script type="module">
import { createApp } from 'https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.esm.js';
</script>
```

---

## Quick Reference

<div class="teloce-grid">
  <div class="teloce-card">
    <strong>Templates</strong>
    Interpolation · Filters · Loops · Conditions · Events
  </div>

  <div class="teloce-card">
    <strong>Reactivity</strong>
    Signals · Effects · Computed · Memo · Batch
  </div>

  <div class="teloce-card">
    <strong>Components</strong>
    Props · Data · Methods · Slots · Lifecycle
  </div>

  <div class="teloce-card">
    <strong>Directives</strong>
    Events · Bindings · Modifiers · Custom Directives
  </div>

  <div class="teloce-card">
    <strong>SFC</strong>
    `.vel` · Template · Script · Style · Scoped CSS
  </div>

  <div class="teloce-card">
    <strong>Tooling</strong>
    CLI · Vite · CDN · Production Builds
  </div>
</div>

---

## Next Steps

* [Python Guide](https://docs/guides/python-guide) — Using Teloce with Flask, Django, and FastAPI
* [SFC (.vel)](https://docs/guides/sfc) — Single File Components
* [Examples](https://docs/examples) — Full example applications
* [Templates](https://docs/guides/templates) — Complete template reference
* [Reactivity](https://docs/guides/reactivity) — Signals and fine-grained updates
