# Directives

<div class="teloce-directives-hero">
  <div class="directive-orbit orbit-a"></div>
  <div class="directive-orbit orbit-b"></div>

  <div class="directive-particle particle-a"></div>
  <div class="directive-particle particle-b"></div>
  <div class="directive-particle particle-c"></div>

  <div class="directive-hero-content">
    <div class="directive-badge">⚡ Teloce Directives</div>

```
<h1>Give Your HTML<br>Superpowers.</h1>

<p>
  Directives are special attributes that connect your
  templates to events, state, behavior, and the DOM.
</p>
```

  </div>
</div>

<style>
.teloce-directives-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: 85px 30px;
  margin: 20px 0 45px;
  border-radius: 24px;
  text-align: center;
  background:
    radial-gradient(circle at center, rgba(56,189,248,.14), transparent 55%),
    linear-gradient(135deg, #0f172a, #111827);
  border: 1px solid rgba(255,255,255,.08);
}

.directive-hero-content {
  position: relative;
  z-index: 5;
  max-width: 720px;
  margin: auto;
  animation: directiveHeroIn .9s ease-out both;
}

.directive-badge {
  display: inline-block;
  padding: 7px 15px;
  margin-bottom: 18px;
  border-radius: 999px;
  border: 1px solid rgba(56,189,248,.3);
  background: rgba(56,189,248,.08);
  animation: directiveBadgePulse 3s ease-in-out infinite;
}

.teloce-directives-hero h1 {
  margin: 0;
  font-size: clamp(2.3rem, 6vw, 4rem);
  line-height: 1.05;
  letter-spacing: -2px;
}

.teloce-directives-hero p {
  max-width: 640px;
  margin: 18px auto 0;
  opacity: .72;
  font-size: 1.05rem;
}

.directive-orbit {
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 50%;
  border: 1px solid rgba(56,189,248,.12);
  transform: translate(-50%, -50%);
}

.orbit-a {
  width: 320px;
  height: 320px;
  animation: directiveOrbit 13s linear infinite;
}

.orbit-b {
  width: 520px;
  height: 520px;
  border-style: dashed;
  animation: directiveOrbitReverse 20s linear infinite;
}

.directive-particle {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 18px rgba(255,255,255,.9);
}

.particle-a {
  top: 23%;
  left: 19%;
  animation: particleA 5s ease-in-out infinite;
}

.particle-b {
  top: 65%;
  right: 17%;
  animation: particleB 6s ease-in-out infinite;
}

.particle-c {
  bottom: 15%;
  left: 35%;
  animation: particleC 7s ease-in-out infinite;
}

@keyframes directiveHeroIn {
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes directiveBadgePulse {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }
}

@keyframes directiveOrbit {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes directiveOrbitReverse {
  to {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
}

@keyframes particleA {
  50% {
    transform: translate(90px, 45px);
  }
}

@keyframes particleB {
  50% {
    transform: translate(-80px, -45px);
  }
}

@keyframes particleC {
  50% {
    transform: translate(70px, -50px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .directive-hero-content,
  .directive-badge,
  .directive-orbit,
  .directive-particle {
    animation: none;
  }
}
</style>

Directives make it possible to express behavior directly inside your templates.

<div class="directive-flow">

<div class="directive-flow-node">
  <span>HTML</span>
  <strong>`@click`</strong>
  <small>Events</small>
</div>

<div class="directive-arrow">→</div>

<div class="directive-flow-node">
  <span>STATE</span>
  <strong>`:model`</strong>
  <small>Binding</small>
</div>

<div class="directive-arrow">→</div>

<div class="directive-flow-node">
  <span>DOM</span>
  <strong>`:show`</strong>
  <small>Behavior</small>
</div>

</div>

<style>
.directive-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 30px 0;
}

.directive-flow-node {
  min-width: 125px;
  padding: 18px;
  text-align: center;
  border-radius: 16px;
  border: 1px solid rgba(56,189,248,.18);
  background: rgba(56,189,248,.04);
  animation: directiveNodeFloat 3s ease-in-out infinite;
}

.directive-flow-node:nth-of-type(3) {
  animation-delay: .5s;
}

.directive-flow-node:nth-of-type(5) {
  animation-delay: 1s;
}

.directive-flow-node span,
.directive-flow-node small {
  display: block;
  opacity: .55;
  font-size: .75rem;
}

.directive-flow-node strong {
  display: block;
  margin: 5px 0;
}

.directive-arrow {
  opacity: .5;
  animation: directiveArrow 1.5s ease-in-out infinite;
}

@keyframes directiveNodeFloat {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

@keyframes directiveArrow {
  50% {
    transform: translateX(5px);
    opacity: 1;
  }
}
</style>

---

## Built-in Directives

Teloce provides directives for events, bindings, visibility, forms, and dynamic DOM behavior.

### `@click`

Binds a click event handler.

```html
<button @click="handleClick">Click Me</button>

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
| ---------- | ----------------------------------------------- |
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

<div class="modifier-demo">

<div class="modifier-card">
  <span>🛑</span>
  <strong>.stop</strong>
  <small>Stop propagation</small>
</div>

<div class="modifier-card">
  <span>🚫</span>
  <strong>.prevent</strong>
  <small>Prevent default</small>
</div>

<div class="modifier-card">
  <span>1️⃣</span>
  <strong>.once</strong>
  <small>Run once</small>
</div>

<div class="modifier-card">
  <span>🎯</span>
  <strong>.self</strong>
  <small>Target itself</small>
</div>

</div>

<style>
.modifier-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 12px;
  margin: 30px 0;
}

.modifier-card {
  padding: 18px;
  text-align: center;
  border-radius: 15px;
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  transition:
    transform .3s ease,
    border-color .3s ease;
}

.modifier-card:hover {
  transform: translateY(-6px);
  border-color: rgba(56,189,248,.35);
}

.modifier-card span,
.modifier-card strong,
.modifier-card small {
  display: block;
}

.modifier-card span {
  font-size: 1.4rem;
  margin-bottom: 6px;
}

.modifier-card small {
  margin-top: 5px;
  opacity: .55;
}
</style>

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

<div class="binding-showcase">

<div class="binding-item">
  <code>:model</code>
  <span>↔</span>
  <strong>State</strong>
</div>

<div class="binding-item">
  <code>:class</code>
  <span>→</span>
  <strong>Classes</strong>
</div>

<div class="binding-item">
  <code>:style</code>
  <span>→</span>
  <strong>Styles</strong>
</div>

<div class="binding-item">
  <code>:show</code>
  <span>→</span>
  <strong>Visibility</strong>
</div>

</div>

<style>
.binding-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin: 30px 0;
}

.binding-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 12px;
  border-radius: 14px;
  border: 1px solid rgba(56,189,248,.14);
  background: rgba(56,189,248,.035);
  transition: transform .3s ease;
}

.binding-item:hover {
  transform: scale(1.04);
}

.binding-item span {
  opacity: .45;
}
</style>

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

<div class="template-flow">

<div class="template-stage">
  <span>01</span>
  <strong>State</strong>
</div>

<div class="template-arrow">→</div>

<div class="template-stage">
  <span>02</span>
  <strong>Directive</strong>
</div>

<div class="template-arrow">→</div>

<div class="template-stage">
  <span>03</span>
  <strong>DOM</strong>
</div>

</div>

<style>
.template-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 30px 0;
}

.template-stage {
  min-width: 120px;
  padding: 18px;
  text-align: center;
  border-radius: 15px;
  border: 1px solid rgba(56,189,248,.17);
  background: rgba(56,189,248,.04);
}

.template-stage span {
  display: block;
  margin-bottom: 5px;
  opacity: .45;
  font-size: .7rem;
}

.template-arrow {
  opacity: .5;
  animation: templateArrow 1.4s ease-in-out infinite;
}

@keyframes templateArrow {
  50% {
    transform: translateX(5px);
  }
}
</style>

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
| --------------- | ------------------------------- |
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

<div class="custom-directive-card">

<div class="custom-icon">⚙️</div>

<div>
  <strong>Extend Teloce</strong>
  <p>
    Custom directives let libraries and applications
    add reusable DOM behavior without modifying the core.
  </p>
</div>

</div>

<style>
.custom-directive-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px;
  margin: 30px 0;
  border-radius: 18px;
  border: 1px solid rgba(56,189,248,.18);
  background:
    radial-gradient(
      circle at left,
      rgba(56,189,248,.1),
      transparent 60%
    ),
    rgba(255,255,255,.02);
  animation: customDirectiveIn .7s ease-out both;
}

.custom-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(56,189,248,.1);
  font-size: 1.4rem;
  animation: customIconSpin 4s linear infinite;
}

.custom-directive-card p {
  margin: 5px 0 0;
  opacity: .65;
}

@keyframes customDirectiveIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes customIconSpin {
  to {
    transform: rotate(360deg);
  }
}
</style>

---

## Directive Reference

| Directive   | Description            | Example                           |
| ----------- | ---------------------- | --------------------------------- |
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

<div class="mental-model">

<div class="mental-box">
  <span>👆</span>
  <strong>Events</strong>
  <small>`@click`, `@input`, `@keyup`</small>
</div>

<div class="mental-box">
  <span>🔗</span>
  <strong>Bindings</strong>
  <small>`:model`, `:class`, `:style`</small>
</div>

<div class="mental-box">
  <span>🔀</span>
  <strong>Structure</strong>
  <small>`&lt;for&gt;`, `&lt;if&gt;`, `&lt;slot&gt;`</small>
</div>

<div class="mental-box">
  <span>⚙️</span>
  <strong>Custom</strong>
  <small>Application-defined behavior</small>
</div>

</div>

<style>
.mental-model {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
  margin: 30px 0;
}

.mental-box {
  padding: 20px;
  text-align: center;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  transition:
    transform .3s ease,
    border-color .3s ease;
}

.mental-box:hover {
  transform: translateY(-7px);
  border-color: rgba(56,189,248,.35);
}

.mental-box span,
.mental-box strong,
.mental-box small {
  display: block;
}

.mental-box span {
  font-size: 1.5rem;
  margin-bottom: 7px;
}

.mental-box small {
  margin-top: 6px;
  opacity: .55;
}
</style>

---

## Next Steps

<div class="teloce-next">

<a href="/guides/filters" class="next-card">
  <strong>🔧 Filters</strong>
  <span>Transform values directly inside templates.</span>
</a>

<a href="/guides/sfc" class="next-card">
  <strong>📦 SFC (.vel)</strong>
  <span>Build Single File Components.</span>
</a>

<a href="/guides/cheatsheet" class="next-card">
  <strong>📋 Cheatsheet</strong>
  <span>Quickly reference the Teloce API.</span>
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

---

<div class="directives-footer">

### ⚡ HTML, but Reactive.

Use directives to connect **events, state, logic, and DOM behavior** without leaving your template.

</div>

<style>
.directives-footer {
  margin-top: 50px;
  padding: 45px 25px;
  text-align: center;
  border-radius: 22px;
  border: 1px solid rgba(56,189,248,.12);
  background:
    radial-gradient(
      circle,
      rgba(56,189,248,.1),
      transparent 65%
    ),
    rgba(255,255,255,.02);
  animation: directiveFooterGlow 4s ease-in-out infinite;
}

@keyframes directiveFooterGlow {
  0%, 100% {
    box-shadow: 0 0 0 rgba(56,189,248,0);
  }

  50% {
    box-shadow: 0 0 45px rgba(56,189,248,.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .directives-footer {
    animation: none;
  }
}
</style>
