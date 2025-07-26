import { injectable } from 'tsyringe';

import type { ILogger, LogMetadata } from '../interfaces/utils/index.js';

// Re-export for convenience
export type { ILogger } from '../interfaces/utils/index.js';

/**
 * Log levels for the application
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Simple console logger implementation
 */
@injectable()
export class ConsoleLogger implements ILogger {
  constructor(private readonly level: LogLevel = LogLevel.INFO) {}

  public error(message: string, error: Error, meta?: LogMetadata): void {
    const errorMeta = {
      error: error.message,
      stack: error.stack,
      ...meta,
    };
    this.writeLog(LogLevel.ERROR, message, errorMeta);
  }

  public warn(message: string, meta?: LogMetadata): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.writeLog(LogLevel.WARN, message, meta);
    }
  }

  public info(message: string, meta?: LogMetadata): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.writeLog(LogLevel.INFO, message, meta);
    }
  }

  public debug(message: string, meta?: LogMetadata): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.writeLog(LogLevel.DEBUG, message, meta);
    }
  }

  public log(message: string, meta?: LogMetadata): void {
    this.info(message, meta);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.ERROR,
      LogLevel.WARN,
      LogLevel.INFO,
      LogLevel.DEBUG,
    ];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  private writeLog(level: LogLevel, message: string, meta?: LogMetadata): void {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    if (level === LogLevel.ERROR) {
      console.error(
        `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`
      );
    } else {
      console.log(
        `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`
      );
    }
  }
}
