# @teloce/std

> Standard library for Teloce — filters, transitions, animations, and utilities.

---

## Installation

```bash
npm install @teloce/std
```

---

## Filters

### String Filters

```javascript
import {
  capitalize,
  uppercase,
  slugify,
  truncate,
} from '@teloce/std';
```

Use these filters in Teloce templates:

```html
{{ 'hello world' | capitalize }}
<!-- "Hello world" -->

{{ 'hello' | uppercase }}
<!-- "HELLO" -->

{{ 'Hello World' | slugify }}
<!-- "hello-world" -->

{{ 'long text...' | truncate:10 }}
<!-- "long tex..." -->
```

---

### Number Filters

```javascript
import {
  currency,
  percent,
  number,
} from '@teloce/std';
```

```html
{{ 19.99 | currency }}
<!-- "$19.99" -->

{{ 0.25 | percent }}
<!-- "25%" -->

{{ 1234567 | number }}
<!-- "1,234,567" -->
```

---

### Date Filters

```javascript
import {
  dateFormat,
  timeAgo,
} from '@teloce/std';
```

```html
{{ date | dateFormat:'YYYY-MM-DD' }}
<!-- "2024-01-01" -->

{{ date | timeAgo }}
<!-- "2d ago" -->
```

---

### Array Filters

```javascript
import {
  first,
  last,
  pluck,
  orderBy,
} from '@teloce/std';
```

```html
{{ items | first }}
<!-- First item -->

{{ items | pluck:'name' }}
<!-- ['name1', 'name2'] -->

{{ items | orderBy:'price':'desc' }}
<!-- Sort by price descending -->
```

---

## Transitions

Teloce provides built-in helpers for common DOM transitions.

```javascript
import {
  fade,
  slide,
  scale,
  withTransition,
} from '@teloce/std';
```

### Fade

```javascript
await fade(element);
```

### Slide

```javascript
await slide(element, {
  duration: 500,
});
```

### Transition Wrapper

```javascript
await withTransition(
  () => {
    element.innerHTML = 'New content';
  },
  fade,
  element
);
```

---

## Animations

Teloce includes helpers for common animations.

```javascript
import {
  pulse,
  shake,
  spin,
  fadeIn,
  fadeOut,
} from '@teloce/std';
```

### Pulse

```javascript
await pulse(element);
```

### Shake

```javascript
await shake(element, {
  duration: 400,
});
```

### Spin

```javascript
await spin(element);
```

### Fade In / Fade Out

```javascript
await fadeIn(element);
await fadeOut(element);
```

---

## Custom Filters

Create and register your own filters.

```javascript
import {
  registerFilter,
  createFilter,
} from '@teloce/std';

registerFilter(
  'reverse',
  createFilter((value) => {
    return value
      .split('')
      .reverse()
      .join('');
  })
);
```

Use the custom filter in a template:

```html
{{ 'hello' | reverse }}
<!-- "olleh" -->
```

---

## Custom Transitions

Create custom transitions by defining the starting and ending styles.

```javascript
import { createCustomTransition } from '@teloce/std';

const myTransition = createCustomTransition(
  {
    transform: 'scale(0)',
    opacity: '0',
  },
  {
    transform: 'scale(1)',
    opacity: '1',
  },
  {
    duration: 500,
  }
);

await myTransition(element);
```

---

## API Overview

| Category               | Features                                         |
| ---------------------- | ------------------------------------------------ |
| **String Filters**     | `capitalize`, `uppercase`, `slugify`, `truncate` |
| **Number Filters**     | `currency`, `percent`, `number`                  |
| **Date Filters**       | `dateFormat`, `timeAgo`                          |
| **Array Filters**      | `first`, `last`, `pluck`, `orderBy`              |
| **Transitions**        | `fade`, `slide`, `scale`, `withTransition`       |
| **Animations**         | `pulse`, `shake`, `spin`, `fadeIn`, `fadeOut`    |
| **Custom Filters**     | `registerFilter`, `createFilter`                 |
| **Custom Transitions** | `createCustomTransition`                         |

---

## License

MIT

```
```
