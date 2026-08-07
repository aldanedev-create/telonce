/**
 * Playground Examples - Pre-built templates for quick start
 */

export interface Example {
  name: string;
  description: string;
  template: string;
  script: string;
  style: string;
  config: string;
}

export const EXAMPLES: Record<string, Example> = {
  // --- Counter Example ---
  counter: {
    name: 'Counter',
    description: 'Simple counter with reactive state',
    template: `
<div id="app">
  <h1>{{ title }}</h1>
  <div class="counter">
    <span class="count">{{ count }}</span>
    <div class="buttons">
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
      <button @click="reset">⟳</button>
    </div>
  </div>
  <p class="info">Double: {{ doubleCount }}</p>
</div>
    `.trim(),
    script: `
const data = {
  title: 'Counter',
  count: 0,
  increment() {
    this.count++;
  },
  decrement() {
    if (this.count > 0) this.count--;
  },
  reset() {
    this.count = 0;
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  }
};
    `.trim(),
    style: `
#app {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
  padding: 40px 20px;
}
h1 {
  color: #333;
  font-size: 28px;
  margin-bottom: 30px;
}
.counter {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 30px;
}
.count {
  font-size: 48px;
  font-weight: bold;
  color: #4a90d9;
}
.buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}
button {
  padding: 10px 30px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}
button:hover {
  transform: translateY(-2px);
}
.buttons button:first-child {
  background: #4a90d9;
  color: white;
}
.buttons button:nth-child(2) {
  background: #e74c3c;
  color: white;
}
.buttons button:last-child {
  background: #95a5a6;
  color: white;
}
.info {
  margin-top: 20px;
  color: #888;
  font-size: 14px;
}
    `.trim(),
    config: '{}',
  },

  // --- Todo App ---
  todo: {
    name: 'Todo App',
    description: 'Interactive todo list with add/remove',
    template: `
<div id="app">
  <h1>{{ title }}</h1>
  <div class="input-group">
    <input :model="newTodo" @keyup.enter="addTodo" placeholder="Add a todo..." />
    <button @click="addTodo">Add</button>
  </div>
  <ul>
    <for key="id" item="todo" in="todos">
      <li :class="{ done: todo.done }">
        <span @click="toggleTodo(todo.id)">{{ todo.text }}</span>
        <button @click="deleteTodo(todo.id)">✕</button>
      </li>
    </for>
  </ul>
  <div class="footer">
    <span>{{ activeTodos }} remaining</span>
  </div>
</div>
    `.trim(),
    script: `
const data = {
  title: 'Todo List',
  newTodo: '',
  todos: [
    { id: 1, text: 'Learn Teloce', done: true },
    { id: 2, text: 'Build a project', done: false },
    { id: 3, text: 'Deploy to production', done: false }
  ],
  addTodo() {
    if (this.newTodo.trim()) {
      this.todos.push({
        id: Date.now(),
        text: this.newTodo.trim(),
        done: false
      });
      this.newTodo = '';
    }
  },
  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
  },
  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) todo.done = !todo.done;
  },
  computed: {
    activeTodos() {
      return this.todos.filter(t => !t.done).length;
    }
  }
};
    `.trim(),
    style: `
#app {
  max-width: 500px;
  margin: 0 auto;
  padding: 40px 20px;
}
h1 {
  color: #333;
  font-size: 28px;
  margin-bottom: 20px;
}
.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
input {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
input:focus {
  border-color: #4a90d9;
}
.input-group button {
  padding: 10px 24px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s;
}
li:hover {
  background: #edf2f7;
}
li.done span {
  text-decoration: line-through;
  opacity: 0.6;
}
li span {
  cursor: pointer;
  flex: 1;
}
li button {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 18px;
  padding: 0 5px;
}
.footer {
  margin-top: 20px;
  color: #888;
  font-size: 14px;
}
    `.trim(),
    config: '{}',
  },

  // --- API Fetch ---
  fetch: {
    name: 'API Fetch',
    description: 'Fetch data from an API endpoint',
    template: `
<div id="app">
  <h1>{{ title }}</h1>
  <button @click="fetchData" :disabled="loading">
    {{ loading ? 'Loading...' : 'Fetch Data' }}
  </button>
  <div class="data" :show="!loading && data.length > 0">
    <ul>
      <for key="id" item="item" in="data">
        <li>
          <span class="id">#{{ item.id }}</span>
          <span class="name">{{ item.name }}</span>
        </li>
      </for>
    </ul>
    <p class="count">{{ data.length }} items loaded</p>
  </div>
  <div class="error" :show="error">
    <p>❌ {{ error }}</p>
  </div>
</div>
    `.trim(),
    script: `
const data = {
  title: 'API Data Fetcher',
  data: [],
  loading: false,
  error: null,
  async fetchData() {
    this.loading = true;
    this.error = null;
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      this.data = [
        { id: 1, name: 'Item One' },
        { id: 2, name: 'Item Two' },
        { id: 3, name: 'Item Three' },
        { id: 4, name: 'Item Four' },
        { id: 5, name: 'Item Five' }
      ];
    } catch (err) {
      this.error = err.message || 'Failed to fetch data';
    } finally {
      this.loading = false;
    }
  }
};
// Auto-fetch on load
setTimeout(() => data.fetchData(), 500);
    `.trim(),
    style: `
#app {
  max-width: 500px;
  margin: 0 auto;
  padding: 40px 20px;
}
h1 {
  color: #333;
  font-size: 28px;
  margin-bottom: 20px;
}
button {
  padding: 10px 24px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
button:hover:not(:disabled) {
  transform: translateY(-2px);
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.data {
  margin-top: 20px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  gap: 12px;
  padding: 10px 14px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 6px;
}
.id {
  color: #888;
  font-size: 12px;
  min-width: 40px;
}
.name {
  color: #333;
}
.count {
  margin-top: 12px;
  color: #888;
  font-size: 14px;
}
.error {
  margin-top: 16px;
  padding: 12px;
  background: #fde8e8;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
}
.error p {
  color: #e74c3c;
  margin: 0;
}
    `.trim(),
    config: '{}',
  },

  // --- Form Example ---
  form: {
    name: 'Form',
    description: 'Form with validation and two-way binding',
    template: `
<div id="app">
  <h1>{{ title }}</h1>
  <form @submit.prevent="handleSubmit">
    <div class="field">
      <label>Name</label>
      <input :model="form.name" placeholder="Enter your name" />
      <span class="error" :show="errors.name">{{ errors.name }}</span>
    </div>
    <div class="field">
      <label>Email</label>
      <input :model="form.email" type="email" placeholder="Enter your email" />
      <span class="error" :show="errors.email">{{ errors.email }}</span>
    </div>
    <div class="field">
      <label>Message</label>
      <textarea :model="form.message" rows="4" placeholder="Enter your message"></textarea>
      <span class="error" :show="errors.message">{{ errors.message }}</span>
    </div>
    <button type="submit" :disabled="submitting">
      {{ submitting ? 'Submitting...' : 'Submit' }}
    </button>
    <div class="success" :show="submitted">
      ✅ Form submitted successfully!
    </div>
  </form>
</div>
    `.trim(),
    script: `
const data = {
  title: 'Contact Form',
  form: {
    name: '',
    email: '',
    message: ''
  },
  errors: {},
  submitting: false,
  submitted: false,
  handleSubmit() {
    this.errors = {};
    this.submitted = false;

    // Validate
    if (!this.form.name.trim()) {
      this.errors.name = 'Name is required';
    }
    if (!this.form.email.trim()) {
      this.errors.email = 'Email is required';
    } else if (!this.form.email.includes('@')) {
      this.errors.email = 'Invalid email address';
    }
    if (!this.form.message.trim()) {
      this.errors.message = 'Message is required';
    }

    if (Object.keys(this.errors).length > 0) return;

    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.submitted = true;
      console.log('Form submitted:', this.form);
    }, 1000);
  }
};
    `.trim(),
    style: `
#app {
  max-width: 500px;
  margin: 0 auto;
  padding: 40px 20px;
}
h1 {
  color: #333;
  font-size: 28px;
  margin-bottom: 30px;
}
.field {
  margin-bottom: 20px;
}
label {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}
input, textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}
input:focus, textarea:focus {
  border-color: #4a90d9;
}
textarea {
  resize: vertical;
}
.error {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 4px;
  display: block;
}
button[type="submit"] {
  padding: 12px 32px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}
button[type="submit"]:hover:not(:disabled) {
  transform: translateY(-2px);
}
button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.success {
  margin-top: 16px;
  padding: 12px 16px;
  background: #d4edda;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  color: #155724;
}
    `.trim(),
    config: '{}',
  },
};

/**
 * Get all example names
 */
export function getExampleNames(): string[] {
  return Object.keys(EXAMPLES);
}

/**
 * Get an example by name
 */
export function getExample(name: string): Example | undefined {
  return EXAMPLES[name];
}