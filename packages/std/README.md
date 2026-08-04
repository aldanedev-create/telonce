# @teloce/std

Standard library for Teloce - filters, transitions, animations, and utilities.

## Installation

```bash
npm install @teloce/std
Filters
String Filters
javascript
import { capitalize, uppercase, slugify, truncate } from '@teloce/std';

// In templates
{{ 'hello world' | capitalize }} // "Hello world"
{{ 'hello' | uppercase }} // "HELLO"
{{ 'Hello World' | slugify }} // "hello-world"
{{ 'long text...' | truncate:10 }} // "long tex..."
Number Filters
javascript
import { currency, percent, number } from '@teloce/std';

// In templates
{{ 19.99 | currency }} // "$19.99"
{{ 0.25 | percent }} // "25%"
{{ 1234567 | number }} // "1,234,567"
Date Filters
javascript
import { dateFormat, timeAgo } from '@teloce/std';

// In templates
{{ date | dateFormat:'YYYY-MM-DD' }} // "2024-01-01"
{{ date | timeAgo }} // "2d ago"
Array Filters
javascript
import { first, last, pluck, orderBy } from '@teloce/std';

// In templates
{{ items | first }} // First item
{{ items | pluck:'name' }} // ['name1', 'name2']
{{ items | orderBy:'price':'desc' }} // Sort by price desc
Transitions
javascript
import { fade, slide, scale, withTransition } from '@teloce/std';

// Apply fade transition
await fade(element);

// Slide transition
await slide(element, { duration: 500 });

// With transition wrapper
await withTransition(() => {
  element.innerHTML = 'New content';
}, fade, element);
Animations
javascript
import { pulse, shake, spin, fadeIn, fadeOut } from '@teloce/std';

// Pulse animation
await pulse(element);

// Shake animation
await shake(element, { duration: 400 });

// Spin continuously
await spin(element);

// Fade in and out
await fadeIn(element);
await fadeOut(element);
Custom Filters
javascript
import { registerFilter, createFilter } from '@teloce/std';

// Register a custom filter
registerFilter('reverse', createFilter((value: string) => {
  return value.split('').reverse().join('');
}));

// Use in templates
{{ 'hello' | reverse }} // "olleh"
Custom Transitions
javascript
import { createCustomTransition } from '@teloce/std';

const myTransition = createCustomTransition(
  { transform: 'scale(0)', opacity: '0' },
  { transform: 'scale(1)', opacity: '1' },
  { duration: 500 }
);

await myTransition(element);

License
MIT