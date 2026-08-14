# @teloce/server


<p align="center">
  <img src="https://raw.githubusercontent.com/aldanedev-create/telonce/main/assets/telonce.png" alt="telonce logo "
   width="200"/>
</p>



**Author:** Aldane Hutchinson

 teloce:  A JavaScript template engine for Python web developers.
> Development server for Teloce — HTTP server, WebSocket HMR, middleware, and proxy support.

---

## Installation

```bash
npm install @teloce/server
```

---

## What It Does

The `@teloce/server` package provides a complete development server with:

* **HTTP Server** — Serves your Teloce application.
* **WebSocket HMR** — Hot Module Replacement for instant updates.
* **Middleware** — Logger, CORS, static files, and compression support.
* **Proxy** — Reverse proxy support for Python backends such as Flask, Django, and FastAPI.

---

## Usage

### Basic Development Server

```javascript
import { createDevServer } from '@teloce/server';

const server = createDevServer({
  port: 5173,
  root: process.cwd(),
  staticDir: 'static',
  logging: true,
});

await server.start();
```

---

### Proxy to Flask

```javascript
import { createDevServer } from '@teloce/server';

const server = createDevServer({
  port: 5173,
  staticDir: 'static',
  proxyTarget: 'http://localhost:5000',
  hmr: true,
});

await server.start();
```

---

### Custom Middleware

```javascript
import {
  createDevServer,
  createMiddleware,
} from '@teloce/server';

const customMiddleware = createMiddleware(
  async (ctx, next) => {
    console.log('Custom middleware');
    await next();
  },
  'custom'
);

const server = createDevServer({
  middleware: [customMiddleware],
});

await server.start();
```

---

## WebSocket HMR

Create a WebSocket server for Hot Module Replacement.

```javascript
import {
  createWebSocketServer,
  broadcastMessage,
} from '@teloce/server';

const wsServer = createWebSocketServer(httpServer, {
  path: '/__teloce_ws',
});

// Broadcast a reload message.
broadcastMessage(wsServer, {
  type: 'reload',
});
```

---

## API Reference

### `createDevServer(options)`

Creates a Teloce development server.

#### Options

| Option        | Description                   | Default         |
| ------------- | ----------------------------- | --------------- |
| `port`        | Server port                   | `5173`          |
| `host`        | Server host                   | `localhost`     |
| `root`        | Root directory                | `process.cwd()` |
| `staticDir`   | Static files directory        | —               |
| `proxyTarget` | Proxy target URL              | —               |
| `hmr`         | Enable Hot Module Replacement | `true`          |
| `logging`     | Enable request logging        | `true`          |
| `cors`        | Enable CORS                   | `true`          |
| `middleware`  | Custom middleware             | `[]`            |

### `createServer(options)`

Creates an HTTP server.

```javascript
import { createServer } from '@teloce/server';

const server = createServer({
  port: 5173,
  host: 'localhost',
});
```

### `createWebSocketServer(server, options)`

Creates a WebSocket server for HMR communication.

```javascript
import { createWebSocketServer } from '@teloce/server';

const wsServer = createWebSocketServer(server, {
  path: '/__teloce_ws',
});
```

### `createMiddleware(handler, name, priority)`

Creates a custom middleware.

```javascript
import { createMiddleware } from '@teloce/server';

const middleware = createMiddleware(
  async (ctx, next) => {
    await next();
  },
  'custom',
  10
);
```

### `createProxy(target, options)`

Creates a reverse proxy.

```javascript
import { createProxy } from '@teloce/server';

const proxy = createProxy('http://localhost:5000', {
  changeOrigin: true,
});
```

---

## Python Backend Integration

The development server can proxy requests to popular Python backend frameworks.

| Framework | Default Port |
| --------- | -----------: |
| Flask     |       `5000` |
| Django    |       `8000` |
| FastAPI   |       `8000` |
| Quart     |       `5000` |
| Flaxon    |       `8080` |

Example:

```javascript
const server = createDevServer({
  port: 5173,
  proxyTarget: 'http://localhost:5000',
  hmr: true,
});

await server.start();
```

---

## License

MIT

```
```
