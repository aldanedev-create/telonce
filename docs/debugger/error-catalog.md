# Error Catalog

A comprehensive catalog of Teloce errors with explanations, common causes, and fixes.

---

## Compilation Errors

### E001: Missing Template

**Error Message:** `Missing <template> section in .vel file`

**Explanation:**

A `.vel` file must contain a `<template>` section.

**Fix:**

Add a `<template>` section to the `.vel` file.

```html
<template>
  <div>Hello World</div>
</template>
```

---

### E002: Unclosed Tag

**Error Message:** `Unclosed <for> directive`

**Explanation:**

Every `<for>` directive must have a corresponding `</for>` closing tag.

**Fix:**

Add the missing closing tag.

**Bad:**

```html
<for product in products>
  <div>{{ product.name }}</div>
```

**Good:**

```html
<for product in products>
  <div>{{ product.name }}</div>
</for>
```

---

### E003: Missing Key

**Error Message:** `For loop missing "key" attribute`

**Explanation:**

Dynamic lists should provide a stable key so Teloce can efficiently track items.

**Fix:**

Add a key to the loop.

**Bad:**

```html
<for product in products>
  <div>{{ product.name }}</div>
</for>
```

**Good:**

```html
<for key="id" item="product" in="products">
  <div>{{ product.name }}</div>
</for>
```

---

### E004: Empty Interpolation

**Error Message:** `Empty interpolation found`

**Explanation:**

Interpolation expressions must contain a variable or valid expression.

**Fix:**

Add an expression inside `{{ }}`.

**Bad:**

```html
<p>{{ }}</p>
```

**Good:**

```html
<p>{{ name }}</p>
```

---

### E005: Unknown Directive

**Error Message:** `Unknown directive: "@unknown"`

**Explanation:**

The directive does not exist or has not been registered.

**Fix:**

Check the directive name or register a custom directive.

**Bad:**

```html
<button @unknown="handleClick">
  Click
</button>
```

**Good:**

```html
<button @click="handleClick">
  Click
</button>
```

---

## Runtime Errors

### R001: Undefined Variable

**Error Message:** `Cannot read property 'name' of undefined`

**Explanation:**

Code is attempting to access a property on an undefined value.

**Fix:**

Ensure the object exists before accessing its properties.

**Bad:**

```javascript
const name = user.name;
```

**Good:**

```javascript
if (user) {
  const name = user.name;
}
```

---

### R002: Type Mismatch

**Error Message:** `Type 'string' is not assignable to type 'number'`

**Explanation:**

A string was provided where a number is expected.

**Fix:**

Use the correct data type.

**Bad:**

```javascript
const count = "5";
total(count);
```

**Good:**

```javascript
const count = 5;
total(count);
```

---

### R003: Function Not Found

**Error Message:** `"saveUser" is not a function`

**Explanation:**

A template or component is calling a function that does not exist.

**Fix:**

Define the function in the component methods.

```javascript
const UserForm = teloce.defineComponent({
  methods: {
    saveUser() {
      // Save user.
    },
  },
});
```

Use it in the template:

```html
<button @click="saveUser">
  Save
</button>
```

---

### R004: Component Not Found

**Error Message:** `Component "MyComponent" is not registered`

**Explanation:**

The application is attempting to render an unregistered component.

**Fix:**

Register the component before using it.

```javascript
app.component(
  "MyComponent",
  MyComponent
);
```

Then:

```html
<MyComponent />
```

---

### R005: Prop Validation Failed

**Error Message:** `Prop "title" failed validation`

**Explanation:**

A component prop did not satisfy its validation rules.

**Fix:**

Pass a valid value or update the validation rules.

```javascript
const MyComponent = teloce.defineComponent({
  props: {
    title: {
      type: String,
      required: true,

      validator: (value) => {
        return value.length > 0;
      },
    },
  },
});
```

---

## API Errors

### A001: Network Error

**Error Message:** `Network request failed`

**Explanation:**

The API request could not be completed.

**Fix:**

1. Check network connectivity.
2. Verify the API URL.
3. Check server availability.
4. Inspect browser network logs.

```javascript
try {
  const response = await fetch("/api/data");

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status}`
    );
  }
} catch (error) {
  console.error(
    "Network error:",
    error
  );
}
```

---

### A002: 404 Not Found

**Error Message:** `404: /api/users not found`

**Explanation:**

The requested API endpoint does not exist.

**Fix:**

Check the endpoint path.

**Bad:**

```javascript
fetch("/api/user");
```

**Good:**

```javascript
fetch("/api/users");
```

---

### A003: 500 Server Error

**Error Message:** `500: Internal Server Error`

**Explanation:**

The server encountered an unexpected error while processing the request.

**Fix:**

Check server logs and fix the backend exception.

Example Python backend:

```python
@app.route("/api/users")
def get_users():
    try:
        return jsonify(users)
    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 500
```

---

## Reactivity Errors

### RE001: Signal Called as Function

**Error Message:** `count is not a function`

**Explanation:**

A normal value is being called as though it were a signal.

**Fix:**

Create and use a signal correctly.

**Bad:**

```javascript
const count = 0;

count();
```

**Good:**

```javascript
const [count, setCount] =
  createSignal(0);

console.log(count());
```

---

### RE002: Effect Cleanup Error

**Error Message:** `Effect cleanup failed`

**Explanation:**

An effect's cleanup function threw an error.

**Fix:**

Handle cleanup failures safely.

```javascript
createEffect(() => {
  const timer = setInterval(
    () => {},
    1000
  );

  return () => {
    try {
      clearInterval(timer);
    } catch (error) {
      console.warn(
        "Cleanup failed:",
        error
      );
    }
  };
});
```

---

### RE003: Computed Cycle

**Error Message:** `Computed property cycle detected`

**Explanation:**

A computed value directly or indirectly depends on itself.

**Bad:**

```javascript
const a = createComputed(() => b());
const b = createComputed(() => a());
```

**Good:**

```javascript
const base = createSignal(0);

const a = createComputed(
  () => base() * 2
);

const b = createComputed(
  () => base() * 3
);
```

---

## Debugger Errors

### D001: Debugger Not Found

**Error Message:** `Debugger server not running`

**Explanation:**

The Teloce debugger server is not running.

**Fix:**

Start the debugger:

```bash
teloce debug
```

---

### D002: WebSocket Connection Failed

**Error Message:** `WebSocket connection failed`

**Explanation:**

The debugger client could not establish a WebSocket connection.

**Fix:**

1. Ensure the debugger is running.
2. Check the debugger port.
3. Verify the WebSocket URL.
4. Check firewall or network restrictions.

```javascript
const ws = new WebSocket(
  "ws://localhost:9000/__teloce_debug"
);

ws.onerror = () => {
  console.log(
    "Debugger connection failed"
  );
};
```

---

## Plugin Errors

### P001: Plugin Not Found

**Error Message:** `Plugin "my-plugin" not found`

**Explanation:**

The requested plugin could not be loaded.

**Fix:**

Install the plugin:

```bash
npm install @teloce/plugin-my-plugin
```

Then register it:

```javascript
import myPlugin from
  "@teloce/plugin-my-plugin";

teloce.use(myPlugin);
```

---

### P002: Plugin Version Mismatch

**Error Message:** `Plugin "my-plugin" requires teloce@^0.1.0`

**Explanation:**

The plugin requires a different version of Teloce.

**Fix:**

Update Teloce or the plugin:

```bash
npm update teloce @teloce/plugin-my-plugin
```

---

### P003: Plugin Conflict

**Error Message:** `Plugin "my-plugin" conflicts with "another-plugin"`

**Explanation:**

Two installed plugins are incompatible or attempt to modify the same functionality.

**Fix:**

1. Check the plugin documentation.
2. Update both plugins.
3. Remove the conflicting plugin.
4. Disable overlapping functionality.

---

## Error Severity Levels

| Level           | Description                                                     |
| --------------- | --------------------------------------------------------------- |
| 🔴 **Critical** | Application crash or severe failure. Must be fixed immediately. |
| 🟠 **Error**    | A feature or operation is broken.                               |
| 🟡 **Warning**  | Potential problem that should be investigated.                  |
| 🔵 **Info**     | Informational message that does not indicate a failure.         |

---

# CSS Error Animations

Teloce applications can use CSS animations to make errors easier to notice without adding animation logic to JavaScript.

> **Note:** GitHub Markdown does not execute CSS inside fenced code blocks. The CSS examples below are intended to be copied into your application's stylesheet.

## Error Shake

Add the following CSS to your stylesheet:

```css
.error-shake {
  animation: error-shake 350ms ease-in-out;
}

@keyframes error-shake {
  0%,
  100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-6px);
  }

  40% {
    transform: translateX(6px);
  }

  60% {
    transform: translateX(-4px);
  }

  80% {
    transform: translateX(4px);
  }
}
```

Then apply the class to an element:

```html
<div class="error-shake">
  Something went wrong.
</div>
```

---

## Error Fade In

Add the following CSS to your stylesheet:

```css
.error-message {
  animation: error-fade-in 250ms ease-out;
}

@keyframes error-fade-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Then use the class in your template:

```html
<div class="error-message">
  Invalid email address.
</div>
```

---

## Severity Indicator

Add the following CSS to your stylesheet:

```css
.error-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.error-indicator::before {
  content: "";
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  animation: error-pulse 1.5s ease-in-out infinite;
}

.error-critical::before {
  background: #dc2626;
}

.error-warning::before {
  background: #eab308;
}

.error-info::before {
  background: #2563eb;
}

@keyframes error-pulse {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}
```

Example:

```html
<div class="error-indicator error-critical">
  Critical error
</div>
```

---

## Debugger Connection Animation

A debugger connection indicator can use a simple pulse animation.

Add the following CSS to your stylesheet:

```css
.debugger-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.debugger-status::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.debugger-connected::before {
  animation: debugger-pulse 1.8s ease-in-out infinite;
}

@keyframes debugger-pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}
```

Example:

```html
<div class="debugger-status debugger-connected">
  Connected
</div>
```

---

## Respect Reduced Motion

Error animations should respect the user's accessibility preferences.

Add the following CSS to your stylesheet:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This disables or minimizes animations for users who have enabled **Reduce Motion** in their operating system or browser.

---

# Debugging Workflow

When an error occurs, use the following workflow:

1. **Read the error code** — Identify the category and error ID.
2. **Check the error message** — Look for the immediate cause.
3. **Review the explanation** — Understand why the error occurred.
4. **Apply the suggested fix** — Start with the simplest solution.
5. **Check the debugger** — Inspect component state and stack traces.
6. **Check network requests** — For API or WebSocket errors.
7. **Check plugins** — Disable recently added plugins if necessary.
8. **Reproduce the issue** — Confirm that the fix works.

---

# Error Code Format

Teloce errors use short prefixes to make errors easy to identify.

| Prefix | Category    |
| ------ | ----------- |
| `E`    | Compilation |
| `R`    | Runtime     |
| `A`    | API         |
| `RE`   | Reactivity  |
| `D`    | Debugger    |
| `P`    | Plugin      |

Examples:

```text
E001   Compilation error
R004   Component runtime error
A002   API endpoint error
RE003  Reactivity cycle
D002   Debugger WebSocket error
P001   Plugin loading error
```

---

# Next Steps

* [Performance](https://docs/debugger/performance) — Performance monitoring.
* [Inspector](https://docs/debugger/inspector) — Component inspector.
* [Troubleshooting](https://docs/debugger/troubleshooting) — Common troubleshooting solutions.
* [Core API](https://docs/api/core) — Core Teloce APIs.
* [Reactivity API](https://docs/api/reactivity-api) — Signals, effects, and computed values.
