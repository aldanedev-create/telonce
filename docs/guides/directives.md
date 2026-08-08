# Directives

Directives are special attributes and template elements that connect your Teloce templates to events, state, behavior, and the DOM.

They make it possible to express behavior directly inside your templates.

---

## Built-in Directives

Teloce provides directives for events, bindings, visibility, forms, and dynamic DOM behavior.

### `@click`

Binds a click event handler.

```html
<button @click="handleClick">
  Click Me
</button>

<button @click="count++">
  Increment
</button>
```

### `@submit`

Binds a form submission event.

```html
<form @submit="handleSubmit">
  <input type="text" />

  <button type="submit">
    Submit
  </button>
</form>
```

### `@input`

Binds an input event.

```html
<input @input="handleInput" />
```

### `@change`

Binds a change event.

```html
<select @change="handleChange">
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

### `@keyup`

Binds a keyboard event.

```html
<input @keyup.enter="handleEnter" />

<input @keyup.escape="clearInput" />
```

### `@focus`

Binds a focus event.

```html
<input @focus="handleFocus" />
```

### `@blur`

Binds a blur event.

```html
<input @blur="handleBlur" />
```

---

## Event Modifiers

Event modifiers change how an event handler behaves.

| Modifier   | Description                                     |
| :--------- | :---------------------------------------------- |
| `.stop`    | Stops event propagation                         |
| `.prevent` | Prevents default behavior                       |
| `.once`    | Triggers only once                              |
| `.self`    | Runs only when the target is the element itself |
| `.passive` | Uses a passive event listener                   |
| `.capture` | Uses the capture phase                          |

### Examples

```html
<button @click.stop="handleClick">
  Stop Propagation
</button>

<button @click.prevent="handleClick">
  Prevent Default
</button>

<button @click.once="handleClick">
  Trigger Once
</button>
```

### Key Modifiers

```html
<input @keyup.enter="handleEnter" />

<input @keyup.escape="handleEscape" />

<input @keyup.tab="handleTab" />

<input @keyup.space="handleSpace" />

<input @keyup.ctrl.enter="handleCtrlEnter" />
```

---

## Binding Directives

Binding directives connect template attributes directly to reactive state.

### `:model`

Two-way binding for form inputs.

```html
<input :model="username" />

<p>
  Hello {{ username }}
</p>
```

### `:class`

Dynamic class binding.

```html
<div :class="{ active: isActive }">
  Content
</div>

<div :class="[isActive ? 'active' : '', 'base']">
  Content
</div>
```

### `:style`

Dynamic style binding.

```html
<div :style="{ color: textColor }">
  Content
</div>

<div :style="[baseStyles, additionalStyles]">
  Content
</div>
```

### `:show`

Conditional visibility.

```html
<div :show="isVisible">
  Content
</div>
```

### `:hide`

Conditional hiding.

```html
<div :hide="isHidden">
  Content
</div>
```

### `:disabled`

Dynamic disabled state.

```html
<button :disabled="isLoading">
  Submit
</button>
```

### `:checked`

Dynamic checked state.

```html
<input
  type="checkbox"
  :checked="isChecked"
/>
```

### `:value`

Dynamic value binding.

```html
<input :value="value" />
```

### `:href`

Dynamic link binding.

```html
<a :href="url">
  Link
</a>
```

### `:src`

Dynamic image binding.

```html
<img :src="imageUrl" />
```

---

## Template Directives

Template directives control structure and content.

### `<for>`

Use `<for>` to render a collection.

```html
<for product in products>
  <div>
    {{ product.name }}
  </div>
</for>
```

### Keyed Loops

Keyed loops help Teloce efficiently track list items.

```html
<for
  key="id"
  item="product"
  in="products"
>
  <div>
    {{ product.name }}
  </div>
</for>
```

### `<if>`

Conditionally render content.

```html
<if loggedIn>
  <h1>Welcome back!</h1>
</if>
```

### `<if>` / `<else>`

```html
<if loggedIn>
  <h1>Welcome back!</h1>

  <else>
    <button>
      Login
    </button>
</if>
```

### `<else if>`

Use additional conditions when multiple states are possible.

```html
<if user.isAdmin>
  <button>Admin Panel</button>

  <else if user.isModerator>
    <button>Moderate</button>

  <else>
    <button>View Only</button>
</if>
```

### `<slot>`

Project content into a component.

```html
<div class="card">
  <slot></slot>
</div>
```

Named slots are also supported:

```html
<slot name="header"></slot>
```

---

## Custom Directives

Teloce allows applications and plugins to define custom directives.

### Registering a Directive

```javascript
teloce.registerDirective('focus', {
  name: 'focus',

  mounted(el) {
    el.focus();
  }
});
```

### Directive Hooks

| Hook            | Description                     |
| :-------------- | :------------------------------ |
| `beforeMount`   | Before the element is mounted   |
| `mounted`       | After the element is mounted    |
| `beforeUpdate`  | Before the element updates      |
| `updated`       | After the element updates       |
| `beforeUnmount` | Before the element is unmounted |
| `unmounted`     | After the element is unmounted  |

### Example: Tooltip Directive

```javascript
teloce.registerDirective('tooltip', {
  name: 'tooltip',

  mounted(el, binding) {
    el.title = binding.value;
  },

  updated(el, binding) {
    el.title = binding.value;
  }
});
```

### Using Custom Directives

```html
<input v-focus />

<button v-tooltip="'Click me!'">
  Submit
</button>
```

---

## Directive Reference

| Directive   | Description            | Example                           |
| :---------- | :--------------------- | :-------------------------------- |
| `@click`    | Click event            | `<button @click="fn">`            |
| `@submit`   | Submit event           | `<form @submit="fn">`             |
| `@input`    | Input event            | `<input @input="fn">`             |
| `@change`   | Change event           | `<select @change="fn">`           |
| `@keyup`    | Keyboard event         | `<input @keyup="fn">`             |
| `:model`    | Two-way binding        | `<input :model="var">`            |
| `:class`    | Class binding          | `<div :class="{ active: true }">` |
| `:style`    | Style binding          | `<div :style="{ color: 'red' }">` |
| `:show`     | Conditional visibility | `<div :show="visible">`           |
| `:hide`     | Conditional hiding     | `<div :hide="hidden">`            |
| `:disabled` | Disabled state         | `<button :disabled="loading">`    |
| `:checked`  | Checked state          | `<input :checked="checked">`      |
| `:value`    | Value binding          | `<input :value="val">`            |
| `:href`     | Link binding           | `<a :href="url">`                 |
| `:src`      | Image binding          | `<img :src="img">`                |
| `<for>`     | Loop                   | `<for item in items>`             |
| `<if>`      | Conditional rendering  | `<if condition>`                  |
| `<slot>`    | Content projection     | `<slot></slot>`                   |

---

## Directive Mental Model

Think of Teloce directives as four main categories:

```text
Directives
│
├── Events
│   ├── @click
│   ├── @submit
│   ├── @input
│   ├── @change
│   ├── @keyup
│   ├── @focus
│   └── @blur
│
├── Bindings
│   ├── :model
│   ├── :class
│   ├── :style
│   ├── :show
│   ├── :hide
│   ├── :disabled
│   ├── :checked
│   ├── :value
│   ├── :href
│   └── :src
│
├── Template Structure
│   ├── <for>
│   ├── <if>
│   ├── <else>
│   └── <slot>
│
└── Custom Directives
    ├── v-focus
    ├── v-tooltip
    └── Application-defined directives
```

### Quick Mental Model

| Category      | Purpose                           | Examples                     |
| :------------ | :-------------------------------- | :--------------------------- |
| **Events**    | Respond to user interaction       | `@click`, `@input`, `@keyup` |
| **Bindings**  | Connect state to DOM properties   | `:model`, `:class`, `:style` |
| **Structure** | Control rendering and content     | `<for>`, `<if>`, `<slot>`    |
| **Custom**    | Add application-specific behavior | `v-focus`, `v-tooltip`       |

---

## Next Steps

* **[Templates](templates.md)** — Learn the complete Teloce template syntax.
* **[Components](components.md)** — Build reusable components.
* **[Reactivity](reactivity.md)** — Learn how reactive state works.
* **[Animations](animations.md)** — Add transitions and animations.
* **[Examples](../examples/)** — Explore complete Teloce applications.

---

## HTML, but Reactive

Use directives to connect **events, state, logic, and DOM behavior** without leaving your template.

**⚡ Give your HTML superpowers.**
