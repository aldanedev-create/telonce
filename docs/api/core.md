# Core API Reference

The **Core API** provides the foundation for building Teloce applications.

---

## `createApp`

Creates a new Teloce application instance.

### Signature

```typescript
function createApp(
  rootSelector: string | Element,
  data: Record<string, any>,
  options?: AppOptions
): AppInstance
```

### Parameters

| Parameter      | Type                  | Description                                   |
| -------------- | --------------------- | --------------------------------------------- |
| `rootSelector` | `string \| Element`   | CSS selector or DOM element to mount the app. |
| `data`         | `Record<string, any>` | Initial reactive data.                        |
| `options`      | `AppOptions`          | Optional application configuration.           |

### `AppOptions`

| Option       | Type                        | Default | Description               |
| ------------ | --------------------------- | ------- | ------------------------- |
| `components` | `Record<string, Component>` | `{}`    | Global components.        |
| `directives` | `Record<string, Directive>` | `{}`    | Global directives.        |
| `filters`    | `Record<string, Filter>`    | `{}`    | Global filters.           |
| `plugins`    | `Plugin[]`                  | `[]`    | Plugins to install.       |
| `dev`        | `boolean`                   | `false` | Enables development mode. |

### Returns

| Property    | Type                                           | Description                 |
| ----------- | ---------------------------------------------- | --------------------------- |
| `state`     | `ReactiveState`                                | Reactive application state. |
| `component` | `(name: string, component: Component) => void` | Registers a component.      |
| `directive` | `(name: string, directive: Directive) => void` | Registers a directive.      |
| `filter`    | `(name: string, filter: Filter) => void`       | Registers a filter.         |
| `use`       | `(plugin: Plugin) => void`                     | Installs a plugin.          |
| `mount`     | `() => void`                                   | Mounts the application.     |
| `unmount`   | `() => void`                                   | Unmounts the application.   |

### Example

```javascript
const app = teloce.createApp('#app', {
  count: 0,
  name: 'Teloce',
});

app.component('MyComponent', MyComponent);
app.use(MyPlugin);
app.mount();
```

---

## `defineComponent`

Defines a reusable Teloce component.

### Signature

```typescript
function defineComponent<P = any, S = any>(
  options: ComponentOptions<P, S>
): Component<P, S>
```

### `ComponentOptions`

| Option          | Type                             | Description              |
| --------------- | -------------------------------- | ------------------------ |
| `name`          | `string`                         | Component name.          |
| `props`         | `PropsOptions`                   | Props definition.        |
| `data`          | `() => S`                        | Reactive component data. |
| `methods`       | `Record<string, Function>`       | Component methods.       |
| `computed`      | `Record<string, () => any>`      | Computed properties.     |
| `template`      | `string`                         | HTML template.           |
| `render`        | `(ctx: ComponentContext) => any` | Render function.         |
| `beforeMount`   | `() => void`                     | Runs before mounting.    |
| `mounted`       | `() => void`                     | Runs after mounting.     |
| `beforeUpdate`  | `() => void`                     | Runs before an update.   |
| `updated`       | `() => void`                     | Runs after an update.    |
| `beforeUnmount` | `() => void`                     | Runs before unmounting.  |
| `unmounted`     | `() => void`                     | Runs after unmounting.   |

### Example

```javascript
const MyComponent = teloce.defineComponent({
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
  },

  data() {
    return {
      localCount: 0,
    };
  },

  methods: {
    increment() {
      this.localCount++;
    },
  },

  computed: {
    doubleCount() {
      return this.localCount * 2;
    },
  },

  template: `
    <div>
      <h2>{{ title }}</h2>
      <p>Count: {{ count }}</p>
      <p>Local: {{ localCount }}</p>

      <button @click="increment">
        Increment
      </button>
    </div>
  `,
});
```

---

## `mount`

Mounts an application to the DOM.

### Signature

```typescript
function mount(
  app: AppInstance,
  selector: string | Element,
  data?: Record<string, any>
): AppInstance
```

### Example

```javascript
const app = createApp(
  '#app',
  {}
);

mount(app, '#app', {
  count: 0,
});
```

---

## `createConfig`

Creates a Teloce configuration object.

### Signature

```typescript
function createConfig(
  options: Partial<TeloceConfig>
): TeloceConfig
```

### `TeloceConfig`

| Option        | Type      | Default | Description                     |
| ------------- | --------- | ------- | ------------------------------- |
| `dev`         | `boolean` | `false` | Enables development mode.       |
| `debug`       | `boolean` | `false` | Enables debug logging.          |
| `strict`      | `boolean` | `true`  | Enables strict behavior.        |
| `performance` | `boolean` | `false` | Enables performance monitoring. |

### Example

```javascript
const config = teloce.createConfig({
  dev: true,
  debug: true,
});
```

---

## `createPlugin`

Creates a Teloce plugin.

### Signature

```typescript
function createPlugin(
  install: (
    app: AppInstance,
    options?: any
  ) => void,
  name?: string,
  version?: string
): Plugin
```

### Example

```javascript
const MyPlugin = teloce.createPlugin(
  (app, options) => {
    app.component(
      'MyComponent',
      MyComponent
    );
  },
  'my-plugin',
  '1.0.0'
);

app.use(MyPlugin);
```

---

# Component Lifecycle

Teloce components provide lifecycle hooks for controlling behavior during their lifetime.

### Lifecycle Hooks

| Hook            | Description                                        |
| --------------- | -------------------------------------------------- |
| `beforeMount`   | Called before the component is mounted to the DOM. |
| `mounted`       | Called after the component is mounted.             |
| `beforeUpdate`  | Called before the component updates.               |
| `updated`       | Called after the component updates.                |
| `beforeUnmount` | Called before the component is removed.            |
| `unmounted`     | Called after the component is removed.             |

### Example

```javascript
const MyComponent = teloce.defineComponent({
  beforeMount() {
    console.log('About to mount');
  },

  mounted() {
    console.log('Mounted!');
  },

  beforeUpdate() {
    console.log('About to update');
  },

  updated() {
    console.log('Updated!');
  },

  beforeUnmount() {
    console.log('About to unmount');
  },

  unmounted() {
    console.log('Unmounted!');
  },
});
```

---

# CSS Animations

Teloce can work with normal CSS animations and transitions. CSS is useful for keeping visual effects outside JavaScript while Teloce controls state and DOM updates.

## Basic Fade Animation

```css
.fade {
  animation: fade-in 400ms ease forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
```

Use it in a template:

```html
<div class="fade">
  Hello Teloce
</div>
```

---

## Slide Animation

```css
.slide-up {
  animation: slide-up 500ms ease-out forwards;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

```html
<div class="slide-up">
  Animated content
</div>
```

---

## Scale Animation

```css
.scale-in {
  animation: scale-in 300ms cubic-bezier(0.2, 0.8, 0.2, 1)
    forwards;
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## Hover Animation

CSS transitions are useful for interactive components.

```css
.button {
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgb(0 0 0 / 15%);
}

.button:active {
  transform: translateY(0);
}
```

```html
<button class="button">
  Hover Me
</button>
```

---

## Reactive Animation

Teloce state can control CSS classes.

```javascript
const app = teloce.createApp('#app', {
  active: false,
});
```

```html
<div :class="{ active: active }">
  Animated panel
</div>

<button @click="active = !active">
  Toggle
</button>
```

```css
.panel {
  opacity: 0.5;
  transform: scale(0.96);
  transition:
    opacity 250ms ease,
    transform 250ms ease;
}

.panel.active {
  opacity: 1;
  transform: scale(1);
}
```

---

## Advanced CSS Animation

CSS custom properties can be controlled from application state.

```css
.card {
  --x: 0px;
  --y: 0px;

  transform:
    translate3d(var(--x), var(--y), 0);

  transition: transform 300ms ease;
}
```

Teloce can update the values:

```javascript
const app = teloce.createApp('#app', {
  x: 20,
  y: 10,
});
```

```html
<div
  class="card"
  :style="{
    '--x': x + 'px',
    '--y': y + 'px'
  }"
>
  Animated Card
</div>
```

This approach allows Teloce's reactive state to control complex CSS effects without putting the animation logic directly into JavaScript.

---

## Reduced Motion

Production applications should respect the user's motion preferences.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

# API Usage Pattern

A typical Teloce application can combine the core APIs:

```javascript
const app = teloce.createApp('#app', {
  count: 0,
  visible: true,
});

const Counter = teloce.defineComponent({
  name: 'Counter',

  methods: {
    increment() {
      this.count++;
    },
  },

  template: `
    <section class="counter">
      <h2>{{ count }}</h2>

      <button @click="increment">
        Increment
      </button>
    </section>
  `,
});

app.component('Counter', Counter);

app.mount();
```

CSS can then handle the visual layer:

```css
.counter {
  animation: scale-in 300ms ease-out;
}

.counter button {
  transition:
    transform 150ms ease,
    opacity 150ms ease;
}

.counter button:hover {
  transform: translateY(-2px);
}

.counter button:active {
  transform: translateY(0);
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

This separation keeps **application logic in Teloce** and **visual behavior in CSS**.

---

# Next Steps

* [Reactivity API](https://docs/api/reactivity-api) — Signals, effects, and computed values.
* [Directives](https://docs/api/directives) — Built-in directives.
* [Filters](https://docs/api/filters) — Built-in filters.
* [Plugin System](https://docs/api/plugin-system) — Extend Teloce with plugins.
