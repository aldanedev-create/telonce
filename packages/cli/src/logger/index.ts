/**
 * Logger - logging utilities for CLI
 */

import chalk from 'chalk';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

export interface Logger {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  debug: (message: string) => void;
  success: (message: string) => void;
  log: (level: LogLevel, message: string) => void;
}

const logLevels: Record<LogLevel, (msg: string) => string> = {
  info: chalk.blue,
  warn: chalk.yellow,
  error: chalk.red,
  debug: chalk.gray,
  success: chalk.green,
};

export const logger: Logger = {
  info(message: string) {
    console.log(`${chalk.blue('ℹ')} ${message}`);
  },
  warn(message: string) {
    console.log(`${chalk.yellow('⚠')} ${message}`);
  },
  error(message: string) {
    console.log(`${chalk.red('✖')} ${message}`);
  },
  debug(message: string) {
    if (process.env.DEBUG) {
      console.log(`${chalk.gray('🔍')} ${message}`);
    }
  },
  success(message: string) {
    console.log(`${chalk.green('✔')} ${message}`);
  },
  log(level: LogLevel, message: string) {
    const color = logLevels[level] || chalk.white;
    console.log(color(message));
  },
};

/**
 * Create a scoped logger
 */
export function createLogger(scope: string): Logger {
  return {
    info(message: string) {
      logger.info(`[${scope}] ${message}`);
    },
    warn(message: string) {
      logger.warn(`[${scope}] ${message}`);
    },
    error(message: string) {
      logger.error(`[${scope}] ${message}`);
    },
    debug(message: string) {
      logger.debug(`[${scope}] ${message}`);
    },
    success(message: string) {
      logger.success(`[${scope}] ${message}`);
    },
    log(level: LogLevel, message: string) {
      logger.log(level, `[${scope}] ${message}`);
    },
  };
}

/**
 * Progress bar utility
 */
export function createProgress(total: number, label: string = 'Progress') {
  let current = 0;
  let lastUpdate = 0;

  return {
    update(amount: number) {
      current = Math.min(current + amount, total);
      const percentage = (current / total) * 100;
      const now = Date.now();
      if (now - lastUpdate > 100 || current === total) {
        const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
        process.stdout.write(`\r${chalk.blue(label)}: [${bar}] ${Math.round(percentage)}%`);
        lastUpdate = now;
        if (current === total) {
          process.stdout.write('\n');
        }
      }
    },
    complete() {
      this.update(total - current);
    },
  };
}