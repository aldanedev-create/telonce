# @teloce/debugger

> Human-friendly debugger for Teloce applications

The Teloce Debugger translates cryptic JavaScript/TypeScript errors into plain English and provides a local dashboard for inspecting your application in real-time.

---

## Features

- **🧠 Human-Friendly Errors** - Translates cryptic error messages into plain English
- **💡 Smart Suggestions** - "Did you mean...?" fix engine with code examples
- **📊 Performance Monitoring** - Real-time FPS, memory usage, and render times
- **🧩 Component Inspector** - Visual component tree with state inspection
- **📝 Live Logging** - Real-time application logs with filtering
- **🔌 WebSocket Connection** - Live data streaming from your application
- **📦 Zero Installation** - Opens in your browser, no extensions needed

---

## Installation

```bash
npm install @teloce/debugger
Or use the CLI:

bash
npm install -g @teloce/cli
Quick Start
Via CLI (Recommended)
bash
# Start the debugger
teloce debug

# With custom port
teloce debug --port 9000

# Without auto-opening browser
teloce debug --no-open
Via API
javascript
import { serveDashboard } from '@teloce/debugger';

const server = serveDashboard({
    port: 9000,
    host: 'localhost',
    open: true
});

// Close the server
await server.close();
Dashboard Tabs
📊 Overview
Real-time statistics (components, errors, FPS, memory)

Recent errors with fixes

Component tree visualization

🧩 Components
All mounted components

Render counts and timings

Mount/unmount status

📦 State
Current application state

Reactive data inspection

Real-time updates

❌ Errors
Human-friendly error messages

Suggested fixes with code examples

Stack traces with source mapping

⚡ Performance
FPS monitoring

Memory usage tracking

Component render times

Compilation time tracking

📝 Logs
Live application logs

Level filtering (info, warn, error, debug)

Timestamped entries

Error Translation Examples
Before (Cryptic)
text
TypeError: Cannot read property 'name' of undefined
After (Human-Friendly)
json
{
    "title": "Property Access on Empty Value",
    "description": "Tried to read property 'name' from undefined.",
    "fix": "Make sure the object exists before accessing 'name'.",
    "example": "if (user) {\n  console.log(user.name);\n}",
    "docs": "Add a null check or ensure the data is loaded."
}
Before (TypeScript Error)
text
TS2322: Type 'string' is not assignable to type 'number'
After (Human-Friendly)
json
{
    "title": "Type Mismatch",
    "description": "You're using a value of type 'string' where 'number' is expected.",
    "fix": "Change the value to a number.",
    "example": "// Instead of: age = '20'\n// Use: age = 20",
    "docs": "The function calculateAge() only accepts numbers."
}
Error Categories
Category	Description
type_error	Type mismatches (string → number, etc.)
reference_error	Undefined variables
property_error	Accessing properties on null/undefined
function_error	Calling non-functions
import_error	Module not found
syntax_error	Invalid syntax
template_error	Template parsing errors
binding_error	Invalid Teloce bindings
unknown	Unclassified errors
API Reference
serveDashboard(options)
Serves the debugger dashboard.

Options:

typescript
interface DashboardOptions {
    port?: number;      // Default: 9000
    host?: string;      // Default: 'localhost'
    open?: boolean;     // Default: true
    config?: TeloceConfig;
}
Returns:

typescript
interface DashboardServer {
    close: () => Promise<void>;
    getUrl: () => string;
    getConnections: () => number;
}
parseError(error)
Parses an error into a structured format.

javascript
import { parseError } from '@teloce/debugger';

const parsed = parseError(new Error('Cannot read property "name" of undefined'));
console.log(parsed.category); // 'property_error'
console.log(parsed.name);     // 'name'
translateError(error)
Translates an error to human-readable format.

javascript
import { translateError } from '@teloce/debugger';

const translation = translateError(error);
console.log(translation.title);    // 'Property Access on Empty Value'
console.log(translation.fix);      // 'Make sure the object exists...'
getSuggestion(error)
Gets suggestions for fixing an error.

javascript
import { getSuggestion } from '@teloce/debugger';

const suggestions = getSuggestion(error);
suggestions.forEach(s => {
    console.log(`${s.priority}: ${s.text}`);
});
createDebugWebSocket(server, options)
Creates a WebSocket server for debug communication.

javascript
import { createDebugWebSocket } from '@teloce/debugger';

const ws = createDebugWebSocket(httpServer, {
    path: '/__teloce_debug'
});

// Send an error
ws.sendError(new Error('Something went wrong'));

// Send state
ws.sendState({ count: 42, user: 'John' });

// Send performance data
ws.sendPerformance({ fps: 60, memory: 1024 * 1024 * 50 });
createInspector(options)
Creates a component inspector.

javascript
import { createInspector } from '@teloce/debugger';

const inspector = createInspector({
    trackDOM: true,
    trackState: true,
    trackRenderTime: true
});

// Create a node
const id = inspector.createNode('component', 'MyComponent');

// Update node
inspector.updateNode(id, { renderCount: 10 });

// Get tree
const tree = inspector.getTree();
console.log(tree.roots);
WebSocket Messages
DebugMessage Types
typescript
type DebugMessageType =
    | 'error'      // Error report
    | 'state'      // State update
    | 'performance'// Performance metrics
    | 'compile'    // Compilation result
    | 'render'     // Render event
    | 'component'  // Component update
    | 'event'      // Event trigger
    | 'log'        // Log message
    | 'connected'  // Client connected
    | 'disconnected'; // Client disconnected
Message Format
typescript
interface DebugMessage<T = any> {
    type: DebugMessageType;
    payload: T;
    timestamp: number;
    source?: string;
    line?: number;
    column?: number;
}
Integration with Flask/Django
Flask
python
@app.route('/')
def home():
    return render_template('index.html', data=data)

# The debugger automatically detects Flask
# Run: teloce debug --proxy http://localhost:5000
Django
python
# The debugger automatically detects Django
# Run: teloce debug --proxy http://localhost:8000
FastAPI
python
# The debugger automatically detects FastAPI
# Run: teloce debug --proxy http://localhost:8000
Configuration
teloce.config.ts
typescript
export default defineConfig({
    debugger: {
        port: 9000,
        host: 'localhost',
        open: true
    }
});
Environment Variables
bash
# Debugger port
TELOCE_DEBUG_PORT=9000

# Debugger host
TELOCE_DEBUG_HOST=localhost

# Auto-open browser
TELOCE_DEBUG_OPEN=true

# Enable verbose logging
DEBUG=teloce:*
Troubleshooting
WebSocket Connection Failed
Issue: WebSocket connection to debug server fails.

Fix:

bash
# Check if the debug server is running
teloce debug

# Check firewall settings
# Ensure port 9000 is open
Dashboard Not Loading
Issue: Dashboard page doesn't load or shows errors.

Fix:

bash
# Clear browser cache
# Check browser console for errors
# Restart the debug server
teloce debug --port 9001
No Errors Showing
Issue: Errors not appearing in the dashboard.

Fix:

javascript
// Ensure WebSocket connection is established
// Check that errors are being sent
import { sendError } from '@teloce/debugger';

const ws = createDebugWebSocket(server);
sendError(ws, new Error('Test error'));
Advanced Usage
Custom Error Translations
typescript
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
Custom Suggestions
typescript
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
License
MIT