# Templates

Teloce templates use a simple, expressive syntax that feels natural to developers coming from **Flask, Django, and Python-based frameworks**.

---

## Interpolation

Display dynamic data using `{{ variable }}`.

```html
<h1>Hello {{ user.name }}</h1>

<p>
  You have {{ cart.items.length }} items in your cart.
</p>
```

### Expressions

JavaScript expressions can be used inside interpolations.

```html
<p>Total: ${{ cart.total }}</p>

<p>Double: {{ count * 2 }}</p>

<p>
  Full Name:
  {{ user.firstName + ' ' + user.lastName }}
</p>
```

### Filters

Transform values using filters.

```html
<p>{{ product.price | currency }}</p>

<p>{{ product.name | uppercase }}</p>

<p>
  {{ created_at | dateFormat('YYYY-MM-DD') }}
</p>
```

---

## Loops

### Basic Loop

Iterate over a collection using `<for>`.

```html
<for product in products>
  <div>{{ product.name }}</div>
</for>
```

### Keyed Loop

Use keyed loops when rendering dynamic collections.

```html
<for key="id" item="product" in="products">
  <div>{{ product.name }}</div>
</for>
```

> **Performance:** Keyed loops help Teloce efficiently track elements when collections change.

### Nested Loops

Loops can be nested.

```html
<for user in users>
  <div>
    <h3>{{ user.name }}</h3>

    <ul>
      <for course in user.courses>
        <li>{{ course.name }}</li>
      </for>
    </ul>
  </div>
</for>
```

### Loop Variables

| Variable | Description                    |
| -------- | ------------------------------ |
| `index`  | Current index, starting at `0` |
| `first`  | `true` for the first item      |
| `last`   | `true` for the last item       |
| `count`  | Total number of items          |

```html
<for product in products>
  <div>
    <span>{{ index + 1 }}.</span>
    <span>{{ product.name }}</span>
  </div>
</for>
```

---

## Conditions

### If Statement

```html
<if loggedIn>
  <h1>
    Welcome back, {{ user.name }}!
  </h1>
</if>
```

### If / Else

```html
<if loggedIn>
  <h1>Welcome back!</h1>
<else>
  <button>Login</button>
</if>
```

### Complex Conditions

```html
<if user.isAdmin>
  <button>Admin Panel</button>

<else if user.isModerator>
  <button>Moderate</button>

<else>
  <button>View Only</button>
</if>
```

### Show / Hide

Control visibility with directives.

```html
<div :show="isVisible">
  This is visible.
</div>

<div :hide="isHidden">
  This is hidden.
</div>
```

---

## Event Handling

### Click Events

```html
<button @click="handleClick">
  Click Me
</button>

<button @click="count++">
  Increment
</button>
```

### Submit Events

```html
<form @submit="handleSubmit">
  <input type="text" />

  <button type="submit">
    Submit
  </button>
</form>
```

### Input Events

```html
<input @input="handleInput" />

<input @change="handleChange" />
```

### Key Events

```html
<input @keyup.enter="handleEnter" />

<input @keyup.escape="clearInput" />
```

### Event Modifiers

| Modifier   | Description                                         |
| ---------- | --------------------------------------------------- |
| `.stop`    | Stops event propagation                             |
| `.prevent` | Prevents the default browser behavior               |
| `.once`    | Triggers only once                                  |
| `.self`    | Triggers only when the target is the element itself |

```html
<button @click.stop="handleClick">
  Stop Propagation
</button>

<form @submit.prevent="handleSubmit">
  Prevent Default
</form>

<button @click.once="handleOnce">
  Trigger Once
</button>
```

---

## Two-Way Binding

### Model Directive

Bind an input directly to application state.

```html
<input :model="username" />

<h2>
  Hello {{ username }}
</h2>
```

### Checkbox

```html
<input
  type="checkbox"
  :model="isChecked"
/>

<span>
  {{ isChecked ? 'Checked' : 'Unchecked' }}
</span>
```

### Radio

```html
<input
  type="radio"
  :model="selected"
  value="option1"
/>

<input
  type="radio"
  :model="selected"
  value="option2"
/>

<p>
  Selected: {{ selected }}
</p>
```

### Select

```html
<select :model="selectedOption">
  <option value="option1">
    Option 1
  </option>

  <option value="option2">
    Option 2
  </option>
</select>
```

### Textarea

```html
<textarea
  :model="message"
  rows="4"
></textarea>

<p>
  {{ message }}
</p>
```

---

## Dynamic Attributes

Teloce supports reactive bindings for classes, styles, and standard HTML attributes.

### Class Binding

```html
<div
  :class="{
    active: isActive,
    'text-bold': isBold
  }"
>
  Content
</div>
```

Arrays can also be used:

```html
<div
  :class="[
    isActive ? 'active' : '',
    'base-class'
  ]"
>
  Content
</div>
```

### Style Binding

```html
<div
  :style="{
    color: textColor,
    fontSize: textSize + 'px'
  }"
>
  Content
</div>
```

### Other Bindings

```html
<input :disabled="isLoading" />

<input :checked="isChecked" />

<a :href="url">
  Link
</a>

<img :src="imageUrl" />
```

---

## Components

Teloce templates support reusable components.

### Using Components

```html
<UserCard
  name="John"
  role="Admin"
/>
```

### Slot Content

Pass content into a component using slots.

```html
<Card>
  <h2>Title</h2>

  <p>
    Content goes here.
  </p>
</Card>
```

### Named Slots

```html
<Layout>
  <template #header>
    <h1>Page Title</h1>
  </template>

  <template #main>
    <p>
      Main content
    </p>
  </template>
</Layout>
```

---

## Comments

Use standard HTML comments inside templates.

```html
<!-- This is a comment -->

<div>
  <!-- Nested comment -->

  {{ data }}
</div>
```

Comments are not rendered as visible content.

---

## Template Overview

Teloce templates combine familiar HTML with:

* **Interpolation** for displaying dynamic data
* **Expressions** for JavaScript-powered values
* **Filters** for transforming values
* **Loops** for rendering collections
* **Conditions** for controlling rendered content
* **Events** for handling user interactions
* **Two-way binding** for synchronizing form inputs with state
* **Dynamic attributes** for reactive classes, styles, and attributes
* **Components** for reusable UI
* **Slots** for flexible component content

---

## Next Steps

### Build interfaces with less code

Teloce templates combine familiar HTML with reactive expressions, directives, events, bindings, and components to help you build dynamic interfaces with less code.
