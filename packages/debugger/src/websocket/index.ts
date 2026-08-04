/**
 * WebSocket - streams live errors/state to the dashboard page
 */

import { createWebSocketServer, type WebSocketServer, type WebSocketMessage } from '@teloce/server';

export type DebugMessageType =
  | 'error'
  | 'state'
  | 'performance'
  | 'compile'
  | 'render'
  | 'component'
  | 'event'
  | 'log'
  | 'connected'
  | 'disconnected';

export interface DebugMessage<T = any> {
  /**
   * Message type
   */
  type: DebugMessageType;

  /**
   * Message payload
   */
  payload: T;

  /**
   * Timestamp
   */
  timestamp: number;

  /**
   * Source file
   */
  source?: string;

  /**
   * Line number
   */
  line?: number;

  /**
   * Column number
   */
  column?: number;
}

export interface DebugWebSocket {
  /**
   * WebSocket server
   */
  server: WebSocketServer;

  /**
   * Send an error message
   */
  sendError: (error: Error | string, source?: string, line?: number, column?: number) => void;

  /**
   * Send state update
   */
  sendState: (state: Record<string, any>, component?: string) => void;

  /**
   * Send performance data
   */
  sendPerformance: (data: any) => void;

  /**
   * Send compile result
   */
  sendCompile: (result: any) => void;

  /**
   * Send render event
   */
  sendRender: (component: string, time: number) => void;

  /**
   * Send log message
   */
  sendLog: (level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) => void;

  /**
   * Broadcast to all clients
   */
  broadcast: (message: DebugMessage) => void;

  /**
   * Close the server
   */
  close: () => Promise<void>;
}

/**
 * Create a debug WebSocket server
 */
export function createDebugWebSocket(
  server: any,
  options: { path?: string } = {}
): DebugWebSocket {
  const wsServer = createWebSocketServer(server, {
    path: options.path || '/__teloce_debug',
  });

  function createMessage<T>(
    type: DebugMessageType,
    payload: T,
    source?: string,
    line?: number,
    column?: number
  ): DebugMessage<T> {
    return {
      type,
      payload,
      timestamp: Date.now(),
      source,
      line,
      column,
    };
  }

  function broadcast(message: DebugMessage): void {
    wsServer.broadcast(message);
  }

  return {
    server: wsServer,

    sendError(error: Error | string, source?: string, line?: number, column?: number): void {
      const message = typeof error === 'string' ? error : error.message;
      const stack = typeof error === 'object' ? error.stack : undefined;
      broadcast(createMessage('error', { message, stack }, source, line, column));
    },

    sendState(state: Record<string, any>, component?: string): void {
      broadcast(createMessage('state', { state, component }));
    },

    sendPerformance(data: any): void {
      broadcast(createMessage('performance', data));
    },

    sendCompile(result: any): void {
      broadcast(createMessage('compile', result));
    },

    sendRender(component: string, time: number): void {
      broadcast(createMessage('render', { component, time }));
    },

    sendLog(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
      broadcast(createMessage('log', { level, message, data }));
    },

    broadcast,

    async close(): Promise<void> {
      await wsServer.close();
    },
  };
}

/**
 * Send an error message
 */
export function sendError(
  ws: DebugWebSocket,
  error: Error | string,
  source?: string,
  line?: number,
  column?: number
): void {
  ws.sendError(error, source, line, column);
}

/**
 * Send state update
 */
export function sendState(
  ws: DebugWebSocket,
  state: Record<string, any>,
  component?: string
): void {
  ws.sendState(state, component);
}

/**
 * Send performance data
 */
export function sendPerformance(
  ws: DebugWebSocket,
  data: any
): void {
  ws.sendPerformance(data);
}