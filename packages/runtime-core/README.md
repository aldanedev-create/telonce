# @teloce/runtime-core

Runtime core for Teloce - component system, lifecycle, props, slots, and directives.

## Installation

```bash
npm install @teloce/runtime-core
Components
Define reusable components:

javascript
import { defineComponent } from '@teloce/runtime-core';

const MyComponent = defineComponent({
  name: 'MyComponent',
  data() {
    return {
      count: 0
    };
  },
  methods: {
    increment() {
      this.count++;
    }
  },
  template: `
    <div>
      <h1>Count: {{ count }}</h1>
      <button @click="increment">Increment</button>
    </div>
  `
});
Lifecycle Hooks
javascript
import { 
  onBeforeMount, 
  onMounted, 
  onBeforeUpdate, 
  onUpdated,
  onBeforeUnmount,
  onUnmounted 
} from '@teloce/runtime-core';

const Component = defineComponent({
  beforeMount() {
    console.log('Before mount');
  },
  mounted() {
    console.log('Mounted');
  },
  beforeUpdate() {
    console.log('Before update');
  },
  updated() {
    console.log('Updated');
  },
  beforeUnmount() {
    console.log('Before unmount');
  },
  unmounted() {
    console.log('Unmounted');
  }
});
Props
Define props with validation:

javascript
import { defineProps, PropType } from '@teloce/runtime-core';

const Component = defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    items: {
      type: Array,
      default: () => []
    }
  }
});
Slots
Use slots for content projection:

javascript
import { createSlots, renderSlot } from '@teloce/runtime-core';

const Component = defineComponent({
  template: `
    <div class="card">
      <div class="header">
        ${renderSlot(slots, 'header')}
      </div>
      <div class="body">
        ${renderSlot(slots, 'default')}
      </div>
    </div>
  `
});
Directives
Create custom directives:

javascript
import { registerDirective, createDirective } from '@teloce/runtime-core';

registerDirective('focus', createDirective({
  name: 'focus',
  mounted(el) {
    el.focus();
  }
}));
License
MIT