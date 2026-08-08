# Components

Components are reusable building blocks for your Teloce applications.

They combine reactive state, props, methods, slots, lifecycle hooks, and dynamic rendering into reusable UI building blocks.

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
| :--------- | :------------------------------ |
| `String`   | `type: String`                  |
| `Number`   | `type: Number`                  |
| `Boolean`  | `type: Boolean`                 |
| `Array`    | `type: Array`                   |
| `Object`   | `type: Object`                  |
| `Function` | `type: Function`                |
| Custom     | `validator: (value) => boolean` |

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

---

## Lifecycle Hooks

Lifecycle hooks allow you to run code at specific stages of a component's lifetime.

| Hook            | When It Runs                      |
| :-------------- | :-------------------------------- |
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

---

## Slots

Slots allow components to receive and render content from their parent.

### Default Slot

**Component:**

```html
<div class="card">
  <div class="header">
    <slot></slot>
  </div>
</div>
```

**Usage:**

```html
<Card>
  <h2>Hello World</h2>
</Card>
```

### Named Slots

**Component:**

```html
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
```

**Usage:**

```html
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

**Component:**

```html
<div>
  <slot
    :item="item"
    :index="index"
  ></slot>
</div>
```

**Usage:**

```html
<ItemList :items="items">
  <template #default="{ item, index }">
    <div>
      {{ index }}: {{ item.name }}
    </div>
  </template>
</ItemList>
```

---

## Component Communication

### Props Down, Events Up

A common component communication pattern is to pass data down through props and send events back up.

**Parent:**

```html
<Child
  :value="parentData"
  @update="handleUpdate"
/>
```

**Child:**

```javascript
export default {
  props: ['value'],

  methods: {
    updateParent() {
      this.$emit('update', newValue);
    }
  }
};
```

### Provide / Inject

Use `provide` and `inject` to share values across component boundaries.

**Parent:**

```javascript
provide() {
  return {
    theme: 'dark',
    user: this.user
  };
}
```

**Child:**

```javascript
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

---

## Component Architecture

A typical Teloce component can be organized around the following pieces:

| Feature              | Purpose                                   |
| :------------------- | :---------------------------------------- |
| `props`              | Receive data from a parent component      |
| `data()`             | Define reactive component state           |
| `methods`            | Define reusable component behavior        |
| `computed`           | Define derived values                     |
| `template`           | Define the component's UI                 |
| Lifecycle hooks      | Respond to component lifecycle events     |
| Slots                | Receive content from parent components    |
| `provide` / `inject` | Share values across component boundaries  |
| Dynamic components   | Render components based on reactive state |
| Async setup          | Perform asynchronous setup work           |

---

## Component Pattern

A complete component can combine several of these features:

```javascript
import { defineComponent } from '@teloce/core';

const UserCard = defineComponent({
  name: 'UserCard',

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      expanded: false
    };
  },

  computed: {
    displayName() {
      return this.user.name;
    }
  },

  methods: {
    toggle() {
      this.expanded = !this.expanded;
    }
  },

  mounted() {
    console.log('UserCard mounted');
  },

  template: `
    <article class="user-card">
      <h2>{{ displayName }}</h2>

      <button @click="toggle">
        {{ expanded ? 'Hide' : 'Show' }}
      </button>

      <div :show="expanded">
        <slot></slot>
      </div>
    </article>
  `
});
```

---

## Next Steps

### Compose. Reuse. Scale.

Teloce components combine reactive state, props, methods, slots, lifecycle hooks, and dynamic rendering into reusable UI building blocks.

* **Templates** — Build reactive interfaces with Teloce's template syntax.
* **Reactivity** — Learn how signals and reactive state work.
* **Routing** — Build multi-page and client-side applications.
* **Plugins** — Extend Teloce with reusable functionality.
* **Examples** — Explore complete Teloce applications.
