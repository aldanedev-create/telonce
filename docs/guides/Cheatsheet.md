# Teloce Cheatsheet

> **Quick reference for Teloce templates, reactivity, components, directives, filters, CLI commands, and CDN builds.**

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
<for product in products>
  <div>{{ product.name }}</div>
</for>
```

#### Keyed Loops

```html
<for key="id" item="product" in="products">
  <div>{{ product.name }}</div>
</for>
```

### Conditions

```html
<if loggedIn>
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

<div :class="{ active: isActive }">
  Content
</div>

<div :style="{ color: textColor }">
  Content
</div>

<div :show="isVisible">
  Content
</div>

<button :disabled="isLoading">
  Submit
</button>

<a :href="url">
  Link
</a>

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

# Reactivity API

## Signals

```javascript
const [count, setCount] = createSignal(0);

count(); // Get value
setCount(10); // Set value

count.update(prev => prev + 1); // Update
```

## Effects

```javascript
createEffect(() => {
  console.log(count());
});
```

## Computed

```javascript
const double = createComputed(() => count() * 2);
```

## Batch

```javascript
batch(() => {
  setCount(10);
  setName('John');
});
```

## Untracked

```javascript
untracked(() => count());
```

---

# Component API

## Options

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

## Lifecycle

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

## Slots

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

# Directives Reference

| Directive   | Description     |
| :---------- | :-------------- |
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

## Event Modifiers

| Modifier   | Description                        |
| :--------- | :--------------------------------- |
| `.stop`    | Stop propagation                   |
| `.prevent` | Prevent default                    |
| `.once`    | Trigger once                       |
| `.self`    | Trigger only on the element itself |
| `.passive` | Passive event listener             |
| `.capture` | Capture phase                      |

---

# Filters Reference

## String Filters

| Filter       | Description             |
| :----------- | :---------------------- |
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

## Number Filters

| Filter     | Description          |
| :--------- | :------------------- |
| `currency` | Format as currency   |
| `percent`  | Format as percentage |
| `number`   | Format with commas   |
| `decimal`  | Format to decimals   |
| `round`    | Round number         |
| `floor`    | Floor number         |
| `ceil`     | Ceil number          |
| `abs`      | Absolute value       |

## Date Filters

| Filter         | Description      |
| :------------- | :--------------- |
| `dateFormat`   | Format date      |
| `timeAgo`      | Relative time    |
| `dateFromISO`  | Parse ISO date   |
| `relativeTime` | Past/future time |

## Array Filters

| Filter    | Description         |
| :-------- | :------------------ |
| `join`    | Join array elements |
| `first`   | Get first element   |
| `last`    | Get last element    |
| `pluck`   | Extract property    |
| `where`   | Filter array        |
| `orderBy` | Sort array          |
| `groupBy` | Group array         |

---

# CLI Commands

| Command         | Description              |
| :-------------- | :----------------------- |
| `teloce dev`    | Start development server |
| `teloce build`  | Build for production     |
| `teloce debug`  | Open debugger dashboard  |
| `teloce create` | Create a new project     |
| `teloce doctor` | Check the environment    |
| `teloce lint`   | Lint templates           |
| `teloce watch`  | Watch and rebuild        |

---

# CDN Builds

## Production

```html
<script src="https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.global.min.js"></script>
```

## ESM

```html
<script type="module">
  import { createApp } from
    'https://cdn.jsdelivr.net/npm/teloce@0.3.0/dist/teloce.esm.js';
</script>
```

---

# Quick Reference

| Area           | Includes                                              |
| :------------- | :---------------------------------------------------- |
| **Templates**  | Interpolation · Filters · Loops · Conditions · Events |
| **Reactivity** | Signals · Effects · Computed · Memo · Batch           |
| **Components** | Props · Data · Methods · Slots · Lifecycle            |
| **Directives** | Events · Bindings · Modifiers · Custom Directives     |
| **SFC**        | `.vel` · Template · Script · Style · Scoped CSS       |
| **Tooling**    | CLI · Vite · CDN · Production Builds                  |

---

# Next Steps

* [Python Guide](https://docs/guides/python-guide) — Using Teloce with Flask, Django, and FastAPI
* [SFC (`.vel`)](https://docs/guides/sfc) — Single File Components
* [Examples](https://docs/examples) — Full example applications
* [Templates](https://docs/guides/templates) — Complete template reference
* [Reactivity](https://docs/guides/reactivity) — Signals and fine-grained updates
