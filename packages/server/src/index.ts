/**
 * @teloce/server - Development Server
 * 
 * This package provides a development server for Teloce applications.
 * It includes HTTP server, WebSocket for HMR, middleware, and proxy support.
 */

// Export HTTP server
export {
  createServer,
  startServer,
  stopServer,
  type ServerOptions,
  type ServerInstance,
  type ServerConfig,
} from './http';

// Export WebSocket
export {
  createWebSocketServer,
  sendMessage,
  broadcastMessage,
  type WebSocketServerOptions,
  type WebSocketServer,
  type WebSocketMessage,
  type WebSocketClient,
} from './websocket';

// Export middleware
export {
  createMiddleware,
  combineMiddleware,
  loggerMiddleware,
  corsMiddleware,
  staticMiddleware,
  compressMiddleware,
  type Middleware,
  type MiddlewareHandler,
  type MiddlewareContext,
} from './middleware';

// Export proxy
export {
  createProxy,
  proxyRequest,
  type ProxyOptions,
  type ProxyConfig,
  type ProxyTarget,
} from './proxy';

// Export main server
export {
  createDevServer,
  type DevServerOptions,
  type DevServer,
  type DevServerConfig,
} from './dev-server';

// Default export
export default {
  createServer,
  startServer,
  stopServer,
  createWebSocketServer,
  sendMessage,
  broadcastMessage,
  createMiddleware,
  combineMiddleware,
  loggerMiddleware,
  corsMiddleware,
  staticMiddleware,
  compressMiddleware,
  createProxy,
  proxyRequest,
  createDevServer,
};