# @teloce/runtime-core




<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo "
   width="200"/>
</p>



**Author:** Aldane Hutchinson

Teloce:A JavaScript template engine for Python web developers.
* [Teloce Website](https://telonce-website.vercel.app/#/)


> Runtime core for Teloce — component system, lifecycle hooks, props, slots, and directives.

---

## Installation

```bash
npm install @teloce/runtime-core
```

---

## Components

Teloce components are reusable pieces of UI that encapsulate their own state, methods, templates, and behavior.

### Defining a Component

```javascript
import { defineComponent } from '@teloce/runtime-core';

const MyComponent = defineComponent({
  name: 'MyComponent',

  data() {
    return {
      count: 0,
    };
  },

  methods: {
    increment() {
      this.count++;
    },
  },

  template: `
    <div>
      <h1>Count: {{ count }}</h1>
      <button @click="increment">Increment</button>
    </div>
  `,
});
```

---

## Lifecycle Hooks

Lifecycle hooks allow you to execute code at specific stages of a component's lifecycle.

```javascript
import {
  defineComponent,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
} from '@teloce/runtime-core';

const Component = defineComponent({
  name: 'LifecycleExample',

  beforeMount() {
    console.log('Before mount');
  },

  mounted() {
    console.log('Mounted');
  },

  beforeUpdate() {
    console.log('Before update');
  },

  updated() {
    console.log('Updated');
  },

  beforeUnmount() {
    console.log('Before unmount');
  },

  unmounted() {
    console.log('Unmounted');
  },
});
```

### Lifecycle Order

The lifecycle generally follows this order:

```text
beforeMount
    ↓
mounted
    ↓
beforeUpdate
    ↓
updated
    ↓
beforeUnmount
    ↓
unmounted
```

### Available Hooks

| Hook                | Description                          |
| ------------------- | ------------------------------------ |
| `onBeforeMount()`   | Runs before the component is mounted |
| `onMounted()`       | Runs after the component is mounted  |
| `onBeforeUpdate()`  | Runs before the component updates    |
| `onUpdated()`       | Runs after the component updates     |
| `onBeforeUnmount()` | Runs before the component is removed |
| `onUnmounted()`     | Runs after the component is removed  |

---

## Props

Props allow components to receive data from their parent components.

### Defining Props

```javascript
import { defineComponent } from '@teloce/runtime-core';

const Component = defineComponent({
  name: 'MyComponent',

  props: {
    title: {
      type: String,
      required: true,
    },

    count: {
      type: Number,
      default: 0,
    },

    items: {
      type: Array,
      default: () => [],
    },
  },
});
```

### Prop Options

| Option     | Description                                 |
| ---------- | ------------------------------------------- |
| `type`     | Expected JavaScript type                    |
| `required` | Whether the prop must be provided           |
| `default`  | Default value when the prop is not provided |

---

## Slots

Slots provide content projection, allowing parent components to provide content to specific areas of a child component.

### Creating Slots

```javascript
import {
  defineComponent,
  createSlots,
  renderSlot,
} from '@teloce/runtime-core';

const Component = defineComponent({
  name: 'Card',

  template: `
    <div class="card">
      <div class="header">
        ${renderSlot(slots, 'header')}
      </div>

      <div class="body">
        ${renderSlot(slots, 'default')}
      </div>
    </div>
  `,
});
```

### Slot Types

| Slot         | Description                       |
| ------------ | --------------------------------- |
| `default`    | Default content slot              |
| `header`     | Named header slot                 |
| Custom names | Any application-defined slot name |

---

## Directives

Directives allow you to add custom behavior to DOM elements.

### Creating a Directive

```javascript
import {
  registerDirective,
  createDirective,
} from '@teloce/runtime-core';

registerDirective(
  'focus',
  createDirective({
    name: 'focus',

    mounted(el) {
      el.focus();
    },
  }),
);
```

### Directive Lifecycle

A directive can define lifecycle callbacks such as:

```javascript
const focusDirective = createDirective({
  name: 'focus',

  mounted(el) {
    el.focus();
  },

  updated(el, binding) {
    console.log('Directive updated:', binding);
  },

  unmounted(el) {
    console.log('Directive removed');
  },
});
```

---

## API Reference

### `defineComponent()`

Creates a reusable Teloce component.

```typescript
function defineComponent(options: ComponentOptions): Component;
```

Common options include:

| Option          | Description                   |
| --------------- | ----------------------------- |
| `name`          | Component name                |
| `data()`        | Returns component state       |
| `methods`       | Component methods             |
| `props`         | Component properties          |
| `template`      | Component template            |
| Lifecycle hooks | Component lifecycle callbacks |

---

### `defineProps()`

Defines or validates component props.

```typescript
function defineProps<T>(options: PropOptions): T;
```

---

### `createSlots()`

Creates a slots collection for a component.

```typescript
function createSlots(
  slots: Record<string, unknown>,
): Slots;
```

---

### `renderSlot()`

Renders a named slot.

```typescript
function renderSlot(
  slots: Slots,
  name?: string,
): unknown;
```

Example:

```javascript
renderSlot(slots, 'header');
renderSlot(slots, 'default');
```

---

### `registerDirective()`

Registers a global directive.

```typescript
function registerDirective(
  name: string,
  directive: Directive,
): void;
```

---

### `createDirective()`

Creates a directive definition.

```typescript
function createDirective(
  options: DirectiveOptions,
): Directive;
```

---

## TypeScript Support

Teloce Runtime Core is designed to work with TypeScript.

```typescript
import {
  defineComponent,
  type ComponentOptions,
} from '@teloce/runtime-core';

const Component = defineComponent({
  name: 'Counter',

  data() {
    return {
      count: 0,
    };
  },

  methods: {
    increment() {
      this.count++;
    },
  },
});
```

---

## License

MIT
