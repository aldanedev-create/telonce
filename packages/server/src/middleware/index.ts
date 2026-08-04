/**
 * Middleware - request/response middleware for the server
 */

import * as http from 'http';
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';

export interface MiddlewareContext {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  params: Record<string, string>;
  query: Record<string, string>;
  body?: any;
}

export type MiddlewareHandler = (
  ctx: MiddlewareContext,
  next: () => Promise<void>
) => Promise<void>;

export interface Middleware {
  name: string;
  handler: MiddlewareHandler;
  priority?: number;
}

/**
 * Create a middleware
 */
export function createMiddleware(
  handler: MiddlewareHandler,
  name: string = 'anonymous',
  priority: number = 0
): Middleware {
  return { name, handler, priority };
}

/**
 * Combine multiple middleware into a single handler
 */
export function combineMiddleware(
  middleware: Middleware[]
): MiddlewareHandler {
  const sorted = [...middleware].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return async (ctx: MiddlewareContext, next: () => Promise<void>) => {
    let index = 0;

    async function nextHandler() {
      if (index < sorted.length) {
        const mw = sorted[index++];
        await mw.handler(ctx, nextHandler);
      } else {
        await next();
      }
    }

    await nextHandler();
  };
}

/**
 * Logging middleware
 */
export function loggerMiddleware(): Middleware {
  return createMiddleware(async (ctx, next) => {
    const start = Date.now();
    const { req } = ctx;
    const method = req.method || 'GET';
    const url = req.url || '/';

    await next();

    const duration = Date.now() - start;
    const status = ctx.res.statusCode || 200;
    console.log(`${method} ${url} - ${status} (${duration}ms)`);
  }, 'logger', 100);
}

/**
 * CORS middleware
 */
export function corsMiddleware(options: {
  origin?: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
} = {}): Middleware {
  const origin = options.origin || '*';
  const methods = options.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  const headers = options.headers || ['Content-Type', 'Authorization'];
  const credentials = options.credentials || false;

  return createMiddleware(async (ctx, next) => {
    const { req, res } = ctx;
    const reqOrigin = req.headers.origin || '';

    // Allow origin
    if (origin === '*') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (typeof origin === 'function') {
      if (origin(reqOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', reqOrigin);
      }
    } else if (Array.isArray(origin)) {
      if (origin.includes(reqOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', reqOrigin);
      }
    } else {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Allow methods
    res.setHeader('Access-Control-Allow-Methods', methods.join(', '));

    // Allow headers
    res.setHeader('Access-Control-Allow-Headers', headers.join(', '));

    // Allow credentials
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    await next();
  }, 'cors', 100);
}

/**
 * Static file middleware
 */
export function staticMiddleware(
  directory: string,
  options: { prefix?: string; index?: string } = {}
): Middleware {
  const prefix = options.prefix || '';
  const index = options.index || 'index.html';

  return createMiddleware(async (ctx, next) => {
    const { req, res } = ctx;
    const parsedUrl = url.parse(req.url || '/', true);
    let filePath = parsedUrl.pathname || '/';

    // Remove prefix if present
    if (prefix && filePath.startsWith(prefix)) {
      filePath = filePath.slice(prefix.length);
    }

    // Normalize path
    if (filePath === '/') {
      filePath = `/${index}`;
    }

    const fullPath = path.join(directory, filePath);
    const safePath = path.normalize(fullPath);

    // Check if path is within directory
    if (!safePath.startsWith(directory)) {
      await next();
      return;
    }

    // Check if file exists
    try {
      const stats = await fs.promises.stat(safePath);
      if (stats.isFile()) {
        const content = await fs.promises.readFile(safePath);
        const ext = path.extname(safePath).slice(1);
        const contentType = getContentType(ext);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      }
    } catch (_) {
      // File not found, continue
    }

    await next();
  }, 'static', 50);
}

/**
 * Compression middleware
 */
export function compressMiddleware(): Middleware {
  return createMiddleware(async (ctx, next) => {
    const { req, res } = ctx;

    // Check if client accepts compression
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const compression = acceptEncoding.includes('gzip') ? 'gzip' :
                        acceptEncoding.includes('deflate') ? 'deflate' : null;

    if (compression) {
      res.setHeader('Content-Encoding', compression);
      // In a real implementation, use compression library
    }

    await next();
  }, 'compress', 40);
}

/**
 * Get content type from file extension
 */
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    txt: 'text/plain',
    xml: 'application/xml',
    pdf: 'application/pdf',
    zip: 'application/zip',
    wasm: 'application/wasm',
    map: 'application/json',
  };
  return types[ext] || 'application/octet-stream';
}