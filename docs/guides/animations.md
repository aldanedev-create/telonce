# Animations Guide

## Animations and Transitions with Teloce

This guide covers animations and transitions in Teloce applications, from simple CSS effects to reactive transitions, JavaScript animations, lifecycle hooks, and production-ready patterns.

---

## Table of Contents

1. [Overview](#overview)
2. [CSS Transitions](#css-transitions)
3. [CSS Animations](#css-animations)
4. [Teloce Transition Directives](#teloce-transition-directives)
5. [Teloce Animation Directives](#teloce-animation-directives)
6. [Transition Hooks](#transition-hooks)
7. [Custom Animations](#custom-animations)
8. [Advanced CSS Patterns](#advanced-css-patterns)
9. [Performance Tips](#performance-tips)
10. [Real-World Examples](#real-world-examples)
11. [Reference](#reference)

---

## Overview

Teloce provides an animation system that combines CSS transitions, CSS keyframes, JavaScript animations, and reactive state.

Animations can respond to:

* Reactive state changes
* Elements entering the DOM
* Elements leaving the DOM
* Component lifecycle events
* List changes
* User interactions
* Route changes

### Key Features

* **Direct DOM Updates** — Animations run directly on real DOM elements.
* **Reactive Triggers** — Animations can respond to reactive state.
* **CSS Animations** — Use lightweight browser-native animations.
* **JavaScript Animations** — Create dynamic animations when CSS is not enough.
* **Transition Hooks** — Control animation lifecycle with JavaScript.
* **List Animations** — Animate items entering, leaving, and moving.
* **Reduced Motion** — Respect user accessibility preferences.
* **Composable Effects** — Combine transitions and animations for complex interfaces.

---

# CSS Transitions

CSS transitions are ideal for simple state changes such as opacity, transforms, colors, and dimensions.

## Basic Transition

```html
<template>
  <div
    :show="isVisible"
    class="fade"
  >
    <p>This content fades in and out.</p>
  </div>

  <button @click="isVisible = !isVisible">
    Toggle
  </button>
</template>

<style>
.fade {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fade[show="true"] {
  opacity: 1;
}
</style>
```

---

## Transform Transition

Transforms are usually more performant than changing layout properties.

```html
<style>
.card {
  transform: translateY(0);
  opacity: 1;

  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
  opacity: 0.95;
}
</style>

<div class="card">
  Hover over me.
</div>
```

---

## Multiple Properties

```html
<style>
.card {
  max-height: 100px;
  padding: 10px;
  opacity: 0.8;

  overflow: hidden;

  transition:
    max-height 0.4s ease,
    padding 0.4s ease,
    opacity 0.3s ease;
}

.card.expanded {
  max-height: 300px;
  padding: 20px;
  opacity: 1;
}
</style>
```

---

# CSS Animations

CSS keyframes are useful for repeated or multi-stage animations.

## Keyframe Animation

```html
<template>
  <div
    :show="isAnimating"
    class="bounce-in"
  >
    <p>Bouncing content!</p>
  </div>

  <button @click="isAnimating = true">
    Animate
  </button>
</template>

<style>
@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }

  70% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.bounce-in {
  animation:
    bounceIn 0.6s
    cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
```

---

## Reusable Animation Classes

```css
/* Fade */

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

/* Slide */

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Scale */

@keyframes zoomIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes zoomOut {
  from {
    transform: scale(1);
    opacity: 1;
  }

  to {
    transform: scale(0.5);
    opacity: 0;
  }
}

/* Utility classes */

.fade-in {
  animation: fadeIn 0.3s ease;
}

.fade-out {
  animation: fadeOut 0.3s ease;
}

.slide-left {
  animation: slideInLeft 0.3s ease;
}

.slide-right {
  animation: slideInRight 0.3s ease;
}

.zoom-in {
  animation: zoomIn 0.3s ease;
}

.zoom-out {
  animation: zoomOut 0.3s ease;
}
```

---

# Teloce Transition Directives

## `<transition>`

The `<transition>` directive can be used to animate elements entering or leaving the DOM.

### Basic Transition

```html
<template>
  <transition name="fade">
    <p :show="isVisible">
      This content will fade.
    </p>
  </transition>

  <button @click="isVisible = !isVisible">
    Toggle
  </button>
</template>

<style>
.fade-enter-active {
  animation: fadeIn 0.3s ease;
}

.fade-leave-active {
  animation: fadeOut 0.3s ease;
}
</style>
```

---

## Slide Transition

```html
<template>
  <transition name="slide">
    <aside
      :show="isVisible"
      class="sidebar"
    >
      <h3>Sidebar Content</h3>
      <p>This slides in and out.</p>
    </aside>
  </transition>
</template>

<style>
.sidebar {
  width: 300px;
  padding: 20px;
  background: #f8fafc;
}

.slide-enter-active {
  animation: slideInRight 0.3s ease;
}

.slide-leave-active {
  animation: slideOutRight 0.3s ease;
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(100%);
  }
}
</style>
```

---

## Scale Transition

```html
<template>
  <transition name="scale">
    <div
      :show="isVisible"
      class="modal"
    >
      <h3>Modal Title</h3>

      <p>
        This content scales in and out.
      </p>

      <button @click="isVisible = false">
        Close
      </button>
    </div>
  </transition>
</template>

<style>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;

  transform:
    translate(-50%, -50%);

  padding: 30px;
  background: white;
  border-radius: 12px;

  box-shadow:
    0 20px 60px
    rgba(0, 0, 0, 0.3);
}

.scale-enter-active {
  animation:
    scaleIn 0.3s
    cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-leave-active {
  animation:
    scaleOut 0.2s
    cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
  from {
    transform:
      translate(-50%, -50%)
      scale(0.8);

    opacity: 0;
  }

  to {
    transform:
      translate(-50%, -50%)
      scale(1);

    opacity: 1;
  }
}

@keyframes scaleOut {
  from {
    transform:
      translate(-50%, -50%)
      scale(1);

    opacity: 1;
  }

  to {
    transform:
      translate(-50%, -50%)
      scale(0.8);

    opacity: 0;
  }
}
</style>
```

---

# Teloce Animation Directives

## `@animation`

The `@animation` directive can apply a named animation to an element.

```html
<template>
  <div
    @animation="pulse"
    class="circle"
  >
    <span>{{ count }}</span>
  </div>

  <button @click="count++">
    Increment
  </button>
</template>

<style>
.circle {
  width: 100px;
  height: 100px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  background: #6366f1;

  color: white;
  font-size: 24px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
</style>
```

---

## Conditional Animation

Animations can be controlled with reactive classes.

```html
<template>
  <div
    :class="{ bounce: shouldBounce }"
  >
    <p>Bounce on click.</p>
  </div>

  <button
    @click="shouldBounce = !shouldBounce"
  >
    Toggle Bounce
  </button>
</template>

<style>
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

.bounce {
  animation:
    bounce 0.5s
    cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
```

---

# Transition Hooks

Transition hooks provide fine-grained JavaScript control.

```javascript
const MyComponent = {
  template: `
    <transition
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div :show="isVisible">
        <p>
          Hook-controlled animation.
        </p>
      </div>
    </transition>
  `,

  data() {
    return {
      isVisible: false
    };
  },

  methods: {
    beforeEnter(el) {
      el.style.opacity = '0';
      el.style.transform =
        'translateY(20px)';
    },

    enter(el, done) {
      el.style.transition =
        'opacity 0.3s ease, transform 0.3s ease';

      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform =
          'translateY(0)';
      });

      setTimeout(done, 300);
    },

    afterEnter() {
      console.log(
        'Enter animation complete'
      );
    },

    beforeLeave(el) {
      el.style.opacity = '1';
    },

    leave(el, done) {
      el.style.transition =
        'opacity 0.3s ease, transform 0.3s ease';

      el.style.opacity = '0';
      el.style.transform =
        'translateY(-20px)';

      setTimeout(done, 300);
    },

    afterLeave() {
      console.log(
        'Leave animation complete'
      );
    }
  }
};
```

---

# Custom Animations

## Using the Animation Library

Teloce can use reusable animation helpers for more advanced effects.

```javascript
import {
  createAnimation,
  fadeIn,
  fadeOut
} from '@teloce/std';

const slideUp = createAnimation(
  [
    {
      transform: 'translateY(100%)',
      opacity: 0
    },
    {
      transform: 'translateY(0)',
      opacity: 1
    }
  ],
  {
    duration: 500,
    easing: 'ease'
  }
);

const MyComponent = {
  methods: {
    async animateElement(el) {
      await slideUp(el);
    }
  }
};
```

---

## Combining Animations

```javascript
import {
  createAnimation,
  withTransition
} from '@teloce/std';

const animations = {
  enter: createAnimation(
    [
      {
        transform: 'scale(0.8)',
        opacity: 0
      },
      {
        transform: 'scale(1)',
        opacity: 1
      }
    ],
    {
      duration: 300
    }
  ),

  exit: createAnimation(
    [
      {
        transform: 'scale(1)',
        opacity: 1
      },
      {
        transform: 'scale(0.8)',
        opacity: 0
      }
    ],
    {
      duration: 200
    }
  )
};

async function animateEnter(el) {
  await withTransition(
    () => {},
    animations.enter,
    el
  );
}
```

---

# Advanced CSS Patterns

## Staggered Animations

Staggering creates a cascading effect for lists.

```css
.stagger-item {
  opacity: 0;
  animation:
    staggerIn 400ms ease forwards;
}

.stagger-item:nth-child(1) {
  animation-delay: 50ms;
}

.stagger-item:nth-child(2) {
  animation-delay: 100ms;
}

.stagger-item:nth-child(3) {
  animation-delay: 150ms;
}

.stagger-item:nth-child(4) {
  animation-delay: 200ms;
}

@keyframes staggerIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Glow Animation

```css
.glow {
  animation:
    glowPulse 2s
    ease-in-out infinite;
}

@keyframes glowPulse {
  0%,
  100% {
    filter:
      drop-shadow(
        0 0 0
        rgba(99, 102, 241, 0)
      );
  }

  50% {
    filter:
      drop-shadow(
        0 0 16px
        rgba(99, 102, 241, 0.6)
      );
  }
}
```

---

## Floating Animation

```css
.float {
  animation:
    floating 3s
    ease-in-out infinite;
}

@keyframes floating {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}
```

---

## Shimmer Loading Effect

```css
.skeleton {
  position: relative;
  overflow: hidden;

  background: #e2e8f0;
}

.skeleton::after {
  content: "";

  position: absolute;
  inset: 0;

  transform: translateX(-100%);

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent
    );

  animation:
    shimmer 1.4s infinite;
}

@keyframes shimmer {
  to {
    transform: translateX(100%);
  }
}
```

---

# Performance Tips

## 1. Prefer CSS for Simple Animations

CSS animations are generally the best choice for simple visual effects.

```css
.move {
  animation:
    slide 0.3s ease;
}

@keyframes slide {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}
```

Avoid manually creating animation loops when CSS can handle the effect.

---

## 2. Animate Transform and Opacity

Prefer:

```css
.element {
  transform: translateX(0);
  opacity: 1;

  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
```

Avoid frequently animating layout properties such as:

```css
/* Avoid when possible */

.element {
  transition:
    width 0.3s,
    height 0.3s,
    margin-left 0.3s;
}
```

Transforms and opacity usually produce smoother animations.

---

## 3. Use `will-change` Carefully

```css
.animated-element {
  will-change:
    transform,
    opacity;
}
```

Do not apply `will-change` to every element. Use it only for elements that are actually animated.

---

## 4. Avoid Forced Layout

Avoid repeatedly reading and writing layout properties in the same animation loop.

Prefer:

```javascript
requestAnimationFrame(() => {
  element.style.transform =
    'translateX(100px)';
});
```

---

## 5. Batch Reactive Updates

When the framework provides batching, group related updates together.

```javascript
batch(() => {
  isVisible = true;
  isAnimating = false;
});
```

---

## 6. Respect Reduced Motion

Always provide an accessibility fallback.

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

# Real-World Examples

## Example 1: Toast Notifications

```html
<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.type"
      >
        <span>
          {{ toast.message }}
        </span>

        <button
          @click="removeToast(toast.id)"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      toasts: []
    };
  },

  methods: {
    addToast(
      message,
      type = 'info'
    ) {
      const id = Date.now();

      this.toasts.push({
        id,
        message,
        type
      });

      setTimeout(() => {
        this.removeToast(id);
      }, 3000);
    },

    removeToast(id) {
      this.toasts =
        this.toasts.filter(
          (toast) =>
            toast.id !== id
        );
    }
  }
};
</script>

<style>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-width: 300px;

  padding: 12px 20px;
  margin-bottom: 8px;

  border-radius: 8px;

  color: white;

  box-shadow:
    0 4px 12px
    rgba(0, 0, 0, 0.15);
}

.toast.info {
  background: #3b82f6;
}

.toast.success {
  background: #22c55e;
}

.toast.warning {
  background: #eab308;
}

.toast.error {
  background: #ef4444;
}

.toast-enter-active {
  animation:
    slideIn 0.3s ease;
}

.toast-leave-active {
  animation:
    slideOut 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }

  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
```

---

## Example 2: Modal with Backdrop

```html
<template>
  <div>
    <button @click="openModal">
      Open Modal
    </button>

    <transition name="fade">
      <div
        :show="isOpen"
        class="modal-backdrop"
        @click="closeModal"
      >
        <transition name="scale">
          <div
            :show="isOpen"
            class="modal"
            @click.stop
          >
            <h2>Modal Title</h2>

            <p>
              This is the modal content.
            </p>

            <button @click="closeModal">
              Close
            </button>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<style>
.modal-backdrop {
  position: fixed;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background:
    rgba(0, 0, 0, 0.5);

  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 500px;

  padding: 40px;

  background: white;
  border-radius: 12px;

  box-shadow:
    0 20px 60px
    rgba(0, 0, 0, 0.3);
}

.fade-enter-active {
  animation:
    fadeIn 0.3s ease;
}

.fade-leave-active {
  animation:
    fadeOut 0.3s ease;
}

.scale-enter-active {
  animation:
    scaleIn 0.3s
    cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-leave-active {
  animation:
    scaleOut 0.2s
    cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scaleOut {
  from {
    transform: scale(1);
    opacity: 1;
  }

  to {
    transform: scale(0.9);
    opacity: 0;
  }
}
</style>
```

---

## Example 3: Animated Todo List

```html
<template>
  <div>
    <input
      :model="newTodo"
      @keyup.enter="addTodo"
      placeholder="Add todo..."
    />

    <button @click="addTodo">
      Add
    </button>

    <transition-group
      name="list"
      tag="ul"
    >
      <for
        key="id"
        item="todo"
        in="todos"
      >
        <li>
          <span>
            {{ todo.text }}
          </span>

          <button
            @click="removeTodo(todo.id)"
          >
            ✕
          </button>
        </li>
      </for>
    </transition-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newTodo: '',
      todos: []
    };
  },

  methods: {
    addTodo() {
      const text =
        this.newTodo.trim();

      if (!text) {
        return;
      }

      this.todos.push({
        id: Date.now(),
        text
      });

      this.newTodo = '';
    },

    removeTodo(id) {
      this.todos =
        this.todos.filter(
          (todo) =>
            todo.id !== id
        );
    }
  }
};
</script>

<style>
ul {
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 16px;
  margin: 4px 0;

  background: #f1f5f9;
  border-radius: 8px;
}

.list-enter-active {
  animation:
    slideIn 0.3s ease;
}

.list-leave-active {
  animation:
    slideOut 0.3s ease;
}

.list-move {
  transition:
    transform 0.3s ease;
}
</style>
```

---

## Example 4: Accordion

```html
<template>
  <div class="accordion">
    <div
      v-for="item in items"
      :key="item.id"
      class="accordion-item"
    >
      <button
        class="accordion-header"
        @click="toggleItem(item.id)"
      >
        <span>
          {{ item.title }}
        </span>

        <span>
          {{
            expandedId === item.id
              ? '−'
              : '+'
          }}
        </span>
      </button>

      <transition name="accordion">
        <div
          :show="expandedId === item.id"
          class="accordion-body"
        >
          <p>
            {{ item.content }}
          </p>
        </div>
      </transition>
    </div>
  </div>
</template>

<style>
.accordion-item {
  border-bottom:
    1px solid #e2e8f0;
}

.accordion-header {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px 20px;

  border: 0;

  cursor: pointer;
  background: #f8fafc;
}

.accordion-header:hover {
  background: #f1f5f9;
}

.accordion-body {
  overflow: hidden;
  padding: 0 20px;
}

.accordion-enter-active,
.accordion-leave-active {
  overflow: hidden;

  transition:
    max-height 0.3s ease,
    opacity 0.3s ease,
    padding 0.3s ease;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 300px;
  padding-top: 20px;
  padding-bottom: 20px;
  opacity: 1;
}
</style>
```

---

## Example 5: Loading Spinner

```html
<template>
  <div
    :show="loading"
    class="spinner-container"
  >
    <div class="spinner"></div>

    <p>Loading...</p>
  </div>
</template>

<style>
.spinner-container {
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;

  border: 4px solid #e2e8f0;
  border-top-color: #6366f1;

  border-radius: 50%;

  animation:
    spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
```

---

# Reference

## Transition Classes

| Class                 | Description                    |
| :-------------------- | :----------------------------- |
| `[name]-enter-active` | Animation during enter         |
| `[name]-enter-from`   | Starting state for enter       |
| `[name]-enter-to`     | Ending state for enter         |
| `[name]-leave-active` | Animation during leave         |
| `[name]-leave-from`   | Starting state for leave       |
| `[name]-leave-to`     | Ending state for leave         |
| `[name]-move`         | Animation when list items move |

---

## Transition Hooks

| Hook            | Description                 |
| :-------------- | :-------------------------- |
| `@before-enter` | Runs before enter animation |
| `@enter`        | Runs during enter animation |
| `@after-enter`  | Runs after enter animation  |
| `@before-leave` | Runs before leave animation |
| `@leave`        | Runs during leave animation |
| `@after-leave`  | Runs after leave animation  |

---

## Animation Utilities

| Utility             | Description                          |
| :------------------ | :----------------------------------- |
| `createAnimation`   | Creates a reusable animation         |
| `withTransition`    | Combines logic with a transition     |
| `waitForTransition` | Waits for a CSS transition to finish |
| `waitForAnimation`  | Waits for a CSS animation to finish  |

---

## Animation Recommendations

| Situation                | Recommended Approach       |
| :----------------------- | :------------------------- |
| Simple hover effect      | CSS transition             |
| Fade or slide            | CSS animation              |
| Enter/leave DOM          | `<transition>`             |
| Reactive animation       | Teloce directive/class     |
| Complex timeline         | JavaScript animation       |
| List insertion/removal   | `<transition-group>`       |
| Route changes            | Router + CSS transition    |
| User prefers less motion | Reduced-motion media query |

---

## Next Steps

* [Cheatsheet](/docs/guides/cheatsheet) — Quick reference.
* [Components](/docs/guides/components) — Build reusable components.
* [Routing](/docs/cookbook/python-routing) — Client and server routing.
* [Plugin System](/docs/api/plugin-system) — Extend Teloce with plugins.
* [Examples](/docs/examples) — Full example applications.
