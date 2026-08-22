import { fileURLToPath } from 'url';
import path from 'path';
import { readFileSync } from 'fs';
import { createServer, type ServerInstance } from '@teloce/server';
import { combineMiddleware, staticMiddleware, corsMiddleware, type MiddlewareContext } from '@teloce/server';
import { createDebugWebSocket, type DebugWebSocket } from '../websocket';

// import.meta.url works in both the ESM and CJS builds (tsup shims it for CJS),
// unlike a bare `__dirname` reference which is undefined in ESM output.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface DashboardOptions {
  port?: number;
  host?: string;
  /**
   * Open the dashboard in the default browser once it starts.
   * (Actual browser-opening is handled by the CLI; this flag is accepted
   * here so callers can pass their options through unchanged.)
   */
  open?: boolean;
  /**
   * Teloce project configuration, made available to the dashboard.
   */
  config?: Record<string, unknown>;
}

export interface DashboardData {
  stats: Record<string, unknown>;
}

export interface DashboardServer {
  /**
   * The live debug WebSocket channel, once the server has started.
   * Useful for pushing errors/state/performance data into the dashboard.
   */
  ws?: DebugWebSocket;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  /**
   * Alias for stop(), kept for callers that expect a close() method.
   */
  close: () => Promise<void>;
}

const DASHBOARD_ASSETS_DIR = path.join(__dirname, 'dashboard');
const DEBUG_WS_PATH = '/__teloce_debug';

export function serveDashboard(options: DashboardOptions = {}): DashboardServer {
  const port = options.port || 9000;
  const host = options.host || 'localhost';

  const staticFiles = staticMiddleware(DASHBOARD_ASSETS_DIR, { prefix: DEBUG_WS_PATH });
  const cors = corsMiddleware();
  const middleware = [cors, staticFiles];

  const httpServer: ServerInstance = createServer({
    port,
    host,
    handler: (req, res) => {
      const ctx: MiddlewareContext = {
        req,
        res,
        params: {},
        query: {},
      };

      return combineMiddleware(middleware)(ctx, async () => {
        // Anything that isn't a dashboard asset falls back to the dashboard
        // shell itself, so deep links (e.g. /components) still load the app.
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexHtmlFallback());
      });
    },
  });

  let ws: DebugWebSocket | undefined;
  let isRunning = false;

  return {
    get ws() {
      return ws;
    },

    async start() {
      if (isRunning) return;
      await httpServer.start();
      ws = createDebugWebSocket(httpServer.server, { path: DEBUG_WS_PATH });
      isRunning = true;
    },

    async stop() {
      if (!isRunning) return;
      if (ws) {
        await ws.close();
        ws = undefined;
      }
      await httpServer.stop();
      isRunning = false;
    },

    async close() {
      await this.stop();
    },
  };
}

let cachedIndexHtml: string | undefined;
function indexHtmlFallback(): string {
  if (cachedIndexHtml) return cachedIndexHtml;
  try {
    // Lazily read so a missing build doesn't crash server startup.
    cachedIndexHtml = readFileSync(
      path.join(DASHBOARD_ASSETS_DIR, 'index.html'),
      'utf-8'
    );
  } catch {
    cachedIndexHtml =
      '<!doctype html><html><body><h1>Teloce Debugger</h1>' +
      '<p>Dashboard assets not found. Run the debugger package build first.</p>' +
      '</body></html>';
  }
  return cachedIndexHtml;
}

export function createDashboardServer(options: DashboardOptions = {}): DashboardServer {
  return serveDashboard(options);
}
