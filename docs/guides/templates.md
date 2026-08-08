# Templates

<div class="teloce-template-hero">
  <div class="template-glow"></div>
  <div class="template-dot dot-one"></div>
  <div class="template-dot dot-two"></div>
  <div class="template-dot dot-three"></div>

  <div class="template-hero-content">
    <div class="template-badge">🧩 Teloce Templates</div>
    <h1>Simple Templates.<br>Powerful Interfaces.</h1>
    <p>
      A lightweight, expressive syntax designed to feel natural
      to Flask, Django, and Python developers.
    </p>
  </div>
</div>

<style>
.teloce-template-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: 75px 30px;
  margin: 20px 0 45px;
  border-radius: 24px;
  text-align: center;
  background:
    radial-gradient(circle at center, rgba(56,189,248,.12), transparent 55%),
    linear-gradient(135deg, #0f172a, #111827);
  border: 1px solid rgba(255,255,255,.08);
}

.template-hero-content {
  position: relative;
  z-index: 4;
  max-width: 700px;
  margin: auto;
  animation: templateFadeUp .9s ease-out both;
}

.template-badge {
  display: inline-block;
  padding: 7px 14px;
  margin-bottom: 18px;
  border-radius: 999px;
  border: 1px solid rgba(56,189,248,.3);
  background: rgba(56,189,248,.1);
  animation: templatePulse 3s ease-in-out infinite;
}

.teloce-template-hero h1 {
  margin: 0;
  font-size: clamp(2.2rem, 6vw, 4rem);
  line-height: 1.05;
  letter-spacing: -2px;
}

.teloce-template-hero p {
  max-width: 600px;
  margin: 18px auto 0;
  opacity: .75;
  font-size: 1.05rem;
}

.template-glow {
  position: absolute;
  z-index: 0;
  width: 300px;
  height: 300px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #38bdf8;
  filter: blur(100px);
  opacity: .13;
  animation: templateGlow 5s ease-in-out infinite;
}

.template-dot {
  position: absolute;
  z-index: 1;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 18px rgba(255,255,255,.8);
}

.dot-one {
  top: 22%;
  left: 17%;
  animation: templateFloatOne 6s ease-in-out infinite;
}

.dot-two {
  top: 65%;
  right: 18%;
  animation: templateFloatTwo 7s ease-in-out infinite;
}

.dot-three {
  bottom: 18%;
  left: 32%;
  animation: templateFloatThree 5s ease-in-out infinite;
}

@keyframes templateFadeUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes templatePulse {
  0%, 100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.06);
  }
}

@keyframes templateGlow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(.9);
    opacity: .1;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: .22;
  }
}

@keyframes templateFloatOne {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(100px, 40px);
  }
}

@keyframes templateFloatTwo {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(-80px, -45px);
  }
}

@keyframes templateFloatThree {
  0%, 100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(70px, -35px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .template-hero-content,
  .template-badge,
  .template-glow,
  .template-dot {
    animation: none;
  }
}
</style>

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

<div class="template-example">
  <span class="example-label">Rendered concept</span>
  <strong>Hello Python Developer</strong>
  <span>You have 3 items in your cart.</span>
</div>

<style>
.template-example {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 18px;
  margin: 20px 0;
  border-radius: 14px;
  border: 1px solid rgba(56,189,248,.15);
  background: rgba(56,189,248,.04);
  animation: exampleIn .6s ease-out both;
}

.example-label {
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .08em;
  opacity: .5;
}

@keyframes exampleIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

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

<div class="feature-grid">

<div class="feature-card">
  <div class="feature-icon">🖱️</div>
  <strong>Click</strong>
  <span>Respond to user clicks.</span>
</div>

<div class="feature-card">
  <div class="feature-icon">⌨️</div>
  <strong>Keyboard</strong>
  <span>Handle keyboard interactions.</span>
</div>

<div class="feature-card">
  <div class="feature-icon">📝</div>
  <strong>Input</strong>
  <span>React to form changes.</span>
</div>

</div>

<style>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
  margin: 25px 0;
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  transition: transform .3s ease, border-color .3s ease;
  animation: featureIn .7s ease both;
}

.feature-card:hover {
  transform: translateY(-6px);
  border-color: rgba(56,189,248,.35);
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-card span {
  opacity: .65;
  font-size: .9rem;
}

@keyframes featureIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

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

<div class="component-flow">
  <div class="flow-node">Component</div>
  <div class="flow-line"></div>
  <div class="flow-node">Template</div>
  <div class="flow-line"></div>
  <div class="flow-node">Rendered UI</div>
</div>

<style>
.component-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 30px 0;
}

.flow-node {
  padding: 12px 18px;
  border-radius: 12px;
  background: rgba(56,189,248,.08);
  border: 1px solid rgba(56,189,248,.2);
  animation: flowPulse 2.5s ease-in-out infinite;
}

.flow-node:nth-child(3) {
  animation-delay: .3s;
}

.flow-node:nth-child(5) {
  animation-delay: .6s;
}

.flow-line {
  width: 35px;
  height: 1px;
  background: rgba(255,255,255,.2);
}

@keyframes flowPulse {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}
</style>

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

<div class="template-overview">

<div>🧩 <strong>Interpolation</strong><span>Dynamic values</span></div>
<div>🔁 <strong>Loops</strong><span>Render collections</span></div>
<div>🔀 <strong>Conditions</strong><span>Control rendering</span></div>
<div>⚡ <strong>Events</strong><span>Handle interactions</span></div>
<div>🔗 <strong>Binding</strong><span>Connect state and UI</span></div>
<div>🧱 <strong>Components</strong><span>Build reusable UI</span></div>

</div>

<style>
.template-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin: 30px 0;
}

.template-overview > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.025);
  transition: transform .25s ease, border-color .25s ease;
}

.template-overview > div:hover {
  transform: translateY(-5px);
  border-color: rgba(56,189,248,.35);
}

.template-overview span {
  opacity: .6;
  font-size: .85rem;
}
</style>

---

## Next Steps

<div class="teloce-next">

<a href="/guides/reactivity" class="next-card">
  <strong>⚡ Reactivity</strong>
  <span>Understand signals and effects.</span>
</a>

<a href="/guides/components" class="next-card">
  <strong>🧩 Components</strong>
  <span>Build reusable components.</span>
</a>

<a href="/guides/directives" class="next-card">
  <strong>🎯 Directives</strong>
  <span>Explore the complete directive system.</span>
</a>

</div>

<style>
.teloce-next {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  margin-top: 25px;
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

<div class="teloce-template-footer">

### Build interfaces with less code.

Teloce templates combine familiar HTML with reactive expressions,
directives, events, bindings, and components.

</div>

<style>
.teloce-template-footer {
  margin-top: 50px;
  padding: 40px 25px;
  text-align: center;
  border-radius: 22px;
  background:
    radial-gradient(
      circle,
      rgba(56,189,248,.1),
      transparent 65%
    ),
    rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.07);
  animation: templateFooterGlow 4s ease-in-out infinite;
}

@keyframes templateFooterGlow {
  0%, 100% {
    box-shadow: 0 0 0 rgba(56,189,248,0);
  }

  50% {
    box-shadow: 0 0 40px rgba(56,189,248,.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .teloce-template-footer {
    animation: none;
  }
}
</style>
