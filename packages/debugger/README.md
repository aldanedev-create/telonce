# @teloce/debugger




<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo "
   width="200"/>
</p>



**Author:** Aldane Hutchinson

 teloce:  A JavaScript template engine for Python web developers.

> Human-friendly debugger for Teloce applications.

The Teloce Debugger translates cryptic JavaScript and TypeScript errors into plain English and provides a local dashboard for inspecting your application in real time.

---

## Features

* **🧠 Human-Friendly Errors** — Translates cryptic error messages into plain English.
* **💡 Smart Suggestions** — Provides "Did you mean...?" suggestions and code examples.
* **📊 Performance Monitoring** — Monitor FPS, memory usage, and render times in real time.
* **🧩 Component Inspector** — Visual component tree with state inspection.
* **📝 Live Logging** — Real-time application logs with filtering.
* **🔌 WebSocket Connection** — Live data streaming from your application.
* **📦 Zero Installation** — Opens in your browser with no browser extensions required.

---

## Installation

```bash
npm install @teloce/debugger
```

### Using the CLI

```bash
npm install -g @teloce/cli
```

---

# Quick Start

## Via CLI — Recommended

Start the debugger:

```bash
teloce debug
```

Start on a custom port:

```bash
teloce debug --port 9000
```

Start without automatically opening the browser:

```bash
teloce debug --no-open
```

## Via API

```javascript
import { serveDashboard } from '@teloce/debugger';

const server = serveDashboard({
    port: 9000,
    host: 'localhost',
    open: true
});

// Close the server
await server.close();
```

---

# Dashboard Tabs

## 📊 Overview

* Real-time statistics
* Component count
* Error count
* FPS
* Memory usage
* Recent errors with suggested fixes
* Component tree visualization

## 🧩 Components

* All mounted components
* Render counts
* Render timings
* Mount and unmount status

## 📦 State

* Current application state
* Reactive data inspection
* Real-time state updates

## ❌ Errors

* Human-friendly error messages
* Suggested fixes with code examples
* Stack traces
* Source mapping

## ⚡ Performance

* FPS monitoring
* Memory usage
* Component render times
* Compilation time tracking

## 📝 Logs

* Live application logs
* Log-level filtering
* `info`
* `warn`
* `error`
* `debug`
* Timestamped entries

---

# Error Translation Examples

## Before — Cryptic Error

```text
TypeError: Cannot read property 'name' of undefined
```

## After — Human-Friendly Error

```json
{
    "title": "Property Access on Empty Value",
    "description": "Tried to read property 'name' from undefined.",
    "fix": "Make sure the object exists before accessing 'name'.",
    "example": "if (user) {\n  console.log(user.name);\n}",
    "docs": "Add a null check or ensure the data is loaded."
}
```

---

## Before — TypeScript Error

```text
TS2322: Type 'string' is not assignable to type 'number'
```

## After — Human-Friendly Error

```json
{
    "title": "Type Mismatch",
    "description": "You're using a value of type 'string' where 'number' is expected.",
    "fix": "Change the value to a number.",
    "example": "// Instead of: age = '20'\n// Use: age = 20",
    "docs": "The function calculateAge() only accepts numbers."
}
```

---

# Error Categories

| Category          | Description                                   |
| ----------------- | --------------------------------------------- |
| `type_error`      | Type mismatches, such as string → number      |
| `reference_error` | Undefined variables                           |
| `property_error`  | Accessing properties on `null` or `undefined` |
| `function_error`  | Calling values that are not functions         |
| `import_error`    | Module not found                              |
| `syntax_error`    | Invalid syntax                                |
| `template_error`  | Template parsing errors                       |
| `binding_error`   | Invalid Teloce bindings                       |
| `unknown`         | Unclassified errors                           |

---

# API Reference

## `serveDashboard(options)`

Serves the debugger dashboard.

### Options

```typescript
interface DashboardOptions {
    port?: number;
    host?: string;
    open?: boolean;
    config?: TeloceConfig;
}
```

Defaults:

* `port` — `9000`
* `host` — `localhost`
* `open` — `true`

### Returns

```typescript
interface DashboardServer {
    close: () => Promise<void>;
    getUrl: () => string;
    getConnections: () => number;
}
```

---

## `parseError(error)`

Parses an error into a structured format.

```javascript
import { parseError } from '@teloce/debugger';

const parsed = parseError(
    new Error('Cannot read property "name" of undefined')
);

console.log(parsed.category);
// 'property_error'

console.log(parsed.name);
// 'name'
```

---

## `translateError(error)`

Translates an error into a human-readable format.

```javascript
import { translateError } from '@teloce/debugger';

const translation = translateError(error);

console.log(translation.title);
// 'Property Access on Empty Value'

console.log(translation.fix);
// 'Make sure the object exists...'
```

---

## `getSuggestion(error)`

Gets suggestions for fixing an error.

```javascript
import { getSuggestion } from '@teloce/debugger';

const suggestions = getSuggestion(error);

suggestions.forEach((suggestion) => {
    console.log(`${suggestion.priority}: ${suggestion.text}`);
});
```

---

## `createDebugWebSocket(server, options)`

Creates a WebSocket server for debugger communication.

```javascript
import { createDebugWebSocket } from '@teloce/debugger';

const ws = createDebugWebSocket(httpServer, {
    path: '/__teloce_debug'
});

// Send an error
ws.sendError(new Error('Something went wrong'));

// Send state
ws.sendState({
    count: 42,
    user: 'John'
});

// Send performance data
ws.sendPerformance({
    fps: 60,
    memory: 1024 * 1024 * 50
});
```

---

## `createInspector(options)`

Creates a component inspector.

```javascript
import { createInspector } from '@teloce/debugger';

const inspector = createInspector({
    trackDOM: true,
    trackState: true,
    trackRenderTime: true
});

// Create a node
const id = inspector.createNode(
    'component',
    'MyComponent'
);

// Update node
inspector.updateNode(id, {
    renderCount: 10
});

// Get component tree
const tree = inspector.getTree();

console.log(tree.roots);
```

---

# WebSocket Messages

## Debug Message Types

```typescript
type DebugMessageType =
    | 'error'        // Error report
    | 'state'        // State update
    | 'performance'  // Performance metrics
    | 'compile'      // Compilation result
    | 'render'       // Render event
    | 'component'    // Component update
    | 'event'        // Event trigger
    | 'log'          // Log message
    | 'connected'    // Client connected
    | 'disconnected'; // Client disconnected
```

## Message Format

```typescript
interface DebugMessage<T = any> {
    type: DebugMessageType;
    payload: T;
    timestamp: number;
    source?: string;
    line?: number;
    column?: number;
}
```

---

# Integration with Python Frameworks

## Flask

```python
from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template(
        "index.html",
        data=data
    )
```

The debugger can be used with a Flask development server:

```bash
teloce debug --proxy http://localhost:5000
```

## Django

Run the debugger with your Django development server:

```bash
teloce debug --proxy http://localhost:8000
```

## FastAPI

Run the debugger with your FastAPI development server:

```bash
teloce debug --proxy http://localhost:8000
```

---

# Configuration

## `teloce.config.ts`

Configure the debugger in your project configuration:

```typescript
import { defineConfig } from '@teloce/cli';

export default defineConfig({
    debugger: {
        port: 9000,
        host: 'localhost',
        open: true
    }
});
```

---

## Environment Variables

### Debugger Port

```bash
TELOCE_DEBUG_PORT=9000
```

### Debugger Host

```bash
TELOCE_DEBUG_HOST=localhost
```

### Auto-Open Browser

```bash
TELOCE_DEBUG_OPEN=true
```

### Enable Verbose Logging

```bash
DEBUG=teloce:*
```

---

# Troubleshooting

## WebSocket Connection Failed

**Issue:** The WebSocket connection to the debug server fails.

**Fix:**

```bash
# Check if the debug server is running
teloce debug

# Check firewall settings
# Ensure port 9000 is available
```

---

## Dashboard Not Loading

**Issue:** The dashboard does not load or displays errors.

**Fix:**

1. Clear your browser cache.
2. Check the browser console for errors.
3. Restart the debugger.
4. Try a different port.

```bash
teloce debug --port 9001
```

---

## No Errors Showing

**Issue:** Errors are not appearing in the dashboard.

**Fix:** Ensure the WebSocket connection is established and errors are being sent.

```javascript
import { createDebugWebSocket } from '@teloce/debugger';

const ws = createDebugWebSocket(server);

ws.sendError(
    new Error('Test error')
);
```

---

# Advanced Usage

## Custom Error Translations

Register custom error patterns:

```typescript
import { registerErrorPattern } from '@teloce/debugger';

registerErrorPattern({
    pattern: /MyCustomError: (.+)/,
    category: 'custom',

    translate: (match) => ({
        title: 'Custom Error',
        description: `Custom error occurred: ${match[1]}`,
        fix: 'Check your custom logic.',
        docs: 'See custom error documentation.'
    })
});
```

---

## Custom Suggestions

Register custom suggestions for specific errors:

```typescript
import { registerSuggestion } from '@teloce/debugger';

registerSuggestion({
    pattern: /Database error/,

    suggestions: [
        {
            text: 'Check your database connection.',
            priority: 'high',
            fixCode: 'await connectToDatabase();'
        }
    ]
});
```

---

# License

MIT
