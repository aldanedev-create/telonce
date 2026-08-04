/**
 * HTTP server - creates and manages the HTTP server
 */

import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

export interface ServerOptions {
  /**
   * Server port
   */
  port?: number;

  /**
   * Server host
   */
  host?: string;

  /**
   * Enable HTTPS
   */
  https?: boolean | {
    key: string;
    cert: string;
  };

  /**
   * Request handler
   */
  handler?: (req: http.IncomingMessage, res: http.ServerResponse) => void | Promise<void>;

  /**
   * Middleware stack
   */
  middleware?: any[];

  /**
   * Static directory
   */
  staticDir?: string;
}

export interface ServerConfig {
  port: number;
  host: string;
  https: boolean;
  options: ServerOptions;
}

export interface ServerInstance {
  server: http.Server | https.Server;
  config: ServerConfig;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  restart: () => Promise<void>;
}

/**
 * Create an HTTP server
 */
export function createServer(options: ServerOptions = {}): ServerInstance {
  const config: ServerConfig = {
    port: options.port || 5173,
    host: options.host || 'localhost',
    https: !!options.https,
    options,
  };

  let server: http.Server | https.Server;

  // Create the server
  if (options.https) {
    // HTTPS server
    let key: string;
    let cert: string;
    
    if (typeof options.https === 'object') {
      key = options.https.key;
      cert = options.https.cert;
    } else {
      // Use default certificates
      const certPath = path.join(__dirname, '..', '..', 'certs');
      key = fs.readFileSync(path.join(certPath, 'server.key'), 'utf-8');
      cert = fs.readFileSync(path.join(certPath, 'server.crt'), 'utf-8');
    }

    server = https.createServer({ key, cert }, options.handler || defaultHandler);
  } else {
    // HTTP server
    server = http.createServer(options.handler || defaultHandler);
  }

  function defaultHandler(_req: http.IncomingMessage, res: http.ServerResponse) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Teloce Dev Server');
  }

  return {
    server,
    config,
    start() {
      return new Promise((resolve, reject) => {
        server.listen(config.port, config.host, () => {
          resolve();
        });
        server.on('error', reject);
      });
    },
    stop() {
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    async restart() {
      await this.stop();
      await this.start();
    },
  };
}

/**
 * Start a server
 */
export async function startServer(
  options: ServerOptions = {}
): Promise<ServerInstance> {
  const server = createServer(options);
  await server.start();
  return server;
}

/**
 * Stop a server
 */
export async function stopServer(server: ServerInstance): Promise<void> {
  await server.stop();
}