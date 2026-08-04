# @teloce/server

Development server for Teloce - HTTP server, WebSocket HMR, middleware, and proxy.

## Installation

```bash
npm install @teloce/server
What It Does
The server package provides a complete development server with:

HTTP Server: Serves your application

WebSocket HMR: Hot module replacement for instant updates

Middleware: Logger, CORS, static files, compression

Proxy: Reverse proxy to Python backends (Flask, Django, FastAPI)

Usage
Basic Dev Server
javascript
import { createDevServer } from '@teloce/server';

const server = createDevServer({
  port: 5173,
  root: process.cwd(),
  staticDir: 'static',
  logging: true
});

await server.start();
With Proxy to Flask
javascript
import { createDevServer } from '@teloce/server';

const server = createDevServer({
  port: 5173,
  staticDir: 'static',
  proxyTarget: 'http://localhost:5000', // Flask dev server
  hmr: true
});

await server.start();
Custom Middleware
javascript
import { createDevServer, createMiddleware } from '@teloce/server';

const customMiddleware = createMiddleware(async (ctx, next) => {
  console.log('Custom middleware');
  await next();
}, 'custom');

const server = createDevServer({
  middleware: [customMiddleware]
});
WebSocket HMR
javascript
import { createWebSocketServer, broadcastMessage } from '@teloce/server';

const wsServer = createWebSocketServer(httpServer, {
  path: '/__teloce_ws'
});

// Broadcast reload message
broadcastMessage(wsServer, { type: 'reload' });
API Reference
createDevServer(options)
Create a development server.

Options:

port - Server port (default: 5173)

host - Server host (default: 'localhost')

root - Root directory (default: process.cwd())

staticDir - Static directory

proxyTarget - Proxy target URL

hmr - Enable HMR (default: true)

logging - Enable logging (default: true)

cors - Enable CORS (default: true)

middleware - Custom middleware

createServer(options)
Create an HTTP server.

createWebSocketServer(server, options)
Create a WebSocket server for HMR.

createMiddleware(handler, name, priority)
Create a middleware.

createProxy(target, options)
Create a reverse proxy.

License
MIT