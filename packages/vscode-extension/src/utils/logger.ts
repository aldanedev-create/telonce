/**
 * Logger Utility
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LoggerOptions {
  prefix?: string;
  level?: LogLevel;
}

export interface Logger {
  debug(msg: string, ...args: any[]): void;
  info(msg: string, ...args: any[]): void;
  warn(msg: string, ...args: any[]): void;
  error(msg: string, ...args: any[]): void;
}

class ConsoleLogger implements Logger {
  constructor(private prefix = '[Teloce]', private level = LogLevel.INFO) {}

  debug(msg: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) console.debug(`${this.prefix} DEBUG:`, msg, ...args);
  }
  info(msg: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) console.info(`${this.prefix} INFO:`, msg, ...args);
  }
  warn(msg: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) console.warn(`${this.prefix} WARN:`, msg, ...args);
  }
  error(msg: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) console.error(`${this.prefix} ERROR:`, msg, ...args);
  }
}

const defaultLogger: Logger = new ConsoleLogger();

export function createLogger(options?: LoggerOptions): Logger {
  return new ConsoleLogger(options?.prefix, options?.level);
}

export function getLogger(): Logger {
  return defaultLogger;
}

export function setLogLevel(_level: LogLevel): void {
  // no-op stub
}