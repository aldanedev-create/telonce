/**
 * Proxy - reverse proxy to Flask/Django/FastAPI dev server
 */

import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

export interface ProxyOptions {
  /**
   * Target URL
   */
  target: string;

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
    return new Promise((resolve, reject) => {
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
        headers: { ...req.headers },
        timeout,
      };

      // Change origin header
      if (options.changeOrigin) {
        if (requestOptions.headers) {
          requestOptions.headers.host = `${targetObj.host}:${targetObj.port}`;
        }
      }

      // Add custom headers
      if (options.headers) {
        for (const [key, value] of Object.entries(options.headers)) {
          if (requestOptions.headers) {
            requestOptions.headers[key] = value;
          }
        }
      }

      // Forward selected headers
      if (options.forwardHeaders && requestOptions.headers) {
        const headers = requestOptions.headers;
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
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Proxy Error: ${err.message}`);
        reject(err);
      });

      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        res.writeHead(504, { 'Content-Type': 'text/plain' });
        res.end('Proxy Timeout');
        reject(new Error('Proxy timeout'));
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