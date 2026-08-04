/**
 * Dev server - complete development server with HMR, middleware, and proxy
 */

import { createServer, type ServerInstance, type ServerOptions } from './http';
import { createWebSocketServer, type WebSocketServer } from './websocket';
import { combineMiddleware, staticMiddleware, loggerMiddleware, corsMiddleware } from './middleware';
import { createProxy } from './proxy';

export interface DevServerOptions {
  /**
   * Server port
   */
  port?: number;

  /**
   * Server host
   */
  host?: string;

  /**
   * Root directory
   */
  root?: string;

  /**
   * Static directory
   */
  staticDir?: string;

  /**
   * Proxy target (for Python backend)
   */
  proxyTarget?: string;

  /**
   * Enable HMR
   */
  hmr?: boolean;

  /**
   * Enable logging
   */
  logging?: boolean;

  /**
   * Enable CORS
   */
  cors?: boolean;

  /**
   * Custom middleware
   */
  middleware?: any[];
}

export interface DevServer {
  /**
   * HTTP server
   */
  http: ServerInstance;

  /**
   * WebSocket server (for HMR)
   */
  ws?: WebSocketServer;

  /**
   * Start the server
   */
  start: () => Promise<void>;

  /**
   * Stop the server
   */
  stop: () => Promise<void>;

  /**
   * Restart the server
   */
  restart: () => Promise<void>;

  /**
   * Hot reload
   */
  reload: () => void;

  /**
   * Get server URL
   */
  getUrl: () => string;
}

/**
 * Create a development server
 */
export function createDevServer(options: DevServerOptions = {}): DevServer {
  const port = options.port || 5173;
  const host = options.host || 'localhost';
  const root = options.root || process.cwd();
  const staticDir = options.staticDir || 'static';
  const proxyTarget = options.proxyTarget;

  // Build middleware stack
  const middleware = [];

  // Logger
  if (options.logging !== false) {
    middleware.push(loggerMiddleware());
  }

  // CORS
  if (options.cors !== false) {
    middleware.push(corsMiddleware());
  }

  // Static files
  if (staticDir) {
    middleware.push(staticMiddleware(staticDir));
  }

  // Proxy
  if (proxyTarget) {
    const proxy = createProxy(proxyTarget, {
      changeOrigin: true,
      ws: true,
    });
    middleware.push({
      name: 'proxy',
      handler: proxy.proxy,
      priority: 0,
    });
  }

  // Custom middleware
  if (options.middleware) {
    middleware.push(...options.middleware);
  }

  // Create HTTP server
  const httpServer = createServer({
    port,
    host,
    handler: combineMiddleware(middleware),
  });

  // Create WebSocket server for HMR
  let wsServer: WebSocketServer | undefined;
  if (options.hmr !== false) {
    wsServer = createWebSocketServer(httpServer.server as any, {
      path: '/__teloce_ws',
    });
  }

  let isRunning = false;

  return {
    http: httpServer,
    ws: wsServer,

    async start() {
      if (isRunning) return;
      await httpServer.start();
      isRunning = true;
      console.log(`🚀 Teloce Dev Server running at http://${host}:${port}`);
    },

    async stop() {
      if (!isRunning) return;
      if (wsServer) {
        wsServer.close();
      }
      await httpServer.stop();
      isRunning = false;
      console.log('🛑 Teloce Dev Server stopped');
    },

    async restart() {
      await this.stop();
      await this.start();
    },

    reload() {
      if (wsServer) {
        wsServer.broadcast({ type: 'reload' });
      }
    },

    getUrl() {
      return `http://${host}:${port}`;
    },
  };
}

/**
 * Start a development server
 */
export async function startDevServer(
  options: DevServerOptions = {}
): Promise<DevServer> {
  const server = createDevServer(options);
  await server.start();
  return server;
}