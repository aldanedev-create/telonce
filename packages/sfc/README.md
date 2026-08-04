# @teloce/sfc

Single File Component (SFC) compiler for Teloce. Compiles `.vel` files into JavaScript.

## Installation

```bash
npm install @teloce/sfc
What is a .vel File?
A .vel file is a Single File Component that contains all parts of a component in one file:

html
<!-- Component.vel -->
<template>
  <div class="component">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <button @click="handleClick">Click Me</button>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  data() {
    return {
      title: 'Hello World',
      message: 'This is a SFC'
    };
  },
  methods: {
    handleClick() {
      this.message = 'Clicked!';
    }
  }
};
</script>

<style scoped>
.component {
  padding: 20px;
  border: 1px solid #ccc;
}
h1 {
  color: blue;
}
</style>
Usage
Compile a .vel file
javascript
import { compile } from '@teloce/sfc';

const source = fs.readFileSync('Component.vel', 'utf-8');
const result = compile(source, {
  filename: 'Component.vel',
  sourceMap: true,
  minify: true,
  scoped: true
});

console.log(result.code);
console.log(result.css);
Parse only
javascript
import { parseSFC } from '@teloce/sfc';

const result = parseSFC(source);
console.log('Template:', result.template);
console.log('Script:', result.script);
console.log('Style:', result.style);
API
compile(source, options)
Compiles a complete .vel file.

Options:

filename - Filename for error reporting

sourceMap - Enable source maps

minify - Enable minification

dev - Development mode

target - Target platform ('browser', 'node', 'esm')

scoped - Enable scoped CSS

Returns:

code - Compiled JavaScript

css - Compiled CSS

name - Component name

sfc - Parsed SFC result

script - Script compile result

style - Style compile result

template - Template compile result

diagnostics - Errors and warnings

parseSFC(source, options)
Parses a .vel file into sections.

Options:

filename - Filename for error reporting

Returns:

template - Template section

script - Script section

style - Style section

name - Component name

diagnostics - Errors and warnings

Scoped CSS
When scoped: true is enabled, CSS selectors are automatically scoped to the component:

css
/* Original */
.component { padding: 20px; }
h1 { color: blue; }

/* Scoped */
.component[data-teloce-component-abc123] { padding: 20px; }
h1[data-teloce-component-abc123] { color: blue; }
License
MIT