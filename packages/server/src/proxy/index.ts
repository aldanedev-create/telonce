/**
 * Proxy - reverse proxy to Flask/Django/FastAPI dev server
 */

import * as http from 'http';
import * as url from 'url';
import { URL } from 'url';

export interface ProxyOptions {
  /**
   * Target URL
   */
  target?: string;

  /**
   * Path rewrite
   */
  pathRewrite?: Record<string, string> | ((path: string) => string);

  /**
   * Headers to forward
   */
  forwardHeaders?: string[];

  /**
   * Additional headers to add
   */
  headers?: Record<string, string>;

  /**
   * Timeout in milliseconds
   */
  timeout?: number;

  /**
   * Follow redirects
   */
  followRedirects?: boolean;

  /**
   * WebSocket support
   */
  ws?: boolean;

  /**
   * Change origin
   */
  changeOrigin?: boolean;
}

export interface ProxyTarget {
  host: string;
  port: number;
  protocol: 'http' | 'https';
  path?: string;
}

export interface ProxyConfig {
  target: ProxyTarget;
  options: ProxyOptions;
}

/**
 * Parse a target URL into proxy target
 */
export function parseTarget(target: string): ProxyTarget {
  const url = new URL(target);
  return {
    protocol: url.protocol === 'https:' ? 'https' : 'http',
    host: url.hostname,
    port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
  };
}

/**
 * Create a proxy
 */
export function createProxy(
  target: string | ProxyTarget,
  options: ProxyOptions = {}
): {
  proxy: (req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>;
  close: () => void;
} {
  const targetObj = typeof target === 'string' ? parseTarget(target) : target;
  const timeout = options.timeout || 30000;

  async function proxyRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    return new Promise((resolve) => {
      const parsedUrl = url.parse(req.url || '/', true);

      // Apply path rewrite
      let pathname = parsedUrl.pathname || '/';
      if (options.pathRewrite) {
        if (typeof options.pathRewrite === 'function') {
          pathname = options.pathRewrite(pathname);
        } else {
          for (const [pattern, replacement] of Object.entries(options.pathRewrite)) {
            pathname = pathname.replace(new RegExp(pattern), replacement);
          }
        }
      }

      // Build target URL
      const queryString = parsedUrl.search || '';
      const targetUrl = `${targetObj.protocol}://${targetObj.host}:${targetObj.port}${pathname}${queryString}`;

      // Prepare request options
      const requestOptions: http.RequestOptions = {
        method: req.method,
        host: targetObj.host,
        port: targetObj.port,
        path: pathname + queryString,
        headers: { ...(req.headers as http.OutgoingHttpHeaders) },
        timeout,
      };

      // Change origin header
      if (options.changeOrigin) {
        const headers = requestOptions.headers as http.OutgoingHttpHeaders;
        headers.host = `${targetObj.host}:${targetObj.port}`;
      }

      // Add custom headers
      if (options.headers) {
        const headers = requestOptions.headers as http.OutgoingHttpHeaders;
        for (const [key, value] of Object.entries(options.headers)) {
          headers[key] = value;
        }
      }

      // Forward selected headers
      if (options.forwardHeaders && requestOptions.headers) {
        const headers = requestOptions.headers as http.OutgoingHttpHeaders;
        const allHeaders = Object.keys(headers);
        for (const header of allHeaders) {
          if (!options.forwardHeaders.includes(header)) {
            delete headers[header];
          }
        }
      }

      // Create proxy request
      const proxyReq = http.request(targetUrl, requestOptions);

      proxyReq.on('response', (proxyRes) => {
        // Copy status code
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);

        // Pipe response
        proxyRes.pipe(res);
        resolve();
      });

      proxyReq.on('error', (err) => {
        // A proper error response has already been written and sent to the
        // client below - that's the request being handled successfully
        // from this function's point of view, so resolve() here, not
        // reject(). Previously this rejected even after writing the 502,
        // and since the caller (createServer's proxy middleware in
        // dev-server.ts) does `await proxy.proxy(...)` with no try/catch,
        // that rejection became an unhandled promise rejection that
        // crashed the entire Node process - meaning any single failed
        // connection to the backend (e.g. Flask/Django not started yet,
        // or mid-restart - both routine during normal dev workflow) took
        // down the whole `teloce dev` server, not just that one request.
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' });
          res.end(`Proxy Error: ${err.message}`);
        }
        resolve();
      });

      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        if (!res.headersSent) {
          res.writeHead(504, { 'Content-Type': 'text/plain' });
          res.end('Proxy Timeout');
        }
        resolve();
      });

      // Pipe request body
      req.pipe(proxyReq);
    });
  }

  return {
    proxy: proxyRequest,
    close() {
      // Clean up
    },
  };
}

/**
 * Proxy a request
 */
export function proxyRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  target: string | ProxyTarget,
  options: ProxyOptions = {}
): Promise<void> {
  const proxy = createProxy(target, options);
  return proxy.proxy(req, res);
}