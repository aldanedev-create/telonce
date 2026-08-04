/**
 * WebSocket server - HMR channel for hot module replacement
 * 
 * Uses the 'ws' package for real WebSocket implementation
 */

import { EventEmitter } from 'events';
import * as http from 'http';
import { WebSocketServer as WSServer, WebSocket, type ServerOptions } from 'ws';
import * as crypto from 'crypto';

export interface WebSocketServerOptions {
  /**
   * Server path
   */
  path?: string;

  /**
   * Heartbeat interval in ms
   */
  heartbeatInterval?: number;

  /**
   * Maximum message size in bytes
   */
  maxPayload?: number;

  /**
   * Client timeout in ms
   */
  clientTimeout?: number;
}

export interface WebSocketServer {
  /**
   * Server instance
   */
  server: WSServer;

  /**
   * Connected clients
   */
  clients: Set<WebSocketClient>;

  /**
   * Broadcast a message to all clients
   */
  broadcast: (message: WebSocketMessage | any) => void;

  /**
   * Send a message to a specific client
   */
  send: (client: WebSocketClient, message: WebSocketMessage | any) => void;

  /**
   * Close the server
   */
  close: () => Promise<void>;

  /**
   * Event emitter
   */
  on: (event: string, handler: (...args: any[]) => void) => void;

  /**
   * Get active connections count
   */
  getConnections: () => number;

  /**
   * Get connected client IDs
   */
  getClientIds: () => string[];
}

export interface WebSocketClient {
  id: string;
  ws: WebSocket;
  send: (data: any) => void;
  close: () => void;
  readyState: number;
  isAlive: boolean;
  connectedAt: number;
  lastMessageAt: number;
}

export interface WebSocketMessage {
  type: 'reload' | 'update' | 'error' | 'connected' | 'ping' | 'pong' | 'log' | string;
  payload?: any;
  timestamp: number;
  id?: string;
}

export interface WebSocketConnectionEvent {
  client: WebSocketClient;
  request: http.IncomingMessage;
}

export interface WebSocketMessageEvent {
  client: WebSocketClient;
  message: WebSocketMessage;
  raw: string | Buffer;
}

/**
 * Generate a unique client ID
 */
function generateClientId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Create a WebSocket server
 */
export function createWebSocketServer(
  server: http.Server,
  options: WebSocketServerOptions = {}
): WebSocketServer {
  const clients = new Set<WebSocketClient>();
  const emitter = new EventEmitter();
  const path = options.path || '/__teloce_ws';
  const heartbeatInterval = options.heartbeatInterval || 30000;
  const clientTimeout = options.clientTimeout || 60000;
  const maxPayload = options.maxPayload || 1024 * 1024; // 1MB

  // Create WebSocket server
  const wsOptions: ServerOptions = {
    server,
    path,
    maxPayload,
    clientTracking: true,
    handleProtocols: (protocols: Set<string>) => {
      // Support for custom protocols
      if (protocols.has('teloce-hmr')) {
        return 'teloce-hmr';
      }
      return protocols.values().next().value || '';
    },
  };

  const wss = new WSServer(wsOptions);

  // Heartbeat interval
  const heartbeatTimer = setInterval(() => {
    for (const client of clients) {
      if (!client.isAlive) {
        // Client is dead, terminate the connection
        client.ws.terminate();
        clients.delete(client);
        emitter.emit('client-disconnected', { client, reason: 'timeout' });
        continue;
      }

      // Check if client has timed out
      const now = Date.now();
      if (now - client.lastMessageAt > clientTimeout) {
        client.ws.terminate();
        clients.delete(client);
        emitter.emit('client-disconnected', { client, reason: 'timeout' });
        continue;
      }

      // Send ping to check connection
      client.isAlive = false;
      client.ws.ping(() => {
        // Ping sent
      });
    }
  }, heartbeatInterval);

  // Handle WebSocket connections
  wss.on('connection', (ws: WebSocket, request: http.IncomingMessage) => {
    // Create client object
    const clientId = generateClientId();
    const client: WebSocketClient = {
      id: clientId,
      ws,
      send: (data: any) => {
        if (ws.readyState === WebSocket.OPEN) {
          const message = typeof data === 'string' ? data : JSON.stringify(data);
          ws.send(message);
        }
      },
      close: () => {
        ws.close();
      },
      readyState: ws.readyState,
      isAlive: true,
      connectedAt: Date.now(),
      lastMessageAt: Date.now(),
    };

    clients.add(client);

    // Emit connection event
    const connectionEvent: WebSocketConnectionEvent = { client, request };
    emitter.emit('connection', connectionEvent);

    // Send connection confirmation
    const connectMessage: WebSocketMessage = {
      type: 'connected',
      payload: {
        clientId: client.id,
        connectedAt: client.connectedAt,
        serverInfo: {
          version: '0.1.0',
          name: 'teloce-dev-server',
        },
      },
      timestamp: Date.now(),
    };
    client.send(connectMessage);

    // Handle messages
    ws.on('message', (data: Buffer | string | ArrayBuffer) => {
      const raw = data.toString();
      try {
        const parsed = JSON.parse(raw) as WebSocketMessage;
        client.lastMessageAt = Date.now();

        // Handle ping/pong
        if (parsed.type === 'ping') {
          const pongMessage: WebSocketMessage = {
            type: 'pong',
            payload: { timestamp: Date.now() },
            timestamp: Date.now(),
            id: parsed.id,
          };
          client.send(pongMessage);
          return;
        }

        const messageEvent: WebSocketMessageEvent = {
          client,
          message: parsed,
          raw,
        };
        emitter.emit('message', messageEvent);
      } catch (error) {
        // Handle non-JSON messages
        const messageEvent: WebSocketMessageEvent = {
          client,
          message: {
            type: 'raw',
            payload: raw,
            timestamp: Date.now(),
          },
          raw,
        };
        emitter.emit('message', messageEvent);
      }
    });

    // Handle pong responses
    ws.on('pong', () => {
      client.isAlive = true;
      client.lastMessageAt = Date.now();
    });

    // Handle close
    ws.on('close', (code: number, reason: string) => {
      clients.delete(client);
      emitter.emit('client-disconnected', { client, code, reason });
    });

    // Handle errors
    ws.on('error', (error: Error) => {
      emitter.emit('error', { client, error });
    });
  });

  // Handle server errors
  wss.on('error', (error: Error) => {
    emitter.emit('error', { error });
  });

  // Handle server close
  wss.on('close', () => {
    clearInterval(heartbeatTimer);
    clients.clear();
    emitter.emit('closed');
  });

  const wsServer: WebSocketServer = {
    server: wss,
    clients,

    broadcast(message: WebSocketMessage | any): void {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      for (const client of clients) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(data);
        }
      }
    },

    send(client: WebSocketClient, message: WebSocketMessage | any): void {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    },

    async close(): Promise<void> {
      clearInterval(heartbeatTimer);
      
      // Close all client connections
      for (const client of clients) {
        client.ws.close(1000, 'Server shutting down');
      }
      clients.clear();

      // Close the server
      return new Promise((resolve) => {
        wss.close(() => {
          emitter.emit('closed');
          resolve();
        });
      });
    },

    on(event: string, handler: (...args: any[]) => void): void {
      emitter.on(event, handler);
    },

    getConnections(): number {
      return clients.size;
    },

    getClientIds(): string[] {
      return Array.from(clients).map(c => c.id);
    },
  };

  return wsServer;
}

/**
 * Send a message to a specific client
 */
export function sendMessage(
  server: WebSocketServer,
  client: WebSocketClient,
  message: WebSocketMessage | any
): void {
  server.send(client, message);
}

/**
 * Broadcast a message to all clients
 */
export function broadcastMessage(
  server: WebSocketServer,
  message: WebSocketMessage | any
): void {
  server.broadcast(message);
}

/**
 * Create a reload message
 */
export function createReloadMessage(): WebSocketMessage {
  return {
    type: 'reload',
    timestamp: Date.now(),
  };
}

/**
 * Create an update message for HMR
 */
export function createUpdateMessage(
  moduleId: string,
  content: string,
  type: 'js' | 'css' | 'html' = 'js'
): WebSocketMessage {
  return {
    type: 'update',
    payload: {
      moduleId,
      content,
      type,
    },
    timestamp: Date.now(),
  };
}

/**
 * Create an error message
 */
export function createErrorMessage(
  message: string,
  details?: any
): WebSocketMessage {
  return {
    type: 'error',
    payload: {
      message,
      details,
    },
    timestamp: Date.now(),
  };
}

/**
 * Create a log message
 */
export function createLogMessage(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  data?: any
): WebSocketMessage {
  return {
    type: 'log',
    payload: {
      level,
      message,
      data,
    },
    timestamp: Date.now(),
  };
}