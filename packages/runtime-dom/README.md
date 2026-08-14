# @teloce/runtime-dom



<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo "
   width="200"/>
</p>



**Author:** Aldane Hutchinson

 teloce:  A JavaScript template engine for Python web developers.

> DOM runtime for Teloce — reconciler, directives, keyed loops, and event handling.

---

## Installation

```bash
npm install @teloce/runtime-dom
```

---

## Keyed Loops

Efficient list rendering using a `Map` cache and `insertBefore` moves.

### Template Syntax

```html
<for key="id" item="product" in="products">
  <div>{{ product.name }}</div>
</for>
```

### JavaScript API

```javascript
import { For, createFor } from '@teloce/runtime-dom';

const { update, unmount } = createFor(
  container,
  productsSignal,
  (item, index) => {
    const div = document.createElement('div');
    div.textContent = item.name;
    return div;
  },
  (item) => item.id
);
```

---

## Conditional Rendering

Render different content based on a reactive condition.

### Template Syntax

```html
<if loggedIn>
  <h1>Welcome back!</h1>
  <else>
    <button>Login</button>
  </else>
</if>
```

### JavaScript API

```javascript
import { If, createIf } from '@teloce/runtime-dom';

const { update } = createIf(
  container,
  loggedInSignal,
  () => document.createElement('h1'),
  () => document.createElement('button')
);
```

---

## Two-Way Binding

Bind form controls to reactive signals using `:model`.

### Template Syntax

```html
<input :model="username">
<h2>Hello {{ username }}</h2>
```

### JavaScript API

```javascript
import { Model, createModel } from '@teloce/runtime-dom';

const { update, unmount } = createModel(
  inputElement,
  usernameSignal
);
```

---

## Dynamic Classes

Apply classes dynamically based on reactive state.

### Template Syntax

```html
<div :class="{ active: isActive, 'text-bold': isBold }"></div>
```

### JavaScript API

```javascript
import { Class, createClass } from '@teloce/runtime-dom';

const { update } = createClass(
  divElement,
  classSignal
);
```

---

## Events

Bind DOM events with support for event modifiers.

### Template Syntax

```html
<button @click.prevent="handleClick">
  Click
</button>
```

### JavaScript API

```javascript
import {
  bindEvents,
  createEventHandlerWithModifiers,
} from '@teloce/runtime-dom';

const unbind = bindEvents(button, [
  createEventHandlerWithModifiers(
    button,
    'click.prevent',
    handleClick
  ),
]);
```

---

## License

MIT

```
```
