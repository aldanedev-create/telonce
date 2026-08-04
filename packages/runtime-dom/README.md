# @teloce/runtime-dom

DOM runtime for Teloce - reconciler, directives, keyed loops, and events.

## Installation

```bash
npm install @teloce/runtime-dom
Keyed Loops
Efficient list rendering with Map-cache and insertBefore moves:

javascript
import { For, createFor } from '@teloce/runtime-dom';

// Template syntax
<for key="id" item="product" in="products">
  <div>{{ product.name }}</div>
</for>

// JavaScript API
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
Conditional Rendering
javascript
import { If, createIf } from '@teloce/runtime-dom';

// Template syntax
<if loggedIn>
  <h1>Welcome back!</h1>
  <else>
    <button>Login</button>
</if>

// JavaScript API
const { update } = createIf(
  container,
  loggedInSignal,
  () => document.createElement('h1'),
  () => document.createElement('button')
);
Two-Way Binding
javascript
import { Model, createModel } from '@teloce/runtime-dom';

// Template syntax
<input :model="username">
<h2>Hello {{ username }}</h2>

// JavaScript API
const { update, unmount } = createModel(
  inputElement,
  usernameSignal
);
Dynamic Classes
javascript
import { Class, createClass } from '@teloce/runtime-dom';

// Template syntax
<div :class="{ active: isActive, 'text-bold': isBold }">

// JavaScript API
const { update } = createClass(
  divElement,
  classSignal
);
Events
javascript
import { bindEvents, createEventHandlerWithModifiers } from '@teloce/runtime-dom';

// Template syntax
<button @click.prevent="handleClick">Click</button>

// JavaScript API
const unbind = bindEvents(button, [
  createEventHandlerWithModifiers(button, 'click.prevent', handleClick)
]);
License
MIT